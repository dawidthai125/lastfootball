import { redirect } from 'next/navigation';

import { AcademyView } from '@/components/academy/AcademyView';
import { resolveClubAcademy } from '@/lib/academy';
import { loadAcademyRecords } from '@/lib/academy/store';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { listClubFixtures } from '@/lib/fixtures';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { resolveHubPhase } from '@/lib/hub';
import { listClubPlayers } from '@/lib/squad/get-players';
import { loadScoutReports } from '@/lib/scouting/load-reports';
import { tryAdminClient } from '@/lib/supabase/admin';

/**
 * Academy — fed only by resolveClubAcademy() (LFE-ACADEMY-01).
 * Placeholder mocks removed; Presentation ≠ Domain.
 */
export default async function AcademyPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const admin = tryAdminClient();
  const [fixtures, rows, revealed, records] = await Promise.all([
    listClubFixtures(club.id),
    listClubPlayers(club.id),
    loadScoutReports(club.id),
    // The club above is the manager's own.
    admin ? loadAcademyRecords(admin, club.id, new Date()) : null,
  ]);
  const phase = resolveHubPhase(club, { hasFixtures: fixtures.length > 0 });
  const academy = resolveClubAcademy(
    club,
    rows,
    phase,
    revealed,
    records?.status === 'ok'
      ? {
          levels: true,
          level: records.level,
          offer: records.open,
          waitDays: records.waitDays,
          cash: club.cashBalance,
          seasonNumber: club.seasonNumber,
          today: utcDateString(),
        }
      : undefined,
  );

  return <AcademyView academy={academy} />;
}
