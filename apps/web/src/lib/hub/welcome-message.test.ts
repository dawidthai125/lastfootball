import { describe, expect, it } from 'vitest';

import type { ClubDto } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';
import { buildWelcomeMessage } from '@/lib/hub/early-club-content';

const day = 'Kolejka na dziś już rozegrana. Następny mecz od jutra.';
const pitch = 'Przygotuj skład i wyjdź na boisko — to Twoja sprawa dnia.';
const fallback =
  'Pierwszy mecz masz za sobą. Skład to Twój następny krok — poznaj zawodników i wróć, gdy będziesz gotów na kolejne wyzwanie.';

function club(): ClubDto {
  return {
    id: 'c1',
    ownerId: 'u1',
    name: 'Test FC',
    shortName: 'TFC',
    primaryColor: '#112233',
    secondaryColor: '#445566',
    crestTemplateId: 'crest-a',
    createdAt: '2026-01-01T00:00:00.000Z',
    firstMatchCompletedAt: '2026-07-24T12:00:00.000Z',
    cashBalance: 100_000,
    transferWindowOpen: false,
    lastTrainingOn: null,
    seasonNumber: 1,
    seasonPhase: 'in_season',
    leagueTier: 'iv',
  };
}

function nextFixture(): FixtureDto {
  return {
    id: 'fx-2',
    clubId: 'c1',
    matchday: 2,
    competition: 'league',
    opponentClubId: 'opp-legia-rzeczna',
    opponent: { id: 'opp-legia-rzeczna', name: 'Legia Rzeczna', shortName: 'LRZ' },
    isHome: true,
    status: 'upcoming',
    homeScore: null,
    awayScore: null,
    playedAt: null,
    createdAt: '2026-07-24T12:00:00.000Z',
  };
}

describe('buildWelcomeMessage kickoff block', () => {
  it('uses the block sentence and drops the pitch invitation', () => {
    const message = buildWelcomeMessage(club(), nextFixture(), day);
    expect(message.subject).toBe('Kolejka 2 czeka');
    expect(message.body).toBe(`${day} Następny rywal: Legia Rzeczna.`);
    expect(message.body).not.toContain('wyjdź na boisko');
    expect(message.body).not.toContain('Przygotuj skład');
  });

  it('keeps the pitch sentence when the kickoff sentence is null or empty', () => {
    const expected = `Następny rywal: Legia Rzeczna. ${pitch}`;
    expect(buildWelcomeMessage(club(), nextFixture(), null).body).toBe(expected);
    expect(buildWelcomeMessage(club(), nextFixture(), '').body).toBe(expected);
    expect(buildWelcomeMessage(club(), nextFixture()).body).toBe(expected);
  });

  it('keeps the fallback body when there is no next fixture', () => {
    expect(buildWelcomeMessage(club(), null, day).body).toBe(fallback);
    expect(buildWelcomeMessage(club(), null, null).body).toBe(fallback);
    expect(buildWelcomeMessage(club(), null).subject).toBe('Witaj w Test FC');
  });
});
