import { createClient } from '@/lib/supabase/server';

export type AuctionSnap = {
  readonly playerId: string;
  readonly sellerClubId: string;
  readonly ask: number;
  readonly highAmount: number | null;
  readonly highClubId: string | null;
};

/** Open auctions. Empty when the tables are not in the database yet. */
export async function loadOpenAuctions(): Promise<readonly AuctionSnap[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transfer_auctions')
    .select('id, player_id, seller_club_id, ask')
    .eq('status', 'open');
  if (error || !data) return [];
  const auctions = data as {
    id: string;
    player_id: string;
    seller_club_id: string;
    ask: number;
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
    };
  });
}
