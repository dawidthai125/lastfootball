import { getManagerClub } from '@/lib/club/get-manager-club';
import { createSessionFromLeagueFixture } from '@/lib/fixtures/create-session';
import { getFixtureByIdForClub } from '@/lib/fixtures/get-fixture';
import type { ManagerLogEntry } from '@/lib/match/manager-commands';
import { parseOurFormation } from '@/lib/match/our-formation';
import { replayManagerMatch } from '@/lib/match/replay-manager-match';
import { loadRivalSquad } from '@/lib/rivals/squad';
import { resolveMatchBench, resolveStartingXi, SquadUnavailableError } from '@/lib/squad';
import type { PlayerRowDto } from '@/lib/squad/types';

/**
 * Official score of a league, cup or challenge match (D127).
 * Builds the same session as the live page from stored data and replays the decisions.
 */
export async function authoritativeManagerScore(
  fixtureId: string,
  players: readonly PlayerRowDto[],
  log: readonly ManagerLogEntry[],
  shape: unknown,
): Promise<{ home: number; away: number } | { error: string }> {
  const club = await getManagerClub();
  const dto = club ? await getFixtureByIdForClub(club.id, fixtureId) : null;
  if (!club || !dto) return { error: 'Nie znaleziono meczu.' };

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
