import type { MatchId } from './ids';
import type { MatchState } from './match-state';
import type { MatchSettings } from './settings';
import { DEFAULT_MATCH_SETTINGS, createMatchSettings } from './settings';

/**
 * Match aggregate — identity + settings + current state.
 * State is replaced (not mutated) as the simulation advances.
 */
export interface Match {
  readonly id: MatchId;
  readonly seed: number;
  readonly settings: MatchSettings;
  readonly createdAtTick: number;
  readonly state: MatchState;
}

export interface CreateMatchModelInput {
  id: MatchId;
  seed: number;
  state: MatchState;
  settings?: Partial<MatchSettings>;
  createdAtTick?: number;
}

export function createMatchModel(input: CreateMatchModelInput): Match {
  return Object.freeze({
    id: input.id,
    seed: input.seed >>> 0,
    settings: createMatchSettings(input.settings ?? DEFAULT_MATCH_SETTINGS),
    createdAtTick: input.createdAtTick ?? 0,
    state: input.state,
  });
}

/** Replace state immutably for replay steps. */
export function withMatchState(match: Match, state: MatchState): Match {
  return Object.freeze({
    ...match,
    state,
  });
}
