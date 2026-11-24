import { describe, expect, it } from 'vitest';

import { OPPONENT_CATALOG } from '@/lib/fixtures/opponent-catalog';
import {
  dueHumanSeasonKey,
  fillHumanSeats,
  humanFixtureMatchday,
  humanRoundFromFixture,
  humanSeasonFromFixture,
  nextHumanRound,
  nextHumanSeasonStart,
  pairingsForMatchday,
} from './human-league';
import { lineupProblem, repairLineup } from '@/lib/squad/lineup-problem';
import type { PlayerRowDto } from '@/lib/squad/types';
import { resolveHumanTable, settleMissing } from './human-table';

const KEY = '2026-11-12';
const at = (iso: string) => new Date(iso);

describe('human league seasons (D138)', () => {
  it('numbers fixtures per season and reads them back', () => {
    expect(humanFixtureMatchday(1)).toBe(301);
    expect(humanFixtureMatchday(22, 1)).toBe(322);
    const seen = new Set<number>();
    for (const season of [1, 2, 3, 40]) {
      for (let round = 1; round <= 22; round += 1) {
        const day = humanFixtureMatchday(round, season);
        expect(humanRoundFromFixture(day)).toBe(round);
        expect(humanSeasonFromFixture(day)).toBe(season);
        seen.add(day);
      }
    }
    expect(seen.size).toBe(4 * 22);
    expect(humanRoundFromFixture(201)).toBeNull();
  });

  it('starts the next season after three free days, never with an overdue round', () => {
    expect(nextHumanSeasonStart(KEY)).toBe('2026-12-07');
    expect(dueHumanSeasonKey(KEY, at('2026-12-06T22:30:00Z'))).toBeNull();
    expect(dueHumanSeasonKey(KEY, at('2026-12-06T23:30:00Z'))).toBe('2026-12-07');
    // Nobody came for two weeks, then somebody came in the evening.
    expect(dueHumanSeasonKey(KEY, at('2026-12-20T10:00:00Z'))).toBe('2026-12-20');
    expect(dueHumanSeasonKey(KEY, at('2026-12-20T19:00:00Z'))).toBe('2026-12-21');
    for (const now of [at('2026-12-07T10:00:00Z'), at('2026-12-20T19:00:00Z')]) {
      const key = dueHumanSeasonKey(KEY, now)!;
      expect(dueHumanSeasonKey(key, now)).toBeNull();
    }
  });

  it('keeps overdue rounds playable in the break', () => {
    expect(
      nextHumanRound({
        seasonKey: KEY,
        playedRounds: Array.from({ length: 21 }, (_, i) => i + 1),
        now: at('2026-12-05T10:00:00Z'),
        playedHumanToday: false,
      }),
    ).toBe(22);
  });

  it('counts played human matches and finished bot pairs only', () => {
    const seats = fillHumanSeats(
      [{ id: 'me', name: 'Ja', shortName: 'JA', createdAt: KEY }],
      OPPONENT_CATALOG,
    );
    const pair = pairingsForMatchday(seats, 1).find((p) => [p.home.id, p.away.id].includes('me'))!;
    const table = (results: Parameters<typeof resolveHumanTable>[0]['results'], now: string) =>
      resolveHumanTable({ seats, seasonKey: KEY, results, now: at(now) });

    expect(table([], '2026-11-12T10:00:00Z').every((row) => row.played === 0)).toBe(true);
    const after = table([], '2026-11-12T21:30:00Z');
    expect(after.find((row) => row.id === 'me')!.played).toBe(0);
    expect(after.reduce((sum, row) => sum + row.played, 0)).toBe(10);
    expect(table([], '2026-11-12T21:30:00Z')).toEqual(after);

    const mine = table(
      [
        {
          round: 1,
          homeId: pair.home.id,
          awayId: pair.away.id,
          homeScore: pair.home.id === 'me' ? 9 : 0,
          awayScore: pair.home.id === 'me' ? 0 : 9,
        },
      ],
      '2026-11-12T21:30:00Z',
    );
    expect(mine[0]).toMatchObject({ id: 'me', played: 1, won: 1, points: 3, goalsFor: 9 });
    expect(mine.reduce((sum, row) => sum + row.goalsFor - row.goalsAgainst, 0)).toBe(0);
  });
});

