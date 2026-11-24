import type { StarterProgress } from '@/lib/starter/steps';
import { tryAdminClient } from '@/lib/supabase/admin';

/** Null hides the panel: no key, an older database, or a failed read. */
export async function loadStarterProgress(clubId: string): Promise<StarterProgress | null> {
  const { data, error } =
    (await tryAdminClient()?.rpc('starter_progress' as never, { p_club_id: clubId } as never)) ??
    {};
  const row = data as StarterProgress | null | undefined;
  return error || !row || typeof row.played !== 'number' ? null : row;
}
