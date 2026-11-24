import { retryDeadlock } from '@/lib/supabase/retry-deadlock';
import { serverDb } from '@/lib/supabase/admin';
import type { createClient } from '@/lib/supabase/server';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import {
  applyTrainingSessionEffects,
  summarizeTrainingSessionEffects,
} from '@/lib/training/apply-effects';
import { resolveClubTraining } from '@/lib/training/resolve-club-training';
import type {
  TrainingFocusId,
  TrainingIntensityId,
  TrainingSessionSummary,
} from '@/lib/training/types';
import type { PlayerRowDto } from '@/lib/squad/types';
import { seenState, SQUAD_MOVED_CODE, SQUAD_MOVED_ERROR } from '@/lib/squad/seen-state';
import { filterSeniorPlayers } from '@/lib/squad/types';
import { groupKeyForFocus } from '@/lib/squad/truth';
import { applyCoachYield, isCoachGroup, type CoachGroup } from '@/lib/training/coach';

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

type RpcResult = {
  ok?: boolean;
  skipped?: boolean;
  changed_count?: number;
  error?: string;
};

export type CompleteTrainingResult =
  | {
      ok: true;
      skipped: boolean;
      changedCount: number;
      summary: TrainingSessionSummary;
    }
  /** `moved`: a player changed since he was read, so read again and repeat. */
  | { ok: false; error: string; moved?: boolean };

/**
 * Atomic team session via RPC: status + skill + clubs.last_training_on.
 * Growth rules: pure applyTrainingSessionEffects (TS SSOT). The database moves every group with
 * the skill (`lf_move_groups`), on top of the trained one.
 */
export async function completeTrainingSession(
  supabase: AppSupabase,
  input: {
    clubId: string;
    lastTrainingOn: string | null;
    playedCount: number;
    activePlayers: readonly PlayerRowDto[];
    focusId: TrainingFocusId;
    intensityId: TrainingIntensityId;
    today?: string;
    coachGroup?: CoachGroup | null;
    assistantGroup?: CoachGroup | null;
    sessionCap?: number;
  },
): Promise<CompleteTrainingResult> {
  const today = input.today ?? utcDateString();
  // A player on loan trains with the other club, as in the individual session (D158).
  const seniors = filterSeniorPlayers(input.activePlayers).filter((p) => p.onLoan !== true);
  const resolved = resolveClubTraining({
    clubId: input.clubId,
    playedCount: input.playedCount,
    lastTrainingOn: input.lastTrainingOn,
    activePlayers: seniors,
    today,
  });

  if (!resolved.canTrain) {
    if (resolved.lockReason === 'already_trained_today') {
      return {
        ok: true,
        skipped: true,
        changedCount: 0,
        summary: { trained: 0, tired: 0, regenerated: 0, skillUp: 0, skillUpNames: [] },
      };
    }
    const msg =
      resolved.lockReason === 'not_unlocked'
        ? 'Trening jeszcze niedostępny.'
        : resolved.lockReason === 'squad_unavailable'
          ? 'Brak aktywnej kadry.'
          : 'Nie można przeprowadzić treningu.';
    return { ok: false, error: msg };
  }

  const before = seniors.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    skill: p.skill,
    potential: p.potential,
    age: p.age,
    pos: p.pos,
    groups: p.groups,
    energy: p.energy,
    injuryMatches: p.injuryMatches,
  }));
  const impulseKey = `${today}:${input.focusId}:${input.intensityId}`;
  const coached = input.coachGroup ?? null;
  const assistant = input.assistantGroup ?? null;
  const trained = applyTrainingSessionEffects(
    before,
    input.focusId,
    input.intensityId,
    impulseKey,
    input.sessionCap,
  );
  const after = trained.map((player, index) => {
    const prev = before[index];
    if (!prev || player.skill <= prev.skill) return player;
    const key = groupKeyForFocus(input.focusId, player.pos ?? '');
    const coachedPlayer = applyCoachYield(player, coached, isCoachGroup(key) ? key : null);
    if (assistant === null || assistant === coached) return coachedPlayer;
    return applyCoachYield(coachedPlayer, assistant, isCoachGroup(key) ? key : null);
  });
  const summary = summarizeTrainingSessionEffects(before, after);

  const updates: {
    id: string;
    status: string;
    skill: number;
    attr_attack?: number;
    attr_passing?: number;
    attr_defense?: number;
    attr_physical?: number;
    attr_goalkeeping?: number;
    energy?: number;
    seen?: Record<string, unknown>;
  }[] = [];
  for (let i = 0; i < after.length; i++) {
    const next = after[i]!;
    const prev = before[i]!;
    const groupsChanged =
      next.groups != null &&
      (next.groups.attack !== prev.groups?.attack ||
        next.groups.passing !== prev.groups?.passing ||
        next.groups.defense !== prev.groups?.defense ||
        next.groups.physical !== prev.groups?.physical ||
        next.groups.goalkeeping !== prev.groups?.goalkeeping);
    const energyChanged = next.energy !== prev.energy;
    if (
      next.status === prev.status &&
      next.skill === prev.skill &&
      !groupsChanged &&
      !energyChanged
    ) {
      continue;
    }
    const seen = seenState(seniors[i]!);
    updates.push({
      id: next.id,
      status: next.status,
      skill: next.skill,
      ...(next.groups
        ? {
            attr_attack: next.groups.attack,
            attr_passing: next.groups.passing,
            attr_defense: next.groups.defense,
            attr_physical: next.groups.physical,
            attr_goalkeeping: next.groups.goalkeeping,
          }
        : {}),
      ...(typeof next.energy === 'number' ? { energy: next.energy } : {}),
      ...(seen ? { seen } : {}),
    });
  }

  const { data, error } = await retryDeadlock(() =>
    serverDb(supabase).rpc(
      'complete_training_session' as never,
      {
        p_club_id: input.clubId,
        p_training_on: today,
        p_updates: updates,
      } as never,
    ),
  );

  if (error) {
    return error.code === SQUAD_MOVED_CODE
      ? { ok: false, error: SQUAD_MOVED_ERROR, moved: true }
      : { ok: false, error: 'Nie udało się zapisać treningu. Spróbuj ponownie.' };
  }

  const row = data as RpcResult | null;
  if (!row || row.ok !== true) {
    return { ok: false, error: row?.error || 'Nie udało się zapisać treningu.' };
  }

  if (row.skipped === true) {
    return {
      ok: true,
      skipped: true,
      changedCount: 0,
      summary: { trained: 0, tired: 0, regenerated: 0, skillUp: 0, skillUpNames: [] },
    };
  }

  return {
    ok: true,
    skipped: false,
    changedCount: typeof row.changed_count === 'number' ? row.changed_count : updates.length,
    summary,
  };
}
