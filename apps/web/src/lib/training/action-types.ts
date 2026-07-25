export type TrainingActionState = {
  error?: string;
  ok?: boolean;
  skipped?: boolean;
};

export const TRAINING_ACTION_INITIAL: TrainingActionState = {};
