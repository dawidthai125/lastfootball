import type { SessionStatus } from './types';

/**
 * Session-level lifecycle (orchestration), distinct from EPIC-3 MatchLifecycleState.
 */
export const SESSION_TRANSITIONS: Readonly<Record<SessionStatus, readonly SessionStatus[]>> =
  Object.freeze({
    created: Object.freeze(['ready', 'disposed'] as const),
    ready: Object.freeze(['running', 'stopped', 'disposed'] as const),
    running: Object.freeze(['paused', 'stopped', 'disposed'] as const),
    paused: Object.freeze(['running', 'stopped', 'disposed'] as const),
    stopped: Object.freeze(['disposed'] as const),
    disposed: Object.freeze([] as const),
  });

export interface SessionLifecycle {
  readonly status: SessionStatus;
  canTransition(to: SessionStatus): boolean;
  transition(to: SessionStatus): SessionStatus;
}

export function createSessionLifecycle(initial: SessionStatus = 'created'): SessionLifecycle {
  let status: SessionStatus = initial;

  return {
    get status() {
      return status;
    },
    canTransition(to) {
      return SESSION_TRANSITIONS[status].includes(to);
    },
    transition(to) {
      if (!SESSION_TRANSITIONS[status].includes(to)) {
        throw new Error(`Invalid session transition ${status} → ${to}`);
      }
      status = to;
      return status;
    },
  };
}

export function isSessionActive(status: SessionStatus): boolean {
  return status === 'running' || status === 'paused' || status === 'ready';
}
