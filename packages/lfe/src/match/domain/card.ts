import type { PlayerId, PitchSide } from './ids';

export type CardType = 'yellow' | 'second_yellow' | 'red';

export interface Card {
  readonly id: string;
  readonly type: CardType;
  readonly playerId: PlayerId;
  readonly side: PitchSide;
  readonly matchMinute: number;
  readonly tick: number;
  readonly reason: string;
}
