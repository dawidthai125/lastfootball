import { createClient } from '@/lib/supabase/server';
import { env } from '@/config/env';
import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';
import { listClubFixtures } from '@/lib/fixtures/get-fixture';
import { resolveFixtureTopUp } from '@/lib/fixtures/resolve-fixture-top-up';
import type { FixtureDto } from '@/lib/fixtures/types';

/**
 * Idempotent ensure of full Thin calendar (LEAGUE_FIXTURE_COUNT).
 * Empty club → insert full planClubFixtures slate.
 * Partial club → top-up missing matchdays from the same plan (no re-plan, no overwrite).
 */
export async function ensureClubFixtures(clubId: string): Promise<FixtureDto[]> {
  const existing = await listClubFixtures(clubId);
  const plan = planClubFixtures(clubId);
  const inserts = resolveFixtureTopUp(plan, existing);

  if (inserts.length === 0) return existing;

  if (!env.isSupabaseConfigured) return existing;

  const supabase = await createClient();
  const rows = inserts.map((p) => ({
    club_id: clubId,
    matchday: p.matchday,
    competition: 'league',
    opponent_club_id: p.opponentClubId,
    is_home: p.isHome,
    status: p.status,
  }));

  const { error } = await supabase.from('fixtures').insert(rows as never);

  if (error) {
    // Race / unique conflict — re-read; partial inserts are ok (unique matchday).
    return listClubFixtures(clubId);
  }

  return listClubFixtures(clubId);
}
