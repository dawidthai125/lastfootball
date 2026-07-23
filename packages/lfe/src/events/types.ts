/**
 * Engine event vocabulary — EPIC-1 + GAMEPLAY-01 match events.
 * EventBus is the sole source of match events.
 */

export type EngineEventType =
  | 'MATCH_START'
  | 'HALF_END'
  | 'MATCH_END'
  | 'CLOCK_TICK'
  | 'PLAYER_MOVE'
  | 'BALL_KICK'
  | 'SHOT'
  | 'ATTACK'
  | 'GOAL'
  | 'OFFSIDE'
  | 'FOUL'
  | 'CARD'
  | 'CORNER'
  | 'FREE_KICK'
  | 'PENALTY'
  | 'SUBSTITUTION'
  | 'INJURY'
  | 'VAR'
  | 'POSSESSION'
  | 'FORMATION_CHANGE'
  | 'PASS'
  | 'SYSTEM';

/** Canonical GAMEPLAY / MATCH-ENGINE event set. */
export const GAMEPLAY_MATCH_EVENTS = [
  'MATCH_START',
  'HALF_END',
  'MATCH_END',
  'GOAL',
  'OFFSIDE',
  'FOUL',
  'CARD',
  'CORNER',
  'FREE_KICK',
  'PENALTY',
  'SUBSTITUTION',
  'INJURY',
  'VAR',
  'POSSESSION',
  'FORMATION_CHANGE',
  'ATTACK',
  'SHOT',
] as const satisfies readonly EngineEventType[];

export type GameplayMatchEventType = (typeof GAMEPLAY_MATCH_EVENTS)[number];

export interface EngineEvent<TPayload = unknown> {
  type: EngineEventType | (string & {});
  tick: number;
  /** Optional opaque payload — structured by emitters. */
  payload?: TPayload;
}

export type EventHandler<TPayload = unknown> = (event: EngineEvent<TPayload>) => void;
