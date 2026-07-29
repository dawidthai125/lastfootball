export type {
  TrainingDto,
  TrainingFocusId,
  TrainingIntensityId,
  TrainingLockReason,
  TrainingFocusOption,
  TrainingIntensityOption,
  TrainingReadinessDto,
} from '@/lib/training/types';
export { TRAINING_THIN, TRAINING_FOCUSES, TRAINING_INTENSITIES } from '@/lib/training/types';
export { resolveClubTraining } from '@/lib/training/resolve-club-training';
export type { ResolveClubTrainingInput } from '@/lib/training/resolve-club-training';
export {
  applyTrainingSessionEffects,
  summarizeTrainingSessionEffects,
} from '@/lib/training/apply-effects';
export type { TrainingPlayerSlice } from '@/lib/training/apply-effects';
export { TRAINING_ACTION_INITIAL } from '@/lib/training/action-types';
export type { TrainingActionState } from '@/lib/training/action-types';
export type { TrainingSessionSummary } from '@/lib/training/types';

// Server I/O / actions — import from complete-session / actions paths (not barrel for client).
