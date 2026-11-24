import { describe, expect, it } from 'vitest';

import { prestigeBand, resolvePrestige } from '@/lib/board/prestige';
import {
  buildSeasonHistory,
  fromSeasonHistoryRow,
  toSeasonHistoryRow,
  type SeasonHistory,
} from '@/lib/board/season-history';
import { resolveNationalCup } from '@/lib/cup/resolve-national-cup';
import type { FixtureDto } from '@/lib/fixtures/types';
import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';
import { LEAGUE_TIERS_ASC, type LeagueTier } from '@/lib/league/league-tier';

function row(over: Partial<SeasonHistory> = {}): SeasonHistory {
  return {
    seasonNumber: 1,
    leagueTier: 'iv',
    position: 6,
    tableSize: 12,
    points: 30,
    won: 8,
    drawn: 6,
    lost: 8,
    goalsFor: 28,
    goalsAgainst: 28,
    cupRoundReached: 1,
    outcome: 'stay',
    ...over,
  };
}

function value(
  leagueTier: LeagueTier,
  history: readonly SeasonHistory[] = [],
  tasks: readonly number[] = [],
): number {
  return resolvePrestige({ leagueTier, history, completedTaskSeasons: tasks }).value;
}

function seasons(count: number, over: Partial<SeasonHistory>): SeasonHistory[] {
  return Array.from({ length: count }, (_, i) => row({ ...over, seasonNumber: i + 1 }));
}

describe('resolvePrestige', () => {
  it('starts a IV-league club at 10, without any sponsor effect', () => {
    const dto = resolvePrestige({ leagueTier: 'iv', history: [], completedTaskSeasons: [] });
    expect(dto).toMatchObject({ value: 10, band: 'Nieznany', sponsorShare: 0 });
    expect(dto.sources.map((s) => s.label)).toEqual(['IV liga']);
  });

  it('stays a whole number in 0..100', () => {
    const best = seasons(16, {
      leagueTier: 'i',
      position: 1,
      cupRoundReached: 5,
      outcome: 'promote',
    });
    const worst = seasons(16, { position: 12, cupRoundReached: 0, outcome: 'relegate' });
    expect(value('i', best, Array(64).fill(16))).toBe(100);
    expect(value('iv', worst)).toBe(0);
    for (const tier of LEAGUE_TIERS_ASC) {
      expect(Number.isInteger(value(tier, seasons(3, { leagueTier: tier })))).toBe(true);
    }
  });

  it('never falls for a better place, a deeper cup run or another task', () => {
    for (const leagueTier of LEAGUE_TIERS_ASC) {
      const at = (over: Partial<SeasonHistory>, tasks = 0) =>
        resolvePrestige({
          leagueTier,
          history: [row({ leagueTier, ...over })],
          completedTaskSeasons: Array(tasks).fill(1),
        }).value;
      for (let place = 2; place <= 12; place += 1) {
        expect(at({ position: place - 1 })).toBeGreaterThanOrEqual(at({ position: place }));
      }
      for (let round = 1; round <= 5; round += 1) {
        expect(at({ cupRoundReached: round })).toBeGreaterThanOrEqual(
          at({ cupRoundReached: round - 1 }),
        );
      }
      for (let n = 1; n <= 4; n += 1) expect(at({}, n)).toBeGreaterThanOrEqual(at({}, n - 1));
      expect(at({ outcome: 'promote' })).toBeGreaterThan(at({ outcome: 'stay' }));
      expect(at({ outcome: 'relegate' })).toBeLessThan(at({ outcome: 'stay' }));
    }
  });

  it('rises slowly with a promotion and falls slightly with a relegation', () => {
    const up = value('iii', [row({ position: 1, outcome: 'promote' })]) - value('iv');
    expect(up).toBeGreaterThanOrEqual(8);
    expect(up).toBeLessThanOrEqual(15);
    const before = seasons(3, { leagueTier: 'iii' });
    const down = row({ seasonNumber: 4, leagueTier: 'iii', position: 12, outcome: 'relegate' });
    const drop = value('iii', before) - value('iv', [...before, down]);
    expect(drop).toBeGreaterThan(5);
    expect(drop).toBeLessThanOrEqual(15);
    expect(value('iv', [row({ position: 12 })])).toBe(8);
  });

  it('weighs recent seasons more', () => {
    const win = { position: 1, cupRoundReached: 5 };
    const fresh = [row(), row({ seasonNumber: 2, ...win })];
    const old = [row(win), row({ seasonNumber: 2 })];
    expect(value('iv', fresh)).toBeGreaterThan(value('iv', old));
  });

  it('names where the points come from', () => {
    const dto = resolvePrestige({
      leagueTier: 'iv',
      history: [row({ leagueTier: 'iii', position: 11, outcome: 'relegate', cupRoundReached: 3 })],
      completedTaskSeasons: [1, 1],
    });
    expect(dto.sources.map((s) => `${s.label} ${s.pointsLabel}`)).toEqual([
      'IV liga +10',
      'Miejsca w lidze −1,5',
      'Awanse i spadki −3',
      'Puchar Krajowy +2',
      'Zadania zarządu +1',
    ]);
    const total = dto.sources.reduce((sum, s) => sum + s.points, 0);
    expect(dto.value).toBe(Math.round(total));
  });

  it('reaches every band over a long career', () => {
    expect([0, 19, 20, 40, 60, 80, 100].map(prestigeBand)).toEqual([
      'Nieznany',
      'Nieznany',
      'Lokalny',
      'Rozpoznawalny',
      'Ceniony',
      'Wielki',
      'Wielki',
    ]);
    const tasks = (count: number) =>
      seasons(8, {}).flatMap((s) => Array(count).fill(s.seasonNumber));
    const steady = (tier: LeagueTier, position: number, cupRoundReached: number) =>
      value(tier, seasons(8, { leagueTier: tier, position, cupRoundReached }), tasks(2));
    expect(steady('iv', 6, 1)).toBeLessThan(25);
    expect(prestigeBand(steady('i', 6, 2))).toBe('Rozpoznawalny');
    expect(prestigeBand(steady('i', 1, 4))).toBe('Wielki');
  });
});

