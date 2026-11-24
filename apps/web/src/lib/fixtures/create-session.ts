import {
  createBench,
  createLineup,
  createMatch,
  createPlayer,
  DEFAULT_PLAYER_CONDITION,
  type FormationCode,
  type MatchSession,
} from '@lastfootball/lfe';
import type { PlayerId } from '@lastfootball/domain';

import type { ClubDto } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';
import { hashSeed } from '@/lib/match/hash-seed';
import { orderForFormation } from '@/lib/match/order-xi';
import { clampSkill, mapPlayerSkillToLfeSkills } from '@/lib/match/map-player-skill-to-lfe';
import { homePitchBonus } from '@/lib/stadium/levels';
import { kickoffPressingWithLine } from '@/lib/training/press-line';
import { kickoffTempo, kickoffWidth } from '@/lib/training/style';
import { mapGroupsToLfeSkills } from '@/lib/squad/truth';
import { cupOpponentTier } from '@/lib/cup/cup-guests';
import { seedOpponentSquad, type RosterPlayerSeed } from '@/lib/squad';

/** An average week: the form a level season settles at and the starting morale. */
const NEUTRAL_FORM = 65;
const NEUTRAL_MORALE = 60;

/**
 * What the engine reads as morale: half stored form, half stored morale, centred so an
 * ordinary player equals the default condition of an AI opponent. No stored morale → neutral.
 */
export function teamSpiritFromSeed(p: Pick<RosterPlayerSeed, 'form' | 'morale'>): number {
  const neutral = DEFAULT_PLAYER_CONDITION.morale;
  if (typeof p.morale !== 'number') return neutral;
  const form = p.form ?? NEUTRAL_FORM;
  const spirit = neutral + (form - NEUTRAL_FORM + (p.morale - NEUTRAL_MORALE)) / 2;
  return Math.max(0, Math.min(100, Math.round(spirit)));
}

function conditionFromSeed(p: RosterPlayerSeed) {
  const energy = p.energy ?? 80;
  return {
    energy,
    morale: teamSpiritFromSeed(p),
    freshness: energy,
    isInjured: false,
    isSuspended: false,
    yellowCards: 0,
    hasRedCard: false,
  };
}

/** Level 0 returns the same skills object, so old sims stay put. */
function withHomePitch<T extends { reactions: number }>(skills: T, bonus: number): T {
  if (bonus <= 0) return skills;
  return { ...skills, reactions: clampSkill(skills.reactions + bonus) };
}

/** Opponent condition only when the seed actually carries it, so AI matches stay put. */
function conditionForOpponent(p: RosterPlayerSeed) {
  if (typeof p.energy !== 'number' && typeof p.form !== 'number') return undefined;
  return conditionFromSeed(p);
}

