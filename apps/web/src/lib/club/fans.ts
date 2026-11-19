export type FanResult = 'win' | 'draw' | 'loss';

export function nextFanMood(current: number, result: FanResult): number {
  const base = Number.isFinite(current) ? Math.trunc(current) : 60;
  const delta = result === 'win' ? 6 : result === 'loss' ? -6 : 1;
  return Math.max(0, Math.min(100, base + delta));
}

export function fanMoodLabel(mood: number): string {
  if (!Number.isFinite(mood)) return 'Spokojni';
  if (mood >= 75) return 'Gorący';
  if (mood >= 50) return 'Spokojni';
  if (mood >= 25) return 'Zniecierpliwieni';
  return 'Wściekli';
}

/** Qualitative post-match line — REUSE nextFanMood / fanMoodLabel (no DB). */
export function describeFanMoodChange(current: number, result: FanResult): string {
  const before = Number.isFinite(current) ? Math.trunc(current) : 60;
  const after = nextFanMood(before, result);
  const delta = after - before;
  const signed = delta > 0 ? `+${delta}` : `${delta}`;
  return `Kibice: ${fanMoodLabel(after)} ${after} (${signed})`;
}

export function fanResultFromScores(
  homeScore: number,
  awayScore: number,
  isHome: boolean,
): FanResult {
  const ours = isHome ? homeScore : awayScore;
  const theirs = isHome ? awayScore : homeScore;
  if (ours > theirs) return 'win';
  if (ours < theirs) return 'loss';
  return 'draw';
}
