import { tickDurationMs } from '../config';
import type { LfeConfig } from '../config';
import type { GameClock, Logger } from '../core';
import type { EventBus } from '../events';
import type { MatchState } from '../match/domain';
import type { MatchLifecycleEvent } from '../match/state-machine';
import type { ReplaySnapshot, SnapshotBuffer } from '../replay';
import type { Rng } from '../rng';
import type { Scheduler } from '../scheduler';
import type { WorldState } from '../world';

import type { SystemRegistry } from './registry';
import type { LifecycleFacts, SystemContext } from './system';

export interface SimulationPipelineDeps {
  readonly config: LfeConfig;
  readonly world: WorldState;
  readonly clock: GameClock;
  readonly events: EventBus;
  readonly scheduler: Scheduler;
  readonly rng: Rng;
  readonly logger: Logger;
  readonly snapshots: SnapshotBuffer;
  readonly systems: SystemRegistry;
  getMatchState: () => MatchState | null;
  setMatchState: (state: MatchState | null) => void;
  getLifecycleQueue: () => MatchLifecycleEvent[];
  getLifecycleFacts: () => LifecycleFacts;
}

export interface SimulationPipeline {
  /**
   * Execute one tick:
   * Clock → Scheduler → Lifecycle → (gameplay) → Event → Replay → Snapshot
   * Snapshot is owned by ReplaySystem; pipeline exposes lastSnapshot.
   */
  runTick(tick: number): ReplaySnapshot | undefined;
}

export function createSimulationPipeline(deps: SimulationPipelineDeps): SimulationPipeline {
  return {
    runTick(tick) {
      const ctx: SystemContext = {
        tick,
        dtMs: tickDurationMs(deps.config.ticksPerSecond),
        config: deps.config,
        world: deps.world,
        clock: deps.clock,
        events: deps.events,
        scheduler: deps.scheduler,
        rng: deps.rng,
        logger: deps.logger,
        matchState: deps.getMatchState(),
        lifecycleQueue: deps.getLifecycleQueue(),
        tickEvents: [],
        snapshots: deps.snapshots,
        lastSnapshot: undefined,
        lifecycleFacts: deps.getLifecycleFacts(),
      };

      deps.systems.runAll(ctx);

      if (ctx.matchState !== deps.getMatchState()) {
        deps.setMatchState(ctx.matchState);
      }

      return ctx.lastSnapshot;
    },
  };
}
