/**
 * Last Football Engine — PUBLIC API surface (LFE-PUBLIC-API-01 / D119).
 * Contract: docs/lfe/LFE_ARCHITECTURE_FREEZE.md §3 (+ §3.6A/B).
 * Official match entry: createMatch(config) → MatchSession.
 * Testing harness: @lastfootball/lfe/testing
 * No physics / React / advanced subpath in this package entry.
 */

export { LFE_VERSION, LFE_STATUS, getEngineStatus } from './status';
export type { EngineStatus, EngineModuleStatus, EngineStatusReport } from './status';

export type { MatchInput, MatchResult, MatchEvent } from './match/types';
export { createMatch } from './match/session';
export type { MatchSession, MatchSessionConfig, SessionStatus } from './match/session/index';

export type {
  Match as MatchModel,
  MatchState,
  MatchPhase,
  MatchClock,
  MatchPeriod,
  MatchSettings,
  Team as MatchTeam,
  Formation,
  FormationSlot,
  FormationCode,
  Player as MatchPlayer,
  PlayerAttributes as MatchPlayerAttributes,
  PlayerSkills,
  PlayerCondition,
  Ball,
  Pitch,
  Goal,
  Referee,
  Weather,
  Stadium,
  Score,
  Lineup,
  LineupSlot,
  Bench,
  Substitution,
  Card,
  Injury,
  Statistics,
  TeamStatistics,
  PlayerStatistics,
  MatchTactics,
  PitchSide,
  PitchRole,
  PitchPoint,
} from './match/domain';
export {
  createPlayer,
  createTeam,
  createLineup,
  createBench,
  createMatchSettings,
  formationByCode,
  FORMATION_442,
  FORMATION_433,
  DEFAULT_MATCH_SETTINGS,
  DEFAULT_PITCH,
  DEFAULT_PLAYER_ATTRIBUTES,
  DEFAULT_PLAYER_SKILLS,
  DEFAULT_PLAYER_CONDITION,
} from './match/domain';

export type { LfeConfig, DeepPartial } from './config';
export { DEFAULT_LFE_CONFIG } from './config';
export type { LogLevel } from './core';

export type { EngineEvent, EngineEventType, GameplayMatchEventType } from './events';
export { GAMEPLAY_MATCH_EVENTS } from './events';

export type {
  Command,
  CommandSource,
  CommandResult,
  MatchCommand,
  MatchCommandType,
  StartMatchCommand,
  KickoffCommand,
  PauseMatchCommand,
  ResumeMatchCommand,
  EndMatchCommand,
  AbandonMatchCommand,
  DeclareWalkoverCommand,
  TacticalCommand,
  TacticalCommandType,
  ChangeTacticsCommand,
  SubstitutePlayerCommand,
  SetPressingCommand,
  SetTempoCommand,
  SetWidthCommand,
  SetMentalityCommand,
  SetPlayerInstructionCommand,
  ChangeFormationCommand,
} from './commands';
export {
  createStartMatchCommand,
  createKickoffCommand,
  createPauseMatchCommand,
  createResumeMatchCommand,
  createEndMatchCommand,
  createAbandonMatchCommand,
  createDeclareWalkoverCommand,
  createChangeTacticsCommand,
  createSubstitutePlayerCommand,
  createSetPressingCommand,
  createSetTempoCommand,
  createSetWidthCommand,
  createSetMentalityCommand,
  createSetPlayerInstructionCommand,
  createChangeFormationCommand,
} from './commands';

export type { Position, SpatialPlayer, SpatialBall, MatchSpatialState } from './match/positioning';
export { createMatchSpatialState, findSpatialPlayer } from './match/positioning';
