import type { LfeConfig } from '../config';
import type { ClockSnapshot } from '../core';
import type { RngState } from '../rng';

/**
 * Single authoritative world state.
 * Entity slots exist as placeholders — no Player/Team/Ball implementations in EPIC-1.
 */

export interface MatchMeta {
  status: 'idle' | 'running' | 'finished';
  seed: number;
}

export interface WorldSettings {
  ticksPerSecond: number;
}

/**
 * Opaque placeholders — typed as unknown[] / null so later epics can replace
 * without changing the World State ownership model.
 */
export interface WorldState {
  tick: number;
  clock: ClockSnapshot;
  players: unknown[];
  teams: unknown[];
  ball: null;
  events: unknown[];
  physics: null;
  rng: RngState;
  match: MatchMeta;
  settings: WorldSettings;
}

export function createInitialWorldState(seed: number, config: LfeConfig): WorldState {
  return {
    tick: 0,
    clock: { tick: 0, elapsedMs: 0, matchMinute: 0 },
    players: [],
    teams: [],
    ball: null,
    events: [],
    physics: null,
    rng: { seed: seed >>> 0, state: seed >>> 0, calls: 0 },
    match: { status: 'idle', seed: seed >>> 0 },
    settings: { ticksPerSecond: config.ticksPerSecond },
  };
}
