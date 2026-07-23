import type { Rating } from './ids';

/**
 * Transient match condition — serializable slice of player form.
 * Injury detail lives in Injury records; this holds live flags only.
 */
export interface PlayerCondition {
  /** 0–100 remaining energy. */
  readonly energy: Rating;
  /** 0–100 morale / confidence. */
  readonly morale: Rating;
  /** 0–100 freshness (inverse of accumulated fatigue). */
  readonly freshness: Rating;
  readonly isInjured: boolean;
  readonly isSuspended: boolean;
  /** Yellow cards in this match (0–2 typically). */
  readonly yellowCards: number;
  readonly hasRedCard: boolean;
}

export const DEFAULT_PLAYER_CONDITION: PlayerCondition = Object.freeze({
  energy: 100,
  morale: 70,
  freshness: 100,
  isInjured: false,
  isSuspended: false,
  yellowCards: 0,
  hasRedCard: false,
});
