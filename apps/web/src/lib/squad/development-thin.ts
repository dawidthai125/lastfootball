/**
 * Match / season development Thin constants (LFE-PLAYERS-02 · LFE-AGE-01 · LFE-CAREER-DECLINE-01).
 * Career Stages (Prime / Decline / Retirement / Youth Depth) must read thresholds here —
 * do not scatter magic age numbers in call sites.
 */
export const DEVELOPMENT_THIN = {
  SKILL_UP_MAX_PER_PLAYER: 1,
  /** Primary path — higher than training K=3. */
  SKILL_UP_MAX_PER_MATCH: 3,
  /**
   * Soft skill regress / `decline` phase starts at this age after season age++ (H-AGE).
   * Aligns with resolveCareerPhase decline band.
   */
  AGE_REGRESS_FROM: 32,
  /** Inclusive upper bound of `decline` phase (then `late`). */
  AGE_LATE_FROM: 38,
  /** Career phase age ceilings (inclusive) — youth ≤20 · rising ≤27 · prime ≤31. */
  PHASE_YOUTH_MAX: 20,
  PHASE_RISING_MAX: 27,
  PHASE_PRIME_MAX: 31,
  PHASE_DECLINE_MAX: 37,
  /**
   * Growth Gate coefficients — never 0 (LOCK hard-ban OUT).
   * Values in (0, 1] soft-gate impulse chance; >1 (Owner GO Prime) boosts delta
   * via resolveGrowthSkillDelta (base + fractional bonus roll).
   */
  GROWTH_COEFF_YOUTH: 1,
  GROWTH_COEFF_RISING: 1,
  /** Owner GO 2026-11-17: Growth ×1.1 in prime (peak ages). */
  GROWTH_COEFF_PRIME: 1.1,
  GROWTH_COEFF_DECLINE: 0.5,
  GROWTH_COEFF_LATE: 0.25,
  /** Season age skill Δ by phase after age++. */
  REGRESS_DELTA_DECLINE: 1,
  REGRESS_DELTA_LATE: 2,
} as const;
