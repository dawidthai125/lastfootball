import { describe, expect, it } from 'vitest';

import { rankingPoints, resolvePlayerRanking, type RankingInputRow } from './player-ranking';

const row = (club: string, patch: Partial<RankingInputRow> = {}): RankingInputRow => ({
  club_id: club,
  name: club,
  short_name: club.slice(0, 3),
  league_tier: 'iv',
  competition: 'league',
  match_tier: 'iv',
  won: 0,
  drawn: 0,
  lost: 0,
  goals_for: 0,
  goals_against: 0,
  ...patch,
});

describe('ranking of players (D152)', () => {
  it('weighs the league and the competition, friendlies give nothing', () => {
    expect(rankingPoints(row('a', { won: 1, drawn: 1 }))).toBe(4);
    expect(rankingPoints(row('a', { won: 1, match_tier: 'i' }))).toBe(6);
    expect(rankingPoints(row('a', { competition: 'cup', won: 1, match_tier: 'i' }))).toBe(4);
    expect(rankingPoints(row('a', { competition: 'human', won: 1, drawn: 1 }))).toBe(8);
    expect(rankingPoints(row('a', { competition: 'challenge', won: 9 }))).toBe(0);
  });

  it('adds up one club and orders by points, then goals, then name', () => {
    const table = resolvePlayerRanking([
      row('Beta', { won: 1, goals_for: 2 }),
      row('Alfa', { won: 1, goals_for: 2 }),
      row('Gama', { won: 1, goals_for: 1 }),
      row('Delta', { won: 1 }),
      row('Delta', { competition: 'human', won: 1, lost: 1 }),
      row('Only friendlies', { competition: 'challenge', won: 5 }),
    ]);
    expect(table.map((r) => r.name)).toEqual(['Delta', 'Alfa', 'Beta', 'Gama']);
    expect(table[0]).toMatchObject({ position: 1, points: 9, played: 3 });
  });
});
