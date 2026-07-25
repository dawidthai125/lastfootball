import {
  isAllowedAgreedAmount,
  resolveCounterAmount,
  resolveOfferAmount,
  type OfferPreset,
  type NegotiationStepResult,
} from '@/lib/transfers/resolve-negotiation';

export type SellerNegotiationStepInput =
  | {
      readonly ask: number;
      readonly phase: 'opening';
      readonly aiPreset: OfferPreset;
      readonly playerAction: 'accept' | 'reject' | 'counter';
    }
  | {
      readonly ask: number;
      readonly phase: 'counter';
      readonly playerAction: 'accept' | 'reject';
    };

/**
 * Pure seller-side negotiation for Incoming Offers (LFE-TRANSFERS-05 S2).
 * AI opens with Low/Normal/High vs ask; player Accept/Reject;
 * Counter only vs AI Low → 95% ask; then Accept/Reject.
 * Does NOT extend resolveNegotiationStep (buy-only).
 */
export function resolveSellerNegotiationStep(
  input: SellerNegotiationStepInput,
): NegotiationStepResult {
  if (input.phase === 'opening') {
    const offer = resolveOfferAmount(input.ask, input.aiPreset);
    if (input.playerAction === 'reject') {
      return { kind: 'rejected' };
    }
    if (input.playerAction === 'accept') {
      return { kind: 'accepted', agreedAmount: offer };
    }
    // counter — only meaningful vs Low AI open
    if (input.aiPreset !== 'low') {
      return { kind: 'rejected' };
    }
    return { kind: 'counter', counterAmount: resolveCounterAmount(input.ask) };
  }

  if (input.playerAction === 'reject') {
    return { kind: 'rejected' };
  }
  return { kind: 'accepted', agreedAmount: resolveCounterAmount(input.ask) };
}

/** Re-export allow-list check for settlement callers. */
export { isAllowedAgreedAmount };
