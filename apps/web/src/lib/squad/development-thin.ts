/** Match / season development Thin constants (LFE-PLAYERS-02). */
export const DEVELOPMENT_THIN = {
  SKILL_UP_MAX_PER_PLAYER: 1,
  /** Primary path — higher than training K=3. */
  SKILL_UP_MAX_PER_MATCH: 5,
  /** Soft peak age for future season-end regres (hook only). */
  AGE_REGRESS_FROM: 32,
} as const;
