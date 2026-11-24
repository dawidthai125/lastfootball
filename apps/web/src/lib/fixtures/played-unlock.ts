/**
 * Shared unlock gate: modules unlock after N league fixtures played.
 * Pure — used by Transfers, Training, and future domains (ZERO DUPLICATE).
 */

/** Whether played fixture count meets an unlock threshold. */
export function hasPlayedUnlock(playedCount: number, threshold: number): boolean {
  return playedCount >= threshold;
}

/** League matches in one season. A season only ends when all of them are played. */
const SEASON_LEAGUE_MATCHES = 22;

/**
 * Matches that count toward an unlock. A new season clears the fixtures, so the closed
 * seasons are added back: what the club unlocked once stays unlocked.
 */
export function unlockPlayedCount(playedThisSeason: number, seasonNumber: number): number {
  const closed = Number.isFinite(seasonNumber) ? Math.max(0, Math.trunc(seasonNumber) - 1) : 0;
  return playedThisSeason + closed * SEASON_LEAGUE_MATCHES;
}

/** Count fixtures with status `played` in an already-loaded list. */
export function countPlayedInList(fixtures: readonly { readonly status: string }[]): number {
  let n = 0;
  for (const f of fixtures) {
    if (f.status === 'played') n += 1;
  }
  return n;
}

/** UTC calendar date `YYYY-MM-DD` (Training Thin day slot). */
export function utcDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
