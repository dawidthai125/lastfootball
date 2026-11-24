import { retryDeadlock } from '@/lib/supabase/retry-deadlock';
import { serverDb } from '@/lib/supabase/admin';
import type { createClient } from '@/lib/supabase/server';
import {
  applyMatchDevelopmentEffects,
  summarizeMatchDevelopment,
  type MatchDevelopmentSummary,
} from '@/lib/squad/match-development';
import type { AttrGroups } from '@/lib/squad/types';
import type { PlayerRowDto } from '@/lib/squad/types';
import { seenState, SQUAD_MOVED_CODE, SQUAD_MOVED_ERROR } from '@/lib/squad/seen-state';
import { filterSeniorPlayers } from '@/lib/squad/types';

export type MatchTruthPatch = {
  readonly status?: PlayerRowDto['status'];
  readonly groups?: AttrGroups;
  readonly energy?: number;
  readonly form?: number;
  readonly suspensionMatches?: number;
  readonly injuryMatches?: number;
  readonly recentRatings?: readonly number[];
  readonly morale?: number;
};

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

type RpcResult = {
  ok?: boolean;
  skipped?: boolean;
  changed_count?: number;
  error?: string;
};

export type ApplyMatchDevelopmentResult =
  | {
      ok: true;
      skipped: boolean;
      changedCount: number;
      summary: MatchDevelopmentSummary;
    }
  /** `moved`: a player changed since he was read, so read again and repeat. */
  | { ok: false; error: string; moved?: boolean };

/**
 * Atomic match development via RPC. The database moves the groups with the skill
 * (`lf_move_groups`), so the groups here stay as they were read.
 * Pure growth: applyMatchDevelopmentEffects — starters, K_MATCH=5, skill ≤ potential.
 */
export async function applyMatchDevelopment(
  supabase: AppSupabase,
  input: {
    clubId: string;
    matchKey: string;
    activePlayers: readonly PlayerRowDto[];
    truthById?: Readonly<Record<string, MatchTruthPatch>>;
    /** The eleven that started: each gets one senior match, once per match key (D134). */
    startedIds?: ReadonlySet<string>;
  },
): Promise<ApplyMatchDevelopmentResult> {
  const seniors = filterSeniorPlayers(input.activePlayers);
  const before = seniors.map((p) => ({
    id: p.id,
    name: p.name,
    skill: p.skill,
    potential: p.potential,
    starter: p.starter,
    age: p.age,
  }));
  const after = applyMatchDevelopmentEffects(before, input.matchKey);
  const summary = summarizeMatchDevelopment(before, after);

  const updates: Record<string, unknown>[] = [];
  for (let i = 0; i < after.length; i++) {
    const next = after[i]!;
    const prev = before[i]!;
    const patch = input.truthById?.[next.id];
    const started = input.startedIds?.has(next.id) === true;
    if (next.skill === prev.skill && !patch && !started) continue;
    const seen = seenState(seniors[i]!);
    updates.push({
      id: next.id,
      skill: next.skill,
      ...(seen ? { seen } : {}),
      ...(started ? { played: true } : {}),
      ...(patch?.status ? { status: patch.status } : {}),
      ...(patch?.groups
        ? {
            attr_attack: patch.groups.attack,
            attr_passing: patch.groups.passing,
            attr_defense: patch.groups.defense,
            attr_physical: patch.groups.physical,
            attr_goalkeeping: patch.groups.goalkeeping,
          }
        : {}),
      ...(typeof patch?.energy === 'number' ? { energy: patch.energy } : {}),
      ...(typeof patch?.form === 'number' ? { form: patch.form } : {}),
      ...(typeof patch?.suspensionMatches === 'number'
        ? { suspension_matches: patch.suspensionMatches }
        : {}),
      ...(typeof patch?.injuryMatches === 'number' ? { injury_matches: patch.injuryMatches } : {}),
      ...(patch?.recentRatings ? { recent_ratings: patch.recentRatings } : {}),
      ...(typeof patch?.morale === 'number' ? { morale: patch.morale } : {}),
    });
  }

  const { data, error } = await retryDeadlock(() =>
    serverDb(supabase).rpc(
      'apply_match_development' as never,
      {
        p_club_id: input.clubId,
        p_match_key: input.matchKey,
        p_updates: updates,
      } as never,
    ),
  );

  if (error?.code === SQUAD_MOVED_CODE) {
    return { ok: false, error: SQUAD_MOVED_ERROR, moved: true };
  }
  if (error) {
    // P0001: the function refused a row and rolled everything back.
    return {
      ok: false,
      error:
        error.code === 'P0001'
          ? 'Nie udało się zaktualizować zawodnika.'
          : 'Nie udało się zapisać rozwoju.',
    };
  }

  const row = data as RpcResult | null;
  if (!row || row.ok !== true) {
    return { ok: false, error: row?.error || 'Nie udało się zapisać rozwoju.' };
  }

  if (row.skipped === true) {
    return {
      ok: true,
      skipped: true,
      changedCount: 0,
      summary: { skillUp: 0, skillUpIds: [], skillUpNames: [] },
    };
  }

  return {
    ok: true,
    skipped: false,
    changedCount: typeof row.changed_count === 'number' ? row.changed_count : updates.length,
    summary,
  };
}

/** What the save of this match will give, as "Name +1". Same rules, key and eleven as persist. */
export function previewMatchDevelopment(
  activePlayers: readonly PlayerRowDto[],
  matchKey: string,
  startedIds: ReadonlySet<string>,
): readonly string[] {
  const seniors = filterSeniorPlayers(activePlayers);
  const before = seniors.map((p) => ({
    id: p.id,
    name: p.name,
    skill: p.skill,
    potential: p.potential,
    starter: startedIds.has(p.id),
    age: p.age,
  }));
  const skillAfter = new Map(
    applyMatchDevelopmentEffects(before, matchKey).map((p) => [p.id, p.skill]),
  );
  return before.flatMap((p) => {
    const gain = (skillAfter.get(p.id) ?? p.skill) - p.skill;
    return gain > 0 ? [`${p.name} +${gain}`] : [];
  });
}
