import { redirect } from 'next/navigation';

import { MessagesView } from '@/components/messages/MessagesView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { resolveClubMessages } from '@/lib/messages';
import { listClubPlayers } from '@/lib/squad/get-players';
import { createClient } from '@/lib/supabase/server';
import { fetchLiveH2hOffers } from '@/lib/transfers/fetch-live-h2h-offers';
import { resolveIncomingOffers } from '@/lib/transfers/resolve-incoming-offers';

/**
 * Messages — fed only by resolveClubMessages() (LFE-MESSAGES-01).
 * Information Thin · derive only · E1–E3 · no DB / workflow.
 */
export default async function MessagesPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const supabase = await createClient();
  const [activePlayers, h2hOffers] = await Promise.all([
    listClubPlayers(club.id),
    fetchLiveH2hOffers(supabase, club.id),
  ]);

  const incomingOffers = resolveIncomingOffers({
    clubId: club.id,
    transferWindowOpen: club.transferWindowOpen,
    activePlayers,
  });

  const messages = resolveClubMessages({
    transferWindowOpen: club.transferWindowOpen,
    incomingOffers,
    incomingLiveOffers: h2hOffers.incoming,
    outgoingLiveOffers: h2hOffers.outgoing,
  });

  return <MessagesView messages={messages} />;
}
