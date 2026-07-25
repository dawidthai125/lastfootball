/**
 * Thin transfer constants (D20) — roster / unlock only.
 * Currency + fee coefficients live in ECONOMY_THIN (GDD §26 / REUSE FIRST).
 */
export const TRANSFERS_THIN = {
  UNLOCK_AFTER_PLAYED: 2,
  MIN_ROSTER: 18,
  MAX_ROSTER: 22,
} as const;

export type TransferDealKind = 'buy' | 'sell';

export type MarketListingDto = {
  readonly marketId: string;
  readonly name: string;
  readonly pos: string;
  readonly role: string;
  readonly age: number;
  readonly skill: number;
  readonly fee: number;
  readonly feeLabel: string;
  readonly clubLabel: string;
};

export type SellCandidateDto = {
  readonly playerId: string;
  readonly name: string;
  readonly pos: string;
  readonly age: number;
  readonly skill: number;
  readonly fee: number;
  readonly feeLabel: string;
  readonly starter: boolean;
};

export type TransferMarketDto = {
  readonly clubId: string;
  readonly windowOpen: boolean;
  readonly cashBalance: number;
  readonly cashLabel: string;
  /** Derived transfer budget — from resolveTransferEnvelope only. */
  readonly envelopeBalance: number;
  readonly envelopeLabel: string;
  readonly currency: string;
  readonly activeRosterCount: number;
  readonly minRoster: number;
  readonly maxRoster: number;
  readonly canBuy: boolean;
  readonly canSell: boolean;
  readonly listings: readonly MarketListingDto[];
  readonly sellCandidates: readonly SellCandidateDto[];
};
