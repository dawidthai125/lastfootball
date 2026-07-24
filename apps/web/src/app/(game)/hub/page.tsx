import { redirect } from 'next/navigation';

import { EarlyClubHub } from '@/components/hub/EarlyClubHub';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { ensureClubFixtures, getLastPlayedFixture, getNextFixture } from '@/lib/fixtures';
import { FIRST_MATCH_PATHS } from '@/lib/first-match/constants';
import { resolveHubPhase } from '@/lib/hub';
import { resolveLeagueTable, resolvePlayerLeaguePositionLabel } from '@/lib/league';

/**
 * Hub / Panel menedżera — decision screen (EARLY_CLUB / SEASON) + fixtures SSOT.
 */
export default async function HubPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const fixtures = await ensureClubFixtures(club.id);
  const hasFixtures = fixtures.length > 0;
  const phase = resolveHubPhase(club, { hasFixtures });
  if (phase === 'NEW_CLUB') redirect(FIRST_MATCH_PATHS.intro);

  const nextFixture = (await getNextFixture(club.id)) ?? null;
  const lastPlayed = (await getLastPlayedFixture(club.id)) ?? null;
  const table = resolveLeagueTable(club, fixtures);
  const leaguePositionLabel = hasFixtures ? resolvePlayerLeaguePositionLabel(table) : null;

  return (
    <EarlyClubHub
      club={club}
      nextFixture={nextFixture}
      lastPlayedFixture={lastPlayed}
      hasFixtures={hasFixtures}
      leaguePositionLabel={leaguePositionLabel}
    />
  );
}
