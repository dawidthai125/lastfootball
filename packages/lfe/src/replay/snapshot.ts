import type { EngineEvent } from '../events';
import type { WorldState } from '../world';

/**
 * Immutable-ish replay frame captured after each tick.
 * Deep-cloned enough for debug / future multiplayer sync.
 */

export interface ReplaySnapshot {
  tick: number;
  world: WorldState;
  /** Events flushed during this tick. */
  tickEvents: EngineEvent[];
  capturedAtTick: number;
}

export function captureSnapshot(world: WorldState, tickEvents: EngineEvent[]): ReplaySnapshot {
  return {
    tick: world.tick,
    world: cloneWorld(world),
    tickEvents: tickEvents.map((e) => ({ ...e })),
    capturedAtTick: world.tick,
  };
}

export function cloneWorld(world: WorldState): WorldState {
  return {
    tick: world.tick,
    clock: { ...world.clock },
    players: world.players.slice(),
    teams: world.teams.slice(),
    ball: world.ball,
    events: world.events.slice(),
    physics: world.physics,
    rng: { ...world.rng },
    match: { ...world.match },
    settings: { ...world.settings },
  };
}

export interface SnapshotBuffer {
  push(snapshot: ReplaySnapshot): void;
  latest(): ReplaySnapshot | undefined;
  all(): readonly ReplaySnapshot[];
  clear(): void;
}

export function createSnapshotBuffer(limit: number): SnapshotBuffer {
  const items: ReplaySnapshot[] = [];

  return {
    push(snapshot) {
      if (limit <= 0) return;
      items.push(snapshot);
      while (items.length > limit) items.shift();
    },
    latest() {
      return items[items.length - 1];
    },
    all() {
      return items;
    },
    clear() {
      items.length = 0;
    },
  };
}
