import { describe, expect, it } from 'vitest';

import type { ClubDto } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';
import { LEAGUE_FIXTURE_COUNT, OPPONENT_CATALOG } from '@/lib/fixtures/opponent-catalog';
import { resolveNavAccess, resolveHubPhase, resolvePrimaryCta } from '@/lib/hub';
import { resolveLeagueTable } from '@/lib/league';
import { formatSeasonLabel, isSeasonCompleteTrigger, resolveSeasonReport } from '@/lib/season';

function club(partial?: Partial<ClubDto>): ClubDto {
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
    ...partial,
  };
}

function seasonFixtures(): FixtureDto[] {
  const first: FixtureDto[] = OPPONENT_CATALOG.map((opp, i) => ({
    id: `fx-${i + 1}`,
    clubId: 'c1',
    matchday: i + 1,
    competition: 'league' as const,
    opponentClubId: opp.id,
    opponent: { id: opp.id, name: opp.name, shortName: opp.shortName },
    isHome: i % 2 === 0,
    status: 'played' as const,
    homeScore: 1,
    awayScore: 0,
    playedAt: '2026-07-30T12:00:00.000Z',
    createdAt: '2026-07-24T12:00:00.000Z',
  }));
  const ret: FixtureDto[] = first.map((leg, i) => ({
    ...leg,
    id: `fx-${LEAGUE_FIXTURE_COUNT / 2 + i + 1}`,
    matchday: LEAGUE_FIXTURE_COUNT / 2 + i + 1,
    isHome: !leg.isHome,
  }));
  return [...first, ...ret];
}

describe('LFE-SEASON-END-01 trigger + labels', () => {
  it('isSeasonCompleteTrigger requires exactly 22 played', () => {
    const full = seasonFixtures();
    expect(isSeasonCompleteTrigger([])).toBe(false);
    expect(isSeasonCompleteTrigger(full.slice(0, 1))).toBe(false);
    expect(full).toHaveLength(LEAGUE_FIXTURE_COUNT);
    expect(isSeasonCompleteTrigger(full)).toBe(true);
    expect(
      isSeasonCompleteTrigger([
        ...full.slice(0, 21),
        {
          ...full[21]!,
          status: 'upcoming' as const,
          homeScore: null,
          awayScore: null,
        },
      ]),
    ).toBe(false);
  });

  it('formatSeasonLabel is 1-based', () => {
    expect(formatSeasonLabel(1)).toBe('Sezon 1');
    expect(formatSeasonLabel(2)).toBe('Sezon 2');
  });
});

describe('LFE-SEASON-END-01 hub phase + unlock (D79)', () => {
  it('resolveHubPhase returns OFFSEASON when seasonPhase offseason (AC-10)', () => {
    const off = club({ seasonPhase: 'offseason' });
    expect(resolveHubPhase(off, { hasFixtures: true })).toBe('OFFSEASON');
    expect(resolveHubPhase(off, { hasFixtures: false })).toBe('OFFSEASON');
  });

  it('OFFSEASON unlock parity with SEASON (D79 · D99 sponsors · D105 board open; stadium locked)', () => {
    expect(resolveNavAccess('sponsors', 'OFFSEASON')).toBe('open');
    expect(resolveNavAccess('sponsors', 'SEASON')).toBe('open');
    expect(resolveNavAccess('board', 'OFFSEASON')).toBe('open');
    expect(resolveNavAccess('board', 'SEASON')).toBe('open');
    expect(resolveNavAccess('stadium', 'OFFSEASON')).toBe('soft_locked');
    expect(resolveNavAccess('stadium', 'SEASON')).toBe('soft_locked');
    expect(resolveNavAccess('league', 'OFFSEASON')).toBe('open');
    expect(resolveNavAccess('finance', 'OFFSEASON')).toBe('open');
  });

  it('OFFSEASON primary CTA is prepare-next-season (D85)', () => {
    const primary = resolvePrimaryCta('OFFSEASON', 'idle', { nextFixture: null });
    expect(primary.id).toBe('prepare-next-season');
    expect(primary.label).toBe('Przygotuj sezon');
  });
});

describe('LFE-SEASON-END-01 resolveSeasonReport (D84 · D86 · D91)', () => {
  it('derives report from league table facts and promotion outcome', () => {
    const c = club({ seasonNumber: 1 });
    const fixtures = seasonFixtures();
    const table = resolveLeagueTable(c, fixtures);
    const report = resolveSeasonReport(table, 1, c.leagueTier);
    expect(report).not.toBeNull();
    expect(report!.seasonLabel).toBe('Sezon 1');
    expect(report!.leagueLabel).toBe(table.leagueLabel);
    expect(report!.played).toBe(22);
    expect(report!.highlights.length).toBeGreaterThan(0);
    expect(report!.highlights.length).toBeLessThanOrEqual(3);
    expect(report!.promotionKind).toBeTruthy();
    expect(report!.promotionLabel.length).toBeGreaterThan(0);
    const blob = JSON.stringify(report);
    expect(blob).not.toMatch(/€|sponsor|Fake/i);
  });

  it('uses dynamic season label for season N', () => {
    const c = club({ seasonNumber: 3 });
    const table = resolveLeagueTable(c, []);
    expect(table.seasonLabel).toBe('Sezon 3');
  });
});
