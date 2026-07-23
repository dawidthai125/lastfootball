import type { Rating } from './ids';

export interface Referee {
  readonly id: string;
  readonly name: string;
  /** Higher = more cards (0–100). */
  readonly strictness: Rating;
  readonly consistency: Rating;
}

export function createReferee(partial?: Partial<Referee>): Referee {
  return Object.freeze({
    id: partial?.id ?? 'ref-default',
    name: partial?.name ?? 'Referee',
    strictness: partial?.strictness ?? 50,
    consistency: partial?.consistency ?? 50,
  });
}
