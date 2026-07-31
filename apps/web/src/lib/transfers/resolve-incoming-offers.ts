import { formatMoney } from '@/lib/finance/format-money';
import { ECONOMY_THIN } from '@/lib/finance/types';
import type { PlayerRowDto } from '@/lib/squad/types';
import { displayPos } from '@/lib/transfers/display-pos';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { resolveOfferAmount, type OfferPreset } from '@/lib/transfers/resolve-negotiation';
import { listTransferSellEligiblePlayers } from '@/lib/transfers/sell-eligibility';
import type { IncomingOfferDto } from '@/lib/transfers/types';

/** Thin cap — derived inbox size (no DB). */
export const INCOMING_THIN = {
  MAX_OFFERS: 3,
} as const;

const AI_BUYER_LABELS = [
  'Orzeł Grodzisk',
  'Wisła Nysa',
  'Stal Mława',
  'Hutnik Ostróda',
  'Unia Rawicz',
] as const;

const AI_PRESETS: readonly OfferPreset[] = ['low', 'normal', 'high'];

/** Stable non-crypto hash from existing string ids only — no Date/RNG. */
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

export function buildIncomingOfferId(clubId: string, playerId: string): string {
  const tag = clubId.replace(/-/g, '').slice(0, 8) || 'club';
  return `in-${tag}-${playerId}`;
}

/** Deterministic AI opening preset vs ask (LFE-TRANSFERS-05). */
export function resolveIncomingAiPreset(clubId: string, playerId: string): OfferPreset {
  return AI_PRESETS[stableHash([clubId, playerId, 'ai-open']) % AI_PRESETS.length]!;
}

export { isTransferSellEligible as isIncomingSellEligible } from '@/lib/transfers/sell-eligibility';

/**
 * Pure derived AI→player offers (LFE-TRANSFERS-03…05).
 * Listed + eligible only. Opening amount = NEGOTIATION_THIN % of ask (S2).
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
  const preferred = sorted.filter((p) => stableHash([input.clubId, p.id]) % 3 === 0);
  const pool = preferred.length > 0 ? preferred : sorted;
  const selected = pool.slice(0, INCOMING_THIN.MAX_OFFERS);

  return selected.map((p) => {
    const ask = deriveTransferFee(p.skill, p.age);
    const aiPreset = resolveIncomingAiPreset(input.clubId, p.id);
    const amount = resolveOfferAmount(ask, aiPreset);
    const buyerIdx = stableHash([input.clubId, p.id, 'buyer']) % AI_BUYER_LABELS.length;
    return {
      offerId: buildIncomingOfferId(input.clubId, p.id),
      playerId: p.id,
      playerName: p.name,
      pos: displayPos(p.pos),
      age: p.age,
      skill: p.skill,
      ask,
      aiPreset,
      amount,
      amountLabel: formatMoney(amount, ECONOMY_THIN.CURRENCY),
      buyerLabel: AI_BUYER_LABELS[buyerIdx]!,
      canCounter: aiPreset === 'low',
    };
  });
}
