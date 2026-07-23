/**
 * LFE Match Domain Model — EPIC-2.
 * Pure data contracts: serializable, immutable-friendly, no AI/physics/UI.
 */

export type { MatchId, PitchPoint, PitchRole, PitchSide, PlayerId, Rating, TeamId } from './ids';

export type { PlayerAttributes } from './player-attributes';
export { DEFAULT_PLAYER_ATTRIBUTES } from './player-attributes';

export type { PlayerSkills } from './player-skills';
export { DEFAULT_PLAYER_SKILLS } from './player-skills';

export type { PlayerCondition } from './player-condition';
export { DEFAULT_PLAYER_CONDITION } from './player-condition';

export type { Player, CreatePlayerInput } from './player';
export { createPlayer } from './player';

export type { Team, TeamColors } from './team';
export { createTeam } from './team';

export type { Formation, FormationSlot, FormationCode } from './formation';
export { FORMATION_433, FORMATION_442, formationByCode } from './formation';

export type { Lineup, LineupSlot, CreateLineupInput } from './lineup';
export { createLineup } from './lineup';

export type { Bench } from './bench';
export { createBench } from './bench';

export type { Substitution, SubstitutionReason } from './substitution';

export type { Ball, BallPhase, BallPossession } from './ball';
export { createBall } from './ball';

export type { Pitch } from './pitch';
export { DEFAULT_PITCH, createPitch } from './pitch';

export type { Goal } from './goal';
export { createGoals } from './goal';

export type { Card, CardType } from './card';
export type { Injury, InjurySeverity } from './injury';

export type { Score } from './score';
export { ZERO_SCORE, createScore } from './score';

export type { Statistics, TeamStatistics, PlayerStatistics } from './statistics';
export { emptyStatistics, emptyTeamStatistics } from './statistics';

export type { MatchClock, MatchPeriod } from './clock';
export { createMatchClock } from './clock';

export type { Referee } from './referee';
export { createReferee } from './referee';

export type { Weather, WeatherType } from './weather';
export { createWeather } from './weather';

export type { Stadium } from './stadium';
export { createStadium } from './stadium';

export type { MatchSettings } from './settings';
export { DEFAULT_MATCH_SETTINGS, createMatchSettings } from './settings';

export type { MatchPhase } from './phase';
export { isTerminalPhase, isPlayPhase, MATCH_PHASES } from './phase';

export type { MatchTactics } from './tactics';
export { DEFAULT_MATCH_TACTICS, createMatchTactics } from './tactics';

export type { MatchState, CreateMatchStateInput } from './match-state';
export { createMatchState } from './match-state';

export type { Match, CreateMatchModelInput } from './match';
export { createMatchModel, withMatchState } from './match';
