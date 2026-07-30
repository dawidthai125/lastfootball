import { redirect } from 'next/navigation';

import { ClubProfileView } from '@/components/club/ClubProfileView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { resolveClubProfile } from '@/lib/club/resolve-club-profile';
import { listClubFixtures } from '@/lib/fixtures';
import { resolveLeagueTable } from '@/lib/league';

/**
 * Club identity — fed only by resolveClubProfile() (LFE-CLUB-01 · D47–D50).
 * Placeholder removed; Information Thin · derive only · no §6 engine / staff.
 */
export default async function ClubPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const fixtures = await listClubFixtures(club.id);
  const table = resolveLeagueTable(club, fixtures);
  const profile = resolveClubProfile({ club, table });

  return <ClubProfileView profile={profile} />;
}
