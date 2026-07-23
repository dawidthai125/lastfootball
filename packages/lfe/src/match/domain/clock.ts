/**
 * Match clock model (domain) — distinct from EPIC-1 tick GameClock.
 * Serializes match time / period for replay; tick engine drives advancement later.
 */

export type MatchPeriod =
  | 'pre_match'
  | 'first_half'
  | 'half_time'
  | 'second_half'
  | 'full_time'
  | 'extra_time_first'
  | 'extra_time_second'
  | 'penalties'
  | 'post_match';

export interface MatchClock {
  readonly period: MatchPeriod;
  /** Elapsed regulation/ET time in this period (ms). */
  readonly periodElapsedMs: number;
  /** Display minute (e.g. 47.2). */
  readonly displayMinute: number;
  /** Stoppage / added time budget for current period (ms). */
  readonly stoppageMs: number;
  /** True when match clock is intentionally frozen (e.g. celebration). */
  readonly frozen: boolean;
}

export function createMatchClock(partial?: Partial<MatchClock>): MatchClock {
  return Object.freeze({
    period: partial?.period ?? 'pre_match',
    periodElapsedMs: partial?.periodElapsedMs ?? 0,
    displayMinute: partial?.displayMinute ?? 0,
    stoppageMs: partial?.stoppageMs ?? 0,
    frozen: partial?.frozen ?? true,
  });
}
