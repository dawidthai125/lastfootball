export type TransferNegotiationState = {
  readonly marketId: string;
  readonly ask: number;
  /** First seller counter (95%). */
  readonly counterAmount?: number;
  /** Last seller step (97%). */
  readonly finalAmount?: number;
  readonly step: 'counter' | 'final';
};

/** Stateless seller counter (Incoming S2) — UI-only until Accept/Reject. */
export type TransferSellerNegotiationState = {
  readonly offerId: string;
  readonly playerId: string;
  readonly ask: number;
  readonly counterAmount: number;
};

export type TransferActionState = {
  error?: string;
  ok?: boolean;
  /** Buy nego counter (N1). */
  negotiation?: TransferNegotiationState;
  /** Seller nego counter on Incoming (LFE-TRANSFERS-05). */
  sellerNegotiation?: TransferSellerNegotiationState;
};

export const TRANSFER_ACTION_INITIAL: TransferActionState = {};
