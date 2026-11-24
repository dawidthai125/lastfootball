import { redirect } from 'next/navigation';

import { IncomingLoanOffers } from '@/components/transfers/IncomingLoanOffers';
import { TransfersView } from '@/components/transfers/TransfersView';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { countPlayedInList, ensureClubFixtures, unlockPlayedCount } from '@/lib/fixtures';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { resolveIncomingLoanOffers } from '@/lib/squad/incoming-loan';
import { listClubPlayers } from '@/lib/squad/get-players';
import { filterSeniorPlayers } from '@/lib/squad/types';
import { createClient } from '@/lib/supabase/server';
import { loadOpenAuctions } from '@/lib/transfers/load-auctions';
import { fetchLiveH2hOffers } from '@/lib/transfers/fetch-live-h2h-offers';
import { fetchLiveListings } from '@/lib/transfers/fetch-live-listings';
import { windowClosesSentence } from '@/lib/transfers/window';
import { resolveTransferMarket } from '@/lib/transfers';

/**
 * Transfer market — decision surface (LFE-UI-EVOLUTION-01D).
 * Data: resolveTransferMarket() only.
 */
export default async function TransfersPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const supabase = await createClient();
  const [activePlayers, liveListings, h2hOffers, auctions, fixtures] = await Promise.all([
    listClubPlayers(club.id),
    fetchLiveListings(supabase, club.id),
    fetchLiveH2hOffers(supabase, club.id),
    loadOpenAuctions(),
    ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase }),
  ]);
  const playedCount = unlockPlayedCount(
    countPlayedInList(fixtures.filter((f) => f.competition === 'league')),
    club.seasonNumber,
  );

  const market = resolveTransferMarket({
    clubId: club.id,
    cashBalance: club.cashBalance,
    transferWindowOpen: club.transferWindowOpen,
    activePlayers,
    liveListings,
    incomingLiveOffers: h2hOffers.incoming,
    outgoingLiveOffers: h2hOffers.outgoing,
  });

  const loanOffers = resolveIncomingLoanOffers({
    clubId: club.id,
    transferWindowOpen: club.transferWindowOpen,
    rosterCount: filterSeniorPlayers(activePlayers).length,
    today: utcDateString(),
  });

  return (
    <div>
      <SectionHeader
        title="Transfery"
        subtitle={
          market.windowOpen
            ? ['Okno otwarte.', windowClosesSentence(playedCount, club.seasonPhase === 'offseason')]
                .filter(Boolean)
                .join(' ')
            : 'Okno zamknięte'
        }
      />
      <IncomingLoanOffers offers={loanOffers} />
      <TransfersView
        market={market}
        auctions={auctions}
        clubId={club.id}
        playedCount={playedCount}
      />
    </div>
  );
}
