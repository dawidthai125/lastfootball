import type { createClient } from '@/lib/supabase/server';

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

/**
 * IO: count league fixtures with status played for a club.
 * Null when the read failed: not the same as no matches.
 * Prefer `countPlayedInList` when fixtures are already loaded.
 */
export async function countClubPlayedFixtures(
  supabase: AppSupabase,
  clubId: string,
): Promise<number | null> {
  const { count, error } = await supabase
    .from('fixtures')
    .select('id', { count: 'exact', head: true })
    .eq('club_id', clubId)
    .eq('competition', 'league')
    .eq('status', 'played');

  return error ? null : count;
}
