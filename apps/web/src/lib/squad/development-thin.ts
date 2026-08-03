/**
 * Match / season development Thin constants (LFE-PLAYERS-02 · LFE-AGE-01).
 * `AGE_REGRESS_FROM` = sole domain parameter for soft skill regress (Decline seed).
 * Future Career Stages (Prime / Decline / Retirement / Youth) must read this —
 * do not scatter magic age thresholds in call sites.
 */
export const DEVELOPMENT_THIN = {
  SKILL_UP_MAX_PER_PLAYER: 1,
  /** Primary path — higher than training K=3. */
  SKILL_UP_MAX_PER_MATCH: 5,
  /** Soft skill regress starts at this age after season age++ (H-AGE). */
  AGE_REGRESS_FROM: 32,
} as const;
