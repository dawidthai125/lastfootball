import type { SimulationSystem } from '../system';

import { createClockSystem } from './clock-system';
import { createEventSystem } from './event-system';
import { createLifecycleSystem } from './lifecycle-system';
import { createReplaySystem } from './replay-system';
import { createSchedulerSystem } from './scheduler-system';

/** Built-in EPIC-4 systems in documentation order (priority defines real order). */
export function createBuiltinSystems(): readonly SimulationSystem[] {
  return [
    createClockSystem(),
    createSchedulerSystem(),
    createLifecycleSystem(),
    createEventSystem(),
    createReplaySystem(),
  ];
}

export {
  createClockSystem,
  createSchedulerSystem,
  createLifecycleSystem,
  createEventSystem,
  createReplaySystem,
};
