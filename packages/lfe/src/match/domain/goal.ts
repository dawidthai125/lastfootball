import type { PitchPoint, PitchSide } from './ids';

export interface Goal {
  readonly side: PitchSide;
  /** Mouth centre on the goal line. */
  readonly centre: PitchPoint;
  readonly width: number;
  readonly height: number;
}

export function createGoals(pitchLength: number, pitchWidth: number): readonly [Goal, Goal] {
  const width = 7.32;
  const height = 2.44;
  const y = pitchWidth / 2;
  return Object.freeze([
    Object.freeze({
      side: 'home' as const,
      centre: Object.freeze({ x: 0, y }),
      width,
      height,
    }),
    Object.freeze({
      side: 'away' as const,
      centre: Object.freeze({ x: pitchLength, y }),
      width,
      height,
    }),
  ]) as readonly [Goal, Goal];
}
