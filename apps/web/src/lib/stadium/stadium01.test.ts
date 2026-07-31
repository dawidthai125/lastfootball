import { describe, expect, it } from 'vitest';

import { STARTER_PACKAGE } from '@/lib/club/types';
import { STADIUM_THIN_NO_PERSIST } from '@/lib/stadium/no-persist';
import { resolveClubStadium } from '@/lib/stadium/resolve-club-stadium';

describe('STADIUM_THIN_NO_PERSIST (M2)', () => {
  it('documents zero persist / ticket surface', () => {
    expect(STADIUM_THIN_NO_PERSIST).toBe(true);
  });
});

describe('resolveClubStadium', () => {
  it('reuses STARTER_PACKAGE for name and capacity (D114)', () => {
    const dto = resolveClubStadium({
      clubName: 'Orzeł Test',
      seasonPhase: 'in_season',
      lastHomeOutcome: null,
      homePlayedCount: 0,
    });
    expect(dto.name).toBe(STARTER_PACKAGE.stadiumLabel('Orzeł Test'));
    expect(dto.capacityLabel).toBe(STARTER_PACKAGE.stadiumCapacity);
    expect(dto.identityNote).toMatch(/startowy/i);
  });

  it('uses unknown attendance when no home played (D113)', () => {
    const dto = resolveClubStadium({
      clubName: 'Orzeł Test',
      seasonPhase: 'in_season',
      lastHomeOutcome: null,
      homePlayedCount: 0,
    });
    expect(dto.attendance.band).toBe('unknown');
    expect(dto.attendance.label).toBe('—');
    expect(dto.attendance.summary).toMatch(/nieznana/i);
    expect(dto.hubHint).toBeNull();
  });

  it('maps last home win → lively', () => {
    const dto = resolveClubStadium({
      clubName: 'Orzeł Test',
      seasonPhase: 'in_season',
      lastHomeOutcome: 'win',
      homePlayedCount: 3,
    });
    expect(dto.attendance.band).toBe('lively');
    expect(dto.attendance.label).toMatch(/Głośno/i);
  });

  it('maps last home draw → steady', () => {
    const dto = resolveClubStadium({
      clubName: 'Orzeł Test',
      seasonPhase: 'in_season',
      lastHomeOutcome: 'draw',
      homePlayedCount: 2,
    });
    expect(dto.attendance.band).toBe('steady');
  });

  it('maps last home loss → quiet', () => {
    const dto = resolveClubStadium({
      clubName: 'Orzeł Test',
      seasonPhase: 'in_season',
      lastHomeOutcome: 'loss',
      homePlayedCount: 4,
    });
    expect(dto.attendance.band).toBe('quiet');
  });

  it('exposes Offseason-only non-blocking hubHint', () => {
    const inSeason = resolveClubStadium({
      clubName: 'Orzeł Test',
      seasonPhase: 'in_season',
      lastHomeOutcome: 'win',
      homePlayedCount: 1,
    });
    expect(inSeason.hubHint).toBeNull();

    const off = resolveClubStadium({
      clubName: 'Orzeł Test',
      seasonPhase: 'offseason',
      lastHomeOutcome: 'win',
      homePlayedCount: 11,
    });
    expect(off.hubHint).toMatch(/nie blokuje/i);
  });

  it('does not expose numeric attendance or ticket fields', () => {
    const dto = resolveClubStadium({
      clubName: 'Orzeł Test',
      seasonPhase: 'in_season',
      lastHomeOutcome: 'win',
      homePlayedCount: 1,
    });
    expect(dto).not.toHaveProperty('ticketIncome');
    expect(dto).not.toHaveProperty('crowdCount');
    expect(dto.attendance).not.toHaveProperty('percent');
    expect(JSON.stringify(dto)).not.toMatch(/\d{3,}\s*widz/);
  });
});
