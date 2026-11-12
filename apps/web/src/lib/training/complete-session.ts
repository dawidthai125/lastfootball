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
  | { ok: false; error: string };

/**
 * Atomic team session via RPC: status + skill + clubs.last_training_on.
 * Growth rules: pure applyTrainingSessionEffects (TS SSOT).
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
    sessionCap?: number;
  },
): Promise<CompleteTrainingResult> {
  const today = input.today ?? utcDateString();
  const seniors = filterSeniorPlayers(input.activePlayers);
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
  }));
  const impulseKey = `${today}:${input.focusId}:${input.intensityId}`;
  const coached = input.coachGroup ?? null;
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
    return applyCoachYield(player, coached, isCoachGroup(key) ? key : null);
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
    });
  }

  const { data, error } = await supabase.rpc(
    'complete_training_session' as never,
    {
      p_club_id: input.clubId,
      p_training_on: today,
      p_updates: updates,
    } as never,
  );

  if (error) {
    return { ok: false, error: error.message || 'Nie udało się zapisać treningu.' };
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
