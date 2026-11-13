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

/**
 * Technique at normal or high intensity adds one tempo habit point.
 * Other foci leave the tempo habit unchanged.
 */
export function gainTempo(points: number, focus: string, intensity: string): number {
  const current = clampStyle(points);
  if (focus === 'technique' && (intensity === 'normal' || intensity === 'high')) {
    return Math.min(STYLE_THIN.CAP, current + 1);
  }
  return current;
}

/** Same kickoff scale as pressing. A missing habit stays at tempo 50. */
export function kickoffTempo(points: number): number {
  return kickoffPressing(points);
}

/**
 * Physical at normal or high intensity adds one width habit point.
 * Other foci leave the width habit unchanged.
 */
export function gainWidth(points: number, focus: string, intensity: string): number {
  const current = clampStyle(points);
  if (focus === 'physical' && (intensity === 'normal' || intensity === 'high')) {
    return Math.min(STYLE_THIN.CAP, current + 1);
  }
  return current;
}

/** Same kickoff scale as pressing. A missing habit stays at width 50. */
export function kickoffWidth(points: number): number {
  return kickoffPressing(points);
}

/** One line for the club card. Points are 0..8, kickoff dials are 50..66. */
export function clubStyleSentence(pressing: number, tempo: number, width: number): string {
  const press = clampStyle(pressing);
  const pace = clampStyle(tempo);
  const wide = clampStyle(width);
  return `Styl sezonu: pressing ${press}/${STYLE_THIN.CAP} (start ${kickoffPressing(press)}), tempo ${pace}/${STYLE_THIN.CAP} (start ${kickoffTempo(pace)}), szerokość ${wide}/${STYLE_THIN.CAP} (start ${kickoffWidth(wide)}).`;
}
