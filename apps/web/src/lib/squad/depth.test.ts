import { describe, expect, it } from 'vitest';

import {
  clauseFromSkill,
  contractUntilLabel,
  hireOnce,
  individualStep,
  injuryLeft,
  moraleDelta,
  nextMorale,
  personalityFromId,
  pressDelta,
  STAFF_FEE,
} from '@/lib/squad/depth';

describe('club depth', () => {
  it('moves morale by result, role and personality', () => {
    expect(moraleDelta({ result: 'win', role: 'xi', personality: 'lider' })).toBe(6);
    expect(moraleDelta({ result: 'loss', role: 'xi', personality: 'wybuchowy' })).toBe(-7);
    expect(moraleDelta({ result: 'win', role: 'xi', personality: 'spokojny' })).toBe(2);
    expect(moraleDelta({ result: 'loss', role: 'bench', personality: 'lider' })).toBe(-2);
    expect(moraleDelta({ result: 'win', role: 'out', personality: 'lider' })).toBe(0);
    expect(nextMorale(98, 6)).toBe(100);
    expect(nextMorale(1, -7)).toBe(0);
  });

  it('keeps a stored contract date and the skill clause', () => {
    expect(contractUntilLabel('2028-06-30')).toBe('30.06.2028');
    expect(contractUntilLabel(null)).toBe('30.06.2028');
    expect(clauseFromSkill(56)).toBe(380_000);
  });

  it('hires staff once and trains one player a day', () => {
    expect(hireOnce({ cash: STAFF_FEE, owned: false })).toEqual({
      ok: true,
      fee: STAFF_FEE,
      cashAfter: 0,
    });
    expect(hireOnce({ cash: 100, owned: false })).toEqual({ ok: false, reason: 'cash' });
    expect(hireOnce({ cash: 100, owned: true }).ok).toBe(true);
    expect(
      individualStep({ energy: 40, group: 50, potential: 60, lastOn: null, today: '2026-11-17' }),
    ).toEqual({ ok: true, energy: 32, group: 51 });
    expect(
      individualStep({
        energy: 40,
        group: 50,
        potential: 60,
        lastOn: '2026-11-17',
        today: '2026-11-17',
      }),
    ).toEqual({ ok: false, reason: 'today' });
  });

  it('gives the physio one extra match of healing and a press swing', () => {
    expect(injuryLeft(2, false)).toBe(1);
    expect(injuryLeft(2, true)).toBe(0);
    expect(injuryLeft(1, true)).toBe(0);
    expect(pressDelta('praise')).toBe(2);
    expect(pressDelta('calm')).toBe(0);
    expect(pressDelta('criticize')).toBe(-2);
    expect(personalityFromId('abc')).toBe('spokojny');
  });
});
