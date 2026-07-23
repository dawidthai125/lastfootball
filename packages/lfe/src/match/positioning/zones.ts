import type { PitchSide } from '../domain/ids';
import type { Pitch } from '../domain/pitch';

import type { Position } from './coordinates';
import { pitchCoordinates } from './coordinates';

/** Named tactical / geometric zones (serializable ids). */
export type PitchZoneId =
  | 'own_penalty'
  | 'own_third'
  | 'middle_third'
  | 'attacking_third'
  | 'opponent_penalty'
  | 'left_flank'
  | 'central_channel'
  | 'right_flank';

export interface PitchZone {
  readonly id: PitchZoneId;
  /** Axis-aligned box in world metres. */
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

/** FIFA-ish penalty area: 16.5m from goal line, 40.32m wide centered. */
function penaltyBox(pitch: Pitch, atHomeGoal: boolean): Omit<PitchZone, 'id'> {
  const depth = 16.5;
  const boxWidth = 40.32;
  const y0 = (pitch.width - boxWidth) / 2;
  const y1 = y0 + boxWidth;
  if (atHomeGoal) {
    return { minX: 0, maxX: depth, minY: y0, maxY: y1 };
  }
  return {
    minX: pitch.length - depth,
    maxX: pitch.length,
    minY: y0,
    maxY: y1,
  };
}

/**
 * Build zones in world space.
 * Longitudinal thirds are absolute; flanks absolute; penalty boxes absolute.
 * `own_*` / `attacking_*` are interpreted relative to `perspective` side.
 */
export function createZones(pitch: Pitch, perspective: PitchSide = 'home'): readonly PitchZone[] {
  const third = pitch.length / 3;
  const flank = pitch.width / 3;
  const homePenalty = penaltyBox(pitch, true);
  const awayPenalty = penaltyBox(pitch, false);

  const ownIsHome = perspective === 'home';
  const ownPenalty = ownIsHome ? homePenalty : awayPenalty;
  const oppPenalty = ownIsHome ? awayPenalty : homePenalty;

  const ownThird = ownIsHome
    ? { minX: 0, maxX: third, minY: 0, maxY: pitch.width }
    : { minX: pitch.length - third, maxX: pitch.length, minY: 0, maxY: pitch.width };
  const midThird = {
    minX: third,
    maxX: third * 2,
    minY: 0,
    maxY: pitch.width,
  };
  const attThird = ownIsHome
    ? { minX: third * 2, maxX: pitch.length, minY: 0, maxY: pitch.width }
    : { minX: 0, maxX: third, minY: 0, maxY: pitch.width };

  return Object.freeze([
    Object.freeze({ id: 'own_penalty' as const, ...ownPenalty }),
    Object.freeze({ id: 'own_third' as const, ...ownThird }),
    Object.freeze({ id: 'middle_third' as const, ...midThird }),
    Object.freeze({ id: 'attacking_third' as const, ...attThird }),
    Object.freeze({ id: 'opponent_penalty' as const, ...oppPenalty }),
    Object.freeze({
      id: 'left_flank' as const,
      minX: 0,
      maxX: pitch.length,
      minY: 0,
      maxY: flank,
    }),
    Object.freeze({
      id: 'central_channel' as const,
      minX: 0,
      maxX: pitch.length,
      minY: flank,
      maxY: flank * 2,
    }),
    Object.freeze({
      id: 'right_flank' as const,
      minX: 0,
      maxX: pitch.length,
      minY: flank * 2,
      maxY: pitch.width,
    }),
  ]);
}

export function pointInZone(pos: Position, zone: PitchZone): boolean {
  return pos.x >= zone.minX && pos.x <= zone.maxX && pos.y >= zone.minY && pos.y <= zone.maxY;
}

export function zonesContaining(
  pos: Position,
  zones: readonly PitchZone[],
): readonly PitchZoneId[] {
  return zones.filter((z) => pointInZone(pos, z)).map((z) => z.id);
}

/** Longitudinal third for a side (own / middle / attacking). */
export function longitudinalThird(
  pos: Position,
  pitch: Pitch,
  side: PitchSide,
): 'own_third' | 'middle_third' | 'attacking_third' {
  const n = pitchCoordinates.toNormalized(pos, side, pitch);
  if (n.x < 1 / 3) return 'own_third';
  if (n.x < 2 / 3) return 'middle_third';
  return 'attacking_third';
}
