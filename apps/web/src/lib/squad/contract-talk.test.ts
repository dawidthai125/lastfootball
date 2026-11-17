import { describe, expect, it } from 'vitest';

import { demandWage, talkResult } from '@/lib/squad/contract-talk';

const base = {
  wage: 1000,
  offer: 1000,
  personality: 'spokojny' as const,
  morale: 40,
  contractUntil: '2028-06-30',
  today: '2026-11-17',
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

  it('year 2029 refuses with the already-extended sentence', () => {
    expect(talkResult({ ...base, contractUntil: '2029-06-30', morale: 80 })).toEqual({
      ok: false,
      reason: 'Kontrakt jest już przedłużony.',
    });
  });

  it("success offer exactly demand, personality spokojny, morale 40, contractUntil '2028-06-30' returns ok wage and '2029-06-30'", () => {
    expect(talkResult(base)).toEqual({
      ok: true,
      wage: 1000,
      contractUntil: '2029-06-30',
    });
  });

  it('non-integer offer 1100.5 refuses', () => {
    expect(talkResult({ ...base, offer: 1100.5 })).toEqual({
      ok: false,
      reason: 'Podaj pensję w euro.',
    });
  });
});
