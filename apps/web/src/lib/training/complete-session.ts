import type { createClient } from '@/lib/supabase/server';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { applyTrainingSessionEffects } from '@/lib/training/apply-effects';
import { resolveClubTraining } from '@/lib/training/resolve-club-training';
import type { TrainingFocusId, TrainingIntensityId } from '@/lib/training/types';
import type { PlayerRowDto } from '@/lib/squad/types';

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

export type CompleteTrainingResult =
  { ok: true; skipped: boolean; changedCount: number } | { ok: false; error: string };

/**
 * Atomic-ish team session: status updates only + clubs.last_training_on.
 * Does not insert/delete players or change skill.
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
  const resolved = resolveClubTraining({
    clubId: input.clubId,
    playedCount: input.playedCount,
    lastTrainingOn: input.lastTrainingOn,
    activePlayers: input.activePlayers,
    today,
  });

  if (!resolved.canTrain) {
    if (resolved.lockReason === 'already_trained_today') {
      return { ok: true, skipped: true, changedCount: 0 };
    }
    const msg =
      resolved.lockReason === 'not_unlocked'
        ? 'Trening jeszcze niedostępny.'
        : resolved.lockReason === 'squad_unavailable'
          ? 'Brak aktywnej kadry.'
          : 'Nie można przeprowadzić treningu.';
    return { ok: false, error: msg };
  }

  const before = input.activePlayers.map((p) => ({ id: p.id, status: p.status }));
  const after = applyTrainingSessionEffects(before, input.focusId, input.intensityId);

  let changedCount = 0;
  for (let i = 0; i < after.length; i++) {
    const next = after[i]!;
    const prev = before[i]!;
    if (next.status === prev.status) continue;
    const { error } = await supabase
      .from('players')
      .update({ status: next.status } as never)
      .eq('id', next.id)
      .eq('club_id', input.clubId)
      .is('departed_at', null);
    if (error) {
      return { ok: false, error: 'Nie udało się zaktualizować statusów zawodników.' };
    }
    changedCount += 1;
  }

  const { error: clubErr } = await supabase
    .from('clubs')
    .update({ last_training_on: today } as never)
    .eq('id', input.clubId);

  if (clubErr) {
    return { ok: false, error: 'Nie udało się zapisać dnia treningu.' };
  }

  return { ok: true, skipped: false, changedCount };
}
