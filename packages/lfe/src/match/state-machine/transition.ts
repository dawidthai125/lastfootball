import type { LifecycleContext } from './context';
import { STATE_DEFINITIONS, TRANSITION_RULES } from './definition';
import type { MatchLifecycleEvent, MatchLifecycleEventType } from './events';
import type { MatchLifecycleState } from './states';
import { isTerminalLifecycleState } from './states';

export interface LifecycleTransitionSuccess {
  readonly ok: true;
  readonly from: MatchLifecycleState;
  readonly to: MatchLifecycleState;
  readonly event: MatchLifecycleEvent;
  readonly tick: number;
}

export interface LifecycleTransitionFailure {
  readonly ok: false;
  readonly from: MatchLifecycleState;
  readonly event: MatchLifecycleEvent;
  readonly reason: string;
}

export type LifecycleTransitionResult = LifecycleTransitionSuccess | LifecycleTransitionFailure;

export function getAllowedEvents(state: MatchLifecycleState): readonly MatchLifecycleEventType[] {
  return STATE_DEFINITIONS[state].allowedEvents;
}

export function getStateDefinition(state: MatchLifecycleState) {
  return STATE_DEFINITIONS[state];
}

/** Possible target states for an event from `from`, ignoring guards. */
export function getDeclaredTargets(
  from: MatchLifecycleState,
  event: MatchLifecycleEventType,
): readonly MatchLifecycleState[] {
  return TRANSITION_RULES.filter((r) => r.from === from && r.event === event).map((r) => r.to);
}

export function canApplyLifecycleEvent(
  from: MatchLifecycleState,
  event: MatchLifecycleEvent,
  ctx: LifecycleContext,
): boolean {
  return applyLifecycleEvent(from, event, ctx).ok;
}

/**
 * Pure deterministic transition.
 * Same (from, event, ctx) ⇒ same result. No mutation, no I/O, no RNG.
 */
export function applyLifecycleEvent(
  from: MatchLifecycleState,
  event: MatchLifecycleEvent,
  ctx: LifecycleContext,
): LifecycleTransitionResult {
  if (isTerminalLifecycleState(from)) {
    return {
      ok: false,
      from,
      event,
      reason: `Terminal state ${from} accepts no transitions`,
    };
  }

  const allowed = STATE_DEFINITIONS[from].allowedEvents;
  if (!allowed.includes(event.type)) {
    return {
      ok: false,
      from,
      event,
      reason: `Event ${event.type} not allowed in ${from}`,
    };
  }

  if (event.type === 'DECLARE_WALKOVER') {
    if (event.walkoverWinner !== 'home' && event.walkoverWinner !== 'away') {
      return {
        ok: false,
        from,
        event,
        reason: 'DECLARE_WALKOVER requires walkoverWinner home|away',
      };
    }
  }

  const candidates = TRANSITION_RULES.filter((r) => r.from === from && r.event === event.type);

  for (const rule of candidates) {
    if (rule.guard && !rule.guard(ctx)) continue;
    return {
      ok: true,
      from,
      to: rule.to,
      event,
      tick: event.tick,
    };
  }

  return {
    ok: false,
    from,
    event,
    reason: `No transition from ${from} on ${event.type} for current context`,
  };
}

/** Immutable MatchState.phase helper — returns next phase or same on failure. */
export function nextLifecycleState(
  from: MatchLifecycleState,
  event: MatchLifecycleEvent,
  ctx: LifecycleContext,
): MatchLifecycleState {
  const result = applyLifecycleEvent(from, event, ctx);
  return result.ok ? result.to : from;
}
