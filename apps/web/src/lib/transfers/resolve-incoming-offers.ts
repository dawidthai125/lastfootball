import { formatMoney } from '@/lib/finance/format-money';
import { ECONOMY_THIN } from '@/lib/finance/types';
import type { PlayerRowDto } from '@/lib/squad/types';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { listTransferSellEligiblePlayers } from '@/lib/transfers/sell-eligibility';
import type { IncomingOfferDto } from '@/lib/transfers/types';

/** Thin cap — derived inbox size (no DB). */
export const INCOMING_THIN = {
  MAX_OFFERS: 3,
} as const;

/** Deterministic AI buyer labels — reused from market flavour, not a second fee SSOT. */
const AI_BUYER_LABELS = [
  'Orzeł Grodzisk',
  'Wisła Nysa',
  'Stal Mława',
  'Hutnik Ostróda',
  'Unia Rawicz',
] as const;

function displayPos(pos: string): string {
  if (pos === 'ŚO' || pos === 'LO') return 'OB';
  return pos;
}

/** Stable non-crypto hash from existing string ids only. */
function stableHash(parts: readonly string[]): number {
  let h = 2166136261;
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) {
      h ^= part.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= 0x7c;
  }
  return h >>> 0;
}

/**
 * Deterministic offer id — solely from clubId + playerId (no randomness).
 * Format: `in-{clubTag}-{playerId}`
 */
export function buildIncomingOfferId(clubId: string, playerId: string): string {
  const tag = clubId.replace(/-/g, '').slice(0, 8) || 'club';
  return `in-${tag}-${playerId}`;
}

/** @deprecated Prefer isTransferSellEligible — kept as alias for TRANSFERS-03 callers. */
export { isTransferSellEligible as isIncomingSellEligible } from '@/lib/transfers/sell-eligibility';

/**
 * Pure derived AI→player offers (LFE-TRANSFERS-03 / 04).
 * Only players with transferListedAt set + shared sell eligibility.
 * Amount = 100% deriveTransferFee. Identical input → identical output.
 */
export function resolveIncomingOffers(input: {
  readonly clubId: string;
  readonly transferWindowOpen: boolean;
  readonly activePlayers: readonly PlayerRowDto[];
}): readonly IncomingOfferDto[] {
  const eligible = listTransferSellEligiblePlayers({
    transferWindowOpen: input.transferWindowOpen,
    activePlayers: input.activePlayers,
  }).filter((p) => p.transferListedAt != null);

  const sorted = eligible.slice().sort((a, b) => a.id.localeCompare(b.id));

  /** Prefer players with stableHash % 3 === 0; fill up to MAX from sorted list. */
  const preferred = sorted.filter((p) => stableHash([input.clubId, p.id]) % 3 === 0);
  const pool = preferred.length > 0 ? preferred : sorted;
  const selected = pool.slice(0, INCOMING_THIN.MAX_OFFERS);

  return selected.map((p) => {
    const amount = deriveTransferFee(p.skill, p.age);
    const buyerIdx = stableHash([input.clubId, p.id, 'buyer']) % AI_BUYER_LABELS.length;
    return {
      offerId: buildIncomingOfferId(input.clubId, p.id),
      playerId: p.id,
      playerName: p.name,
      pos: displayPos(p.pos),
      age: p.age,
      skill: p.skill,
      amount,
      amountLabel: formatMoney(amount, ECONOMY_THIN.CURRENCY),
      buyerLabel: AI_BUYER_LABELS[buyerIdx]!,
    };
  });
}
