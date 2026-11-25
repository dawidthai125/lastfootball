import type { tryAdminClient } from '@/lib/supabase/admin';

// Not a 'use server' module on purpose: it takes a club id. Callers authorise the owner first.

type RefreshDb = Pick<NonNullable<ReturnType<typeof tryAdminClient>>, 'from'>;

/**
 * The break between seasons (D136): full energy, injuries healed, nobody tired.
 * A suspension is still served. Safe to repeat, so a retried season start may run it again.
 */
export async function refreshSquadForSeason(db: RefreshDb, clubId: string): Promise<boolean> {
  const rested = { energy: 100, injury_matches: 0 };
  const squad = (patch: Record<string, unknown>) =>
    db
      .from('players')
      .update(patch as never)
      .eq('club_id', clubId)
      .is('departed_at', null);

  const steps = [
    () =>
      squad({ ...rested, status: 'SUSPENDED' })
        .eq('status', 'INJURED')
        .gt('suspension_matches', 0),
    () => squad({ ...rested, status: 'READY' }).in('status', ['INJURED', 'TIRED']),
    // Energy only: a write of injury_matches starts the count of the days of a ban anew.
    () => squad({ energy: 100 }),
  ];
  for (const step of steps) {
    const { error } = await step();
    if (error) {
      console.error('refreshSquadForSeason failed', { code: error.code });
      return false;
    }
  }
  return true;
}
