import { describe, expect, it } from 'vitest';

import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import {
  isAllowedAgreedAmount,
  listAllowedAgreedAmounts,
  NEGOTIATION_THIN,
  resolveCounterAmount,
  resolveNegotiationStep,
  resolveOfferAmount,
  scaleAskAmount,
} from '@/lib/transfers/resolve-negotiation';

describe('negotiation Thin (LFE-TRANSFERS-02-N1)', () => {
  const ask = deriveTransferFee(60, 24);

  it('presets and counter percentages are frozen', () => {
    expect(NEGOTIATION_THIN.PRESET_LOW_PCT).toBe(90);
    expect(NEGOTIATION_THIN.PRESET_NORMAL_PCT).toBe(100);
    expect(NEGOTIATION_THIN.PRESET_HIGH_PCT).toBe(110);
    expect(NEGOTIATION_THIN.COUNTER_PCT).toBe(95);
  });

  it('scaleAskAmount is deterministic', () => {
    expect(scaleAskAmount(100_000, 90)).toBe(90_000);
    expect(scaleAskAmount(100_000, 95)).toBe(95_000);
    expect(scaleAskAmount(ask, 100)).toBe(ask);
    expect(scaleAskAmount(ask, 90)).toBe(resolveOfferAmount(ask, 'low'));
  });

  it('opening High/Normal accepts; Low counters at 95%', () => {
    expect(resolveNegotiationStep({ ask, phase: 'opening', preset: 'high' })).toEqual({
      kind: 'accepted',
      agreedAmount: resolveOfferAmount(ask, 'high'),
    });
    expect(resolveNegotiationStep({ ask, phase: 'opening', preset: 'normal' })).toEqual({
      kind: 'accepted',
      agreedAmount: resolveOfferAmount(ask, 'normal'),
    });
    expect(resolveNegotiationStep({ ask, phase: 'opening', preset: 'low' })).toEqual({
      kind: 'counter',
      counterAmount: resolveCounterAmount(ask),
    });
  });

  it('counter Accept/Reject — one counter only', () => {
    expect(resolveNegotiationStep({ ask, phase: 'counter', playerAction: 'accept' })).toEqual({
      kind: 'accepted',
      agreedAmount: resolveCounterAmount(ask),
    });
    expect(resolveNegotiationStep({ ask, phase: 'counter', playerAction: 'reject' })).toEqual({
      kind: 'rejected',
    });
  });

  it('identical input → identical output (pure)', () => {
    const input = { ask, phase: 'opening' as const, preset: 'low' as const };
    expect(resolveNegotiationStep(input)).toEqual(resolveNegotiationStep(input));
    expect(resolveNegotiationStep(input)).toEqual(resolveNegotiationStep({ ...input }));
  });

  it('allowed settlement amounts match presets + counter vs ask', () => {
    const allowed = listAllowedAgreedAmounts(ask);
    expect(allowed).toEqual([
      resolveOfferAmount(ask, 'low'),
      resolveOfferAmount(ask, 'normal'),
      resolveOfferAmount(ask, 'high'),
      resolveCounterAmount(ask),
    ]);
    for (const a of allowed) {
      expect(isAllowedAgreedAmount(ask, a)).toBe(true);
    }
    expect(isAllowedAgreedAmount(ask, ask + 1)).toBe(false);
    expect(isAllowedAgreedAmount(ask, 0)).toBe(false);
  });
});
