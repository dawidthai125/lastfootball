import {
  KICKOFF_VALID_MS,
  readKickoffSnapshot,
  type KickoffSnapshot,
} from '@/lib/match/kickoff-snapshot';
import { tryAdminClient } from '@/lib/supabase/admin';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Null when it cannot be stored; the save then falls back to the stored squad. */
export async function storeKickoff(snapshot: KickoffSnapshot): Promise<string | null> {
  const admin = tryAdminClient();
  if (!admin) return null;
  // Abandoned starts of this match are useless once they are too old to finish.
  await admin
    .from('match_kickoffs' as never)
    .delete()
    .eq('fixture_id', snapshot.fixture.id)
    .lt('started_at', new Date(Date.now() - KICKOFF_VALID_MS).toISOString());
  const { data, error } = await admin
    .from('match_kickoffs' as never)
    .insert({
      fixture_id: snapshot.fixture.id,
      club_id: snapshot.club.id,
      snapshot,
    } as never)
    .select('id')
    .maybeSingle();
  return error || !data ? null : (data as { id: string }).id;
}

export async function loadKickoff(
  kickoffId: unknown,
  fixtureId: string,
  clubId: string,
  now: Date = new Date(),
): Promise<KickoffSnapshot | null> {
  if (typeof kickoffId !== 'string' || !UUID.test(kickoffId)) return null;
  const admin = tryAdminClient();
  if (!admin) return null;
  const { data, error } = await admin
    .from('match_kickoffs' as never)
    .select('snapshot')
    .eq('id', kickoffId)
    .eq('fixture_id', fixtureId)
    .eq('club_id', clubId)
    .gte('started_at', new Date(now.getTime() - KICKOFF_VALID_MS).toISOString())
    .maybeSingle();
  if (error || !data) return null;
  return readKickoffSnapshot((data as { snapshot: unknown }).snapshot, fixtureId, clubId);
}

/** The result is stored; the copies are no longer needed. */
export async function clearKickoffs(fixtureId: string, clubId: string): Promise<void> {
  await tryAdminClient()
    ?.from('match_kickoffs' as never)
    .delete()
    .eq('fixture_id', fixtureId)
    .eq('club_id', clubId);
}
