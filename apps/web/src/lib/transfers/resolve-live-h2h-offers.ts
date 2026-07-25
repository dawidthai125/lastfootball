import { formatMoney } from '@/lib/finance/format-money';
import { ECONOMY_THIN } from '@/lib/finance/types';
import type { LiveH2hOfferDto, TransferOfferStatus } from '@/lib/transfers/types';

export type TransferOfferRow = {
  readonly id: string;
  readonly player_id: string;
  readonly seller_club_id: string;
  readonly buyer_club_id: string;
  readonly amount: number;
  readonly ask_at_create: number;
  readonly status: string;
  readonly created_at: string;
  readonly player_name?: string;
  readonly pos?: string;
  readonly counterpart_label?: string;
};

function displayPos(pos: string): string {
  if (pos === 'ŚO' || pos === 'LO') return 'OB';
  return pos;
}

/** Pure map of pending offer rows → DTO (snapshots immutable). */
export function resolveLiveH2hOffers(
  rows: readonly TransferOfferRow[],
  side: 'incoming' | 'outgoing',
): readonly LiveH2hOfferDto[] {
  return rows.map((r) => ({
    offerId: r.id,
    playerId: r.player_id,
    playerName: r.player_name ?? r.player_id,
    pos: displayPos(r.pos ?? ''),
    sellerClubId: r.seller_club_id,
    buyerClubId: r.buyer_club_id,
    amount: r.amount,
    amountLabel: formatMoney(r.amount, ECONOMY_THIN.CURRENCY),
    askAtCreate: r.ask_at_create,
    askAtCreateLabel: formatMoney(r.ask_at_create, ECONOMY_THIN.CURRENCY),
    status: r.status as TransferOfferStatus,
    counterpartLabel: r.counterpart_label ?? 'Klub',
    side,
    createdAt: r.created_at,
  }));
}
