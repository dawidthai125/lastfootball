import { challengeBlockReason, matchdayBlockReason } from '@/lib/fixtures/matchday-gate';

export type KickoffCompetition = 'league' | 'cup' | 'challenge' | 'human';

export type KickoffBlockInput = {
  readonly matchesBlocked: boolean;
  readonly competition: KickoffCompetition | null | undefined;
  readonly lastPlayedAt: string | null | undefined;
  /** Newest played challenge. Only a challenge asks for it. */
  readonly lastChallengeAt?: string | null;
  readonly now: Date;
};

/**
 * Sentence when the next kickoff must not start.
 * Email deadline wins. Human matches skip the Warsaw day rule. Rules themselves stay put.
 */
export function kickoffBlockReason(input: KickoffBlockInput): string | null {
  if (input.matchesBlocked) {
    return 'Potwierdź email, żeby rozgrywać kolejne mecze.';
  }
  if (input.competition === 'human') return null;
  if (input.competition === 'challenge') {
    return challengeBlockReason(input.lastChallengeAt, input.now);
  }
  return matchdayBlockReason(input.lastPlayedAt, input.now);
}

/**
 * Latest played_at on one clock. `match` is the Warsaw day of league and cup; the human league
 * and challenges do not take it. `challenge` has its own day. Same rule completeFixture uses.
 */
export function latestPlayedAt(
  fixtures: readonly {
    status: string;
    competition?: KickoffCompetition;
    playedAt?: string | null;
  }[],
  clock: 'match' | 'challenge' = 'match',
): string | null {
  let best: string | null = null;
  let bestMs = Number.NEGATIVE_INFINITY;
  for (const fixture of fixtures) {
    if (fixture.status !== 'played' || !fixture.playedAt) continue;
    const other = fixture.competition === 'human' || fixture.competition === 'challenge';
    if (clock === 'match' ? other : fixture.competition !== 'challenge') continue;
    const ms = Date.parse(fixture.playedAt);
    if (Number.isNaN(ms) || ms < bestMs) continue;
    bestMs = ms;
    best = fixture.playedAt;
  }
  return best;
}
