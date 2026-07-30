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
        summary: { trained: 0, tired: 0, regenerated: 0, skillUp: 0 },
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
    status: p.status,
    skill: p.skill,
    potential: p.potential,
  }));
  const after = applyTrainingSessionEffects(before, input.focusId, input.intensityId);
  const summary = summarizeTrainingSessionEffects(before, after);

  const updates: { id: string; status: string; skill: number }[] = [];
  for (let i = 0; i < after.length; i++) {
    const next = after[i]!;
    const prev = before[i]!;
    if (next.status === prev.status && next.skill === prev.skill) continue;
    updates.push({ id: next.id, status: next.status, skill: next.skill });
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
      summary: { trained: 0, tired: 0, regenerated: 0, skillUp: 0 },
    };
  }

  return {
    ok: true,
    skipped: false,
    changedCount: typeof row.changed_count === 'number' ? row.changed_count : updates.length,
    summary,
  };
}
