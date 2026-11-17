export type ClubMatchResult = 'win' | 'draw' | 'loss';

/** Inaugural match is always at home. Rejects a missing or absurd score. */
export function clubHomeResult(home: number, away: number): ClubMatchResult | null {
  if (!Number.isInteger(home) || !Number.isInteger(away)) return null;
  if (home < 0 || away < 0 || home > 30 || away > 30) return null;
  if (home > away) return 'win';
  if (home < away) return 'loss';
  return 'draw';
}
