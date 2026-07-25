export type {
  TransferMarketDto,
  MarketListingDto,
  SellCandidateDto,
  IncomingOfferDto,
  LiveListingDto,
  LiveH2hOfferDto,
  LiveH2hOfferPhase,
  LiveH2hLastActor,
  TransferOfferStatus,
  TransferDealKind,
} from '@/lib/transfers/types';
export { TRANSFERS_THIN } from '@/lib/transfers/types';
export { resolveTransferMarket } from '@/lib/transfers/resolve-transfer-market';
export { resolveLiveListings } from '@/lib/transfers/resolve-live-listings';
export type { LiveListingRow } from '@/lib/transfers/resolve-live-listings';
export { resolveLiveH2hOffers } from '@/lib/transfers/resolve-live-h2h-offers';
export { seedTransferCatalogue } from '@/lib/transfers/seed-catalogue';
export { deriveTransferFee } from '@/lib/transfers/derive-fee';
export {
  INCOMING_THIN,
  resolveIncomingOffers,
  buildIncomingOfferId,
  resolveIncomingAiPreset,
} from '@/lib/transfers/resolve-incoming-offers';
export {
  isTransferSellEligible,
  listTransferSellEligiblePlayers,
} from '@/lib/transfers/sell-eligibility';
export {
  NEGOTIATION_THIN,
  resolveNegotiationStep,
  resolveOfferAmount,
  resolveCounterAmount,
  isAllowedAgreedAmount,
} from '@/lib/transfers/resolve-negotiation';
export type {
  OfferPreset,
  NegotiationStepInput,
  NegotiationStepResult,
} from '@/lib/transfers/resolve-negotiation';
export { resolveSellerNegotiationStep } from '@/lib/transfers/resolve-seller-negotiation';
export type { SellerNegotiationStepInput } from '@/lib/transfers/resolve-seller-negotiation';
export { TRANSFER_ACTION_INITIAL } from '@/lib/transfers/action-types';
export type {
  TransferActionState,
  TransferSellerNegotiationState,
} from '@/lib/transfers/action-types';

// Server I/O / actions — import from complete-deal, ensure-window, actions paths (not barrel for client).
