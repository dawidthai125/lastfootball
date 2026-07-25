import { hasPlayedUnlock, utcDateString } from '@/lib/fixtures/played-unlock';
import type { PlayerRowDto } from '@/lib/squad/types';
import {
  TRAINING_FOCUSES,
  TRAINING_INTENSITIES,
  TRAINING_THIN,
  type TrainingDto,
  type TrainingLockReason,
  type TrainingReadinessDto,
} from '@/lib/training/types';

export type ResolveClubTrainingInput = {
  readonly clubId: string;
  readonly playedCount: number;
  readonly lastTrainingOn: string | null;
  readonly activePlayers: readonly PlayerRowDto[];
  /** Inject for tests; defaults to UTC today. */
  readonly today?: string;
};

function readinessOf(players: readonly PlayerRowDto[]): TrainingReadinessDto {
  let ready = 0;
  let tired = 0;
  let injured = 0;
  let suspended = 0;
  for (const p of players) {
    switch (p.status) {
      case 'READY':
        ready += 1;
        break;
      case 'TIRED':
        tired += 1;
        break;
      case 'INJURED':
        injured += 1;
        break;
      case 'SUSPENDED':
        suspended += 1;
        break;
      default:
        break;
    }
  }
  return {
    ready,
    tired,
    injured,
    suspended,
    active: players.length,
  };
}

/**
 * Sole training UI contract (LFE-TRAINING-01). Pure — no Supabase.
 */
export function resolveClubTraining(input: ResolveClubTrainingInput): TrainingDto {
  const today = input.today ?? utcDateString();
  const unlocked = hasPlayedUnlock(input.playedCount, TRAINING_THIN.UNLOCK_AFTER_PLAYED);
  const readiness = readinessOf(input.activePlayers);

  let lockReason: TrainingLockReason = null;
  if (!unlocked) {
    lockReason = 'not_unlocked';
  } else if (readiness.active === 0) {
    lockReason = 'squad_unavailable';
  } else if (input.lastTrainingOn === today) {
    lockReason = 'already_trained_today';
  }

  const canTrain = lockReason === null;

  return {
    clubId: input.clubId,
    unlocked,
    playedCount: input.playedCount,
    playedRequired: TRAINING_THIN.UNLOCK_AFTER_PLAYED,
    canTrain,
    lockReason,
    today,
    lastTrainingOn: input.lastTrainingOn,
    readiness,
    focuses: TRAINING_FOCUSES,
    intensities: TRAINING_INTENSITIES,
    defaults: {
      focusId: TRAINING_THIN.DEFAULT_FOCUS_ID,
      intensityId: TRAINING_THIN.DEFAULT_INTENSITY_ID,
    },
    individualAvailable: false,
  };
}
