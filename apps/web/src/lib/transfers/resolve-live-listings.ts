import { formatMoney } from '@/lib/finance/format-money';
import { ECONOMY_THIN } from '@/lib/finance/types';
import { displayPos } from '@/lib/transfers/display-pos';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import type { LiveListingDto } from '@/lib/transfers/types';

/** Raw row from list_live_transfer_listings RPC (or equivalent query). */
export type LiveListingRow = {
  readonly player_id: string;
  readonly player_name: string;
  readonly pos: string;
  readonly role: string;
  readonly age: number;
  readonly skill: number;
  readonly seller_club_id: string;
  readonly seller_club_name: string;
  readonly seller_short_name: string;
  readonly seller_window_open: boolean;
};

/**
 * Pure map of DB live listing rows → DTO (LFE-TRANSFERS-06).
 * Ask = deriveTransferFee only. Excludes caller's own club (done by query).
 */
export function resolveLiveListings(rows: readonly LiveListingRow[]): readonly LiveListingDto[] {
  return rows.map((r) => {
    const ask = deriveTransferFee(r.skill, r.age);
    return {
      playerId: r.player_id,
      playerName: r.player_name,
      pos: displayPos(r.pos),
      role: r.role,
      age: r.age,
      skill: r.skill,
      ask,
      askLabel: formatMoney(ask, ECONOMY_THIN.CURRENCY),
      sellerClubId: r.seller_club_id,
      sellerClubLabel: r.seller_short_name || r.seller_club_name,
      sellerWindowOpen: r.seller_window_open,
    };
  });
}
