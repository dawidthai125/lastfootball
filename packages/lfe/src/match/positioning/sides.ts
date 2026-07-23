import type { PitchSide } from '../domain/ids';
import type { Pitch } from '../domain/pitch';

import type { Position } from './coordinates';
import { pitchCoordinates, position } from './coordinates';

/**
 * Side facing / attacking direction on the pitch.
 * Home attacks +x (toward away goal); Away attacks −x.
 */
export interface PitchSideOrientation {
  readonly side: PitchSide;
  /** Unit facing along attack (radians from +x). */
  readonly attackFacing: number;
  /** Transform own-half normalized point to world. */
  toWorld(normalizedX: number, normalizedY: number, pitch: Pitch): Position;
}

export const HomeSide: PitchSideOrientation = Object.freeze({
  side: 'home' as const,
  attackFacing: 0,
  toWorld(nx: number, ny: number, pitch: Pitch) {
    return pitchCoordinates.toWorld({ x: nx, y: ny }, 'home', pitch);
  },
});

export const AwaySide: PitchSideOrientation = Object.freeze({
  side: 'away' as const,
  /** π radians — facing toward decreasing x. */
  attackFacing: Math.PI,
  toWorld(nx: number, ny: number, pitch: Pitch) {
    return pitchCoordinates.toWorld({ x: nx, y: ny }, 'away', pitch);
  },
});

export function sideOrientation(side: PitchSide): PitchSideOrientation {
  return side === 'home' ? HomeSide : AwaySide;
}

/** Kickoff ball at centre spot. */
export function centreSpotPosition(pitch: Pitch): Position {
  return position(pitch.centreSpot.x, pitch.centreSpot.y);
}
