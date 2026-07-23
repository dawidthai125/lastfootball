/** Backward-compatible scaffold types from pre–EPIC-1 core. */

export type Seed = number;

export interface ClockState {
  elapsedMs: number;
  matchMinute: number;
}
