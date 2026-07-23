import type { Rating } from './ids';

/**
 * Physical / athletic attributes (0–100 integers preferred).
 * No derived combat formulas in EPIC-2.
 */
export interface PlayerAttributes {
  readonly speed: Rating;
  readonly acceleration: Rating;
  readonly strength: Rating;
  readonly stamina: Rating;
  readonly agility: Rating;
  readonly jumping: Rating;
  readonly balance: Rating;
}

export const DEFAULT_PLAYER_ATTRIBUTES: PlayerAttributes = Object.freeze({
  speed: 50,
  acceleration: 50,
  strength: 50,
  stamina: 50,
  agility: 50,
  jumping: 50,
  balance: 50,
});
