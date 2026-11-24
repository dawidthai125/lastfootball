import {
  KICKOFF_VALID_MS,
  readKickoffSnapshot,
  type KickoffSnapshot,
} from '@/lib/match/kickoff-snapshot';
import { tryAdminClient } from '@/lib/supabase/admin';

/**
 * One open match per club: opening a match replaces the copy before it. The client never
 * names a copy, so it cannot choose between starts or opt out.
 */
export async function storeKickoff(snapshot: KickoffSnapshot): Promise<void> {
  const { error } =
    (await tryAdminClient()
      ?.from('match_kickoffs' as never)
      .upsert(
        {
          club_id: snapshot.club.id,
          fixture_id: snapshot.fixture.id,
          started_at: new Date().toISOString(),
          snapshot,
        } as never,
        { onConflict: 'club_id' },
      )) ?? {};
  if (error) console.error('storeKickoff failed', { fixtureId: snapshot.fixture.id });
}

export type KickoffLookup =
  | { readonly kind: 'found'; readonly snapshot: KickoffSnapshot }
  /** Never stored, or another match was opened since: the stored squad counts. */
  | { readonly kind: 'none' }
  | { readonly kind: 'expired' }
  | { readonly kind: 'error' };

export async function loadKickoff(
  fixtureId: string,
  clubId: string,
  now: Date = new Date(),
): Promise<KickoffLookup> {
  const admin = tryAdminClient();
  if (!admin) return { kind: 'none' };
  const { data, error } = await admin
    .from('match_kickoffs' as never)
    .select('fixture_id, started_at, snapshot')
    .eq('club_id', clubId)
    .maybeSingle();
  if (error) return { kind: 'error' };
  const row = data as { fixture_id: string; started_at: string; snapshot: unknown } | null;
  if (!row || row.fixture_id !== fixtureId) return { kind: 'none' };
  if (now.getTime() - Date.parse(row.started_at) > KICKOFF_VALID_MS) return { kind: 'expired' };
  const snapshot = readKickoffSnapshot(row.snapshot, fixtureId, clubId);
  return snapshot ? { kind: 'found', snapshot } : { kind: 'error' };
}

/** Any settled match ends the open one, so no start survives another match. */
export async function clearKickoffs(clubId: string): Promise<void> {
  await tryAdminClient()
    ?.from('match_kickoffs' as never)
    .delete()
    .eq('club_id', clubId);
}
