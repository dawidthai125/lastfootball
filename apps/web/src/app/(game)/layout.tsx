import type { ReactNode } from 'react';

import { ClubProvider } from '@/components/club/ClubProvider';
import { AppShell } from '@/components/layout/AppShell';
import { SoftLockRouteGate } from '@/components/layout/SoftLockRouteGate';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { isFirstMatchCompleted } from '@/lib/club/types';
import { countPlayedInList, ensureClubFixtures, hasPlayedUnlock } from '@/lib/fixtures';
import type { FixtureDto } from '@/lib/fixtures/types';
import {
  resolveHubPhase,
  resolveHubSession,
  resolvePrimaryCta,
} from '@/lib/hub';
import {
  resolveClubInvitations,
  type ClubInvitationsDto,
} from '@/lib/invitations';
import { resolveClubMessages, type ClubMessagesDto } from '@/lib/messages';
import { listClubPlayers } from '@/lib/squad/get-players';
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
  let messages: ClubMessagesDto = EMPTY_MESSAGES;
  let invitations: ClubInvitationsDto = EMPTY_INVITATIONS;

  if (club && isFirstMatchCompleted(club)) {
    const fixtures = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });
    hasFixtures = fixtures.length > 0;
    const playedCount = countPlayedInList(fixtures);
    trainingUnlocked = hasPlayedUnlock(playedCount, TRAINING_THIN.UNLOCK_AFTER_PLAYED);

    const nextFixture = pickNextUpcoming(fixtures);
    const lastPlayedFixture = pickLastPlayed(fixtures);
    const phase = resolveHubPhase(club, { hasFixtures });
    const hubSession = resolveHubSession(phase, nextFixture, lastPlayedFixture);
    const primary = resolvePrimaryCta(phase, hubSession, {
      nextFixture,
      lastPlayedFixture,
      hasFixtures,
    });

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
      messages={messages}
      invitations={invitations}
    >
      <AppShell>
        <SoftLockRouteGate>{children}</SoftLockRouteGate>
      </AppShell>
    </ClubProvider>
  );
}
