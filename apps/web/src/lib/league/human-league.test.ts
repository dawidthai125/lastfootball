import { describe, expect, it } from 'vitest';
import type { PitchRole } from '@lastfootball/lfe';

import type { ClubDto } from '@/lib/club/types';
import { OPPONENT_CATALOG } from '@/lib/fixtures/opponent-catalog';
import type { FixtureDto } from '@/lib/fixtures/types';
import { createSessionFromLeagueFixture } from '@/lib/fixtures/create-session';
import type { RosterPlayerSeed } from '@/lib/squad';

import {
  fillHumanSeats,
  humanFixtureMatchday,
  humanRoundFromFixture,
  kickoffDate,
  kickoffWindowSentence,
  kickoffWindowState,
  nextHumanRound,
  pairingForClub,
  pairingsForMatchday,
  sharedHumanSeed,
  type HumanClubInput,
} from './human-league';
import { finishSharedSession } from './human-play';

const bots = OPPONENT_CATALOG.map((bot) => ({
  id: bot.id,
  name: bot.name,
  shortName: bot.shortName,
}));

function human(id: string, createdAt: string): HumanClubInput {
  return { id, name: `Klub ${id}`, shortName: id.slice(0, 3).toUpperCase(), createdAt };
}

function xi(prefix: string, skill: number, attack: number): RosterPlayerSeed[] {
  const roles: { pos: string; role: PitchRole; number: number }[] = [
    { pos: 'BR', role: 'GK', number: 1 },
    { pos: 'PO', role: 'RB', number: 2 },
    { pos: 'ŚO', role: 'CB', number: 4 },
    { pos: 'ŚO', role: 'CB', number: 5 },
    { pos: 'LO', role: 'LB', number: 3 },
    { pos: 'ŚP', role: 'CM', number: 6 },
    { pos: 'ŚP', role: 'CM', number: 8 },
    { pos: 'ŚP', role: 'CM', number: 10 },
    { pos: 'PN', role: 'RW', number: 7 },
    { pos: 'N', role: 'ST', number: 9 },
    { pos: 'PN', role: 'LW', number: 11 },
  ];
  return roles.map((role, index) => ({
    id: `${prefix}-${index}`,
    name: `${prefix} ${index}`,
    number: role.number,
    pos: role.pos,
    role: role.role,
    starter: true,
    captain: index === 6,
    skill,
    groups: {
      attack,
      passing: Math.max(1, attack - 4),
      defense: 55,
      physical: 62,
      goalkeeping: role.role === 'GK' ? attack : 18,
    },
    energy: prefix === 'home' ? 84 : 71,
    form: prefix === 'home' ? 74 : 63,
  }));
}

function club(id: string, name: string, shortName: string): ClubDto {
  return {
    id,
    ownerId: 'owner',
    name,
    shortName,
    primaryColor: '#000',
    secondaryColor: '#fff',
    crestTemplateId: 'crest',
    createdAt: '2026-11-12T00:00:00Z',
    firstMatchCompletedAt: '2026-11-12T00:00:00Z',
    cashBalance: 1000,
    transferWindowOpen: false,
    lastTrainingOn: null,
    seasonNumber: 1,
    seasonPhase: 'in_season',
    leagueTier: 'iv',
  };
}

function fixture(input: {
  id: string;
  isHome: boolean;
  opponentId: string;
  opponentName: string;
  opponentShort: string;
  seed: number;
}): FixtureDto {
  return {
    id: input.id,
    clubId: 'viewer',
    matchday: humanFixtureMatchday(1),
    competition: 'human',
    opponentClubId: input.opponentId,
    opponent: {
      id: input.opponentId,
      name: input.opponentName,
      shortName: input.opponentShort,
    },
    isHome: input.isHome,
    status: 'upcoming',
    homeScore: null,
    awayScore: null,
    playedAt: null,
    createdAt: '2026-11-12T00:00:00Z',
    sharedSeed: input.seed,
  };
}

