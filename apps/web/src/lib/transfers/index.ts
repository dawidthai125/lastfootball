export type {
  TransferMarketDto,
  MarketListingDto,
  SellCandidateDto,
  TransferDealKind,
} from '@/lib/transfers/types';
export { TRANSFERS_THIN } from '@/lib/transfers/types';
export { resolveTransferMarket } from '@/lib/transfers/resolve-transfer-market';
export { seedTransferCatalogue } from '@/lib/transfers/seed-catalogue';
export { deriveTransferFee } from '@/lib/transfers/derive-fee';
export {
  NEGOTIATION_THIN,
  resolveNegotiationStep,
  resolveOfferAmount,
  resolveCounterAmount,
} from '@/lib/transfers/resolve-negotiation';
export type {
  OfferPreset,
  NegotiationStepInput,
  NegotiationStepResult,
} from '@/lib/transfers/resolve-negotiation';
export { TRANSFER_ACTION_INITIAL } from '@/lib/transfers/action-types';
export type { TransferActionState } from '@/lib/transfers/action-types';

// Server I/O / actions — import from complete-deal, ensure-window, actions paths (not barrel for client).
