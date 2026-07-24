import { redirect } from 'next/navigation';

import { EarlyClubHub } from '@/components/hub/EarlyClubHub';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { ensureClubFixtures, getLastPlayedFixture, getNextFixture } from '@/lib/fixtures';
import { FIRST_MATCH_PATHS } from '@/lib/first-match/constants';
import { resolveHubPhase } from '@/lib/hub';

/**
 * Hub / Panel menedżera — EARLY_CLUB decision screen + fixtures SSOT (LFE-LEAGUE-01).
 */
export default async function HubPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const phase = resolveHubPhase(club);
  if (phase === 'NEW_CLUB') redirect(FIRST_MATCH_PATHS.intro);

  const fixtures = await ensureClubFixtures(club.id);
  const nextFixture = (await getNextFixture(club.id)) ?? null;
  const lastPlayed = (await getLastPlayedFixture(club.id)) ?? null;

  return (
    <EarlyClubHub
      club={club}
      nextFixture={nextFixture}
      lastPlayedFixture={lastPlayed}
      hasFixtures={fixtures.length > 0}
    />
  );
}
