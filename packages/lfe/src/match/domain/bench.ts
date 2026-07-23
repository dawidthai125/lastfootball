import type { PlayerId, PitchSide } from './ids';

export interface Bench {
  readonly side: PitchSide;
  readonly playerIds: readonly PlayerId[];
}

export function createBench(side: PitchSide, playerIds: readonly PlayerId[]): Bench {
  return Object.freeze({
    side,
    playerIds: Object.freeze([...playerIds]),
  });
}
