/**
 * Pure facts evaluated by transition guards — no I/O, no RNG.
 * Callers supply values derived from MatchState / MatchSettings.
 */

export interface LifecycleContext {
  readonly tick: number;
  readonly homeLineupConfirmed: boolean;
  readonly awayLineupConfirmed: boolean;
  readonly enableExtraTime: boolean;
  readonly enablePenalties: boolean;
  /** True when home goals === away goals after regulation / ET. */
  readonly scoreTied: boolean;
}

export function defaultLifecycleContext(partial?: Partial<LifecycleContext>): LifecycleContext {
  return {
    tick: partial?.tick ?? 0,
    homeLineupConfirmed: partial?.homeLineupConfirmed ?? false,
    awayLineupConfirmed: partial?.awayLineupConfirmed ?? false,
    enableExtraTime: partial?.enableExtraTime ?? false,
    enablePenalties: partial?.enablePenalties ?? false,
    scoreTied: partial?.scoreTied ?? false,
  };
}
