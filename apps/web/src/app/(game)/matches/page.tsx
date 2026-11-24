import { redirect } from 'next/navigation';

import { FixturesView } from '@/components/fixtures/FixturesView';
import { loadEmailGate } from '@/lib/auth/email-confirm';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { resolveLeagueTierLabel } from '@/lib/league/league-tier';
import { ensurePlayerCupTie } from '@/lib/cup/ensure-cup-tie';
import { ensureClubFixtures, toUiFixture } from '@/lib/fixtures';
import { pickCalendarHero } from '@/lib/fixtures/calendar-hero';
import { kickoffBlockReason } from '@/lib/fixtures/kickoff-gate';
import { lastPlayedOf } from '@/lib/fixtures/last-played';
import { createClient } from '@/lib/supabase/server';
import type { FixtureDto } from '@/lib/fixtures/types';

function calendarBucket(competition: FixtureDto['competition']): 'league' | 'cup' | 'friendly' {
  if (competition === 'cup') return 'cup';
  if (competition === 'challenge') return 'friendly';
  return 'league';
}

export default async function MatchesPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const seeded = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });
  const fixtures = await ensurePlayerCupTie(club, seeded);
  const emailGate = await loadEmailGate(club.ownerId);
  const last = await lastPlayedOf(await createClient(), club.id, fixtures);
  const lastPlayedAt = last.match;
  const lastChallengeAt = last.challenge;
  const now = new Date();
  const hero = pickCalendarHero(
    fixtures.map((fixture) => ({
      day: fixture.matchday,
      status: fixture.status,
      competition: calendarBucket(fixture.competition),
      domain: fixture.competition,
    })),
    'ALL',
  );
  const kickoffSentence = hero
    ? kickoffBlockReason({
        matchesBlocked: emailGate.matchesBlocked,
        competition: hero.domain,
        lastPlayedAt,
        lastChallengeAt,
        now,
      })
    : null;
  const ui = fixtures.map((f) => toUiFixture(f, club));

  return (
    <FixturesView
      fixtures={ui}
      clubName={club.name}
      clubShortName={club.shortName}
      leagueLabel={resolveLeagueTierLabel(club.leagueTier)}
      kickoffSentence={kickoffSentence}
      matchesBlocked={emailGate.matchesBlocked}
      lastPlayedAt={lastPlayedAt}
      lastChallengeAt={lastChallengeAt}
      kickoffNow={now.toISOString()}
    />
  );
}
