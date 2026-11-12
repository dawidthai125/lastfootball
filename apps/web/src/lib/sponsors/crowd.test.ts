import { describe, expect, it } from 'vitest';

import { ECONOMY_THIN } from '@/lib/finance/types';
import { sponsorFromCrowd, type LeagueRung } from '@/lib/sponsors/crowd';

describe('sponsorFromCrowd', () => {
  it('keeps iv + steady on the current sponsor constants', () => {
    expect(sponsorFromCrowd({ attendance: 'steady', leagueTier: 'iv' })).toEqual({
      base: 15_000,
      bonus: 10_000,
    });
    expect(ECONOMY_THIN.SPONSOR_BASE).toBe(15_000);
    expect(ECONOMY_THIN.SPONSOR_BONUS).toBe(10_000);
  });

  it('pays a lively iv crowd more than a steady iv crowd', () => {
    const lively = sponsorFromCrowd({ attendance: 'lively', leagueTier: 'iv' });
    const steady = sponsorFromCrowd({ attendance: 'steady', leagueTier: 'iv' });
    expect(lively.base).toBeGreaterThan(steady.base);
  });

  it('pays tier i steady more than tier iv steady', () => {
    const top = sponsorFromCrowd({ attendance: 'steady', leagueTier: 'i' });
    const bottom = sponsorFromCrowd({ attendance: 'steady', leagueTier: 'iv' });
    expect(top.base).toBeGreaterThan(bottom.base);
  });

  it('pays a quiet iv crowd less than a steady iv crowd', () => {
    const quiet = sponsorFromCrowd({ attendance: 'quiet', leagueTier: 'iv' });
    const steady = sponsorFromCrowd({ attendance: 'steady', leagueTier: 'iv' });
    expect(quiet.base).toBeLessThan(steady.base);
  });

  it('falls back to iv + steady when the rung or the crowd is unknown', () => {
    const baseline = { base: 15_000, bonus: 10_000 };
    expect(
      sponsorFromCrowd({
        attendance: 'lively',
        leagueTier: 'v' as LeagueRung,
      }),
    ).toEqual(baseline);
    expect(
      sponsorFromCrowd({
        attendance: 'packed' as 'lively',
        leagueTier: 'i',
      }),
    ).toEqual(baseline);
  });
});
