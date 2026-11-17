import { redirect } from 'next/navigation';

import { MessagesView } from '@/components/messages/MessagesView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { resolveClubMessages } from '@/lib/messages';
import { isPersonality } from '@/lib/squad/depth';
import { resolveDressingConflict } from '@/lib/squad/dressing-room';
import { resolveIncomingLoanOffers } from '@/lib/squad/incoming-loan';
import { resolveIntlCallup } from '@/lib/squad/intl-callup';
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
  const today = utcDateString();
  const [activePlayers, h2hOffers] = await Promise.all([
    listClubPlayers(club.id),
    fetchLiveH2hOffers(supabase, club.id),
  ]);

  const incomingOffers = resolveIncomingOffers({
    clubId: club.id,
    transferWindowOpen: club.transferWindowOpen,
    activePlayers,
  });

  const dressing = resolveDressingConflict(
    activePlayers.map((player) => ({
      id: player.id,
      name: player.name,
      starter: player.starter,
      morale: typeof player.morale === 'number' ? player.morale : 60,
      personality: isPersonality(player.personality) ? player.personality : 'spokojny',
    })),
  );

  const loanOffers = resolveIncomingLoanOffers({
    clubId: club.id,
    transferWindowOpen: club.transferWindowOpen,
    rosterCount: activePlayers.length,
    today,
  });

  const intl = resolveIntlCallup({
    clubId: club.id,
    today,
    players: activePlayers.map((player) => ({
      id: player.id,
      name: player.name,
      skill: player.skill,
      nationality: player.nationality,
      starter: player.starter,
      onLoan: player.onLoan === true,
      loanedIn: player.loanedIn === true,
    })),
    alreadyAbsentIds: activePlayers
      .filter((player) => player.intlAbsentUntil && player.intlAbsentUntil >= today)
      .map((player) => player.id),
  });

  const messages = resolveClubMessages({
    transferWindowOpen: club.transferWindowOpen,
    incomingOffers,
    incomingLiveOffers: h2hOffers.incoming,
    outgoingLiveOffers: h2hOffers.outgoing,
    dressingConflict: dressing
      ? { conflictId: dressing.id, subject: dressing.subject }
      : null,
    incomingLoanOffers: loanOffers.length > 0 ? { count: loanOffers.length } : null,
    intlCallup: intl
      ? { playerId: intl.playerId, subject: intl.subject }
      : null,
  });

  return (
    <MessagesView
      messages={messages}
      dressingConflictId={dressing?.id ?? null}
      intlPlayerId={intl?.playerId ?? null}
    />
  );
}
