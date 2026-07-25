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
  /** True when players.transfer_listed_at is set. */
  readonly listed: boolean;
};

/** Derived AI→player offer (LFE-TRANSFERS-03…05) — opening = % ask via NEGOTIATION_THIN. */
export type IncomingOfferDto = {
  readonly offerId: string;
  readonly playerId: string;
  readonly playerName: string;
  readonly pos: string;
  readonly age: number;
  readonly skill: number;
  /** Ask from deriveTransferFee. */
  readonly ask: number;
  readonly aiPreset: 'low' | 'normal' | 'high';
  /** Opening offer amount (= resolveOfferAmount(ask, aiPreset)). */
  readonly amount: number;
  readonly amountLabel: string;
  readonly buyerLabel: string;
  /** True when AI opened Low — player may counter to 95% ask. */
  readonly canCounter: boolean;
};

/** Live H2H listing (LFE-TRANSFERS-06) — from listed players of other clubs. */
export type LiveListingDto = {
  readonly playerId: string;
  readonly playerName: string;
  readonly pos: string;
  readonly role: string;
  readonly age: number;
  readonly skill: number;
  /** Ask from deriveTransferFee. */
  readonly ask: number;
  readonly askLabel: string;
  readonly sellerClubId: string;
  readonly sellerClubLabel: string;
  readonly sellerWindowOpen: boolean;
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
  /** H2H live listings — Instant Buy @ 100% ask. */
  readonly liveListings: readonly LiveListingDto[];
  readonly sellCandidates: readonly SellCandidateDto[];
  /**
   * Active players with transfer_listed_at set — shown even when window closed (Unlist).
   * Derived inside resolveTransferMarket only (no separate resolver).
   */
  readonly listedPlayers: readonly SellCandidateDto[];
  /** Derived AI incoming offers — from resolveIncomingOffers only. */
  readonly incomingOffers: readonly IncomingOfferDto[];
};
