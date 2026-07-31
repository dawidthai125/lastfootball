import { formatMoney } from '@/lib/finance/format-money';
import { ECONOMY_THIN } from '@/lib/finance/types';
import { displayPos } from '@/lib/transfers/display-pos';
import type {
  LiveH2hLastActor,
  LiveH2hOfferDto,
  LiveH2hOfferPhase,
  TransferOfferStatus,
} from '@/lib/transfers/types';

export type TransferOfferRow = {
  readonly id: string;
  readonly player_id: string;
  readonly seller_club_id: string;
  readonly buyer_club_id: string;
  /** current_amount from DB */
  readonly current_amount: number;
  readonly opening_amount: number;
  readonly ask_at_create: number;
  readonly phase: string;
  readonly last_actor: string;
  readonly status: string;
  readonly created_at: string;
  readonly player_name?: string;
  readonly pos?: string;
  readonly counterpart_label?: string;
};

/** Pure map of pending offer rows → DTO. */
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
    amount: r.current_amount,
    amountLabel: formatMoney(r.current_amount, ECONOMY_THIN.CURRENCY),
    openingAmount: r.opening_amount,
    openingAmountLabel: formatMoney(r.opening_amount, ECONOMY_THIN.CURRENCY),
    askAtCreate: r.ask_at_create,
    askAtCreateLabel: formatMoney(r.ask_at_create, ECONOMY_THIN.CURRENCY),
    phase: r.phase as LiveH2hOfferPhase,
    lastActor: r.last_actor as LiveH2hLastActor,
    status: r.status as TransferOfferStatus,
    counterpartLabel: r.counterpart_label ?? 'Klub',
    side,
    createdAt: r.created_at,
  }));
}
