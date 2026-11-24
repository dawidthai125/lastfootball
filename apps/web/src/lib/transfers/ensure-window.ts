import { countClubPlayedFixtures } from '@/lib/fixtures/count-played';
import { tryAdminClient } from '@/lib/supabase/admin';
import type { createClient } from '@/lib/supabase/server';
import { isTransferWindowOpen } from '@/lib/transfers/window';

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

/** Opens and closes the window by the calendar of the club season (D152). Idempotent. */
export async function ensureTransferWindow(supabase: AppSupabase, clubId: string): Promise<void> {
  const { data } = await supabase
    .from('clubs')
    .select('season_number, season_phase, transfer_window_open')
    .eq('id', clubId)
    .maybeSingle();
  const club = data as {
    season_number: number | null;
    season_phase: string | null;
    transfer_window_open: boolean;
  } | null;
  if (!club) return;

  const played = await countClubPlayedFixtures(supabase, clubId);
  const open = isTransferWindowOpen({
    season: club.season_number ?? 1,
    offseason: club.season_phase === 'offseason',
    played,
  });
  if (open === club.transfer_window_open) return;
  await tryAdminClient()
    ?.from('clubs')
    .update({ transfer_window_open: open } as never)
    .eq('id', clubId);
}
