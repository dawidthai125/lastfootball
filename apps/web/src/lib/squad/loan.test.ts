import { describe, expect, it } from 'vitest';

import { loanBlock, loanUntilDate, loanWage, recallWage } from '@/lib/squad/loan';

describe('loan', () => {
  it('blocks a keeper, a starter, and someone already out on loan', () => {
    expect(loanBlock({ position: 'BR', starter: false, onLoan: false })).toBe(
      'Bramkarza nie wypożyczysz.',
    );
    expect(loanBlock({ position: 'PO', starter: true, onLoan: false })).toBe(
      'Zdejmij go z jedenastki.',
    );
    expect(loanBlock({ position: 'BR', starter: false, onLoan: true })).toBe(
      'Już jest wypożyczony.',
    );
  });

  it('splits the wage and recalls the banked figure', () => {
    expect(loanWage(1001)).toBe(500);
    expect(loanWage(Number.NaN)).toBe(0);
    expect(recallWage(4000, 2000)).toBe(4000);
    expect(recallWage(-1, 2000)).toBe(2000);
  });

  it('sets the loan end 120 days after today', () => {
    expect(loanUntilDate('2026-11-17')).toBe('2027-03-17');
  });
});
