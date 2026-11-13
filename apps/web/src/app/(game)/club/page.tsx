import { redirect } from 'next/navigation';

import { ClubProfileView } from '@/components/club/ClubProfileView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { readClubBuild } from '@/lib/club/read-build';
import { resolveClubProfile } from '@/lib/club/resolve-club-profile';
import { createClient } from '@/lib/supabase/server';
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
  const supabase = await createClient();
  const build = await readClubBuild(supabase, club.id);
  const profile = resolveClubProfile({
    club,
    table,
    standsLevel: build.levels.stands,
    stylePressing: build.stylePressing,
    styleTempo: build.styleTempo,
    styleWidth: build.styleWidth,
  });

  return <ClubProfileView profile={profile} />;
}
