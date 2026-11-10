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
import type { FixtureDto } from '@/lib/fixtures/types';
import { hashSeed } from '@/lib/match/hash-seed';
import { orderForFormation } from '@/lib/match/order-xi';
import { mapPlayerSkillToLfeSkills } from '@/lib/match/map-player-skill-to-lfe';
import { cupOpponentTier } from '@/lib/cup/cup-guests';
import { seedOpponentSquad, type RosterPlayerSeed } from '@/lib/squad';

/**
 * League fixture → MatchSession.
 * Our XI skills from DB (`players.skill`); AI from League Strength Profile (tier).
 */
export function createSessionFromLeagueFixture(
  club: ClubDto,
  fixture: FixtureDto,
  ourXi: readonly RosterPlayerSeed[],
  ourBench: readonly RosterPlayerSeed[] = [],
  ourFormation: FormationCode = '4-4-2',
): MatchSession {
  const our = orderForFormation(ourXi, ourFormation);
  const cup = fixture.competition === 'cup';
  const their = orderForFormation(
    seedOpponentSquad(
      fixture.opponentClubId,
      cup ? cupOpponentTier(fixture.opponentClubId, club.leagueTier) : club.leagueTier,
    ),
    '4-4-2',
  );
  const homeFormation: FormationCode = fixture.isHome ? ourFormation : '4-4-2';
  const awayFormation: FormationCode = fixture.isHome ? '4-4-2' : ourFormation;

  const homeTeamId = 'team-home';
  const awayTeamId = 'team-away';

  const ourSide = fixture.isHome ? 'home' : 'away';
  const theirSide = fixture.isHome ? 'away' : 'home';

  const ourPlayers = our.map((p) => {
    if (p.skill == null || !Number.isFinite(p.skill)) {
      throw new Error(`League XI missing skill for player ${p.id}`);
    }
    return createPlayer({
      id: p.id as PlayerId,
      teamId: ourSide === 'home' ? homeTeamId : awayTeamId,
      side: ourSide,
      name: p.name,
      shirtNumber: p.number,
      preferredRole: p.role,
      skills: mapPlayerSkillToLfeSkills(p.skill),
    });
  });
  const benchPlayers = ourBench.map((p) => {
    if (p.skill == null || !Number.isFinite(p.skill)) {
      throw new Error(`League bench missing skill for player ${p.id}`);
    }
    return createPlayer({
      id: p.id as PlayerId,
      teamId: ourSide === 'home' ? homeTeamId : awayTeamId,
      side: ourSide,
      name: p.name,
      shirtNumber: p.number,
      preferredRole: p.role,
      skills: mapPlayerSkillToLfeSkills(p.skill),
    });
  });
  const theirPlayers = their.map((p) => {
    if (p.skill == null || !Number.isFinite(p.skill)) {
      throw new Error(`Opponent seed missing skill for ${p.id}`);
    }
    return createPlayer({
      id: p.id as PlayerId,
      teamId: theirSide === 'home' ? homeTeamId : awayTeamId,
      side: theirSide,
      name: p.name,
      shirtNumber: p.number,
      preferredRole: p.role,
      skills: mapPlayerSkillToLfeSkills(p.skill),
    });
  });

  const homePlayers = fixture.isHome ? ourPlayers : theirPlayers;
  const awayPlayers = fixture.isHome ? theirPlayers : ourPlayers;
  const homeIds = homePlayers.map((p) => p.id);
  const awayIds = awayPlayers.map((p) => p.id);
  const ourCaptain = our.find((p) => p.captain)?.id;
  const homeCaptain = fixture.isHome
    ? ((ourCaptain as PlayerId | undefined) ?? homeIds[0]!)
    : homeIds[0]!;

  const homeName = fixture.isHome ? club.name : fixture.opponent.name;
  const awayName = fixture.isHome ? fixture.opponent.name : club.name;
  const homeShort = fixture.isHome ? club.shortName : fixture.opponent.shortName;
  const awayShort = fixture.isHome ? fixture.opponent.shortName : club.shortName;

  return createMatch({
    seed: hashSeed(`${fixture.id}:${club.id}`),
    matchId: fixture.id,
    homeTeamId,
    awayTeamId,
    homeTeamName: homeName,
    awayTeamName: awayName,
    homeShortName: homeShort,
    awayShortName: awayShort,
    homeLineup: createLineup({
      side: 'home',
      formationCode: homeFormation,
      playerIds: homeIds,
      captainPlayerId: homeCaptain,
    }),
    awayLineup: createLineup({
      side: 'away',
      formationCode: awayFormation,
      playerIds: awayIds,
    }),
    homeBench: createBench('home', fixture.isHome ? benchPlayers.map((p) => p.id) : []),
    awayBench: createBench('away', fixture.isHome ? [] : benchPlayers.map((p) => p.id)),
    players: [...homePlayers, ...awayPlayers, ...benchPlayers],
    tacticsSide: ourSide,
    settings: {
      halfDurationMs: 45_000,
      halfTimeDurationMs: 3_000,
      enableExtraTime: cup,
      enablePenalties: cup,
    },
  });
}
