/** Core primitives — scaffold only. */
export type Seed = number;

export interface ClockState {
  elapsedMs: number;
  matchMinute: number;
}
