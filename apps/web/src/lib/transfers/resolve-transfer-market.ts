import { formatMoney } from '@/lib/finance/format-money';
import { resolveTransferEnvelope } from '@/lib/finance/resolve-transfer-envelope';
import { ECONOMY_THIN } from '@/lib/finance/types';
import type { PlayerRowDto } from '@/lib/squad/types';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { resolveIncomingOffers } from '@/lib/transfers/resolve-incoming-offers';
import { seedTransferCatalogue } from '@/lib/transfers/seed-catalogue';
import { listTransferSellEligiblePlayers } from '@/lib/transfers/sell-eligibility';
import {
  TRANSFERS_THIN,
  type LiveListingDto,
  type MarketListingDto,
  type SellCandidateDto,
  type TransferMarketDto,
} from '@/lib/transfers/types';

function displayPos(pos: string): string {
  if (pos === 'ŚO' || pos === 'LO') return 'OB';
  return pos;
}

/**
 * Sole transfer market SSOT for product UI (LFE-TRANSFERS-01…06).
 * Pure — never reads DB; callers pass club cash, window, roster, and live listing DTOs.
 */
export function resolveTransferMarket(input: {
  readonly clubId: string;
  readonly cashBalance: number;
  readonly transferWindowOpen: boolean;
  readonly activePlayers: readonly PlayerRowDto[];
  /** Prefetched H2H listed players (other clubs). */
  readonly liveListings?: readonly LiveListingDto[];
}): TransferMarketDto {
  const active = input.activePlayers.filter((p) => p.departedAt == null && p.status !== 'DEPARTED');
  const count = active.length;
  const windowOpen = input.transferWindowOpen;
  const envelope = resolveTransferEnvelope(input.cashBalance);
  const canBuy = windowOpen && count < TRANSFERS_THIN.MAX_ROSTER;
  const canSell = windowOpen && count > TRANSFERS_THIN.MIN_ROSTER;

  const listings: MarketListingDto[] = seedTransferCatalogue(input.clubId).map((s) => {
    const fee = deriveTransferFee(s.skill, s.age);
    return {
      marketId: s.marketId,
      name: s.name,
      pos: displayPos(s.pos),
      role: s.role,
      age: s.age,
      skill: s.skill,
      fee,
      feeLabel: formatMoney(fee, ECONOMY_THIN.CURRENCY),
      clubLabel: s.clubLabel,
    };
  });

  const sellCandidates: SellCandidateDto[] = listTransferSellEligiblePlayers({
    transferWindowOpen: windowOpen,
    activePlayers: input.activePlayers,
  }).map((p) => {
    const fee = deriveTransferFee(p.skill, p.age);
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
      const fee = deriveTransferFee(p.skill, p.age);
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
    sellCandidates,
    listedPlayers,
    incomingOffers: resolveIncomingOffers({
      clubId: input.clubId,
      transferWindowOpen: windowOpen,
      activePlayers: input.activePlayers,
    }),
  };
}
