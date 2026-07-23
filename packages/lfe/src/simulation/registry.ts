import { compareSystemPriority, SystemPriority } from './priority';
import type { SimulationSystem, SystemFn, SystemContext } from './system';

/**
 * Registry of simulation systems.
 * Execution order = ascending SystemPriority, then id (never insertion/import order).
 */
export interface SystemRegistry {
  registerSystem(system: SimulationSystem): void;
  /**
   * EPIC-1 compatibility: callback at GAMEPLAY priority (between Lifecycle and Event).
   */
  register(name: string, fn: SystemFn, priority?: number): void;
  unregister(id: string): boolean;
  listOrdered(): readonly SimulationSystem[];
  list(): readonly string[];
  get(id: string): SimulationSystem | undefined;
  runAll(ctx: SystemContext): void;
}

export function createSystemRegistry(): SystemRegistry {
  const byId = new Map<string, SimulationSystem>();

  function ordered(): SimulationSystem[] {
    return [...byId.values()].sort((a, b) => {
      const byPri = compareSystemPriority(a.priority, b.priority);
      if (byPri !== 0) return byPri;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });
  }

  return {
    registerSystem(system) {
      byId.set(system.id, system);
    },
    register(name, fn, priority = SystemPriority.GAMEPLAY) {
      byId.set(name, {
        id: name,
        priority,
        execute(ctx) {
          fn(ctx.world, ctx.tick);
        },
      });
    },
    unregister(id) {
      return byId.delete(id);
    },
    listOrdered() {
      return ordered();
    },
    list() {
      return ordered().map((s) => s.id);
    },
    get(id) {
      return byId.get(id);
    },
    runAll(ctx) {
      for (const system of ordered()) {
        system.execute(ctx);
      }
    },
  };
}
