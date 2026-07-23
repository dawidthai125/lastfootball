/**
 * Lifecycle commands — not gameplay events (GOAL/PASS live on the Event Bus later).
 * Deterministic inputs to the match state machine.
 */

export const MATCH_LIFECYCLE_EVENTS = [
  'PREPARE_LINEUPS',
  'CONFIRM_LINEUPS',
  'START_KICKOFF',
  'OPEN_PLAY',
  'END_FIRST_HALF',
  'START_SECOND_HALF',
  'END_SECOND_HALF',
  'START_EXTRA_TIME',
  'END_EXTRA_TIME',
  'START_PENALTIES',
  'END_PENALTIES',
  'COMPLETE_MATCH',
  'ABANDON_MATCH',
  'DECLARE_WALKOVER',
] as const;

export type MatchLifecycleEventType = (typeof MATCH_LIFECYCLE_EVENTS)[number];

export interface MatchLifecycleEvent {
  readonly type: MatchLifecycleEventType;
  /** Tick when the command is applied (replay sync). */
  readonly tick: number;
  readonly reason?: string;
  /** For DECLARE_WALKOVER. */
  readonly walkoverWinner?: 'home' | 'away';
}
