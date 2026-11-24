import { redirect } from 'next/navigation';

import { FinanceView } from '@/components/finance/FinanceView';
import { loadAcademyUpkeep } from '@/lib/academy/read-level';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { resolveClubFinance } from '@/lib/finance';
import { listClubFinanceMovements } from '@/lib/finance/get-movements';
import { countPlayedInList, ensureClubFixtures } from '@/lib/fixtures';
import { listClubPlayers } from '@/lib/squad/get-players';
import { matchWageDue } from '@/lib/squad/truth';
import { filterSeniorPlayers } from '@/lib/squad/types';
import { createClient } from '@/lib/supabase/server';

/**
 * Club finances — fed only by resolveClubFinance() (LFE-ECONOMY-01).
 * Presentation: LFE-UI-EVOLUTION-01H decision-first FinanceView.
 */
export default async function FinancePage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const [movements, players, upkeep] = await Promise.all([
    listClubFinanceMovements(club.id),
    listClubPlayers(club.id),
    loadAcademyUpkeep(await createClient(), club.id),
  ]);
  const finance = resolveClubFinance(
    club,
    movements,
    matchWageDue(filterSeniorPlayers(players)),
    upkeep,
  );
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
