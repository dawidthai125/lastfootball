import { loadEmailGate } from '@/lib/auth/email-confirm';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { getFixtureByIdForClub, listClubFixtures } from '@/lib/fixtures';
import { kickoffBlockReason, latestPlayedAt } from '@/lib/fixtures/kickoff-gate';

/** Sentence for an upcoming fixture entry. Played fixtures and the scripted first match stay open. */
export async function upcomingKickoffSentence(matchId: string): Promise<string | null> {
  if (matchId === FIRST_MATCH_ID) return null;

  const club = await getManagerClub();
  if (!club) return null;

  const fixture = await getFixtureByIdForClub(club.id, matchId);
  if (!fixture || fixture.status !== 'upcoming') return null;

  const [gate, fixtures] = await Promise.all([
    loadEmailGate(club.ownerId),
    listClubFixtures(club.id),
  ]);

  return kickoffBlockReason({
    matchesBlocked: gate.matchesBlocked,
    competition: fixture.competition,
    lastPlayedAt: latestPlayedAt(fixtures),
    lastChallengeAt: latestPlayedAt(fixtures, 'challenge'),
    now: new Date(),
  });
}
