/**
 * Match lifecycle states — SSOT for in-progress match flow (EPIC-3).
 * Distinct from EPIC-1 tick GameClock; drives MatchState.phase.
 */

export const MATCH_LIFECYCLE_STATES = [
  'PRE_MATCH',
  'LINEUP',
  'KICKOFF',
  'FIRST_HALF',
  'HALF_TIME',
  'SECOND_HALF',
  'EXTRA_TIME',
  'PENALTIES',
  'FULL_TIME',
  'FINISHED',
] as const;

export type MatchLifecycleState = (typeof MATCH_LIFECYCLE_STATES)[number];

export function isTerminalLifecycleState(state: MatchLifecycleState): boolean {
  return state === 'FINISHED';
}

export function isPlayLifecycleState(state: MatchLifecycleState): boolean {
  return (
    state === 'FIRST_HALF' ||
    state === 'SECOND_HALF' ||
    state === 'EXTRA_TIME' ||
    state === 'PENALTIES'
  );
}
