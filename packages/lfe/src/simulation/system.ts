import type { LfeConfig } from '../config';
import type { GameClock, Logger } from '../core';
import type { EngineEvent, EventBus } from '../events';
import type { MatchState } from '../match/domain';
import type { MatchLifecycleEvent } from '../match/state-machine';
import type { ReplaySnapshot, SnapshotBuffer } from '../replay';
import type { Rng } from '../rng';
import type { Scheduler } from '../scheduler';
import type { WorldState } from '../world';

import type { SystemPriorityValue } from './priority';

/**
 * Shared per-tick context passed to every system.
 * Mutable fields are updated in-place during the tick (deterministic, no I/O).
 */
export interface SystemContext {
  readonly tick: number;
  readonly dtMs: number;
  readonly config: LfeConfig;
  readonly world: WorldState;
  readonly clock: GameClock;
  readonly events: EventBus;
  readonly scheduler: Scheduler;
  readonly rng: Rng;
  readonly logger: Logger;
  /** Bound match aggregate (EPIC-2); null until session wiring. */
  matchState: MatchState | null;
  /** Lifecycle commands queued for this tick (FIFO, deterministic). */
  lifecycleQueue: MatchLifecycleEvent[];
  /** Filled by EventSystem after flush. */
  tickEvents: EngineEvent[];
  /** Snapshot buffer — ReplaySystem / pipeline write here. */
  readonly snapshots: SnapshotBuffer;
  /** Last snapshot produced this tick (set after snapshot phase). */
  lastSnapshot: ReplaySnapshot | undefined;
  /** Optional lifecycle facts for LifecycleSystem guards. */
  lifecycleFacts: LifecycleFacts;
}

export interface LifecycleFacts {
  homeLineupConfirmed: boolean;
  awayLineupConfirmed: boolean;
  enableExtraTime: boolean;
  enablePenalties: boolean;
  scoreTied: boolean;
}

export interface SimulationSystem {
  readonly id: string;
  readonly priority: SystemPriorityValue;
  execute(ctx: SystemContext): void;
}

/** EPIC-1 compatible callback — adapted to SimulationSystem at GAMEPLAY priority. */
export type SystemFn = (world: WorldState, tick: number) => void;
