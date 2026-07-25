import type { createClient } from '@/lib/supabase/server';
import { resolveLiveListings, type LiveListingRow } from '@/lib/transfers/resolve-live-listings';
import type { LiveListingDto } from '@/lib/transfers/types';

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Fetch H2H live listings via security-definer RPC (no listing table).
 * Source: players WHERE transfer_listed_at IS NOT NULL, excluding own club.
 */
export async function fetchLiveListings(
  supabase: AppSupabase,
  excludeClubId: string,
): Promise<readonly LiveListingDto[]> {
  const { data, error } = await supabase.rpc(
    'list_live_transfer_listings' as never,
    {
      p_exclude_club_id: excludeClubId,
    } as never,
  );

  if (error || !data) {
    return [];
  }

  const rows = (data as LiveListingRow[]).map((r) => ({
    player_id: r.player_id,
    player_name: r.player_name,
    pos: r.pos,
    role: r.role,
    age: r.age,
    skill: r.skill,
    seller_club_id: r.seller_club_id,
    seller_club_name: r.seller_club_name,
    seller_short_name: r.seller_short_name,
    seller_window_open: Boolean(r.seller_window_open),
  }));

  return resolveLiveListings(rows);
}
