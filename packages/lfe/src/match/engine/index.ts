/**
 * Match Engine v1 (LFE-MATCH-ENGINE-01) + AI decisions (LFE-MATCH-AI-01).
 * Deterministic tick simulation — EventBus + MatchState only.
 */

export {
  DISPLAY_MINUTES_PER_HALF,
  advanceMatchClock,
  baseDisplayMinute,
  isHalfComplete,
  periodForPhase,
} from './clock';
export {
  possessionHomeChance,
  resolvePossessionAction,
  rollPossessionSide,
  withPossessionTick,
} from './resolve';
export type { MatchEngineEmit } from './resolve';
export { simulateMatchTick } from './tick';
export type { MatchEngineTickInput, MatchEngineTickResult } from './tick';
