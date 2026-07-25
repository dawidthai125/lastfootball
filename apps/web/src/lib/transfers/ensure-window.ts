import type { createClient } from '@/lib/supabase/server';
import { countClubPlayedFixtures } from '@/lib/fixtures/count-played';
import { hasPlayedUnlock } from '@/lib/fixtures/played-unlock';
import { TRANSFERS_THIN } from '@/lib/transfers/types';

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Opens transfer window when played fixtures >= UNLOCK_AFTER_PLAYED (idempotent).
 * Thin exception vs GDD K11. Uses shared played-unlock helper.
 */
export async function ensureTransferWindow(supabase: AppSupabase, clubId: string): Promise<void> {
  const count = await countClubPlayedFixtures(supabase, clubId);
  if (!hasPlayedUnlock(count, TRANSFERS_THIN.UNLOCK_AFTER_PLAYED)) return;

  await supabase
    .from('clubs')
    .update({ transfer_window_open: true } as never)
    .eq('id', clubId)
    .eq('transfer_window_open', false);
}
