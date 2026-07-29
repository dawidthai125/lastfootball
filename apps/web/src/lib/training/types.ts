/** Thin training constants — temporary until fuller GDD §8 / §26 (LFE-TRAINING-01/02). */
export const TRAINING_THIN = {
  UNLOCK_AFTER_PLAYED: 2,
  DEFAULT_FOCUS_ID: 'tactics',
  DEFAULT_INTENSITY_ID: 'normal',
  /** Max skill + per player per session (anti-farm). */
  SKILL_UP_MAX_PER_PLAYER: 1,
  /** Max players receiving +skill per session (K). */
  SKILL_UP_MAX_PER_SESSION: 3,
  /** skill >= ceiling grows only on high intensity. */
  SKILL_SOFT_CEILING: 85,
} as const;

export type TrainingFocusId = 'tactics' | 'technique' | 'physical' | 'regeneration';
export type TrainingIntensityId = 'light' | 'normal' | 'high';

export type TrainingLockReason =
  'not_unlocked' | 'already_trained_today' | 'squad_unavailable' | null;

export type TrainingFocusOption = {
  readonly id: TrainingFocusId;
  readonly label: string;
  readonly description: string;
};

export type TrainingIntensityOption = {
  readonly id: TrainingIntensityId;
  readonly label: string;
  readonly description: string;
};

export type TrainingReadinessDto = {
  readonly ready: number;
  readonly tired: number;
  readonly injured: number;
  readonly suspended: number;
  readonly active: number;
};

/**
 * Stable UI contract for `/training` (RESOLVER FIRST).
 * Required fields are Thin SSOT; optional slots reserved for future expansion.
 */
export type TrainingDto = {
  readonly clubId: string;
  readonly unlocked: boolean;
  readonly playedCount: number;
  readonly playedRequired: number;
  readonly canTrain: boolean;
  readonly lockReason: TrainingLockReason;
  /** UTC calendar day for the current slot (`YYYY-MM-DD`). */
  readonly today: string;
  /** Club SSOT last training day, or null. */
  readonly lastTrainingOn: string | null;
  readonly readiness: TrainingReadinessDto;
  readonly focuses: readonly TrainingFocusOption[];
  readonly intensities: readonly TrainingIntensityOption[];
  readonly defaults: {
    readonly focusId: TrainingFocusId;
    readonly intensityId: TrainingIntensityId;
  };
  /** Future: qualitative preview before confirm. */
  readonly sessionPreview?: undefined;
  /** Future: morale hint strip. */
  readonly moraleHint?: undefined;
  /** Future: match-day lock policy. */
  readonly matchDayPolicy?: undefined;
  /** Future: individual training — always false in Thin. */
  readonly individualAvailable?: false;
};

/** Post-session feedback counts (LFE-TRAINING-02). */
export type TrainingSessionSummary = {
  readonly trained: number;
  readonly tired: number;
  readonly regenerated: number;
  readonly skillUp: number;
};

export const TRAINING_FOCUSES: readonly TrainingFocusOption[] = [
  {
    id: 'tactics',
    label: 'Taktyka / zespół',
    description: 'Wspólna organizacja gry — fokus domyślny.',
  },
  {
    id: 'technique',
    label: 'Technika',
    description: 'Podania, przyjęcie, kontrola piłki.',
  },
  {
    id: 'physical',
    label: 'Fizyczność',
    description: 'Wytrzymałość i obciążenie ciała.',
  },
  {
    id: 'regeneration',
    label: 'Regeneracja',
    description: 'Odpoczynek — obniża zmęczenie kadry.',
  },
] as const;

export const TRAINING_INTENSITIES: readonly TrainingIntensityOption[] = [
  {
    id: 'light',
    label: 'Lekka',
    description: 'Bezpiecznie — bez wzrostu zmęczenia.',
  },
  {
    id: 'normal',
    label: 'Normalna',
    description: 'Umiarkowane obciążenie części kadry.',
  },
  {
    id: 'high',
    label: 'Wysoka',
    description: 'Mocny push — więcej zawodników zmęczonych.',
  },
] as const;
