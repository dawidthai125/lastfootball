import type { MatchClock, MatchPhase } from '../domain';
import { createMatchClock } from '../domain';
import { isPlayLifecycleState } from '../state-machine';

/** Regulation minutes shown on scorebug per half. */
export const DISPLAY_MINUTES_PER_HALF = 45;

export function baseDisplayMinute(phase: MatchPhase): number {
  switch (phase) {
    case 'SECOND_HALF':
      return DISPLAY_MINUTES_PER_HALF;
    case 'EXTRA_TIME':
      return DISPLAY_MINUTES_PER_HALF * 2;
    case 'PENALTIES':
      return DISPLAY_MINUTES_PER_HALF * 2 + 30;
    default:
      return 0;
  }
}

export function periodForPhase(phase: MatchPhase): MatchClock['period'] {
  switch (phase) {
    case 'FIRST_HALF':
      return 'first_half';
    case 'HALF_TIME':
      return 'half_time';
    case 'SECOND_HALF':
      return 'second_half';
    case 'FULL_TIME':
    case 'FINISHED':
      return 'full_time';
    case 'EXTRA_TIME':
      return 'extra_time_first';
    case 'PENALTIES':
      return 'penalties';
    default:
      return 'pre_match';
  }
}

/**
 * Advance domain MatchClock from simulation dt.
 * displayMinute maps linearly: halfDurationMs → 45' (compressed halves still show 0–45).
 */
export function advanceMatchClock(
  clock: MatchClock,
  dtMs: number,
  opts: { phase: MatchPhase; halfDurationMs: number },
): MatchClock {
  const targetPeriod = periodForPhase(opts.phase);

  if (!isPlayLifecycleState(opts.phase)) {
    return createMatchClock({
      period: targetPeriod,
      periodElapsedMs: clock.period === targetPeriod ? clock.periodElapsedMs : 0,
      displayMinute: clock.displayMinute,
      stoppageMs: clock.stoppageMs,
      frozen: true,
    });
  }

  const halfMs = Math.max(1, opts.halfDurationMs);
  const samePeriod = clock.period === targetPeriod && !clock.frozen;
  const periodElapsedMs = samePeriod ? clock.periodElapsedMs + dtMs : dtMs;
  const clamped = Math.min(periodElapsedMs, halfMs + clock.stoppageMs);
  const base = baseDisplayMinute(opts.phase);
  const displayMinute = base + (clamped / halfMs) * DISPLAY_MINUTES_PER_HALF;

  return createMatchClock({
    period: targetPeriod,
    periodElapsedMs: clamped,
    displayMinute,
    stoppageMs: clock.stoppageMs,
    frozen: false,
  });
}

export function isHalfComplete(clock: MatchClock, halfDurationMs: number): boolean {
  return clock.periodElapsedMs >= Math.max(1, halfDurationMs);
}
