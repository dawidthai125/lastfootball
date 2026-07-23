import type { MatchState } from '../domain/match-state';

import type { LifecycleContext } from './context';
import type { MatchLifecycleEvent } from './events';
import type { LifecycleTransitionResult } from './transition';
import { applyLifecycleEvent } from './transition';

/**
 * Apply a lifecycle event to MatchState.phase immutably.
 * Does not mutate ball/players — architecture-only binding for EPIC-3.
 */
export function transitionMatchState(
  state: MatchState,
  event: MatchLifecycleEvent,
  ctx: LifecycleContext,
): { readonly state: MatchState; readonly result: LifecycleTransitionResult } {
  const result = applyLifecycleEvent(state.phase, event, ctx);
  if (!result.ok) {
    return { state, result };
  }
  return {
    state: Object.freeze({
      ...state,
      phase: result.to,
      tick: event.tick,
    }),
    result,
  };
}
