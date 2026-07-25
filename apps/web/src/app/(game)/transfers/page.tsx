import { redirect } from 'next/navigation';

import { TransfersView } from '@/components/transfers/TransfersView';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { listClubPlayers } from '@/lib/squad/get-players';
import { createClient } from '@/lib/supabase/server';
import { fetchLiveH2hOffers } from '@/lib/transfers/fetch-live-h2h-offers';
import { fetchLiveListings } from '@/lib/transfers/fetch-live-listings';
import { resolveTransferMarket } from '@/lib/transfers';

/**
 * Transfer market — fed only by resolveTransferMarket() (LFE-TRANSFERS-01…07).
 */
export default async function TransfersPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const supabase = await createClient();
  const [activePlayers, liveListings, h2hOffers] = await Promise.all([
    listClubPlayers(club.id),
    fetchLiveListings(supabase, club.id),
    fetchLiveH2hOffers(supabase, club.id),
  ]);

  const market = resolveTransferMarket({
    clubId: club.id,
    cashBalance: club.cashBalance,
    transferWindowOpen: club.transferWindowOpen,
    activePlayers,
    liveListings,
    incomingLiveOffers: h2hOffers.incoming,
    outgoingLiveOffers: h2hOffers.outgoing,
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
