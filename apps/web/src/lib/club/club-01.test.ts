import { describe, expect, it } from 'vitest';

import { resolveClubProfile } from '@/lib/club/resolve-club-profile';
import type { ClubDto } from '@/lib/club/types';
import { STARTER_PACKAGE } from '@/lib/club/types';
import { formatMoney } from '@/lib/finance/format-money';
import { resolveLeagueTable, resolveLeagueTierLabel } from '@/lib/league';
import { UI_COPY } from '@/lib/ui/copy';

function clubFixture(overrides: Partial<ClubDto> = {}): ClubDto {
  return {
    id: 'club-1',
    ownerId: 'owner-1',
    name: 'Bóbrka United',
    shortName: 'BOB',
    primaryColor: '#1a3a5c',
    secondaryColor: '#c4a35a',
    crestTemplateId: 'crest-01',
    createdAt: '2026-07-01T00:00:00.000Z',
    firstMatchCompletedAt: '2026-07-02T00:00:00.000Z',
    cashBalance: 100_000,
    transferWindowOpen: false,
    lastTrainingOn: null,
    seasonNumber: 1,
    seasonPhase: 'in_season',
    leagueTier: 'iv',
    ...overrides,
  };
}

describe('resolveClubProfile (LFE-CLUB-01)', () => {
  it('composes identity from ClubDto', () => {
    const club = clubFixture();
    const table = resolveLeagueTable(club, []);
    const dto = resolveClubProfile({ club, table });

    expect(dto.identity).toEqual({
      name: 'Bóbrka United',
      shortName: 'BOB',
      crestTemplateId: 'crest-01',
      primaryColor: '#1a3a5c',
      secondaryColor: '#c4a35a',
    });
  });

  it('reuses resolveLeagueTierLabel and STARTER_PACKAGE for stadium', () => {
    const club = clubFixture({ name: 'Orzeł Test' });
    const table = resolveLeagueTable(club, []);
    const dto = resolveClubProfile({ club, table });

    expect(dto.starter.leagueLabel).toBe(resolveLeagueTierLabel('iv'));
    expect(dto.starter.stadiumLabel).toBe(STARTER_PACKAGE.stadiumLabel('Orzeł Test'));
    expect(dto.starter.stadiumCapacityLabel).toBe(STARTER_PACKAGE.stadiumCapacity);
  });

  it('uses qualitative organization label — not numeric §6 metrics', () => {
    const club = clubFixture();
    const table = resolveLeagueTable(club, []);
    const dto = resolveClubProfile({ club, table });

    expect(dto.organizationLabel).toBe(UI_COPY.clubOrganizationStarter);
    expect(dto).not.toHaveProperty('reputation');
    expect(dto).not.toHaveProperty('prestige');
    expect(dto).not.toHaveProperty('level');
    expect(dto).not.toHaveProperty('supporters');
    expect(dto).not.toHaveProperty('staff');
  });

  it('formats cash from ClubDto.cashBalance', () => {
    const club = clubFixture({ cashBalance: 125_500 });
    const table = resolveLeagueTable(club, []);
    const dto = resolveClubProfile({ club, table });

    expect(dto.cashLabel).toBe(formatMoney(125_500));
  });

  it('exposes league position label from table input', () => {
    const club = clubFixture();
    const table = resolveLeagueTable(club, []);
    const dto = resolveClubProfile({ club, table });

    expect(dto.leaguePositionLabel).toMatch(/miejsce/);
  });

  it('is deterministic for the same inputs', () => {
    const club = clubFixture();
    const table = resolveLeagueTable(club, []);
    expect(resolveClubProfile({ club, table })).toEqual(resolveClubProfile({ club, table }));
  });

  it('exposes deep-links without staff', () => {
    const club = clubFixture();
    const table = resolveLeagueTable(club, []);
    const dto = resolveClubProfile({ club, table });

    expect(dto.links.map((l) => l.id)).toEqual([
      'squad',
      'finance',
      'league',
      'achievements',
      'rankings',
    ]);
    expect(JSON.stringify(dto)).not.toMatch(/Personel|Asystent|Skaut|Trener/i);
  });
});
