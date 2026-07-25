import { redirect } from 'next/navigation';

import { TransfersView } from '@/components/transfers/TransfersView';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { listClubPlayers } from '@/lib/squad/get-players';
import { resolveTransferMarket } from '@/lib/transfers';

/**
 * Transfer market — fed only by resolveTransferMarket() (LFE-TRANSFERS-01).
 */
export default async function TransfersPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const activePlayers = await listClubPlayers(club.id);
  const market = resolveTransferMarket({
    clubId: club.id,
    cashBalance: club.cashBalance,
    transferWindowOpen: club.transferWindowOpen,
    activePlayers,
  });

  return (
    <div>
      <SectionHeader
        title="Transfery"
        subtitle={
          market.windowOpen
            ? `Okno otwarte · ${market.cashLabel}`
            : `Okno zamknięte · ${market.cashLabel}`
        }
      />
      <TransfersView market={market} />
    </div>
  );
}
