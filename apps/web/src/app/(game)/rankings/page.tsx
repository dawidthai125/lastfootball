import { redirect } from 'next/navigation';

import { RankingView } from '@/components/ranking/RankingView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { ensureClubFixtures } from '@/lib/fixtures';
import { resolveLeagueTable } from '@/lib/league';
import { resolveClubRanking } from '@/lib/ranking';

/**
 * Seasonal club ranking — fed by resolveLeagueTable → resolveClubRanking (LFE-RANKING-01).
 * Own Information Thin surface; not league standings columns.
 */
export default async function RankingsPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const fixtures = await ensureClubFixtures(club.id);
  const table = resolveLeagueTable(club, fixtures);
  const ranking = resolveClubRanking({ table });

  return <RankingView ranking={ranking} />;
}
