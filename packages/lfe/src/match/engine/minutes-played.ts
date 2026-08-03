/**
 * LFE-RATINGS-V2 — Thin minutesPlayed reconcile from XI + substitutions + displayMinute.
 * Pure · no RNG · absolute recompute (not tick-by-tick).
 */

import type { MatchState, PlayerId } from '../domain';
import { bumpPlayerStat } from '../domain';

function isOnPitch(state: MatchState, playerId: PlayerId): boolean {
  return (
    state.homeLineup.slots.some((s) => s.playerId === playerId) ||
    state.awayLineup.slots.some((s) => s.playerId === playerId)
  );
}

/**
 * Total on-pitch display minutes for `playerId` up to `untilFloor` (inclusive span).
 */
export function computeMinutesPlayed(
  playerId: PlayerId,
  state: MatchState,
  untilFloor: number,
): number {
  const until = Math.max(0, untilFloor);
  const wasEverIn = state.substitutions.some((s) => s.playerInId === playerId);
  const wasEverOut = state.substitutions.some((s) => s.playerOutId === playerId);
  const onPitch = isOnPitch(state, playerId);

  // True starters only (never subbed in). Bench never appearing in subs → 0.
  let on = !wasEverIn && (onPitch || wasEverOut);
  let segmentStart = 0;
  let total = 0;

  for (const sub of state.substitutions) {
    const minute = Math.max(0, Math.floor(sub.matchMinute));
    if (sub.playerOutId === playerId && on) {
      total += Math.max(0, minute - segmentStart);
      on = false;
    }
    if (sub.playerInId === playerId && !on) {
      on = true;
      segmentStart = minute;
    }
  }

  if (on) {
    total += Math.max(0, until - segmentStart);
  }

  return total;
}

/** Set `minutesPlayed` for every roster row from current clock + sub history. */
export function reconcileMinutesPlayed(state: MatchState): MatchState {
  const until = Math.floor(state.clock.displayMinute);
  let players = state.statistics.players;
  let changed = false;

  for (const row of state.statistics.players) {
    const mins = computeMinutesPlayed(row.playerId, state, until);
    if (mins !== row.minutesPlayed) {
      players = bumpPlayerStat(players, row.playerId, { minutesPlayed: mins });
      changed = true;
    }
  }

  if (!changed) return state;

  return Object.freeze({
    ...state,
    statistics: Object.freeze({
      ...state.statistics,
      players,
    }),
  });
}
