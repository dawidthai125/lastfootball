import { getManagerClub } from '@/lib/club/get-manager-club';
import { createSessionFromFirstMatch } from '@/lib/first-match/create-session';
import { createSessionFromLeagueFixture } from '@/lib/fixtures/create-session';
import { getFixtureByIdForClub } from '@/lib/fixtures/get-fixture';
import { sessionFromKickoff, type KickoffSnapshot } from '@/lib/match/kickoff-snapshot';
import type { ManagerLogEntry } from '@/lib/match/manager-commands';
import { parseOurFormation } from '@/lib/match/our-formation';
import { replayManagerMatch } from '@/lib/match/replay-manager-match';
import { loadRivalSquad } from '@/lib/rivals/squad';
import { resolveMatchBench, resolveStartingXi, SquadUnavailableError } from '@/lib/squad';
import { lineupProblem } from '@/lib/squad/lineup-problem';
import type { PlayerRowDto } from '@/lib/squad/types';

/**
 * Official score of a league, cup or challenge match (D127).
 * Replays the decisions on the kickoff snapshot the live page stored (D130). Without one
 * it builds the same session from the stored squad.
 */
export async function authoritativeManagerScore(
  fixtureId: string,
  players: readonly PlayerRowDto[],
  log: readonly ManagerLogEntry[],
  shape: unknown,
  today: string,
  kickoff: KickoffSnapshot | null = null,
): Promise<{ home: number; away: number } | { error: string }> {
  if (kickoff) {
    const session = sessionFromKickoff(kickoff);
    const score = replayManagerMatch(session, kickoff.fixture.isHome ? 'home' : 'away', log);
    session.dispose();
    return score ?? { error: 'Nie udało się policzyć wyniku. Spróbuj ponownie.' };
  }

  const club = await getManagerClub();
  const dto = club ? await getFixtureByIdForClub(club.id, fixtureId) : null;
  if (!club || !dto) return { error: 'Nie znaleziono meczu.' };

  const problem = lineupProblem(club.id, players, today);
  if (problem) return { error: problem };

  try {
    const rival = dto.competition === 'challenge' ? await loadRivalSquad(dto.opponentClubId) : null;
    if (dto.competition === 'challenge' && !rival) {
      return { error: 'Rywal nie ma pełnej jedenastki.' };
    }
    const session = createSessionFromLeagueFixture(
      club,
      dto,
      resolveStartingXi(players),
      resolveMatchBench(players),
      parseOurFormation(typeof shape === 'string' ? shape : null),
      rival?.xi ?? null,
    );
    const score = replayManagerMatch(session, dto.isHome ? 'home' : 'away', log);
    session.dispose();
    return score ?? { error: 'Nie udało się policzyć wyniku. Spróbuj ponownie.' };
  } catch (e) {
    if (e instanceof SquadUnavailableError) return { error: e.message };
    throw e;
  }
}

/** Onboarding match: same rule, no money in it. */
export async function authoritativeFirstMatchScore(
  players: readonly PlayerRowDto[],
  log: readonly ManagerLogEntry[],
): Promise<{ home: number; away: number } | { error: string }> {
  const club = await getManagerClub();
  if (!club) return { error: 'Nie znaleziono klubu.' };
  try {
    const session = createSessionFromFirstMatch(
      club,
      resolveStartingXi(players),
      resolveMatchBench(players),
    );
    const score = replayManagerMatch(session, 'home', log);
    session.dispose();
    return score ?? { error: 'Nie udało się policzyć wyniku. Spróbuj ponownie.' };
  } catch (e) {
    if (e instanceof SquadUnavailableError) return { error: e.message };
    throw e;
  }
}
