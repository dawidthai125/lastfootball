export type TransferNegotiationState = {
  readonly marketId: string;
  readonly ask: number;
  readonly counterAmount: number;
};

export type TransferActionState = {
  error?: string;
  ok?: boolean;
  /** Stateless counter step — no DB pending; UI-only until Accept/Reject. */
  negotiation?: TransferNegotiationState;
};

export const TRANSFER_ACTION_INITIAL: TransferActionState = {};
