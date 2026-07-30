import { describe, expect, it } from 'vitest';

import type { LeagueTableDto, LeagueTableRowDto } from '@/lib/league/types';
import { resolveClubRanking, resolveRankingBand } from '@/lib/ranking';

function row(
  partial: Partial<LeagueTableRowDto> & Pick<LeagueTableRowDto, 'position' | 'clubId'>,
): LeagueTableRowDto {
  return {
    name: partial.name ?? `Club ${partial.clubId}`,
    shortName: partial.shortName ?? partial.clubId.slice(0, 3).toUpperCase(),
    played: partial.played ?? 0,
    won: partial.won ?? 0,
    drawn: partial.drawn ?? 0,
    lost: partial.lost ?? 0,
    goalsFor: partial.goalsFor ?? 0,
    goalsAgainst: partial.goalsAgainst ?? 0,
    goalDifference: partial.goalDifference ?? 0,
    points: partial.points ?? 0,
    isPlayer: partial.isPlayer ?? false,
    ...partial,
  };
}

function table(rows: LeagueTableRowDto[]): LeagueTableDto {
  return {
    leagueLabel: 'IV liga',
    seasonLabel: 'Sezon 1',
    rows,
  };
}

describe('resolveRankingBand', () => {
  it('splits 12 clubs into deterministic thirds', () => {
    expect(resolveRankingBand(1, 12)).toBe('upper');
    expect(resolveRankingBand(4, 12)).toBe('upper');
    expect(resolveRankingBand(5, 12)).toBe('mid');
    expect(resolveRankingBand(8, 12)).toBe('mid');
    expect(resolveRankingBand(9, 12)).toBe('lower');
    expect(resolveRankingBand(12, 12)).toBe('lower');
  });
});

describe('resolveClubRanking', () => {
  const twelve = table(
    Array.from({ length: 12 }, (_, i) =>
      row({
        position: i + 1,
        clubId: i === 2 ? 'player' : `ai-${i + 1}`,
        name: i === 2 ? 'Player FC' : `AI ${i + 1}`,
        shortName: i === 2 ? 'PFC' : `A${i + 1}`,
        isPlayer: i === 2,
        points: 36 - i,
        won: 10 - Math.floor(i / 2),
        drawn: 1,
        lost: i,
        goalsFor: 20 - i,
        goalsAgainst: i,
        goalDifference: 20 - 2 * i,
        played: 11,
      }),
    ),
  );

  it('is deterministic for the same table input', () => {
    const a = resolveClubRanking({ table: twelve });
    const b = resolveClubRanking({ table: twelve });
    expect(a).toEqual(b);
  });

  it('maps all league clubs without sport columns or scores', () => {
    const ranking = resolveClubRanking({ table: twelve });
    expect(ranking.rows).toHaveLength(12);
    expect(ranking.seasonLabel).toBe('Sezon 1');
    expect(ranking.contextLabel).toBe('IV liga');
    expect(ranking.playerPosition).toBe(3);

    const json = JSON.stringify(ranking);
    expect(json).not.toMatch(
      /"points"|"won"|"drawn"|"lost"|"goalsFor"|"goalsAgainst"|"goalDifference"|"elo"|"rating"|"score"|"xp"/i,
    );

    for (const r of ranking.rows) {
      expect(r).toEqual({
        position: r.position,
        clubId: r.clubId,
        name: r.name,
        shortName: r.shortName,
        isPlayer: r.isPlayer,
        band: r.band,
      });
      expect(Object.keys(r).sort()).toEqual(
        ['band', 'clubId', 'isPlayer', 'name', 'position', 'shortName'].sort(),
      );
    }
  });

  it('preserves table order and derives bands', () => {
    const ranking = resolveClubRanking({ table: twelve });
    expect(ranking.rows.map((r) => r.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(ranking.rows[0]?.band).toBe('upper');
    expect(ranking.rows[2]?.isPlayer).toBe(true);
    expect(ranking.rows[2]?.band).toBe('upper');
    expect(ranking.rows[7]?.band).toBe('mid');
    expect(ranking.rows[11]?.band).toBe('lower');
  });

  it('does not author UI copy strings for bands (D29)', async () => {
    const src = await import('@/lib/ranking/resolve-club-ranking');
    const text = src.resolveClubRanking.toString();
    expect(text).not.toMatch(/UI_COPY|Górna|Środek|Dolna/);
  });

  it('returns null playerPosition when no player row', () => {
    const ranking = resolveClubRanking({
      table: table([row({ position: 1, clubId: 'ai-1', isPlayer: false })]),
    });
    expect(ranking.playerPosition).toBeNull();
    expect(ranking.rows).toHaveLength(1);
  });
});
