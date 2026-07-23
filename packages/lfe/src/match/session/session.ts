import type { CommandBus, Command, CommandResult } from '../../commands';
import type { GameClock, TimeController } from '../../core';
import type { EventBus } from '../../events';
import type { MatchLifecycleState } from '../state-machine';
import type { Match, MatchState } from '../domain';
import type { ReplaySnapshot } from '../../replay';
import type { Scheduler } from '../../scheduler';
import type { Simulation } from '../../simulation';
import type { WorldState } from '../../world';

import type { MatchSessionConfig, SessionStatus } from './types';
import type { MatchEvent, MatchResult } from '../types';
import type { MatchSpatialState } from '../positioning';

/** Read-only view of session internals for debug / tooling. */
export interface MatchSessionContext {
  readonly sessionId: string;
  readonly status: SessionStatus;
  readonly seed: number;
  readonly tick: number;
  readonly phase: MatchLifecycleState | null;
  readonly world: WorldState;
  readonly match: Match;
  readonly matchState: MatchState;
  readonly spatial: MatchSpatialState;
  readonly simulation: Simulation;
  readonly commands: CommandBus;
  readonly events: EventBus;
  readonly scheduler: Scheduler;
  readonly clock: GameClock;
  readonly time: TimeController;
}

/**
 * Public match orchestration — sole entry for running a match (EPIC-6).
 * Pipeline / CommandBus / State Machine are owned by the session.
 */
export interface MatchSession {
  readonly id: string;
  readonly status: SessionStatus;
  readonly config: MatchSessionConfig;

  context(): MatchSessionContext;

  start(): CommandResult;
  pause(): CommandResult;
  resume(): CommandResult;
  stop(): CommandResult;
  dispatch(command: Command): CommandResult;

  /** Advance one simulation tick (requires running/paused session). */
  step(): ReplaySnapshot | undefined;
  run(ticks: number): void;

  getMatchState(): MatchState;
  getWorld(): WorldState;
  /** Kickoff / formation spatial snapshot (EPIC-7). */
  getSpatialState(): MatchSpatialState;
  snapshots(): readonly ReplaySnapshot[];
  latestSnapshot(): ReplaySnapshot | undefined;

  dispose(): void;

  /** Legacy: advance until stopped/disposed or maxTicks; returns score snapshot. */
  runToEnd(maxTicks?: number): MatchResult;
  getEvents(): MatchEvent[];
}
