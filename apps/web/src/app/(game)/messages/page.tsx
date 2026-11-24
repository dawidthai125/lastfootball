import { redirect } from 'next/navigation';

import { MessagesView } from '@/components/messages/MessagesView';
import { loadBoardState } from '@/lib/board/load-board-state';
import { resolveBoardTaskNote } from '@/lib/board/tasks';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { juniorAgeNote } from '@/lib/academy/levels';
import { loadAcademyUpkeep } from '@/lib/academy/read-level';
import { resolveClubFinance } from '@/lib/finance';
import { listClubFinanceMovements } from '@/lib/finance/get-movements';
import { listClubFixtures } from '@/lib/fixtures/get-fixture';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { loadMatchEvents } from '@/lib/messages/load-match-events';
import { resolveClubMessages } from '@/lib/messages';
import {
  listClubRetirementFlash,
  resolveDeparturePreview,
  contractLeavers,
  resolveRetirementFarewell,
} from '@/lib/season';
import { isPersonality } from '@/lib/squad/depth';
import { resolveDressingConflict } from '@/lib/squad/dressing-room';
import { resolveIncomingLoanOffers } from '@/lib/squad/incoming-loan';
import { resolveIntlCallup } from '@/lib/squad/intl-callup';
import { listClubPlayers } from '@/lib/squad/get-players';
import { matchWageDue } from '@/lib/squad/truth';
import { filterSeniorPlayers, isAcademyProspect } from '@/lib/squad/types';
import { contractFarewell, contractReminder } from '@/lib/season/contract-expiry';
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
  const [activePlayers, h2hOffers, farewellFlash, movements, fixtures, upkeep, matchEvents] =
    await Promise.all([
      listClubPlayers(club.id),
      fetchLiveH2hOffers(supabase, club.id),
      club.seasonPhase === 'in_season'
        ? listClubRetirementFlash(club.id, today)
        : Promise.resolve([]),
      listClubFinanceMovements(club.id),
      listClubFixtures(club.id),
      loadAcademyUpkeep(supabase, club.id),
      loadMatchEvents(club.id),
    ]);
  const board = await loadBoardState(club, fixtures);

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
    roster: filterSeniorPlayers(activePlayers),
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
      intlAbsentUntil: player.intlAbsentUntil ?? null,
    })),
    alreadyAbsentIds: activePlayers
      .filter((player) => player.intlAbsentUntil && player.intlAbsentUntil >= today)
      .map((player) => player.id),
  });

  const seasonDeparture =
    club.seasonPhase === 'offseason'
      ? resolveDeparturePreview(
          activePlayers.map((player) => ({
            id: player.id,
            name: player.name,
            age: player.age,
            skill: player.skill,
            academyTrack: Boolean(player.academyTrack),
            departed: player.departedAt != null || player.status === 'DEPARTED',
          })),
        )
      : null;
  const retirementFarewell =
    club.seasonPhase === 'in_season' ? resolveRetirementFarewell(farewellFlash, today) : null;

  const messages = resolveClubMessages({
    transferWindowOpen: club.transferWindowOpen,
    incomingOffers,
    incomingLiveOffers: h2hOffers.incoming,
    outgoingLiveOffers: h2hOffers.outgoing,
    dressingConflict: dressing ? { conflictId: dressing.id, subject: dressing.subject } : null,
    incomingLoanOffers: loanOffers.length > 0 ? { count: loanOffers.length } : null,
    intlCallup: intl ? { playerId: intl.playerId, subject: intl.subject } : null,
    seasonDeparture: seasonDeparture ? { summary: seasonDeparture.summary } : null,
    retirementFarewell: retirementFarewell ? { subject: retirementFarewell.subject } : null,
    wageNote: resolveClubFinance(
      club,
      movements,
      matchWageDue(filterSeniorPlayers(activePlayers)),
      upkeep,
    ).wageNote,
    boardTaskNote: board ? resolveBoardTaskNote(board.tasks) : null,
    contractNotes: [
      contractReminder(activePlayers, club.seasonNumber),
      contractFarewell(contractLeavers(farewellFlash, today)),
    ].filter((note) => note !== null),
    academyAgeNote: juniorAgeNote(activePlayers.filter(isAcademyProspect)),
    matchEvents,
  });

  return (
    <MessagesView
      messages={messages}
      dressingConflictId={dressing?.id ?? null}
      intlPlayerId={intl?.playerId ?? null}
    />
  );
}
