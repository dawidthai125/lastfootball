import type { MatchHandle, MatchInput } from './types';

/**
 * Creates a match handle.
 * Foundation stub — does not run simulation.
 */
export function createMatch(_input: MatchInput): MatchHandle {
  return {
    runToEnd() {
      throw new Error('LFE createMatch: simulation not implemented (foundation scaffold).');
    },
    getEvents() {
      return [];
    },
  };
}
