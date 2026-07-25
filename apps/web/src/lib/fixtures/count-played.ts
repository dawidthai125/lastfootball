import type { createClient } from '@/lib/supabase/server';

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

/**
 * IO: count league fixtures with status played for a club.
 * Prefer `countPlayedInList` when fixtures are already loaded.
 */
export async function countClubPlayedFixtures(
  supabase: AppSupabase,
  clubId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('fixtures')
    .select('id', { count: 'exact', head: true })
    .eq('club_id', clubId)
    .eq('status', 'played');

  if (error || count == null) return 0;
  return count;
}
