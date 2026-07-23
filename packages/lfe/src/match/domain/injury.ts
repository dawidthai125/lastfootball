import type { PlayerId, PitchSide } from './ids';

export type InjurySeverity = 'knock' | 'minor' | 'serious';

export interface Injury {
  readonly id: string;
  readonly playerId: PlayerId;
  readonly side: PitchSide;
  readonly severity: InjurySeverity;
  readonly matchMinute: number;
  readonly tick: number;
  readonly description: string;
  /** Player forced off. */
  readonly forcedOff: boolean;
}
