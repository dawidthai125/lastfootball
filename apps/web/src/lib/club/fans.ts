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
  // At the edge the step was cut to an unknown part, so no number is better than a wrong one.
  if ((delta > 0 && after >= 100) || (delta < 0 && after <= 0)) {
    return `Kibice: ${fanMoodLabel(after)} ${after}`;
  }
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

/** The match behind the stored mood: every competition of the club moves it. */
export function lastMoodFixture<
  T extends { readonly status: string; readonly playedAt: string | null },
>(fixtures: readonly T[]): T | null {
  let last: T | null = null;
  for (const fixture of fixtures) {
    if (fixture.status !== 'played' || !fixture.playedAt) continue;
    if (!last || Date.parse(fixture.playedAt) > Date.parse(last.playedAt!)) last = fixture;
  }
  return last;
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

/**
 * Hub strip label — REUSE played-fixture Kibice line when the last match has scores.
 * Falls back to mood label only (no second Δ formula).
 */
export function resolveHubFanLabel(
  storedMood: number | null | undefined,
  lastPlayed: {
    readonly id: string;
    readonly homeScore: number | null;
    readonly awayScore: number | null;
    readonly isHome: boolean;
  } | null,
): string | null {
  if (typeof storedMood !== 'number' || !Number.isFinite(storedMood)) return null;
  if (lastPlayed) {
    const withDelta = resolvePlayedFixtureFanLine({
      fixtureId: lastPlayed.id,
      latestPlayedId: lastPlayed.id,
      homeScore: lastPlayed.homeScore,
      awayScore: lastPlayed.awayScore,
      isHome: lastPlayed.isHome,
      storedMood,
    });
    if (withDelta) return withDelta;
  }
  return `Kibice: ${fanMoodLabel(storedMood)} ${Math.trunc(storedMood)}`;
}
