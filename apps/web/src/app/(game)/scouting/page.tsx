import { redirect } from 'next/navigation';

import { ScoutingView } from '@/components/scouting/ScoutingView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { listClubFixtures } from '@/lib/fixtures';
import { resolveHubPhase } from '@/lib/hub';
import { listScoutShortlistIds } from '@/lib/scouting/get-shortlist';
import { resolveClubScouting } from '@/lib/scouting';
import { listClubPlayers } from '@/lib/squad/get-players';
import { createClient } from '@/lib/supabase/server';
import { fetchLiveListings } from '@/lib/transfers/fetch-live-listings';
import { resolveTransferMarket } from '@/lib/transfers';

/**
 * Scouting — fed only by resolveClubScouting() (LFE-SCOUTING-01).
 * Placeholder mocks removed; market via resolveTransferMarket (REUSE).
 */
export default async function ScoutingPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const supabase = await createClient();
  const [fixtures, ownPlayers, liveListings, shortlistIds] = await Promise.all([
    listClubFixtures(club.id),
    listClubPlayers(club.id),
    fetchLiveListings(supabase, club.id),
    listScoutShortlistIds(club.id),
  ]);

  const phase = resolveHubPhase(club, { hasFixtures: fixtures.length > 0 });
  const market = resolveTransferMarket({
    clubId: club.id,
    cashBalance: club.cashBalance,
    transferWindowOpen: club.transferWindowOpen,
    activePlayers: ownPlayers,
    liveListings,
  });

  const scouting = resolveClubScouting(club, ownPlayers, market, shortlistIds, phase);

  return <ScoutingView scouting={scouting} />;
}