describe('human league', () => {
  it('fills 12 seats and leaves the 13th club out', () => {
    const humans = Array.from({ length: 13 }, (_, index) =>
      human(
        `c${String(index).padStart(2, '0')}`,
        `2026-11-${String(index + 1).padStart(2, '0')}T00:00:00Z`,
      ),
    );
    const seats = fillHumanSeats(humans, bots);
    expect(seats).toHaveLength(12);
    expect(seats.filter((seat) => seat.kind === 'human')).toHaveLength(12);
    expect(seats.some((seat) => seat.id === 'c12')).toBe(false);
    expect(seats[0]?.id).toBe('c00');
  });

  it('fills empty seats with bots', () => {
    const seats = fillHumanSeats([human('alpha', '2026-11-01'), human('beta', '2026-11-02')], bots);
    expect(seats.filter((seat) => seat.kind === 'human').map((seat) => seat.id)).toEqual([
      'alpha',
      'beta',
    ]);
    expect(seats.filter((seat) => seat.kind === 'bot')).toHaveLength(10);
  });

  it('plays each pair once, then swaps home in the return leg', () => {
    const seats = fillHumanSeats([human('alpha', '2026-11-01')], bots);
    const seen = new Set<string>();
    for (let matchday = 1; matchday <= 11; matchday += 1) {
      for (const pair of pairingsForMatchday(seats, matchday)) {
        const key = [pair.home.id, pair.away.id].sort().join(':');
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
    }
    expect(seen.size).toBe(66);
    const first = pairingForClub(seats, 1, 'alpha');
    const back = pairingForClub(seats, 12, 'alpha');
    expect(first).not.toBeNull();
    expect(back?.home.id).toBe(first?.away.id);
    expect(back?.away.id).toBe(first?.home.id);
  });

  it('gives both clubs the same seed', () => {
    const seed = sharedHumanSeed('2026-11-12', 1, 'home', 'away');
    expect(sharedHumanSeed('2026-11-12', 1, 'home', 'away')).toBe(seed);
    expect(sharedHumanSeed('2026-11-12', 1, 'away', 'home')).not.toBe(seed);
  });

  it('opens the shared window at 18:00 Warsaw and closes at 21:00', () => {
    const day = '2026-11-12';
    expect(kickoffWindowState(new Date('2026-11-12T16:30:00Z'), day)).toBe('before');
    expect(kickoffWindowState(new Date('2026-11-12T17:00:00Z'), day)).toBe('open');
    expect(kickoffWindowState(new Date('2026-11-12T19:30:00Z'), day)).toBe('open');
    expect(kickoffWindowState(new Date('2026-11-12T20:00:00Z'), day)).toBe('after');
    expect(kickoffWindowState(new Date('2026-11-11T18:00:00Z'), day)).toBe('before');
    expect(kickoffWindowSentence('before')).toContain('18:00');
    expect(kickoffDate('2026-11-12', 2)).toBe('2026-11-13');
    expect(humanRoundFromFixture(humanFixtureMatchday(4))).toBe(4);
  });

  it('plays one catch-up round per Warsaw day', () => {
    const now = new Date('2026-11-14T18:00:00Z');
    expect(
      nextHumanRound({
        seasonKey: '2026-11-12',
        playedRounds: [],
        now,
        playedHumanToday: false,
      }),
    ).toBe(1);
    expect(
      nextHumanRound({
        seasonKey: '2026-11-12',
        playedRounds: [1],
        now,
        playedHumanToday: true,
      }),
    ).toBeNull();
    expect(
      nextHumanRound({
        seasonKey: '2026-11-12',
        playedRounds: [1],
        now: new Date('2026-11-12T18:00:00Z'),
        playedHumanToday: false,
      }),
    ).toBeNull();
  });

  it('two clubs watch the same match from one seed', () => {
    const seed = sharedHumanSeed('2026-11-12', 1, 'home-club', 'away-club');
    const homeXi = xi('home', 72, 80);
    const awayXi = xi('away', 58, 44);
    const homeView = createSessionFromLeagueFixture(
      club('home-club', 'Dom', 'DOM'),
      fixture({
        id: 'fix-home',
        isHome: true,
        opponentId: 'away-club',
        opponentName: 'Wyjazd',
        opponentShort: 'WYJ',
        seed,
      }),
      homeXi,
      [],
      '4-3-3',
      awayXi,
    );
    const awayView = createSessionFromLeagueFixture(
      club('away-club', 'Wyjazd', 'WYJ'),
      fixture({
        id: 'fix-away',
        isHome: false,
        opponentId: 'home-club',
        opponentName: 'Dom',
        opponentShort: 'DOM',
        seed,
      }),
      awayXi,
      [],
      '4-4-2',
      homeXi,
    );

    const homeResult = finishSharedSession(homeView, 500);
    const awayResult = finishSharedSession(awayView, 500);
    expect(homeResult.seed).toBe(seed);
    expect(awayResult).toEqual(homeResult);
    expect(homeResult.homeAttempted + homeResult.awayAttempted).toBeGreaterThan(0);
  }, 20000);
});
