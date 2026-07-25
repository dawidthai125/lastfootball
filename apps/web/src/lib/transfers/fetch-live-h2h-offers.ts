import type { createClient } from '@/lib/supabase/server';
import { resolveLiveH2hOffers } from '@/lib/transfers/resolve-live-h2h-offers';
import type { LiveH2hOfferDto } from '@/lib/transfers/types';

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

type OfferDb = {
  id: string;
  player_id: string;
  seller_club_id: string;
  buyer_club_id: string;
  opening_amount: number;
  current_amount: number;
  ask_at_create: number;
  phase: string;
  last_actor: string;
  status: string;
  created_at: string;
  buyer_label: string | null;
  seller_label: string | null;
};

/**
 * Pending H2H offers for club (incoming = seller, outgoing = buyer).
 */
export async function fetchLiveH2hOffers(
  supabase: AppSupabase,
  clubId: string,
): Promise<{
  readonly incoming: readonly LiveH2hOfferDto[];
  readonly outgoing: readonly LiveH2hOfferDto[];
}> {
  const { data, error } = await supabase
    .from('transfer_offers' as never)
    .select(
      'id, player_id, seller_club_id, buyer_club_id, opening_amount, current_amount, ask_at_create, phase, last_actor, status, created_at, buyer_label, seller_label',
    )
    .eq('status', 'pending')
    .or(`seller_club_id.eq.${clubId},buyer_club_id.eq.${clubId}`);

  if (error || !data) {
    return { incoming: [], outgoing: [] };
  }

  const offers = data as OfferDb[];
  const playerIds = [...new Set(offers.map((o) => o.player_id))];

  const { data: players } = playerIds.length
    ? await supabase.from('players').select('id, name, pos').in('id', playerIds)
    : { data: [] as { id: string; name: string; pos: string }[] };

  const playerMap = new Map(
    ((players as { id: string; name: string; pos: string }[] | null) ?? []).map((p) => [p.id, p]),
  );

  const incomingRows = offers
    .filter((o) => o.seller_club_id === clubId)
    .map((o) => {
      const p = playerMap.get(o.player_id);
      return {
        ...o,
        player_name: p?.name,
        pos: p?.pos,
        counterpart_label: o.buyer_label || 'Kupujący',
      };
    });

  const outgoingRows = offers
    .filter((o) => o.buyer_club_id === clubId)
    .map((o) => {
      const p = playerMap.get(o.player_id);
      return {
        ...o,
        player_name: p?.name,
        pos: p?.pos,
        counterpart_label: o.seller_label || 'Sprzedawca',
      };
    });

  return {
    incoming: resolveLiveH2hOffers(incomingRows, 'incoming'),
    outgoing: resolveLiveH2hOffers(outgoingRows, 'outgoing'),
  };
}
