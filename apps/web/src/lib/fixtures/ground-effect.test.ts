import { describe, expect, it } from 'vitest';

import { createSessionFromLeagueFixture } from '@/lib/fixtures/create-session';
import { mapFixtureRow } from '@/lib/fixtures/map-fixture';
import { replayManagerMatch } from '@/lib/match/replay-manager-match';
import { seedOpponentSquad } from '@/lib/squad';

const CLUB = { id: 'club-a', name: 'A', shortName: 'A', leagueTier: 'iv' } as never;

function play(seed: number, extra: Record<string, unknown>) {
  const row = mapFixtureRow({
    id: `fx-${seed}`,
    club_id: 'club-a',
    matchday: 5,
    competition: 'league',
    opponent_club_id: 'bot-x',
    is_home: true,
    status: 'upcoming',
    home_score: null,
    away_score: null,
    played_at: null,
    created_at: '2026-11-24T00:00:00Z',
  } as never);
  const xi = seedOpponentSquad('our-squad', 'iv');
  const rival = seedOpponentSquad('rival-squad', 'iv');
  const session = createSessionFromLeagueFixture(
    CLUB,
    { ...row, ...extra } as never,
    xi,
    [],
    '4-4-2',
    rival,
  );
  return { session, result: replayManagerMatch(session, 'home', []) };
}

describe('ground of a match', () => {
  it('the pitch of the host changes the match', () => {
    const level0 = [1, 2, 3, 4].map((seed) => play(seed, {}).result);
    const level3 = [1, 2, 3, 4].map((seed) => play(seed, { homePitchLevel: 3 }).result);
    expect(level3).not.toEqual(level0);
  });

  it('a cup final has no host', () => {
    expect(play(1, {}).session.getMatchState().rules?.neutral).toBeUndefined();
    const final = play(1, { competition: 'cup', matchday: 104 });
    expect(final.session.getMatchState().rules?.neutral).toBe(true);
    expect(final.result).not.toBeNull();
  });
});
