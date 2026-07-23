/**
 * Engine event vocabulary — EPIC-1.
 * Domain payloads stay empty until later epics; type string is the contract.
 */

export type EngineEventType =
  | 'MATCH_START'
  | 'MATCH_END'
  | 'CLOCK_TICK'
  | 'PLAYER_MOVE'
  | 'BALL_KICK'
  | 'SHOT'
  | 'GOAL'
  | 'FOUL'
  | 'OFFSIDE'
  | 'PASS'
  | 'SYSTEM';

export interface EngineEvent<TPayload = unknown> {
  type: EngineEventType | (string & {});
  tick: number;
  /** Optional opaque payload — no game entities in EPIC-1. */
  payload?: TPayload;
}

export type EventHandler<TPayload = unknown> = (event: EngineEvent<TPayload>) => void;
