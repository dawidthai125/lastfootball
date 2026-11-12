/** Pressing habit 0..8. Kickoff pressing is 50 plus two per point, never above 66. */

export const STYLE_THIN = { CAP: 8, PER_POINT: 2 } as const;

/** Finite integer truncated toward 0, then clamped to 0..CAP. Anything else is 0. */
export function clampStyle(points: number): number {
  if (!Number.isFinite(points)) return 0;
  const truncated = Math.trunc(points);
  if (truncated <= 0) return 0;
  if (truncated >= STYLE_THIN.CAP) return STYLE_THIN.CAP;
  return truncated;
}

/**
 * Tactics at normal or high intensity adds one habit point.
 * Light intensity, any other focus, or any other intensity leaves the habit unchanged.
 */
export function gainStyle(points: number, focus: string, intensity: string): number {
  const current = clampStyle(points);
  if (focus === 'tactics' && (intensity === 'normal' || intensity === 'high')) {
    return Math.min(STYLE_THIN.CAP, current + 1);
  }
  return current;
}

/** Default pressing 50, plus PER_POINT for each habit point. */
export function kickoffPressing(points: number): number {
  return 50 + clampStyle(points) * STYLE_THIN.PER_POINT;
}
