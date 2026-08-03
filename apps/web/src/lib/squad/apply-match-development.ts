import type { createClient } from '@/lib/supabase/server';
import {
  applyMatchDevelopmentEffects,
  summarizeMatchDevelopment,
  type MatchDevelopmentSummary,
} from '@/lib/squad/match-development';
import type { PlayerRowDto } from '@/lib/squad/types';
import { filterSeniorPlayers } from '@/lib/squad/types';

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
  | { ok: false; error: string };

/**
 * Atomic match development via RPC (skill only).
 * Pure growth: applyMatchDevelopmentEffects — starters, K_MATCH=5, skill ≤ potential.
 */
export async function applyMatchDevelopment(
  supabase: AppSupabase,
  input: {
    clubId: string;
    matchKey: string;
    activePlayers: readonly PlayerRowDto[];
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

  const updates: { id: string; skill: number }[] = [];
  for (let i = 0; i < after.length; i++) {
    const next = after[i]!;
    const prev = before[i]!;
    if (next.skill === prev.skill) continue;
    updates.push({ id: next.id, skill: next.skill });
  }

  const { data, error } = await supabase.rpc(
    'apply_match_development' as never,
    {
      p_club_id: input.clubId,
      p_match_key: input.matchKey,
      p_updates: updates,
    } as never,
  );

  if (error) {
    return { ok: false, error: error.message || 'Nie udało się zapisać rozwoju.' };
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

/** Pure preview for Post Match UI (same rules as persist). Senior filter only. */
export function previewMatchDevelopment(
  activePlayers: readonly PlayerRowDto[],
): MatchDevelopmentSummary {
  const seniors = filterSeniorPlayers(activePlayers);
  const before = seniors.map((p) => ({
    id: p.id,
    name: p.name,
    skill: p.skill,
    potential: p.potential,
    starter: p.starter,
    age: p.age,
  }));
  const after = applyMatchDevelopmentEffects(before, 'preview');
  return summarizeMatchDevelopment(before, after);
}
