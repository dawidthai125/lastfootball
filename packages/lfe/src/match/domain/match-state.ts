import type { Ball } from './ball';
import { createBall } from './ball';
import type { Bench } from './bench';
import type { Card } from './card';
import type { MatchClock } from './clock';
import { createMatchClock } from './clock';
import type { Goal } from './goal';
import { createGoals } from './goal';
import type { Injury } from './injury';
import type { Lineup } from './lineup';
import type { MatchPhase } from './phase';
import type { Pitch } from './pitch';
import { DEFAULT_PITCH } from './pitch';
import type { Player } from './player';
import type { Referee } from './referee';
import { createReferee } from './referee';
import type { Score } from './score';
import { ZERO_SCORE } from './score';
import type { Stadium } from './stadium';
import { createStadium } from './stadium';
import type { Statistics } from './statistics';
import { createPlayersStatistics, emptyStatistics } from './statistics';
import type { Substitution } from './substitution';
import type { Team } from './team';
import type { MatchTactics } from './tactics';
import { createMatchTactics } from './tactics';
import type { Weather } from './weather';
import { createWeather } from './weather';

/**
 * Mutable-at-runtime match snapshot — treated as immutable value object per tick.
 * Clone / replace fields when advancing (replay-friendly).
 * Sole source of match truth for UI / Canvas (GAMEPLAY-01).
 */
export interface MatchState {
  readonly phase: MatchPhase;
  readonly clock: MatchClock;
  readonly score: Score;
  readonly homeTeam: Team;
  readonly awayTeam: Team;
  readonly homeLineup: Lineup;
  readonly awayLineup: Lineup;
  readonly homeBench: Bench;
  readonly awayBench: Bench;
  /** All players keyed participation — roster for both sides. */
  readonly players: readonly Player[];
  readonly ball: Ball;
  readonly pitch: Pitch;
  readonly goals: readonly [Goal, Goal];
  readonly referee: Referee;
  readonly weather: Weather;
  readonly stadium: Stadium;
  readonly substitutions: readonly Substitution[];
  readonly cards: readonly Card[];
  readonly injuries: readonly Injury[];
  readonly statistics: Statistics;
  /** Active tactics for the managing side (home by default until multi-manager). */
  readonly tactics: MatchTactics;
  /** Tick index mirrored from simulation when bound (0 until core wiring). */
  readonly tick: number;
}

export interface CreateMatchStateInput {
  homeTeam: Team;
  awayTeam: Team;
  homeLineup: Lineup;
  awayLineup: Lineup;
  homeBench: Bench;
  awayBench: Bench;
  players: readonly Player[];
  pitch?: Pitch;
  referee?: Referee;
  weather?: Weather;
  stadium?: Stadium;
  phase?: MatchPhase;
}

export function createMatchState(input: CreateMatchStateInput): MatchState {
  const pitch = input.pitch ?? DEFAULT_PITCH;
  return Object.freeze({
    phase: input.phase ?? 'PRE_MATCH',
    clock: createMatchClock(),
    score: ZERO_SCORE,
    homeTeam: input.homeTeam,
    awayTeam: input.awayTeam,
    homeLineup: input.homeLineup,
    awayLineup: input.awayLineup,
    homeBench: input.homeBench,
    awayBench: input.awayBench,
    players: Object.freeze([...input.players]),
    ball: createBall({ position: pitch.centreSpot }),
    pitch,
    goals: createGoals(pitch.length, pitch.width),
    referee: input.referee ?? createReferee(),
    weather: input.weather ?? createWeather(),
    stadium: input.stadium ?? createStadium(),
    substitutions: Object.freeze([]),
    cards: Object.freeze([]),
    injuries: Object.freeze([]),
    statistics: emptyStatistics(createPlayersStatistics(input.players)),
    tactics: createMatchTactics({
      formationCode: input.homeLineup.formationCode,
    }),
    tick: 0,
  });
}
