import { env } from '@/config/env';
import type { ClubDto } from '@/lib/club/types';
import { listClubFixtures } from '@/lib/fixtures/get-fixture';
import type { FixtureDto } from '@/lib/fixtures/types';
import { resolveNationalCup } from '@/lib/cup/resolve-national-cup';
import { createClient } from '@/lib/supabase/server';

/**
 * Insert the manager's current cup tie once the league anchor is reached.
 * Status stays scheduled so it does not replace the next league match.
 */
export async function ensurePlayerCupTie(
  club: Pick<ClubDto, 'id' | 'name' | 'shortName' | 'leagueTier' | 'seasonPhase'> & {
    readonly seasonNumber?: number;
  },
  fixtures: readonly FixtureDto[],
): Promise<readonly FixtureDto[]> {
  if (club.seasonPhase === 'offseason') return fixtures;
  const tie = resolveNationalCup(club, fixtures).playerTie;
  if (!tie?.due) return fixtures;

  const existing = fixtures.find((f) => f.competition === 'cup' && f.matchday === tie.matchday);
  if (existing) return fixtures;
  if (!env.isSupabaseConfigured) return fixtures;

  const supabase = await createClient();
  const { error } = await supabase.from('fixtures').insert({
    club_id: club.id,
    matchday: tie.matchday,
    competition: 'cup',
    opponent_club_id: tie.opponentId,
    is_home: tie.isHome,
    status: 'scheduled',
  } as never);

  if (error) return listClubFixtures(club.id);
  return listClubFixtures(club.id);
}
