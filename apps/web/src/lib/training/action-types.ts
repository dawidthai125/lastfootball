export type TrainingSessionSummaryState = {
  readonly trained: number;
  readonly tired: number;
  readonly regenerated: number;
  readonly skillUp: number;
};

export type TrainingActionState = {
  error?: string;
  ok?: boolean;
  skipped?: boolean;
  summary?: TrainingSessionSummaryState;
};

export const TRAINING_ACTION_INITIAL: TrainingActionState = {};
