import type { ReactNode } from 'react';

import { ClubProvider } from '@/components/club/ClubProvider';
import { AppShell } from '@/components/layout/AppShell';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { countPlayedInList, ensureClubFixtures, hasPlayedUnlock } from '@/lib/fixtures';
import { resolveClubMessages, type ClubMessagesDto } from '@/lib/messages';
import { listClubPlayers } from '@/lib/squad/get-players';
import { createClient } from '@/lib/supabase/server';
import { TRAINING_THIN } from '@/lib/training/types';
import { fetchLiveH2hOffers } from '@/lib/transfers/fetch-live-h2h-offers';
import { resolveIncomingOffers } from '@/lib/transfers/resolve-incoming-offers';

const EMPTY_MESSAGES: ClubMessagesDto = { items: [] };

/** Game chrome — Hub and in-game routes with live club DTO when present. */
export default async function GameLayout({ children }: { children: ReactNode }) {
  const club = await getManagerClub();
  let hasFixtures = false;
  let trainingUnlocked = false;
  let messages: ClubMessagesDto = EMPTY_MESSAGES;

  if (club && isFirstMatchCompleted(club)) {
    const fixtures = await ensureClubFixtures(club.id);
    hasFixtures = fixtures.length > 0;
    const playedCount = countPlayedInList(fixtures);
    trainingUnlocked = hasPlayedUnlock(playedCount, TRAINING_THIN.UNLOCK_AFTER_PLAYED);

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
    messages = resolveClubMessages({
      transferWindowOpen: club.transferWindowOpen,
      incomingOffers,
      incomingLiveOffers: h2hOffers.incoming,
      outgoingLiveOffers: h2hOffers.outgoing,
    });
  } else if (club) {
    // Pre-first-match: window/offers may still derive (usually empty).
    messages = resolveClubMessages({
      transferWindowOpen: club.transferWindowOpen,
      incomingOffers: [],
      incomingLiveOffers: [],
      outgoingLiveOffers: [],
    });
  }

  return (
    <ClubProvider
      club={club}
      hasFixtures={hasFixtures}
      trainingUnlocked={trainingUnlocked}
      messages={messages}
    >
      <AppShell>{children}</AppShell>
    </ClubProvider>
  );
}
