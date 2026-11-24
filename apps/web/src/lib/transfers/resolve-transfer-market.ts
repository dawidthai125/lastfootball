import { aiSaleAsk } from '@/lib/transfers/fair-sale';
import { formatMoney } from '@/lib/finance/format-money';
import { resolveTransferEnvelope } from '@/lib/finance/resolve-transfer-envelope';
import { ECONOMY_THIN } from '@/lib/finance/types';
import type { PlayerRowDto } from '@/lib/squad/types';
import { filterSeniorPlayers } from '@/lib/squad/types';
import { displayPos } from '@/lib/transfers/display-pos';
import { marketFee } from '@/lib/transfers/market-fee';
import { resolveIncomingOffers } from '@/lib/transfers/resolve-incoming-offers';
import { talentLabels, talentsOf } from '@/lib/squad/talents';
import { boughtPlayerId, seedTransferCatalogue } from '@/lib/transfers/seed-catalogue';
import { listTransferSellEligiblePlayers, saleRoster } from '@/lib/transfers/sell-eligibility';
import {
  TRANSFERS_THIN,
  type LiveH2hOfferDto,
  type LiveListingDto,
  type MarketListingDto,
  type SellCandidateDto,
  type TransferMarketDto,
} from '@/lib/transfers/types';

/**
 * Sole transfer market SSOT for product UI (LFE-TRANSFERS-01…07).
 * Pure — never reads DB; callers pass club cash, window, roster, live listings, H2H offers.
 */
export function resolveTransferMarket(input: {
  readonly clubId: string;
  readonly cashBalance: number;
  readonly transferWindowOpen: boolean;
  readonly activePlayers: readonly PlayerRowDto[];
  /** Prefetched H2H listed players (other clubs). */
  readonly liveListings?: readonly LiveListingDto[];
  readonly incomingLiveOffers?: readonly LiveH2hOfferDto[];
  readonly outgoingLiveOffers?: readonly LiveH2hOfferDto[];
  /** Market rows this club bought already: each one is sold once. */
  readonly boughtMarketIds?: ReadonlySet<string>;
}): TransferMarketDto {
  /** Senior filter only — academy prospects never enter market roster counts. */
  const seniors = filterSeniorPlayers(input.activePlayers);
  const active = seniors;
  const count = active.length;
  const windowOpen = input.transferWindowOpen;
  const envelope = resolveTransferEnvelope(input.cashBalance);
  const canBuy = windowOpen && count < TRANSFERS_THIN.MAX_ROSTER;
  const canSell = windowOpen && saleRoster(seniors).length > TRANSFERS_THIN.MIN_ROSTER;

  const listings: MarketListingDto[] = seedTransferCatalogue(input.clubId)
    .filter((s) => !input.boughtMarketIds?.has(s.marketId))
    .map((s) => {
      const fee = marketFee(s.skill, s.age, s.clubLabel);
      return {
        marketId: s.marketId,
        name: s.name,
        pos: displayPos(s.pos),
        role: s.role,
        age: s.age,
        skill: s.skill,
        talents: talentLabels(talentsOf(boughtPlayerId(s.marketId), s.pos)),
        fee,
        feeLabel: formatMoney(fee, ECONOMY_THIN.CURRENCY),
        clubLabel: s.clubLabel,
      };
    });

  const sellCandidates: SellCandidateDto[] = listTransferSellEligiblePlayers({
    transferWindowOpen: windowOpen,
    activePlayers: seniors,
  }).map((p) => {
    const fee = aiSaleAsk(p);
    return {
      playerId: p.id,
      name: p.name,
      pos: displayPos(p.pos),
      age: p.age,
      skill: p.skill,
      fee,
      feeLabel: formatMoney(fee, ECONOMY_THIN.CURRENCY),
      starter: p.starter,
      listed: p.transferListedAt != null,
    };
  });

  const listedPlayers: SellCandidateDto[] = active
    .filter((p) => p.transferListedAt != null)
    .map((p) => {
      const fee = aiSaleAsk(p);
      return {
        playerId: p.id,
        name: p.name,
        pos: displayPos(p.pos),
        age: p.age,
        skill: p.skill,
        fee,
        feeLabel: formatMoney(fee, ECONOMY_THIN.CURRENCY),
        starter: p.starter,
        listed: true,
      };
    });

  return {
    clubId: input.clubId,
    windowOpen,
    cashBalance: input.cashBalance,
    cashLabel: formatMoney(input.cashBalance, ECONOMY_THIN.CURRENCY),
    envelopeBalance: envelope.envelopeBalance,
    envelopeLabel: envelope.envelopeLabel,
    currency: ECONOMY_THIN.CURRENCY,
    activeRosterCount: count,
    minRoster: TRANSFERS_THIN.MIN_ROSTER,
    maxRoster: TRANSFERS_THIN.MAX_ROSTER,
    canBuy,
    canSell,
    listings,
    liveListings: input.liveListings ?? [],
    incomingLiveOffers: input.incomingLiveOffers ?? [],
    outgoingLiveOffers: input.outgoingLiveOffers ?? [],
    sellCandidates,
    listedPlayers,
    incomingOffers: resolveIncomingOffers({
      clubId: input.clubId,
      transferWindowOpen: windowOpen,
      activePlayers: seniors,
    }),
  };
}
