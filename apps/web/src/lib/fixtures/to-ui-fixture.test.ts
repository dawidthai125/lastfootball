import { describe, expect, it } from 'vitest';

import { playedMatchHref } from '@/components/fixtures/FixturesView';
import type { ClubDto } from '@/lib/club/types';
import {
  buildLeagueLiveBundle,
  buildLeaguePreMatchBundle,
  toUiFixture,
} from '@/lib/fixtures/to-ui-fixture';
import { resolveMatchFacts } from '@/lib/fixtures/match-facts';
import type { FixtureDto } from '@/lib/fixtures/types';
import { seedOpponentSquad } from '@/lib/squad';
import { stadiumSeats } from '@/lib/stadium/levels';

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

describe('match facts', () => {
  const upcoming = (id: string, patch: Partial<FixtureDto> = {}): FixtureDto => ({
    ...played(),
    id,
    status: 'upcoming',
    homeScore: null,
    awayScore: null,
    ...patch,
  });
  const seats = (text: string) => Number(text.replace(/ /g, ''));
  const many = (patch: Partial<FixtureDto>, stands = 0) =>
    Array.from({ length: 200 }, (_, i) =>
      resolveMatchFacts(upcoming(`fx-${i}-${patch.matchday ?? 0}`, patch), stands),
    );

  it('pre-match and live show the same facts for one fixture', () => {
    for (const patch of [
      {},
      { isHome: false },
      { homeStandsLevel: 3, homeFanMood: 90 },
      { competition: 'cup' as const, matchday: 104, homeStandsLevel: 2 },
      { competition: 'human' as const, matchday: 301, sharedSeed: 77 },
    ]) {
      const dto = upcoming('fx-same', patch);
      const pre = buildLeaguePreMatchBundle(club, dto, seedOpponentSquad('xi'));
      const live = buildLeagueLiveBundle(club, dto);
      expect(live.viewers).toBe(pre.attendance);
      expect(live.weather).toBe(`${pre.temperature} · ${pre.weather.toLowerCase()}`);
    }
  });

  it('varies by fixture and never sells more than the seats', () => {
    for (const stands of [0, 3]) {
      const facts = many({ homeFanMood: 100, matchday: 5 }, stands);
      expect(new Set(facts.map((f) => f.referee)).size).toBeGreaterThan(8);
      expect(new Set(facts.map((f) => f.attendance)).size).toBeGreaterThan(50);
      for (const f of facts) {
        expect(seats(f.attendance)).toBeGreaterThan(0);
        expect(seats(f.attendance)).toBeLessThanOrEqual(stadiumSeats(stands));
      }
    }
    const avg = (mood: number) =>
      many({ homeFanMood: mood }).reduce((sum, f) => sum + seats(f.attendance), 0) / 200;
    expect(avg(90)).toBeGreaterThan(avg(60));
    expect(avg(60)).toBeGreaterThan(avg(20));
  });

  it('plays August warm and the winter weeks cold', () => {
    const degrees = (matchday: number) =>
      many({ matchday }).map((f) => Number.parseInt(f.temperature, 10));
    expect(Math.min(...degrees(1))).toBeGreaterThanOrEqual(17);
    expect(Math.max(...degrees(11))).toBeLessThanOrEqual(10);
    expect(Math.max(...degrees(12))).toBeLessThanOrEqual(8);
    expect(Math.min(...degrees(22))).toBeGreaterThanOrEqual(13);
    expect(many({ matchday: 1 }).some((f) => f.weather === 'Śnieg')).toBe(false);
  });

  it('both human-league viewers read the same facts', () => {
    const human = { competition: 'human' as const, matchday: 301, sharedSeed: 9 };
    const home = upcoming('a', { ...human, clubId: 'h', opponentClubId: 'v', homeFanMood: 10 });
    const away = upcoming('b', { ...human, clubId: 'v', opponentClubId: 'h', isHome: false });
    expect(resolveMatchFacts(home, 1)).toEqual(resolveMatchFacts(away, 1));
  });
});
