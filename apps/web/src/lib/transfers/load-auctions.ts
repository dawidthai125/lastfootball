import { tryAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export type AuctionSnap = {
  readonly playerId: string;
  readonly sellerClubId: string;
  readonly ask: number;
  readonly highAmount: number | null;
  readonly highClubId: string | null;
  readonly endsAt: string;
};

/** Auctions past their end are settled first; the scheduler does the same every 10 minutes. */
export async function settleDueAuctions(): Promise<void> {
  await tryAdminClient()?.rpc('settle_due_auctions' as never);
}

/** Whether bids bind this player now. A failed read counts as yes: no sale on a guess. */
export async function hasOpenAuction(playerId: string): Promise<boolean> {
  const admin = tryAdminClient();
  if (!admin) return false;
  const { data, error } = await admin
    .from('transfer_auctions' as never)
    .select('id')
    .eq('player_id', playerId)
    .eq('status', 'open')
    .limit(1);
  return Boolean(error) || (data as unknown as unknown[] | null)?.length !== 0;
}

/** Open auctions. Empty when the tables are not in the database yet. */
export async function loadOpenAuctions(): Promise<readonly AuctionSnap[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transfer_auctions')
    .select('id, player_id, seller_club_id, ask, ends_at')
    .eq('status', 'open');
  if (error || !data) return [];
  const auctions = data as {
    id: string;
    player_id: string;
    seller_club_id: string;
    ask: number;
    ends_at: string;
  }[];
  if (auctions.length === 0) return [];

  const ids = auctions.map((row) => row.id);
  const bids = await supabase
    .from('transfer_auction_bids')
    .select('auction_id, club_id, amount, created_at')
    .in('auction_id', ids);
  const rows =
    bids.error || !bids.data
      ? []
      : (bids.data as {
          auction_id: string;
          club_id: string;
          amount: number;
          created_at: string;
        }[]);

  return auctions.map((auction) => {
    const mine = rows
      .filter((bid) => bid.auction_id === auction.id)
      .sort((a, b) => b.amount - a.amount || (a.created_at < b.created_at ? 1 : -1));
    const high = mine[0];
    return {
      playerId: auction.player_id,
      sellerClubId: auction.seller_club_id,
      ask: auction.ask,
      highAmount: high?.amount ?? null,
      highClubId: high?.club_id ?? null,
      endsAt: auction.ends_at,
    };
  });
}
