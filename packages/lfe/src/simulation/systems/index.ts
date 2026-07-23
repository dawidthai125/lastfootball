import type { SimulationSystem } from '../system';

import { createClockSystem } from './clock-system';
import { createEventSystem } from './event-system';
import { createLifecycleSystem } from './lifecycle-system';
import { createMatchEngineSystem } from './match-engine-system';
import { createReplaySystem } from './replay-system';
import { createSchedulerSystem } from './scheduler-system';

/** Built-in systems: Clock → Scheduler → Lifecycle → MatchEngine → Event → Replay. */
export function createBuiltinSystems(): readonly SimulationSystem[] {
  return [
    createClockSystem(),
    createSchedulerSystem(),
    createLifecycleSystem(),
    createMatchEngineSystem(),
    createEventSystem(),
    createReplaySystem(),
  ];
}

export {
  createClockSystem,
  createSchedulerSystem,
  createLifecycleSystem,
  createMatchEngineSystem,
  createEventSystem,
  createReplaySystem,
};
