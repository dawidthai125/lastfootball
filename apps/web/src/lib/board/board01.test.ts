import { describe, expect, it } from 'vitest';

import { BOARD_THIN_NO_PERSIST } from '@/lib/board/no-persist';
import { resolveClubBoard } from '@/lib/board/resolve-club-board';
import type { SeasonReportDto } from '@/lib/season/types';

function report(overrides: Partial<SeasonReportDto> = {}): SeasonReportDto {
  return {
    seasonNumber: 1,
    seasonLabel: 'Sezon 1',
    leagueLabel: 'IV liga',
    position: 4,
    tableSize: 12,
    played: 22,
    won: 10,
    drawn: 5,
    lost: 7,
    goalsFor: 30,
    goalsAgainst: 25,
    goalDifference: 5,
    points: 35,
    zone: 'upper_mid',
    zoneLabel: 'Górny środek',
    highlights: [],
    promotionKind: 'stay',
    promotionLabel: 'Bez zmian szczebla',
    ...overrides,
  };
}

describe('BOARD_THIN_NO_PERSIST (M2)', () => {
  it('documents zero persist surface', () => {
    expect(BOARD_THIN_NO_PERSIST).toBe(true);
  });
});

describe('resolveClubBoard', () => {
  it('builds descriptive expectation without completion flags', () => {
    const dto = resolveClubBoard({
      seasonPhase: 'in_season',
      seasonNumber: 1,
      playerPosition: 5,
      tableSize: 12,
      playedCount: 8,
      seasonReport: null,
    });
    expect(dto.expectation.label).toBeTruthy();
    expect(dto.expectation.summary).toMatch(/nie zadanie/i);
    expect(dto.seasonReview).toBeNull();
    expect(dto.hubHint).toBeNull();
    expect(dto.standing).not.toHaveProperty('complete');
    expect(dto.standing.trend).toBe('steady');
    expect(dto.tone).toBe('neutral');
  });

  it('derives rising / positive from top third', () => {
    const dto = resolveClubBoard({
      seasonPhase: 'in_season',
      seasonNumber: 2,
      playerPosition: 2,
      tableSize: 12,
      playedCount: 10,
      seasonReport: null,
    });
    expect(dto.standing.trend).toBe('rising');
    expect(dto.tone).toBe('positive');
    expect(dto.phaseLabel).toMatch(/toku/i);
  });

  it('derives slipping / concern from bottom third', () => {
    const dto = resolveClubBoard({
      seasonPhase: 'in_season',
      seasonNumber: 1,
      playerPosition: 11,
      tableSize: 12,
      playedCount: 12,
      seasonReport: null,
    });
    expect(dto.standing.trend).toBe('slipping');
    expect(dto.tone).toBe('concern');
  });

  it('exposes Offseason seasonReview and non-blocking hubHint (H-BOARD)', () => {
    const dto = resolveClubBoard({
      seasonPhase: 'offseason',
      seasonNumber: 1,
      playerPosition: 4,
      tableSize: 12,
      playedCount: 22,
      seasonReport: report({ position: 4, zone: 'upper_mid' }),
    });
    expect(dto.seasonReview?.available).toBe(true);
    expect(dto.seasonReview?.outcomeLabel).toContain('Górny środek');
    expect(dto.tone).toBe('positive');
    expect(dto.hubHint).toMatch(/nie blokuje/i);
  });

  it('uses concern tone for bottom-zone Offseason review', () => {
    const dto = resolveClubBoard({
      seasonPhase: 'offseason',
      seasonNumber: 1,
      playerPosition: 12,
      tableSize: 12,
      playedCount: 22,
      seasonReport: report({
        position: 12,
        zone: 'bottom',
        zoneLabel: 'Doł tabeli',
        promotionKind: 'relegate',
        promotionLabel: 'Spadek',
      }),
    });
    expect(dto.tone).toBe('concern');
    expect(dto.seasonReview?.outcomeLabel).toContain('Spadek');
  });

  it('restricts tone to positive | neutral | concern', () => {
    for (const pos of [1, 6, 12] as const) {
      const dto = resolveClubBoard({
        seasonPhase: 'in_season',
        seasonNumber: 1,
        playerPosition: pos,
        tableSize: 12,
        playedCount: 5,
        seasonReport: null,
      });
      expect(['positive', 'neutral', 'concern']).toContain(dto.tone);
    }
  });
});
