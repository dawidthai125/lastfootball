import type { createClient } from '@/lib/supabase/server';
import { TRANSFERS_THIN } from '@/lib/transfers/types';

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Opens transfer window when played fixtures >= UNLOCK_AFTER_PLAYED (idempotent).
 * Thin exception vs GDD K11.
 */
export async function ensureTransferWindow(
  supabase: AppSupabase,
  clubId: string,
): Promise<void> {
  const { count, error } = await supabase
    .from('fixtures')
    .select('id', { count: 'exact', head: true })
    .eq('club_id', clubId)
    .eq('status', 'played');

  if (error || count == null) return;
  if (count < TRANSFERS_THIN.UNLOCK_AFTER_PLAYED) return;

  await supabase
    .from('clubs')
    .update({ transfer_window_open: true } as never)
    .eq('id', clubId)
    .eq('transfer_window_open', false);
}
