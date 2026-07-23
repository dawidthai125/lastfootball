/**
 * MatchState.phase — aliases EPIC-3 lifecycle SSOT.
 * Coarse EPIC-2 phases replaced by full match state machine states.
 */

export type { MatchLifecycleState as MatchPhase } from '../state-machine/states';
export {
  isTerminalLifecycleState as isTerminalPhase,
  isPlayLifecycleState as isPlayPhase,
  MATCH_LIFECYCLE_STATES as MATCH_PHASES,
} from '../state-machine/states';
