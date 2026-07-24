import { createClient } from '@/lib/supabase/server';
import { env } from '@/config/env';
import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';
import { listClubFixtures } from '@/lib/fixtures/get-fixture';
import type { FixtureDto } from '@/lib/fixtures/types';

/**
 * Idempotent: if club has no fixtures, insert Thin A slate (3).
 * Safe to call from Hub loader and after completeFirstMatch.
 */
export async function ensureClubFixtures(clubId: string): Promise<FixtureDto[]> {
  const existing = await listClubFixtures(clubId);
  if (existing.length > 0) return existing;

  if (!env.isSupabaseConfigured) return [];

  const plan = planClubFixtures(clubId);
  const supabase = await createClient();
  const rows = plan.map((p) => ({
    club_id: clubId,
    matchday: p.matchday,
    competition: 'league',
    opponent_club_id: p.opponentClubId,
    is_home: p.isHome,
    status: p.status,
  }));

  const { error } = await supabase.from('fixtures').insert(rows as never);

  if (error) {
    // Race: another request inserted — re-read.
    return listClubFixtures(clubId);
  }

  return listClubFixtures(clubId);
}
