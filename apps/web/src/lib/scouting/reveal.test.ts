import { describe, expect, it } from 'vitest';

import { payForBand, SCOUT_REPORT_FEE, type ScoutBand } from './reveal';

describe('payForBand', () => {
  it('fails below 2000 and leaves 0 when cash is exactly the fee', () => {
    expect(SCOUT_REPORT_FEE).toBe(2_000);
    expect(payForBand({ cash: 1_999, alreadyRevealed: false, band: 'high' })).toEqual({
      ok: false,
      reason: 'cash',
    });

    const paid = payForBand({ cash: 2_000, alreadyRevealed: false, band: 'high' });
    expect(paid).toEqual({
      ok: true,
      fee: 2_000,
      cashAfter: 0,
      band: 'high',
      label: 'Wysoki',
    });
    expect(paid.ok).toBe(true);
    if (!paid.ok) return;
    expect(paid.cashAfter).toBeGreaterThanOrEqual(0);
    expect(Object.keys(paid)).toEqual(['ok', 'fee', 'cashAfter', 'band', 'label']);
  });

  it('does not charge a second time when the band is already revealed', () => {
    const first = payForBand({ cash: 5_000, alreadyRevealed: false, band: 'low' });
    expect(first).toEqual({
      ok: true,
      fee: 2_000,
      cashAfter: 3_000,
      band: 'low',
      label: 'Niski',
    });
    if (!first.ok) return;

    const second = payForBand({
      cash: first.cashAfter,
      alreadyRevealed: true,
      band: 'low',
    });
    expect(second).toEqual({ ok: false, reason: 'already' });
    expect(first.cashAfter).toBe(3_000);
    expect(payForBand({ cash: 0, alreadyRevealed: true, band: 'nope' as ScoutBand })).toEqual({
      ok: false,
      reason: 'already',
    });
  });

  it('returns only band keys and the Polish label, never a ceiling number', () => {
    const cases: ReadonlyArray<{ band: ScoutBand; label: string }> = [
      { band: 'low', label: 'Niski' },
      { band: 'medium', label: 'Średni' },
      { band: 'high', label: 'Wysoki' },
      { band: 'elite', label: 'Bardzo wysoki' },
    ];

    for (const { band, label } of cases) {
      const paid = payForBand({ cash: 9_000, alreadyRevealed: false, band });
      expect(paid).toEqual({
        ok: true,
        fee: 2_000,
        cashAfter: 7_000,
        band,
        label,
      });
      expect(Object.keys(paid)).toEqual(['ok', 'fee', 'cashAfter', 'band', 'label']);
      expect(paid).not.toHaveProperty('potential');
      expect(paid).not.toHaveProperty('ceiling');
      expect(paid).not.toHaveProperty('seedPotentialCeiling');
      expect(JSON.stringify(paid)).not.toContain('88');
    }

    expect(payForBand({ cash: 9_000, alreadyRevealed: false, band: '88' as ScoutBand })).toEqual({
      ok: false,
      reason: 'band',
    });
    expect(
      payForBand({ cash: 100, alreadyRevealed: false, band: 'elite-99' as ScoutBand }),
    ).toEqual({ ok: false, reason: 'band' });
  });
});