describe('closing a season (D140)', () => {
  const seats = fillHumanSeats(
    [
      { id: 'strong', name: 'Mocni', shortName: 'MOC', createdAt: '2026-11-01' },
      { id: 'weak', name: 'Słabi', shortName: 'SLA', createdAt: '2026-11-02' },
    ],
    OPPONENT_CATALOG,
  );
  const now = at('2026-12-07T10:00:00Z');

  it('gives an absent club defeats, so it cannot win, and keeps played matches', () => {
    const pair = pairingsForMatchday(seats, 1)[0]!;
    const played = [
      { round: 1, homeId: pair.home.id, awayId: pair.away.id, homeScore: 0, awayScore: 0 },
    ];
    const missing = settleMissing({ seats, seasonKey: KEY, results: played });
    // Two matches between the two clubs have no result.
    expect(missing).toHaveLength(22 * 6 - 1 - 2);
    expect(settleMissing({ seats, seasonKey: KEY, results: played })).toEqual(missing);
    const table = resolveHumanTable({
      seats,
      seasonKey: KEY,
      results: [...played, ...missing],
      now,
    });
    const weak = table.find((row) => row.id === 'weak')!;
    expect(weak).toMatchObject({ played: 20, won: 0, points: 0, goalsFor: 0 });
    expect(table.slice(0, 10).every((row) => row.isBot)).toBe(true);
  });

  it('agrees with the live table on bot pairs', () => {
    const live = resolveHumanTable({ seats, seasonKey: KEY, results: [], now });
    const bots = settleMissing({ seats, seasonKey: KEY, results: [] }).filter(
      (r) => r.homeId.startsWith('opp-') && r.awayId.startsWith('opp-'),
    );
    expect(resolveHumanTable({ seats, seasonKey: KEY, results: bots, now })).toEqual(live);
  });
});

describe('repairLineup (D138)', () => {
  const ROLES = 'GK RB CB CB LB RW CM CM LW ST ST GK CB CM ST'.split(' ');
  const POS: Record<string, string> = {
    GK: 'BR',
    RB: 'PO',
    CB: 'ŚO',
    LB: 'LO',
    RW: 'PN',
    LW: 'PN',
    CM: 'ŚP',
    ST: 'N',
  };
  const squad = (status: (i: number) => string) =>
    ROLES.map(
      (role, i) =>
        ({
          id: `p${i}`,
          clubId: 'c',
          name: `P${i}`,
          shirtNumber: i + 1,
          pos: POS[role],
          role,
          age: 25,
          skill: 60,
          potential: 70,
          energy: 80,
          status: status(i),
          starter: i < 11,
          captain: false,
          nationality: 'POL',
          version: 1,
          departedAt: null,
        }) as unknown as PlayerRowDto,
    );

  it('replaces only the unavailable and keeps a good line-up', () => {
    const good = squad(() => 'READY');
    expect(repairLineup('c', good, '2026-12-08')).toEqual(good);
    const hurt = squad((i) => (i === 2 ? 'INJURED' : 'READY'));
    expect(lineupProblem('c', hurt, '2026-12-08')).not.toBeNull();
    const fixed = repairLineup('c', hurt, '2026-12-08');
    expect(lineupProblem('c', fixed, '2026-12-08')).toBeNull();
    const ids = fixed.filter((p) => p.starter).map((p) => p.id);
    expect(ids).not.toContain('p2');
    expect(ids).toContain('p12');
  });

  it('leaves a squad that cannot field eleven as it is', () => {
    const empty = squad((i) => (i > 8 ? 'INJURED' : 'READY'));
    expect(repairLineup('c', empty, '2026-12-08')).toEqual(empty);
  });
});
