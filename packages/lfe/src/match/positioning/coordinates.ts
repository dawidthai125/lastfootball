import type { PitchPoint, PitchSide } from '../domain/ids';
import type { Pitch } from '../domain/pitch';

/**
 * Absolute pitch position in metres.
 * Origin: home goal line (x=0), left touchline from home attacking view (y=0).
 * Independent of Canvas / camera.
 */
export interface Position {
  readonly x: number;
  readonly y: number;
}

export function position(x: number, y: number): Position {
  return Object.freeze({ x, y });
}

/**
 * Pitch coordinate helpers — normalized (0–1) ↔ world metres.
 * Formation anchors use attacking-relative normalized space.
 */
export interface PitchCoordinates {
  /** Normalized attacking-relative → world metres for a side. */
  toWorld(normalized: PitchPoint, side: PitchSide, pitch: Pitch): Position;
  /** World metres → attacking-relative normalized for a side. */
  toNormalized(world: Position, side: PitchSide, pitch: Pitch): PitchPoint;
  clamp(pos: Position, pitch: Pitch): Position;
  isOnPitch(pos: Position, pitch: Pitch): boolean;
}

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export const pitchCoordinates: PitchCoordinates = {
  toWorld(normalized, side, pitch) {
    if (side === 'home') {
      return position(normalized.x * pitch.length, normalized.y * pitch.width);
    }
    // Away attacks toward home goal: mirror both axes.
    return position((1 - normalized.x) * pitch.length, (1 - normalized.y) * pitch.width);
  },

  toNormalized(world, side, pitch) {
    const nx = pitch.length === 0 ? 0 : world.x / pitch.length;
    const ny = pitch.width === 0 ? 0 : world.y / pitch.width;
    if (side === 'home') {
      return Object.freeze({ x: clamp01(nx), y: clamp01(ny) });
    }
    return Object.freeze({ x: clamp01(1 - nx), y: clamp01(1 - ny) });
  },

  clamp(pos, pitch) {
    return position(
      Math.min(pitch.length, Math.max(0, pos.x)),
      Math.min(pitch.width, Math.max(0, pos.y)),
    );
  },

  isOnPitch(pos, pitch) {
    return pos.x >= 0 && pos.x <= pitch.length && pos.y >= 0 && pos.y <= pitch.width;
  },
};

export type { PitchCoordinates as PitchCoordinatesApi };
