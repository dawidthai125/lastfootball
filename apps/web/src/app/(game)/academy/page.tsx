import { redirect } from 'next/navigation';

import { AcademyView } from '@/components/academy/AcademyView';
import { resolveClubAcademy } from '@/lib/academy';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { listClubFixtures } from '@/lib/fixtures';
import { resolveHubPhase } from '@/lib/hub';
import { listClubPlayers } from '@/lib/squad/get-players';
import { loadRevealedPlayerIds } from '@/lib/scouting/load-reports';

/**
 * Academy — fed only by resolveClubAcademy() (LFE-ACADEMY-01).
 * Placeholder mocks removed; Presentation ≠ Domain.
 */
export default async function AcademyPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const [fixtures, rows, revealed] = await Promise.all([
    listClubFixtures(club.id),
    listClubPlayers(club.id),
    loadRevealedPlayerIds(club.id),
  ]);
  const phase = resolveHubPhase(club, { hasFixtures: fixtures.length > 0 });
  const academy = resolveClubAcademy(club, rows, phase, revealed);

  return <AcademyView academy={academy} />;
}
