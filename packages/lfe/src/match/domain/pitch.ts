import type { PitchPoint } from './ids';

/** FIFA-ish default pitch in metres. */
export interface Pitch {
  readonly length: number;
  readonly width: number;
  readonly centreSpot: PitchPoint;
  readonly halfwayY: number;
}

export const DEFAULT_PITCH: Pitch = Object.freeze({
  length: 105,
  width: 68,
  centreSpot: Object.freeze({ x: 52.5, y: 34 }),
  halfwayY: 34,
});

export function createPitch(partial?: Partial<Pitch>): Pitch {
  const length = partial?.length ?? DEFAULT_PITCH.length;
  const width = partial?.width ?? DEFAULT_PITCH.width;
  return Object.freeze({
    length,
    width,
    centreSpot: Object.freeze(partial?.centreSpot ?? { x: length / 2, y: width / 2 }),
    halfwayY: partial?.halfwayY ?? width / 2,
  });
}
