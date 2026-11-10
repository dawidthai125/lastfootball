import { redirect } from 'next/navigation';

import { FixturesView } from '@/components/fixtures/FixturesView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { resolveLeagueTierLabel } from '@/lib/league/league-tier';
import { ensurePlayerCupTie } from '@/lib/cup/ensure-cup-tie';
import { ensureClubFixtures, toUiFixture } from '@/lib/fixtures';

export default async function MatchesPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const seeded = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });
  const fixtures = await ensurePlayerCupTie(club, seeded);
  const ui = fixtures.map((f) => toUiFixture(f, club));

  return (
    <FixturesView
      fixtures={ui}
      clubName={club.name}
      clubShortName={club.shortName}
      leagueLabel={resolveLeagueTierLabel(club.leagueTier)}
    />
  );
}
