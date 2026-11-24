import type { MatchState, Player, PlayerId } from '../match/domain';

/** Energy a player loses for each minute on the pitch under full rules (D151). */
export const FATIGUE_PER_MINUTE = 0.25;

/** Energy lost so far. Stamina 50 is the base; 90 loses 40% less. */
export function fatigueOf(state: MatchState, player: Player): number {
  const rate = FATIGUE_PER_MINUTE * (1.5 - player.attributes.stamina / 100);
  return minutesOnPitch(state, player.id) * rate;
}

export function minutesOnPitch(state: MatchState, playerId: PlayerId): number {
  const entry = state.substitutions.find((s) => s.playerInId === playerId)?.matchMinute ?? 0;
  return Math.max(0, state.clock.displayMinute - entry);
}
