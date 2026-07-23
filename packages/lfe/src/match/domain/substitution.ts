import type { PlayerId, PitchSide } from './ids';

export type SubstitutionReason = 'tactical' | 'injury' | 'other';

/**
 * Record of a completed or pending substitution — data only.
 * Application rules live in a later epic.
 */
export interface Substitution {
  readonly id: string;
  readonly side: PitchSide;
  readonly playerOutId: PlayerId;
  readonly playerInId: PlayerId;
  /** Match clock minute when issued (design field). */
  readonly matchMinute: number;
  /** Tick when recorded (replay sync). */
  readonly tick: number;
  readonly reason: SubstitutionReason;
  readonly completed: boolean;
}
