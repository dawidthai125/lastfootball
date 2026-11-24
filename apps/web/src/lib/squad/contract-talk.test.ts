import { describe, expect, it } from 'vitest';

import { demandWage, talkResult } from '@/lib/squad/contract-talk';

const base = {
  wage: 1000,
  offer: 1000,
  personality: 'spokojny' as const,
  morale: 40,
  contractSeason: 2 as number | null,
  season: 1,
};

describe('contract talk', () => {
  it('lider wage 1000 demands 1100', () => {
    expect(demandWage(1000, 'lider')).toBe(1100);
  });

  it('wybuchowy wage 1000 demands 1200', () => {
    expect(demandWage(1000, 'wybuchowy')).toBe(1200);
  });

  it('spokojny wage 1000 demands 1000', () => {
    expect(demandWage(1000, 'spokojny')).toBe(1000);
  });

  it('NaN wage demands 0', () => {
    expect(demandWage(Number.NaN, 'lider')).toBe(0);
  });

  it('morale 39 refuses with the low-morale sentence', () => {
    expect(talkResult({ ...base, morale: 39 })).toEqual({
      ok: false,
      reason: 'Za niski nastrój na rozmowę.',
    });
  });

  it('offer below demand refuses with the low-pay sentence', () => {
    expect(talkResult({ ...base, personality: 'lider', offer: 1099 })).toEqual({
      ok: false,
      reason: 'Za niska pensja.',
    });
  });

  it('offer demand+5001 refuses with the high-pay sentence', () => {
    expect(talkResult({ ...base, offer: 6001 })).toEqual({
      ok: false,
      reason: 'Za wysoka pensja.',
    });
  });

  it('refuses before the last two seasons of the contract', () => {
    expect(talkResult({ ...base, contractSeason: 3, morale: 80 })).toEqual({
      ok: false,
      reason: 'Kontrakt jest już przedłużony.',
    });
  });

  it('agrees on exactly the demand and covers two more seasons', () => {
    expect(talkResult(base)).toEqual({
      ok: true,
      wage: 1000,
      contractSeason: 3,
    });
  });

  it('non-integer offer 1100.5 refuses', () => {
    expect(talkResult({ ...base, offer: 1100.5 })).toEqual({
      ok: false,
      reason: 'Podaj pensję w euro.',
    });
  });
});
