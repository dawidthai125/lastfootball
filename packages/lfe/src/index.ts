/**
 * Last Football Engine — public API surface.
 * EPIC-1…7 + GAMEPLAY + MATCH-ENGINE + MATCH-AI.
 * Public match entry: createMatch(config) → MatchSession.
 * No physics / React.
 */

export { LFE_VERSION, LFE_STATUS, getEngineStatus } from './status';
export type { EngineStatus, EngineModuleStatus, EngineStatusReport } from './status';

export type { MatchInput, MatchResult, MatchEvent, MatchHandle } from './match/types';
export { createMatch } from './match/session';
export type {
  MatchSession,
  MatchSessionContext,
  MatchSessionConfig,
  SessionStatus,
  SessionLifecycle,
} from './match/session/index';
export {
  SESSION_TRANSITIONS,
  createSessionLifecycle,
  isSessionActive,
  buildMatchFromConfig,
} from './match/session/index';

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
  createMatchModel,
  withMatchState,
  createMatchState,
  createPlayer,
  createTeam,
  createLineup,
  createBench,
  createBall,
  createPitch,
  createGoals,
  createScore,
  createMatchClock,
  createReferee,
  createWeather,
  createStadium,
  createMatchSettings,
  createMatchTactics,
  formationByCode,
  FORMATION_442,
  FORMATION_433,
  DEFAULT_MATCH_SETTINGS,
  DEFAULT_PITCH,
  DEFAULT_PLAYER_ATTRIBUTES,
  DEFAULT_PLAYER_SKILLS,
  DEFAULT_PLAYER_CONDITION,
  DEFAULT_MATCH_TACTICS,
  ZERO_SCORE,
  emptyStatistics,
  isTerminalPhase,
  isPlayPhase,
  MATCH_PHASES,
} from './match/domain';

export type {
  MatchLifecycleState,
  MatchLifecycleEvent,
  MatchLifecycleEventType,
  LifecycleContext,
  LifecycleTransitionResult,
  LifecycleStateDefinition,
  LifecycleTransitionRule,
} from './match/state-machine';
export {
  MATCH_LIFECYCLE_STATES,
  MATCH_LIFECYCLE_EVENTS,
  STATE_DEFINITIONS,
  TRANSITION_RULES,
  applyLifecycleEvent,
  canApplyLifecycleEvent,
  nextLifecycleState,
  getAllowedEvents,
  getStateDefinition,
  defaultLifecycleContext,
  isTerminalLifecycleState,
  isPlayLifecycleState,
  transitionMatchState,
} from './match/state-machine';

export type { LfeConfig, DeepPartial } from './config';
export { DEFAULT_LFE_CONFIG, resolveConfig, tickDurationMs } from './config';

export type {
  ClockSnapshot,
  GameClock,
  Logger,
  LogLevel,
  LogRecord,
  TickEngine,
  TickPhases,
  TimeController,
} from './core';
export { createGameClock, createLogger, createTickEngine, createTimeController } from './core';

export type { Rng, RngState } from './rng';
export { createRng } from './rng';

export type {
  EngineEvent,
  EngineEventType,
  EventBus,
  EventHandler,
  GameplayMatchEventType,
} from './events';
export { createEventBus, GAMEPLAY_MATCH_EVENTS } from './events';

export type { Scheduler, ScheduledJob, ScheduledJobId } from './scheduler';
export { createScheduler } from './scheduler';

export type { WorldState, MatchMeta, WorldSettings, PitchDimensions } from './world';
export { createInitialWorldState } from './world';

export type { Simulation, SimulationOptions, SystemFn, SystemRegistry } from './simulation';
/** @internal Prefer createMatch() for match play — createSimulation is for engine/unit tests. */
export {
  createSimulation,
  createSystemRegistry,
  SystemPriority,
  compareSystemPriority,
  createSimulationPipeline,
  createBuiltinSystems,
  createClockSystem,
  createSchedulerSystem,
  createLifecycleSystem,
  createMatchEngineSystem,
  createEventSystem,
  createReplaySystem,
} from './simulation';
export type {
  SimulationSystem,
  SystemContext,
  LifecycleFacts,
  SystemPriorityName,
  SystemPriorityValue,
  SimulationPipeline,
} from './simulation';

export type { ReplaySnapshot, SnapshotBuffer } from './replay';
export { captureSnapshot, cloneWorld, createSnapshotBuffer } from './replay';

export type {
  Command,
  CommandSource,
  CommandContext,
  CommandResult,
  CommandHandler,
  CommandValidator,
  ValidationError,
  CommandRegistry,
  CommandBus,
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
  createCommandRegistry,
  createCommandBus,
  nextCommandId,
  resetCommandIdSeq,
  registerMatchCommands,
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
  MATCH_COMMAND_HANDLERS,
  TACTICAL_COMMAND_HANDLERS,
} from './commands';

/** GAMEPLAY-01 facade — prefer createMatch for app entry. */
export * as gameplay from './gameplay';

export { simulateMatchTick, advanceMatchClock, DISPLAY_MINUTES_PER_HALF } from './match/engine';
export type { MatchEngineTickInput, MatchEngineTickResult, MatchEngineEmit } from './match/engine';

export type {
  MatchAiActionDecision,
  MatchAiContext,
  MatchAiDecision,
  MatchAiPossessionDecision,
  MatchAiSideContext,
  TacticStyle,
} from './ai';
export {
  buildMatchAiContext,
  decideAction,
  decideActionFromState,
  decidePossession,
  decidePossessionFromState,
  formationAggressiveness,
  scorePhaseModifier,
  sideContext,
  styleFromMentality,
} from './ai';

export type { Vec2 } from './math';
export { vec2 } from './math';

export type {
  Position,
  PitchCoordinates,
  PitchSideOrientation,
  PitchGrid,
  GridCell,
  PitchZoneId,
  PitchZone,
  DistanceCalculator,
  FormationLayout,
  FormationLayoutSlot,
  OccupiedSlot,
  SpawnPoint,
  SpawnPoints,
  SpatialPlayer,
  SpatialBall,
  MatchSpatialState,
} from './match/positioning';
export {
  position,
  pitchCoordinates,
  HomeSide,
  AwaySide,
  sideOrientation,
  centreSpotPosition,
  createPitchGrid,
  cellAt,
  cellCenter,
  sameCell,
  createZones,
  pointInZone,
  zonesContaining,
  longitudinalThird,
  distanceCalculator,
  buildFormationLayout,
  occupyFormationLayout,
  createKickoffSpawnPoints,
  createMatchSpatialState,
  findSpatialPlayer,
} from './match/positioning';
