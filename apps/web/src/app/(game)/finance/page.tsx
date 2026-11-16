import { redirect } from 'next/navigation';

import { FinanceView } from '@/components/finance/FinanceView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { resolveClubFinance } from '@/lib/finance';
import { listClubFinanceMovements } from '@/lib/finance/get-movements';
import { countPlayedInList, ensureClubFixtures } from '@/lib/fixtures';

/**
 * Club finances — fed only by resolveClubFinance() (LFE-ECONOMY-01).
 * Presentation: LFE-UI-EVOLUTION-01H decision-first FinanceView.
 */
export default async function FinancePage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const movements = await listClubFinanceMovements(club.id);
  const finance = resolveClubFinance(club, movements);
  const fixtures = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });
  const playedCount = countPlayedInList(fixtures.filter((f) => f.competition === 'league'));

  return (
    <FinanceView
      finance={finance}
      transferWindowOpen={club.transferWindowOpen}
      playedCount={playedCount}
    />
  );
}
