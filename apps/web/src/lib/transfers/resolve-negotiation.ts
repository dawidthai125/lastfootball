/**
 * Thin buy-negotiation constants (LFE-TRANSFERS-02-N1).
 * Ask stays deriveTransferFee; percentages apply only to negotiation offers.
 */
export const NEGOTIATION_THIN = {
  PRESET_LOW_PCT: 90,
  PRESET_NORMAL_PCT: 100,
  PRESET_HIGH_PCT: 110,
  COUNTER_PCT: 95,
} as const;

export type OfferPreset = 'low' | 'normal' | 'high';

export type NegotiationPhase = 'opening' | 'counter';

export type NegotiationStepInput =
  | {
      readonly ask: number;
      readonly phase: 'opening';
      readonly preset: OfferPreset;
    }
  | {
      readonly ask: number;
      readonly phase: 'counter';
      readonly playerAction: 'accept' | 'reject';
    };

export type NegotiationStepResult =
  | { readonly kind: 'accepted'; readonly agreedAmount: number }
  | { readonly kind: 'rejected' }
  | { readonly kind: 'counter'; readonly counterAmount: number };

/** Round ask × percent/100 — sole scaler for negotiation amounts. */
export function scaleAskAmount(ask: number, percent: number): number {
  return Math.round((ask * percent) / 100);
}

export function resolveOfferAmount(ask: number, preset: OfferPreset): number {
  const pct =
    preset === 'low'
      ? NEGOTIATION_THIN.PRESET_LOW_PCT
      : preset === 'high'
        ? NEGOTIATION_THIN.PRESET_HIGH_PCT
        : NEGOTIATION_THIN.PRESET_NORMAL_PCT;
  return scaleAskAmount(ask, pct);
}

export function resolveCounterAmount(ask: number): number {
  return scaleAskAmount(ask, NEGOTIATION_THIN.COUNTER_PCT);
}

/** Allowed settlement amounts for a given ask (security revalidation). */
export function listAllowedAgreedAmounts(ask: number): readonly number[] {
  return [
    resolveOfferAmount(ask, 'low'),
    resolveOfferAmount(ask, 'normal'),
    resolveOfferAmount(ask, 'high'),
    resolveCounterAmount(ask),
  ];
}

export function isAllowedAgreedAmount(ask: number, agreedAmount: number): boolean {
  return listAllowedAgreedAmounts(ask).includes(agreedAmount);
}

/**
 * Pure deterministic negotiation step (LFE-TRANSFERS-02-N1).
 * Identical input → identical output. No IO / randomness.
 *
 * Opening: High/Normal → Accept; Low → Counter (95% ask).
 * Counter: Accept → agreedAmount = 95% ask; Reject → rejected.
 */
export function resolveNegotiationStep(input: NegotiationStepInput): NegotiationStepResult {
  if (input.phase === 'opening') {
    const offer = resolveOfferAmount(input.ask, input.preset);
    if (input.preset === 'low') {
      return { kind: 'counter', counterAmount: resolveCounterAmount(input.ask) };
    }
    return { kind: 'accepted', agreedAmount: offer };
  }

  if (input.playerAction === 'reject') {
    return { kind: 'rejected' };
  }
  return { kind: 'accepted', agreedAmount: resolveCounterAmount(input.ask) };
}
