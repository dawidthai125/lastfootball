import type { MatchLifecycleEvent } from '../state-machine';
import type { MatchState } from '../domain';
import type { Rng } from '../../rng';

import { advanceMatchClock, isHalfComplete } from './clock';
import {
  resolvePossessionAction,
  rollPossessionSide,
  withPossessionTick,
  type MatchEngineEmit,
} from './resolve';

export type MatchEngineTickInput = {
  readonly tick: number;
  readonly dtMs: number;
  readonly rng: Rng;
  readonly halfDurationMs: number;
  readonly halfTimeDurationMs: number;
};

export type MatchEngineTickResult = {
  readonly state: MatchState;
  readonly emits: readonly MatchEngineEmit[];
  readonly lifecycle: readonly MatchLifecycleEvent[];
};

/**
 * One Match Engine step — pure aside from rng consumption.
 * Decisions come from Match AI; this module applies RNG + MatchState / emits.
 * Call only from MatchEngineSystem during play / half-time phases.
 */
export function simulateMatchTick(
  state: MatchState,
  input: MatchEngineTickInput,
): MatchEngineTickResult {
  const emits: MatchEngineEmit[] = [];
  const lifecycle: MatchLifecycleEvent[] = [];
  let next = state;

  // Half-time break: wait then start second half
  if (state.phase === 'HALF_TIME') {
    const breakElapsed =
      state.clock.period === 'half_time' ? state.clock.periodElapsedMs + input.dtMs : input.dtMs;
    next = Object.freeze({
      ...state,
      clock: {
        ...state.clock,
        period: 'half_time' as const,
        periodElapsedMs: breakElapsed,
        frozen: true,
        displayMinute: 45,
      },
      tick: input.tick,
    });
    if (breakElapsed >= Math.max(1, input.halfTimeDurationMs)) {
      lifecycle.push({ type: 'START_SECOND_HALF', tick: input.tick });
      emits.push({ type: 'SYSTEM', payload: { kind: 'second_half_start' } });
    }
    return { state: next, emits, lifecycle };
  }

  if (state.phase !== 'FIRST_HALF' && state.phase !== 'SECOND_HALF') {
    return { state, emits, lifecycle };
  }

  const clock = advanceMatchClock(state.clock, input.dtMs, {
    phase: state.phase,
    halfDurationMs: input.halfDurationMs,
  });
  next = Object.freeze({ ...state, clock, tick: input.tick });

  if (isHalfComplete(clock, input.halfDurationMs)) {
    if (state.phase === 'FIRST_HALF') {
      lifecycle.push({ type: 'END_FIRST_HALF', tick: input.tick });
      emits.push({
        type: 'HALF_END',
        payload: { half: 1, score: next.score, minute: clock.displayMinute },
      });
    } else {
      lifecycle.push({ type: 'END_SECOND_HALF', tick: input.tick });
      emits.push({
        type: 'HALF_END',
        payload: { half: 2, score: next.score, minute: clock.displayMinute },
      });
      lifecycle.push({ type: 'COMPLETE_MATCH', tick: input.tick });
      emits.push({
        type: 'MATCH_END',
        payload: { score: next.score, minute: clock.displayMinute },
      });
    }
    return { state: next, emits, lifecycle };
  }

  const side = rollPossessionSide(next, input.rng);
  emits.push({
    type: 'POSSESSION',
    payload: { side, minute: clock.displayMinute },
  });
  next = withPossessionTick(next, side);

  const resolved = resolvePossessionAction(next, side, input.rng, input.tick);
  next = resolved.state;
  emits.push(...resolved.emits);

  return { state: next, emits, lifecycle };
}
