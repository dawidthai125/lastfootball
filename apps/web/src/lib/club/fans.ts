export type FanResult = 'win' | 'draw' | 'loss';

export function fanMoodDelta(result: FanResult): number {
  return result === 'win' ? 6 : result === 'loss' ? -6 : 1;
}

export function nextFanMood(current: number, result: FanResult): number {
  const base = Number.isFinite(current) ? Math.trunc(current) : 60;
  return Math.max(0, Math.min(100, base + fanMoodDelta(result)));
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

/**
 * Line for a played fixture when `fan_mood` already includes that result.
 * Shows stored mood + the signed delta for this scoreline (Information Thin).
 */
export function describeFanMoodAfterResult(storedMood: number, result: FanResult): string {
  const after = Number.isFinite(storedMood) ? Math.trunc(storedMood) : 60;
  const delta = fanMoodDelta(result);
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

/** Played-recap line only for the club's latest settled fixture. */
export function resolvePlayedFixtureFanLine(input: {
  readonly fixtureId: string;
  readonly latestPlayedId: string | null;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly isHome: boolean;
  readonly storedMood: number | null;
}): string | null {
  if (!input.latestPlayedId || input.fixtureId !== input.latestPlayedId) return null;
  if (input.homeScore == null || input.awayScore == null) return null;
  if (typeof input.storedMood !== 'number' || !Number.isFinite(input.storedMood)) return null;
  const result = fanResultFromScores(input.homeScore, input.awayScore, input.isHome);
  return describeFanMoodAfterResult(input.storedMood, result);
}
