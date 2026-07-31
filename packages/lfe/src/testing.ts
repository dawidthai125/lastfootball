/**
 * Last Football Engine — TESTING API barrel (LFE-PUBLIC-API-01 / D121).
 * Re-exports only — zero logic.
 * Contract: docs/lfe/LFE_ARCHITECTURE_FREEZE.md §5 (+ harness access to INTERNAL AI/Engine for Vitest).
 * App code must import from @lastfootball/lfe (PUBLIC), not this entry.
 */

export * from './index';

export type { MatchSessionContext, SessionLifecycle } from './match/session/index';
export {
  SESSION_TRANSITIONS,
  createSessionLifecycle,
  isSessionActive,
  buildMatchFromConfig,
} from './match/session/index';

export type { MatchHandle } from './match/types';

export {
  createMatchModel,
  withMatchState,
  createMatchState,
  createBall,
  createPitch,
  createGoals,
  createScore,
  createMatchClock,
  createReferee,
  createWeather,
  createStadium,
  createMatchTactics,
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

export { resolveConfig, tickDurationMs } from './config';

export type {
  ClockSnapshot,
  GameClock,
  Logger,
  LogRecord,
  TickEngine,
  TickPhases,
  TimeController,
} from './core';
export { createGameClock, createLogger, createTickEngine, createTimeController } from './core';

export type { Rng, RngState } from './rng';
export { createRng } from './rng';

export type { EventBus, EventHandler } from './events';
export { createEventBus } from './events';

export type { Scheduler, ScheduledJob, ScheduledJobId } from './scheduler';
export { createScheduler } from './scheduler';

export type { WorldState, MatchMeta, WorldSettings, PitchDimensions } from './world';
export { createInitialWorldState } from './world';

export type { Simulation, SimulationOptions, SystemFn, SystemRegistry } from './simulation';
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
  CommandContext,
  CommandHandler,
  CommandValidator,
  ValidationError,
  CommandRegistry,
  CommandBus,
} from './commands';
export {
  createCommandRegistry,
  createCommandBus,
  nextCommandId,
  resetCommandIdSeq,
  registerMatchCommands,
  MATCH_COMMAND_HANDLERS,
  TACTICAL_COMMAND_HANDLERS,
} from './commands';

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
} from './match/positioning';
