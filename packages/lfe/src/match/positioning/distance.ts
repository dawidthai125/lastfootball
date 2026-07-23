import type { Position } from './coordinates';

/**
 * Pure spatial metrics — deterministic, no physics.
 */
export interface DistanceCalculator {
  distance(a: Position, b: Position): number;
  distanceSquared(a: Position, b: Position): number;
  manhattan(a: Position, b: Position): number;
  isWithin(a: Position, b: Position, radius: number): boolean;
  /** Angle from a → b in radians (−π..π), 0 = +x. */
  bearing(a: Position, b: Position): number;
  closest<T extends { position: Position }>(
    origin: Position,
    candidates: readonly T[],
  ): T | undefined;
}

export const distanceCalculator: DistanceCalculator = {
  distanceSquared(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  },
  distance(a, b) {
    return Math.sqrt(this.distanceSquared(a, b));
  },
  manhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  },
  isWithin(a, b, radius) {
    const r = radius * radius;
    return this.distanceSquared(a, b) <= r;
  },
  bearing(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
  },
  closest(origin, candidates) {
    if (candidates.length === 0) return undefined;
    let best = candidates[0]!;
    let bestD = this.distanceSquared(origin, best.position);
    for (let i = 1; i < candidates.length; i += 1) {
      const c = candidates[i]!;
      const d = this.distanceSquared(origin, c.position);
      if (d < bestD) {
        best = c;
        bestD = d;
      }
    }
    return best;
  },
};
