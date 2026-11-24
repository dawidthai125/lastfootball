import type { ReactNode } from 'react';

import { EmailConfirmSlot } from '@/components/auth/EmailConfirmSlot';
import { ClubProvider } from '@/components/club/ClubProvider';
import { AppShell } from '@/components/layout/AppShell';
import { SoftLockRouteGate } from '@/components/layout/SoftLockRouteGate';
import { loadBoardState } from '@/lib/board/load-board-state';
import { resolveBoardTaskNote } from '@/lib/board/tasks';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { countPlayedInList, ensureClubFixtures, hasPlayedUnlock } from '@/lib/fixtures';
import type { FixtureDto } from '@/lib/fixtures/types';
import { resolveHubPhase, resolveHubSession, resolvePrimaryCta } from '@/lib/hub';
import { resolveClubInvitations, type ClubInvitationsDto } from '@/lib/invitations';
import { juniorAgeNote } from '@/lib/academy/levels';
import { loadAcademyUpkeep } from '@/lib/academy/read-level';
import { resolveClubFinance } from '@/lib/finance';
import { listClubFinanceMovements } from '@/lib/finance/get-movements';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { resolveClubMessages, type ClubMessagesDto } from '@/lib/messages';
import {
  listClubRetirementFlash,
  resolveDeparturePreview,
  resolveRetirementFarewell,
} from '@/lib/season';
import { isPersonality } from '@/lib/squad/depth';
import { resolveDressingConflict } from '@/lib/squad/dressing-room';
import { resolveIncomingLoanOffers } from '@/lib/squad/incoming-loan';
import { resolveIntlCallup } from '@/lib/squad/intl-callup';
import { listClubPlayers } from '@/lib/squad/get-players';
import { matchWageDue } from '@/lib/squad/truth';
import { filterSeniorPlayers, isAcademyProspect } from '@/lib/squad/types';
import { createClient } from '@/lib/supabase/server';
import { TRAINING_THIN } from '@/lib/training/types';
import { fetchLiveH2hOffers } from '@/lib/transfers/fetch-live-h2h-offers';
import { resolveIncomingOffers } from '@/lib/transfers/resolve-incoming-offers';

const EMPTY_MESSAGES: ClubMessagesDto = { items: [] };
const EMPTY_INVITATIONS: ClubInvitationsDto = { items: [] };

function pickNextUpcoming(fixtures: readonly FixtureDto[]): FixtureDto | null {
  const upcoming = fixtures
    .filter((f) => f.status === 'upcoming')
    .slice()
    .sort((a, b) => a.matchday - b.matchday);
  return upcoming[0] ?? null;
}

function pickLastPlayed(fixtures: readonly FixtureDto[]): FixtureDto | null {
  const played = fixtures
    .filter((f) => f.status === 'played')
    .slice()
    .sort((a, b) => b.matchday - a.matchday);
  return played[0] ?? null;
}

/** Game chrome — Hub and in-game routes with live club DTO when present. */
export default async function GameLayout({ children }: { children: ReactNode }) {
  const club = await getManagerClub();
  let hasFixtures = false;
  let trainingUnlocked = false;
  let playedCount = 0;
  let messages: ClubMessagesDto = EMPTY_MESSAGES;
  let invitations: ClubInvitationsDto = EMPTY_INVITATIONS;

  if (club && isFirstMatchCompleted(club)) {
    const fixtures = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });
    const leagueFixtures = fixtures.filter((f) => f.competition === 'league');
    hasFixtures = leagueFixtures.length > 0;
    playedCount = countPlayedInList(leagueFixtures);
    trainingUnlocked = hasPlayedUnlock(playedCount, TRAINING_THIN.UNLOCK_AFTER_PLAYED);

    const nextFixture = pickNextUpcoming(leagueFixtures);
    const lastPlayedFixture = pickLastPlayed(leagueFixtures);
    const phase = resolveHubPhase(club, { hasFixtures });
    const hubSession = resolveHubSession(phase, nextFixture, lastPlayedFixture);
    const primary = resolvePrimaryCta(phase, hubSession, {
      nextFixture,
      lastPlayedFixture,
      hasFixtures,
    });

    const supabase = await createClient();
    const today = utcDateString();
    const [activePlayers, h2hOffers, farewellFlash, movements, board, upkeep] = await Promise.all([
      listClubPlayers(club.id),
      fetchLiveH2hOffers(supabase, club.id),
      club.seasonPhase === 'in_season'
        ? listClubRetirementFlash(club.id, today)
        : Promise.resolve([]),
      listClubFinanceMovements(club.id),
      loadBoardState(club, fixtures),
      loadAcademyUpkeep(supabase, club.id),
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
      rosterCount: filterSeniorPlayers(activePlayers).length,
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
    messages = resolveClubMessages({
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
      academyAgeNote: juniorAgeNote(activePlayers.filter(isAcademyProspect)),
    });
    invitations = resolveClubInvitations({
      messages,
      hubSession,
      primary,
      nextFixtureId: nextFixture?.id ?? null,
    });
  } else if (club) {
    // Pre-first-match: window/offers may still derive (usually empty).
    messages = resolveClubMessages({
      transferWindowOpen: club.transferWindowOpen,
      incomingOffers: [],
      incomingLiveOffers: [],
      outgoingLiveOffers: [],
    });
    const phase = resolveHubPhase(club, { hasFixtures: false });
    const hubSession = resolveHubSession(phase, null, null);
    const primary = resolvePrimaryCta(phase, hubSession, { nextFixture: null });
    invitations = resolveClubInvitations({
      messages,
      hubSession,
      primary,
      nextFixtureId: null,
    });
  }

  return (
    <ClubProvider
      club={club}
      hasFixtures={hasFixtures}
      trainingUnlocked={trainingUnlocked}
      playedCount={playedCount}
      messages={messages}
      invitations={invitations}
    >
      <AppShell>
        {club ? <EmailConfirmSlot userId={club.ownerId} variant="game" /> : null}
        <SoftLockRouteGate>{children}</SoftLockRouteGate>
      </AppShell>
    </ClubProvider>
  );
}
