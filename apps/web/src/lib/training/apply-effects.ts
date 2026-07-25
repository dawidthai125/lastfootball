import type { PlayerStatus } from '@/lib/squad/types';
import type { TrainingFocusId, TrainingIntensityId } from '@/lib/training/types';

export type TrainingPlayerStatusSlice = {
  readonly id: string;
  readonly status: PlayerStatus;
};

/**
 * Pure status transitions for a team training session.
 * Never changes roster size or skill — only `status`.
 */
export function applyTrainingSessionEffects(
  players: readonly TrainingPlayerStatusSlice[],
  focusId: TrainingFocusId,
  intensityId: TrainingIntensityId,
): TrainingPlayerStatusSlice[] {
  if (focusId === 'regeneration') {
    return players.map((p) => {
      if (p.status === 'TIRED') return { id: p.id, status: 'READY' };
      return p;
    });
  }

  if (intensityId === 'light') {
    return players.map((p) => p);
  }

  // Deterministic: sort by id, mark every Nth READY → TIRED.
  const step = intensityId === 'high' ? 2 : 3;
  const readyIds = players
    .filter((p) => p.status === 'READY')
    .map((p) => p.id)
    .sort();
  const toTire = new Set<string>();
  for (let i = 0; i < readyIds.length; i += step) {
    const id = readyIds[i];
    if (id) toTire.add(id);
  }

  return players.map((p) => {
    if (p.status === 'INJURED' || p.status === 'SUSPENDED' || p.status === 'DEPARTED') {
      return p;
    }
    if (p.status === 'READY' && toTire.has(p.id)) {
      return { id: p.id, status: 'TIRED' };
    }
    return p;
  });
}
