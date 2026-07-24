import { redirect } from 'next/navigation';

import { EarlyClubHub } from '@/components/hub/EarlyClubHub';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { FIRST_MATCH_PATHS } from '@/lib/first-match/constants';
import { resolveHubPhase } from '@/lib/hub';

/**
 * Hub / Panel menedżera — LFE-HUB-01 EARLY_CLUB decision screen.
 * Mid-season dashboard mock removed from this path.
 */
export default async function HubPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const phase = resolveHubPhase(club);
  if (phase === 'NEW_CLUB') redirect(FIRST_MATCH_PATHS.intro);

  return <EarlyClubHub club={club} />;
}
