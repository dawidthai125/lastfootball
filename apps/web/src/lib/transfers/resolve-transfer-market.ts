import { formatMoney } from '@/lib/finance/format-money';
import { resolveTransferEnvelope } from '@/lib/finance/resolve-transfer-envelope';
import { ECONOMY_THIN } from '@/lib/finance/types';
import type { PlayerRowDto } from '@/lib/squad/types';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { seedTransferCatalogue } from '@/lib/transfers/seed-catalogue';
import {
  TRANSFERS_THIN,
  type MarketListingDto,
  type SellCandidateDto,
  type TransferMarketDto,
} from '@/lib/transfers/types';

function displayPos(pos: string): string {
  if (pos === 'ŚO' || pos === 'LO') return 'OB';
  return pos;
}

/**
 * Sole transfer market SSOT for product UI (LFE-TRANSFERS-01 / E1 envelope).
 * Pure — never reads DB; callers pass club cash, window flag, and active roster rows.
 */
export function resolveTransferMarket(input: {
  readonly clubId: string;
  readonly cashBalance: number;
  readonly transferWindowOpen: boolean;
  readonly activePlayers: readonly PlayerRowDto[];
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

  const gkCount = active.filter((p) => p.pos === 'BR' || p.role === 'GK').length;

  const sellCandidates: SellCandidateDto[] = active
    .filter((p) => {
      if (!canSell) return false;
      const isGk = p.pos === 'BR' || p.role === 'GK';
      if (isGk && gkCount <= 1) return false;
      return true;
    })
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
    sellCandidates,
  };
}
