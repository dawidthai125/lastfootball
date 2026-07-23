export interface MatchSettings {
  readonly halfDurationMs: number;
  readonly halfTimeDurationMs: number;
  readonly enableExtraTime: boolean;
  readonly extraTimeHalfMs: number;
  readonly enablePenalties: boolean;
  readonly maxSubstitutions: number;
  readonly ticksPerSecond: number;
  /** Seed is on Match; settings stay pure rules. */
}

export const DEFAULT_MATCH_SETTINGS: MatchSettings = Object.freeze({
  halfDurationMs: 45 * 60 * 1000,
  halfTimeDurationMs: 15 * 60 * 1000,
  enableExtraTime: false,
  extraTimeHalfMs: 15 * 60 * 1000,
  enablePenalties: false,
  maxSubstitutions: 5,
  ticksPerSecond: 20,
});

export function createMatchSettings(partial?: Partial<MatchSettings>): MatchSettings {
  return Object.freeze({
    ...DEFAULT_MATCH_SETTINGS,
    ...partial,
  });
}
