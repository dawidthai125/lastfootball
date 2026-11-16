import { describe, expect, it } from 'vitest';

import { playedMatchHref } from '@/components/fixtures/FixturesView';
import type { ClubDto } from '@/lib/club/types';
import { toUiFixture } from '@/lib/fixtures/to-ui-fixture';
import type { FixtureDto } from '@/lib/fixtures/types';

const club: ClubDto = {
  id: 'c1',
  ownerId: 'u1',
  name: 'Lastovia',
  shortName: 'LAS',
  primaryColor: '#112233',
  secondaryColor: '#445566',
  crestTemplateId: 'crest-a',
  createdAt: '2026-01-01T00:00:00.000Z',
  firstMatchCompletedAt: '2026-07-24T12:00:00.000Z',
  cashBalance: 100_000,
  transferWindowOpen: true,
  lastTrainingOn: null,
  seasonNumber: 1,
  seasonPhase: 'in_season',
  leagueTier: 'iv',
};

function played(matchNote?: string | null): FixtureDto {
  return {
    id: 'fx-played',
    clubId: club.id,
    matchday: 3,
    competition: 'league',
    opponentClubId: 'opp-wilki-polnocy',
    opponent: { id: 'opp-wilki-polnocy', name: 'Wilki Północy', shortName: 'WLP' },
    isHome: true,
    status: 'played',
    homeScore: 1,
    awayScore: 0,
    playedAt: '2026-07-25T00:00:00.000Z',
    createdAt: '2026-07-25T00:00:00.000Z',
    matchNote,
  };
}

describe('played fixture note', () => {
  it('maps a saved note and leaves a missing note empty', () => {
    const withNote = toUiFixture(played('Lastovia wygrała 1:0.'), club);
    const withoutNote = toUiFixture(played(null), club);

    expect(withNote.matchNote).toBe('Lastovia wygrała 1:0.');
    expect(withoutNote.matchNote).toBeNull();
    expect(withNote.score).toBe('1:0');
    expect(withoutNote.score).toBe('1:0');
    expect(playedMatchHref(withNote.id)).toBe('/match/fx-played');
  });
});
