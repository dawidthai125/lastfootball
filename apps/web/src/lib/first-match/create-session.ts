import {
  createBench,
  createLineup,
  createMatch,
  createPlayer,
  type FormationCode,
  type MatchSession,
} from '@lastfootball/lfe';
import type { PlayerId } from '@lastfootball/domain';

import type { ClubDto } from '@/lib/club/types';
import { FIRST_MATCH_BOT, FIRST_MATCH_ID } from '@/lib/first-match/constants';
import { seedBotSquad, seedStarterSquad } from '@/lib/first-match/starter-squad';

/**
 * Builds MatchSession for inaugural match from Club DTO + deterministic squads.
 * Does not change LFE contracts — same createMatch entry as mock fixtures.
 */
export function createSessionFromFirstMatch(club: ClubDto): MatchSession {
  const homeTeamId = 'team-home';
  const awayTeamId = 'team-away';
  const our = seedStarterSquad(club.id);
  const their = seedBotSquad();
  const formationCode: FormationCode = '4-4-2';

  const homePlayers = our.map((p) =>
    createPlayer({
      id: p.id as PlayerId,
      teamId: homeTeamId,
      side: 'home',
      name: p.name,
      shirtNumber: p.number,
      preferredRole: p.role,
    }),
  );
  const awayPlayers = their.map((p) =>
    createPlayer({
      id: p.id as PlayerId,
      teamId: awayTeamId,
      side: 'away',
      name: p.name,
      shirtNumber: p.number,
      preferredRole: p.role,
    }),
  );

  const homeIds = homePlayers.map((p) => p.id);
  const awayIds = awayPlayers.map((p) => p.id);
  const captain = our.find((p) => p.captain)?.id ?? homeIds[0]!;

  const session = createMatch({
    seed: hashSeed(`${FIRST_MATCH_ID}:${club.id}`),
    matchId: FIRST_MATCH_ID,
    homeTeamId,
    awayTeamId,
    homeTeamName: club.name,
    awayTeamName: FIRST_MATCH_BOT.name,
    homeShortName: club.shortName,
    awayShortName: FIRST_MATCH_BOT.shortName,
    homeLineup: createLineup({
      side: 'home',
      formationCode,
      playerIds: homeIds,
      captainPlayerId: captain as PlayerId,
    }),
    awayLineup: createLineup({
      side: 'away',
      formationCode,
      playerIds: awayIds,
    }),
    homeBench: createBench('home', []),
    awayBench: createBench('away', []),
    players: [...homePlayers, ...awayPlayers],
    settings: {
      halfDurationMs: 20_000,
      halfTimeDurationMs: 2_000,
      enableExtraTime: false,
      enablePenalties: false,
    },
  });

  return session;
}

function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
