import { matchdayBlockReason } from '@/lib/fixtures/matchday-gate';

export type KickoffCompetition = 'league' | 'cup' | 'challenge' | 'human';

export type KickoffBlockInput = {
  readonly matchesBlocked: boolean;
  readonly competition: KickoffCompetition | null | undefined;
  readonly lastPlayedAt: string | null | undefined;
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
  return matchdayBlockReason(input.lastPlayedAt, input.now);
}

/**
 * Latest played_at that takes the Warsaw day: every competition except the human league,
 * which has its own clock. Same rule completeFixture uses.
 */
export function latestPlayedAt(
  fixtures: readonly {
    status: string;
    competition?: KickoffCompetition;
    playedAt?: string | null;
  }[],
): string | null {
  let best: string | null = null;
  let bestMs = Number.NEGATIVE_INFINITY;
  for (const fixture of fixtures) {
    if (fixture.status !== 'played' || !fixture.playedAt) continue;
    if (fixture.competition === 'human') continue;
    const ms = Date.parse(fixture.playedAt);
    if (Number.isNaN(ms) || ms < bestMs) continue;
    bestMs = ms;
    best = fixture.playedAt;
  }
  return best;
}
