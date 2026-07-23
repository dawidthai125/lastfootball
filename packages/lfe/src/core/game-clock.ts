import { tickDurationMs } from '../config';

/** Simulation clock — advances only on ticks (deterministic). */
export interface GameClock {
  /** Absolute tick index (0-based before first tick completes; after step = ticks executed). */
  tick: number;
  /** Elapsed simulation milliseconds. */
  elapsedMs: number;
  /** Match clock minutes (EPIC-1: elapsedMs / 60_000). */
  matchMinute: number;
  /** Advance one tick. */
  advance(ticksPerSecond: number): void;
  snapshot(): ClockSnapshot;
  restore(snapshot: ClockSnapshot): void;
}

export interface ClockSnapshot {
  tick: number;
  elapsedMs: number;
  matchMinute: number;
}

export function createGameClock(): GameClock {
  let tick = 0;
  let elapsedMs = 0;

  return {
    get tick() {
      return tick;
    },
    get elapsedMs() {
      return elapsedMs;
    },
    get matchMinute() {
      return elapsedMs / 60_000;
    },
    advance(ticksPerSecond) {
      tick += 1;
      elapsedMs += tickDurationMs(ticksPerSecond);
    },
    snapshot() {
      return { tick, elapsedMs, matchMinute: elapsedMs / 60_000 };
    },
    restore(s) {
      tick = s.tick;
      elapsedMs = s.elapsedMs;
    },
  };
}
