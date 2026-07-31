import { redirect } from 'next/navigation';

import { FixturesView } from '@/components/fixtures/FixturesView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { STARTER_PACKAGE } from '@/lib/club/types';
import { ensureClubFixtures, toUiFixture } from '@/lib/fixtures';

export default async function MatchesPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const fixtures = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });
  const ui = fixtures.map((f) => toUiFixture(f, club));

  return (
    <FixturesView
      fixtures={ui}
      clubName={club.name}
      clubShortName={club.shortName}
      leagueLabel={STARTER_PACKAGE.league}
    />
  );
}
