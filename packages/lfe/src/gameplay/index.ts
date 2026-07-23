/**
 * GAMEPLAY-01 — architecture notes (types only; no circular re-exports).
 *
 * Flow: UI → CommandBus → MatchState → EventBus
 *       UI / Canvas ← MatchState (read-only)
 * Canvas must never mutate MatchState or call CommandBus handlers.
 */

export { GAMEPLAY_MATCH_EVENTS } from '../events/types';
export type { GameplayMatchEventType } from '../events/types';