describe('season history payload', () => {
  const club = {
    id: 'club-x',
    name: 'Klub',
    shortName: 'KLB',
    leagueTier: 'iv' as const,
    seasonNumber: 2,
  };
  const league = planClubFixtures(club.id).map((p): FixtureDto => ({
    id: `f${p.matchday}`,
    clubId: club.id,
    matchday: p.matchday,
    competition: 'league',
    opponentClubId: p.opponentClubId,
    opponent: { id: p.opponentClubId, name: 'O', shortName: 'O' } as FixtureDto['opponent'],
    isHome: p.isHome,
    status: 'played',
    homeScore: p.isHome ? 3 : 0,
    awayScore: p.isHome ? 0 : 3,
    playedAt: null,
    createdAt: '2026-01-01T00:00:00Z',
  }));

  it('stores the closed season and survives the row round trip', () => {
    const history = buildSeasonHistory(club, league)!;
    expect(history).toMatchObject({
      seasonNumber: 2,
      leagueTier: 'iv',
      position: 1,
      tableSize: 12,
      points: 66,
      won: 22,
      goalsFor: 66,
      goalsAgainst: 0,
      outcome: 'promote',
    });
    // Qualified and drawn, but no cup match played.
    expect(history.cupRoundReached).toBe(1);
    expect(fromSeasonHistoryRow(toSeasonHistoryRow(history))).toEqual(history);
  });

  it('follows the cup run to the trophy', () => {
    let fixtures = [...league];
    for (const round of [1, 2, 3, 4]) {
      const tie = resolveNationalCup(club, fixtures).playerTie!;
      fixtures = [
        ...fixtures,
        {
          ...league[0]!,
          id: `cup${round}`,
          competition: 'cup',
          matchday: tie.matchday,
          opponentClubId: tie.opponentId,
          isHome: tie.isHome,
          homeScore: tie.isHome ? 1 : 0,
          awayScore: tie.isHome ? 0 : 1,
        },
      ];
      const reached = buildSeasonHistory(club, fixtures)!.cupRoundReached;
      expect(reached).toBe(round + 1);
    }
  });

  it('records nothing before the last league match', () => {
    expect(buildSeasonHistory(club, league.slice(1))).toBeNull();
    expect(buildSeasonHistory(club, [])).toBeNull();
  });
});
