import { describe, expect, it } from 'vitest';

import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { aiSaleAsk, saleBlock } from '@/lib/transfers/fair-sale';

const NOW = new Date('2026-11-24T12:00:00Z');

describe('fair sale', () => {
  it('pays a tenth for players who came for nothing', () => {
    const junior = { skill: 46, age: 17, origin: 'academy' };
    expect(deriveTransferFee(46, 17)).toBeGreaterThan(100_000);
    expect(aiSaleAsk(junior)).toBeLessThan(15_000);
    expect(aiSaleAsk({ ...junior, origin: 'free' })).toBe(aiSaleAsk(junior));
  });

  it('keeps the full price for the starting squad and purchases', () => {
    expect(aiSaleAsk({ skill: 66, age: 28 })).toBe(deriveTransferFee(66, 28));
    expect(aiSaleAsk({ skill: 66, age: 28, origin: 'bought' })).toBe(deriveTransferFee(66, 28));
  });

  it('holds newcomers for a week and never sells loans', () => {
    const p = { skill: 60, age: 22 };
    expect(saleBlock(p, NOW)).toBeNull();
    expect(saleBlock({ ...p, joinedAt: '2026-11-23T12:00:00Z' }, NOW)).toContain('6 dni');
    expect(saleBlock({ ...p, joinedAt: '2026-11-17T11:00:00Z' }, NOW)).toBeNull();
    expect(saleBlock({ ...p, loanedIn: true }, NOW)).toContain('Wypożyczonego');
    expect(saleBlock({ ...p, onLoan: true }, NOW)).toContain('wypożyczeniu');
  });
});
