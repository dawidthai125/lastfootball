import { describe, expect, it } from 'vitest';

import { resolveClubFinance } from '@/lib/finance/resolve-club-finance';
import { ECONOMY_THIN, type FinanceMovementDto } from '@/lib/finance/types';
import {
  resolveWageNote,
  unpaidWageMoraleDelta,
  wagesMovementLabel,
} from '@/lib/finance/unpaid-wages';
import { matchWageDue, payWages } from '@/lib/squad/truth';

function wages(createdAt: string, unpaid: number): FinanceMovementDto {
  return {
    id: createdAt,
    createdAt,
    category: 'wages',
    label: wagesMovementLabel(unpaid),
    amount: -100,
    fixtureId: 'fx',
  };
}

describe('unpaidWageMoraleDelta', () => {
  it('is 0 when paid in full and never above the cap', () => {
    expect(unpaidWageMoraleDelta(9_580, 9_580)).toBe(0);
    expect(unpaidWageMoraleDelta(0, 0)).toBe(0);
    expect(unpaidWageMoraleDelta(Number.NaN, 0)).toBe(0);
    expect(unpaidWageMoraleDelta(9_580, 0)).toBe(-ECONOMY_THIN.UNPAID_WAGE_MORALE_MAX);
    expect(unpaidWageMoraleDelta(9_580, -50)).toBe(-8);
  });

  it('follows the unpaid share and costs at least one point', () => {
    const due = 10_000;
    expect(unpaidWageMoraleDelta(due, payWages(5_000, due).paid)).toBe(-4);
    expect(unpaidWageMoraleDelta(due, payWages(9_999, due).paid)).toBe(-1);
  });
});

describe('matchWageDue', () => {
  it('is 0 without stored wages and fills a missing wage from skill', () => {
    expect(matchWageDue([{ skill: 65, age: 27 }])).toBe(0);
    expect(matchWageDue([{ skill: 65, age: 27, wage: 7_000 }])).toBe(1_000);
    expect(
      matchWageDue([
        { skill: 65, age: 27, wage: 7_000 },
        { skill: 65, age: 27 },
      ]),
    ).toBe(Math.round((7_000 + 3_725) / 7));
  });
});

describe('resolveWageNote', () => {
  const base = { cash: 100_000, nextWage: 9_580, movements: [] };

  it('is silent with a safe cash balance', () => {
    expect(resolveWageNote(base)).toBeNull();
    expect(resolveWageNote({ ...base, cash: 3 * 9_580 })).toBeNull();
    expect(resolveWageNote({ ...base, cash: 0, nextWage: 0 })).toBeNull();
  });

  it('warns below three wage payments', () => {
    expect(resolveWageNote({ ...base, cash: 3 * 9_580 - 1 })).toContain('mniej niż 3 mecze');
  });

  it('reports unpaid wages until a match pays in full', () => {
    const short = wages('2026-11-20T18:00:00Z', 4_000);
    const full = wages('2026-11-21T18:00:00Z', 0);
    expect(resolveWageNote({ ...base, movements: [short] })).toContain('Morale kadry spadło');
    expect(resolveWageNote({ ...base, movements: [short, full] })).toBeNull();
    expect(resolveClubFinance({ id: 'c', cashBalance: 100_000 }, [short]).wageNote).toContain(
      'nie pokryła pensji',
    );
  });

  it('names the missing amount in the ledger', () => {
    expect(wagesMovementLabel(0)).toBe('Pensje kolejki');
    expect(wagesMovementLabel(4_000)).toMatch(/zabrakło 4.?000/);
  });
});
