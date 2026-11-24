import { describe, expect, it } from 'vitest';

import { REST_PER_DAY, restedEnergy, restedStatus } from '@/lib/squad/rest';

describe('rest', () => {
  it('adds energy per full day and stops at 100', () => {
    expect(restedEnergy(40, '2026-11-20', '2026-11-23')).toBe(40 + 3 * REST_PER_DAY);
    expect(restedEnergy(95, '2026-11-01', '2026-11-23')).toBe(100);
  });

  it('gives nothing the same day, for the future, or without a stamp', () => {
    expect(restedEnergy(40, '2026-11-23', '2026-11-23')).toBe(40);
    expect(restedEnergy(40, '2026-11-25', '2026-11-23')).toBe(40);
    expect(restedEnergy(40, null, '2026-11-23')).toBe(40);
    expect(restedEnergy(40, 'x', '2026-11-23')).toBe(40);
  });

  it('counts across a month end', () => {
    expect(restedEnergy(40, '2026-11-30', '2026-12-01')).toBe(45);
  });

  it('clears only tiredness', () => {
    expect(restedStatus('TIRED', 50, 60)).toBe('READY');
    expect(restedStatus('TIRED', 54, 59)).toBe('TIRED');
    expect(restedStatus('TIRED', 66, 66)).toBe('TIRED');
    expect(restedStatus('INJURED', 80, 90)).toBe('INJURED');
    expect(restedStatus('SUSPENDED', 80, 90)).toBe('SUSPENDED');
  });
});
