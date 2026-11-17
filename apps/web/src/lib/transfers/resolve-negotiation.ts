/**
 * Thin buy-negotiation constants (LFE-TRANSFERS-02-N1).
 * Ask stays deriveTransferFee; percentages apply only to negotiation offers.
 */
export const NEGOTIATION_THIN = {
  PRESET_LOW_PCT: 90,
  PRESET_NORMAL_PCT: 100,
  PRESET_HIGH_PCT: 110,
  COUNTER_PCT: 95,
  /** Last seller step after the first counter is refused. */
  FINAL_PCT: 97,
} as const;

export type OfferPreset = 'low' | 'normal' | 'high';

export type NegotiationPhase = 'opening' | 'counter' | 'final';

export type NegotiationBundle = 'fee_only' | 'fee_wage';

export type NegotiationStepInput =
  | {
      readonly ask: number;
      readonly phase: 'opening';
      readonly preset: OfferPreset;
    }
  | {
      readonly ask: number;
      readonly phase: 'counter';
      readonly playerAction: 'accept' | 'reject' | 'final';
    }
  | {
      readonly ask: number;
      readonly phase: 'final';
      readonly playerAction: 'accept' | 'reject';
    };

export type NegotiationStepResult =
  | { readonly kind: 'accepted'; readonly agreedAmount: number }
  | { readonly kind: 'rejected' }
  | { readonly kind: 'counter'; readonly counterAmount: number }
  | { readonly kind: 'final'; readonly finalAmount: number };

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

export function resolveFinalAmount(ask: number): number {
  return scaleAskAmount(ask, NEGOTIATION_THIN.FINAL_PCT);
}

export function negotiationBundleLabel(bundle: NegotiationBundle): string {
  if (bundle === 'fee_wage') return 'Kwota + pensja w limicie klubu';
  return 'Tylko kwota transferu';
}

/** Allowed settlement amounts for a given ask (security revalidation). */
export function listAllowedAgreedAmounts(ask: number): readonly number[] {
  return [
    resolveOfferAmount(ask, 'low'),
    resolveOfferAmount(ask, 'normal'),
    resolveOfferAmount(ask, 'high'),
    resolveCounterAmount(ask),
    resolveFinalAmount(ask),
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
 * Counter: Accept → 95% ask; final → 97% ask; Reject → rejected.
 * Final: Accept → 97% ask; Reject → rejected.
 */
export function resolveNegotiationStep(input: NegotiationStepInput): NegotiationStepResult {
  if (input.phase === 'opening') {
    const offer = resolveOfferAmount(input.ask, input.preset);
    if (input.preset === 'low') {
      return { kind: 'counter', counterAmount: resolveCounterAmount(input.ask) };
    }
    return { kind: 'accepted', agreedAmount: offer };
  }

  if (input.phase === 'final') {
    if (input.playerAction === 'reject') return { kind: 'rejected' };
    return { kind: 'accepted', agreedAmount: resolveFinalAmount(input.ask) };
  }

  if (input.playerAction === 'reject') {
    return { kind: 'rejected' };
  }
  if (input.playerAction === 'final') {
    return { kind: 'final', finalAmount: resolveFinalAmount(input.ask) };
  }
  return { kind: 'accepted', agreedAmount: resolveCounterAmount(input.ask) };
}
