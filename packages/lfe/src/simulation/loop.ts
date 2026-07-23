import type { DeepPartial, LfeConfig } from '../config';
import { resolveConfig } from '../config';
import type { CommandBus, Command, CommandResult } from '../commands';
import {
  createCommandBus,
  createCommandRegistry,
  createEndMatchCommand,
  createStartMatchCommand,
  registerMatchCommands,
} from '../commands';
import type { GameClock, Logger, TimeController } from '../core';
import { createGameClock, createLogger, createTimeController } from '../core';
import type { EventBus } from '../events';
import { createEventBus } from '../events';
import type { MatchState } from '../match/domain';
import type { MatchLifecycleEvent } from '../match/state-machine';
import type { ReplaySnapshot, SnapshotBuffer } from '../replay';
import { createSnapshotBuffer } from '../replay';
import type { Rng } from '../rng';
import { createRng } from '../rng';
import type { Scheduler } from '../scheduler';
import { createScheduler } from '../scheduler';
import type { WorldState } from '../world';
import { createInitialWorldState } from '../world';

import { createSimulationPipeline } from './pipeline';
import type { SystemRegistry } from './registry';
import { createSystemRegistry } from './registry';
import type { LifecycleFacts } from './system';
import { createBuiltinSystems } from './systems';

export interface SimulationOptions {
  seed: number;
  config?: DeepPartial<LfeConfig>;
  logger?: Logger;
  /** Optional EPIC-2 match state bound into LifecycleSystem. */
  matchState?: MatchState | null;
}

export interface Simulation {
  readonly config: LfeConfig;
  readonly world: WorldState;
  readonly rng: Rng;
  readonly clock: GameClock;
  readonly events: EventBus;
  readonly scheduler: Scheduler;
  readonly systems: SystemRegistry;
  readonly time: TimeController;
  readonly logger: Logger;
  readonly pipeline: ReturnType<typeof createSimulationPipeline>;
  readonly commands: CommandBus;
  getMatchState(): MatchState | null;
  setMatchState(state: MatchState | null): void;
  setLifecycleFacts(partial: Partial<LifecycleFacts>): void;
  enqueueLifecycle(event: MatchLifecycleEvent): void;
  /** Preferred entry for match mutations (AI / UI / bots / tests). */
  dispatch(command: Command): CommandResult;
  step(): ReplaySnapshot | undefined;
  run(ticks: number): void;
  /** Dispatches StartMatchCommand. */
  start(): CommandResult;
  /** Dispatches EndMatchCommand. */
  end(): CommandResult;
  snapshots(): readonly ReplaySnapshot[];
  latestSnapshot(): ReplaySnapshot | undefined;
}

/**
 * Headless simulation loop (EPIC-4 + EPIC-5 commands).
 * Match control mutations go through CommandBus.
 */
export function createSimulation(options: SimulationOptions): Simulation {
  const config = resolveConfig(options.config);
  const logger = options.logger ?? createLogger(config.logLevel);
  const rng = createRng(options.seed);
  const clock = createGameClock();
  const events = createEventBus();
  const systems = createSystemRegistry();
  const time = createTimeController(config.timeScale);
  const world = createInitialWorldState(options.seed, config);
  const snapshots: SnapshotBuffer = createSnapshotBuffer(config.snapshotHistoryLimit);

  let matchState: MatchState | null = options.matchState ?? null;
  const lifecycleQueue: MatchLifecycleEvent[] = [];
  let lifecycleFacts: LifecycleFacts = {
    homeLineupConfirmed: false,
    awayLineupConfirmed: false,
    enableExtraTime: false,
    enablePenalties: false,
    scoreTied: false,
    halfDurationMs: 45 * 60 * 1000,
    halfTimeDurationMs: 15 * 60 * 1000,
  };

  for (const system of createBuiltinSystems()) {
    systems.registerSystem(system);
  }

  const scheduler = createScheduler({
    ticksPerSecond: config.ticksPerSecond,
    getCurrentTick: () => clock.tick,
  });

  function syncWorld(): void {
    world.tick = clock.tick;
    world.clock = clock.snapshot();
    world.rng = rng.getState();
    world.settings.ticksPerSecond = config.ticksPerSecond;
  }

  const commandRegistry = createCommandRegistry();
  registerMatchCommands(commandRegistry);

  const commands = createCommandBus({
    world,
    clock,
    rng,
    logger,
    time,
    events,
    registry: commandRegistry,
    getMatchState: () => matchState,
    setMatchState: (s) => {
      matchState = s;
    },
    getLifecycleFacts: () => lifecycleFacts,
    setLifecycleFacts: (partial) => {
      lifecycleFacts = { ...lifecycleFacts, ...partial };
    },
    enqueueLifecycle: (event) => {
      lifecycleQueue.push(event);
    },
  });

  const pipeline = createSimulationPipeline({
    config,
    world,
    clock,
    events,
    scheduler,
    rng,
    logger,
    snapshots,
    systems,
    getMatchState: () => matchState,
    setMatchState: (s) => {
      matchState = s;
    },
    getLifecycleQueue: () => lifecycleQueue,
    getLifecycleFacts: () => lifecycleFacts,
  });

  const simulation: Simulation = {
    config,
    world,
    rng,
    clock,
    events,
    scheduler,
    systems,
    time,
    logger,
    pipeline,
    commands,
    getMatchState: () => matchState,
    setMatchState: (s) => {
      matchState = s;
    },
    setLifecycleFacts(partial) {
      lifecycleFacts = { ...lifecycleFacts, ...partial };
    },
    enqueueLifecycle(event) {
      lifecycleQueue.push(event);
    },
    dispatch(command) {
      return commands.execute(command);
    },
    step() {
      const nextTick = clock.tick + 1;
      return pipeline.runTick(nextTick);
    },
    run(ticks) {
      const n = Math.max(0, Math.floor(ticks));
      for (let i = 0; i < n; i += 1) {
        simulation.step();
      }
    },
    start() {
      return commands.execute(createStartMatchCommand({ tick: clock.tick, source: 'system' }));
    },
    end() {
      return commands.execute(createEndMatchCommand({ tick: clock.tick, source: 'system' }));
    },
    snapshots: () => snapshots.all(),
    latestSnapshot: () => snapshots.latest(),
  };

  syncWorld();
  return simulation;
}
