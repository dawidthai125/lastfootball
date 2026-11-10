import type { MatchLifecycleEvent } from '../state-machine';
import { createScore, type MatchState } from '../domain';
import type { Rng } from '../../rng';

import { advanceMatchClock, isHalfComplete } from './clock';
import { reconcileMinutesPlayed } from './minutes-played';
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
  /** Both extra-time halves. League matches leave this unused. */
  readonly extraTimeDurationMs: number;
  readonly enableExtraTime: boolean;
  readonly enablePenalties: boolean;
};

export type MatchEngineTickResult = {
  readonly state: MatchState;
  readonly emits: readonly MatchEngineEmit[];
  readonly lifecycle: readonly MatchLifecycleEvent[];
};

/** A draw stays a draw unless this match was opened as a cup (extra time or penalties). */
function regulationDrawFinishes(state: MatchState, input: MatchEngineTickInput): boolean {
  if (state.score.home !== state.score.away) return true;
  return !input.enableExtraTime && !input.enablePenalties;
}

function queueFullTime(
  lifecycle: MatchLifecycleEvent[],
  emits: MatchEngineEmit[],
  state: MatchState,
  tick: number,
): void {
  lifecycle.push({ type: 'COMPLETE_MATCH', tick });
  emits.push({
    type: 'MATCH_END',
    payload: { score: state.score, minute: state.clock.displayMinute },
  });
}

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

  // Shoot-out is one tick. The goal is only on the score, not in player stats,
  // matching the cup table (a draw becomes a one-goal winner, decidedBy extra).
  if (state.phase === 'PENALTIES') {
    const side = input.rng.nextBool() ? 'home' : 'away';
    next = Object.freeze({
      ...state,
      tick: input.tick,
      score: createScore(
        side === 'home' ? state.score.home + 1 : state.score.home,
        side === 'away' ? state.score.away + 1 : state.score.away,
      ),
    });
    emits.push({
      type: 'SYSTEM',
      payload: { kind: 'penalty_decider', side, score: next.score },
    });
    lifecycle.push({ type: 'END_PENALTIES', tick: input.tick });
    queueFullTime(lifecycle, emits, next, input.tick);
    return { state: next, emits, lifecycle };
  }

  if (
    state.phase !== 'FIRST_HALF' &&
    state.phase !== 'SECOND_HALF' &&
    state.phase !== 'EXTRA_TIME'
  ) {
    return { state, emits, lifecycle };
  }

  const periodMs = state.phase === 'EXTRA_TIME' ? input.extraTimeDurationMs : input.halfDurationMs;
  const clock = advanceMatchClock(state.clock, input.dtMs, {
    phase: state.phase,
    halfDurationMs: periodMs,
  });
  next = Object.freeze({ ...state, clock, tick: input.tick });

  if (isHalfComplete(clock, periodMs)) {
    next = reconcileMinutesPlayed(next);
    if (state.phase === 'FIRST_HALF') {
      lifecycle.push({ type: 'END_FIRST_HALF', tick: input.tick });
      emits.push({
        type: 'HALF_END',
        payload: { half: 1, score: next.score, minute: clock.displayMinute },
      });
    } else if (state.phase === 'SECOND_HALF') {
      lifecycle.push({ type: 'END_SECOND_HALF', tick: input.tick });
      emits.push({
        type: 'HALF_END',
        payload: { half: 2, score: next.score, minute: clock.displayMinute },
      });
      // League draws finish here. A cup draw goes to extra time or penalties.
      if (regulationDrawFinishes(next, input)) {
        queueFullTime(lifecycle, emits, next, input.tick);
      }
    } else {
      lifecycle.push({ type: 'END_EXTRA_TIME', tick: input.tick });
      emits.push({
        type: 'HALF_END',
        payload: { half: 3, score: next.score, minute: clock.displayMinute },
      });
      const stillTied = next.score.home === next.score.away;
      if (!stillTied || !input.enablePenalties) {
        queueFullTime(lifecycle, emits, next, input.tick);
      }
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