/** AI rival of this fixture. Also frozen in the kickoff copy (D130). */
export function resolveOpponentXi(
  club: Pick<ClubDto, 'leagueTier'>,
  fixture: Pick<FixtureDto, 'competition' | 'opponentClubId'>,
): readonly RosterPlayerSeed[] {
  return seedOpponentSquad(
    fixture.opponentClubId,
    fixture.competition === 'cup'
      ? cupOpponentTier(fixture.opponentClubId, club.leagueTier)
      : club.leagueTier,
  );
}

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
  theirXi?: readonly RosterPlayerSeed[] | null,
): MatchSession {
  const shared = typeof fixture.sharedSeed === 'number';
  const formation: FormationCode = shared ? '4-4-2' : ourFormation;
  const our = orderForFormation(ourXi, formation);
  const cup = fixture.competition === 'cup';
  const theirSource = theirXi && theirXi.length === 11 ? theirXi : resolveOpponentXi(club, fixture);
  const their = orderForFormation(theirSource, '4-4-2');
  const homeFormation: FormationCode = fixture.isHome ? formation : '4-4-2';
  const awayFormation: FormationCode = fixture.isHome ? '4-4-2' : formation;

  const homeTeamId = 'team-home';
  const awayTeamId = 'team-away';

  const ourSide = fixture.isHome ? 'home' : 'away';
  const theirSide = fixture.isHome ? 'away' : 'home';
  const tacticsSide = shared ? 'home' : ourSide;
  const habit =
    tacticsSide === 'home' ? (fixture.homeStylePressing ?? 0) : (fixture.viewerStylePressing ?? 0);
  const pressLine =
    tacticsSide === 'home' ? (fixture.homePressLine ?? 'mid') : (fixture.viewerPressLine ?? 'mid');
  const pressShape =
    tacticsSide === 'home'
      ? (fixture.homePressShape ?? 'flat')
      : (fixture.viewerPressShape ?? 'flat');
  const tempoHabit =
    tacticsSide === 'home' ? (fixture.homeStyleTempo ?? 0) : (fixture.viewerStyleTempo ?? 0);
  const widthHabit =
    tacticsSide === 'home' ? (fixture.homeStyleWidth ?? 0) : (fixture.viewerStyleWidth ?? 0);
  const pitchBonus = homePitchBonus(fixture.homePitchLevel ?? 0);

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
      skills: withHomePitch(
        p.groups ? mapGroupsToLfeSkills(p.groups) : mapPlayerSkillToLfeSkills(p.skill),
        ourSide === 'home' ? pitchBonus : 0,
      ),
      condition: conditionFromSeed(p),
    });
  });
  const benchSource = shared ? [] : ourBench;
  const benchPlayers = benchSource.map((p) => {
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
      skills: withHomePitch(
        p.groups ? mapGroupsToLfeSkills(p.groups) : mapPlayerSkillToLfeSkills(p.skill),
        ourSide === 'home' ? pitchBonus : 0,
      ),
      condition: conditionFromSeed(p),
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
      skills: withHomePitch(
        p.groups ? mapGroupsToLfeSkills(p.groups) : mapPlayerSkillToLfeSkills(p.skill),
        theirSide === 'home' ? pitchBonus : 0,
      ),
      ...(conditionForOpponent(p) ? { condition: conditionForOpponent(p) } : {}),
    });
  });

  const homePlayers = fixture.isHome ? ourPlayers : theirPlayers;
  const awayPlayers = fixture.isHome ? theirPlayers : ourPlayers;
  const homeIds = homePlayers.map((p) => p.id);
  const awayIds = awayPlayers.map((p) => p.id);
  const ourCaptain = our.find((p) => p.captain)?.id;
  const homeSeeds = fixture.isHome ? our : their;
  const homeCaptain = shared
    ? ((homeSeeds.find((p) => p.captain)?.id as PlayerId | undefined) ?? homeIds[0]!)
    : fixture.isHome
      ? ((ourCaptain as PlayerId | undefined) ?? homeIds[0]!)
      : homeIds[0]!;
  const ourSetPiece = (our.find((p) => p.setPiece)?.id as PlayerId | undefined) ?? null;
  const homeSetPiece = fixture.isHome ? ourSetPiece : null;
  const awaySetPiece = fixture.isHome ? null : ourSetPiece;

  const homeName = fixture.isHome ? club.name : fixture.opponent.name;
  const awayName = fixture.isHome ? fixture.opponent.name : club.name;
  const homeShort = fixture.isHome ? club.shortName : fixture.opponent.shortName;
  const awayShort = fixture.isHome ? fixture.opponent.shortName : club.shortName;

  return createMatch({
    seed: shared ? fixture.sharedSeed! : hashSeed(`${fixture.id}:${club.id}`),
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
      setPiecePlayerId: homeSetPiece,
    }),
    awayLineup: createLineup({
      side: 'away',
      formationCode: awayFormation,
      playerIds: awayIds,
      setPiecePlayerId: awaySetPiece,
    }),
    homeBench: createBench('home', fixture.isHome ? benchPlayers.map((p) => p.id) : []),
    awayBench: createBench('away', fixture.isHome ? [] : benchPlayers.map((p) => p.id)),
    players: [...homePlayers, ...awayPlayers, ...benchPlayers],
    tacticsSide,
    openingPressing: kickoffPressingWithLine(habit, pressLine, pressShape),
    openingTempo: kickoffTempo(tempoHabit),
    openingWidth: kickoffWidth(widthHabit),
    settings: {
      halfDurationMs: 45_000,
      halfTimeDurationMs: 3_000,
      enableExtraTime: cup,
      enablePenalties: cup,
      // Same compression as regulation: 1 display minute = 1s. Extra time is 30'.
      extraTimeHalfMs: 15_000,
    },
  });
}
