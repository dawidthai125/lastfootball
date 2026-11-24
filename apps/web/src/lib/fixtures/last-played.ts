import { latestPlayedAt } from '@/lib/fixtures/kickoff-gate';
import type { FixtureDto } from '@/lib/fixtures/types';
import type { createClient } from '@/lib/supabase/server';

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

export type LastPlayed = { readonly match: string | null; readonly challenge: string | null };

export function laterOf(a: string | null, b: string | null): string | null {
  if (!a || !b) return a ?? b;
  return Date.parse(a) >= Date.parse(b) ? a : b;
}

/**
 * Last match of each clock from the archive. A season start deletes the played fixtures, and the
 * day of the match must not be free again. Null = the read failed.
 */
export async function archivedLastPlayed(
  supabase: AppSupabase,
  clubId: string,
): Promise<LastPlayed | null> {
  const [match, challenge] = await Promise.all([
    supabase
      .from('club_matches' as never)
      .select('played_at')
      .eq('club_id', clubId)
      .in('competition', ['league', 'cup'])
      .order('played_at', { ascending: false })
      .limit(1),
    supabase
      .from('rival_challenges')
      .select('played_at')
      .eq('challenger_club_id', clubId)
      .eq('status', 'played')
      .order('played_at', { ascending: false, nullsFirst: false })
      .limit(1),
  ]);
  if (match.error || challenge.error) return null;
  const first = (rows: unknown) =>
    (rows as { played_at: string | null }[] | null)?.[0]?.played_at ?? null;
  return { match: first(match.data), challenge: first(challenge.data) };
}

/** For screens: the fixtures they already have, together with the archive. */
export async function lastPlayedOf(
  supabase: AppSupabase,
  clubId: string,
  fixtures: readonly FixtureDto[],
): Promise<LastPlayed> {
  const archive = await archivedLastPlayed(supabase, clubId);
  return {
    match: laterOf(latestPlayedAt(fixtures), archive?.match ?? null),
    challenge: laterOf(latestPlayedAt(fixtures, 'challenge'), archive?.challenge ?? null),
  };
}
