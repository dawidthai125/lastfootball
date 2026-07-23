import type { PlayerId, PitchPoint, PitchSide } from './ids';

export type BallPossession = 'home' | 'away' | 'loose';

export type BallPhase = 'in_play' | 'out_of_play' | 'dead' | 'set_piece';

/**
 * Ball model — pose placeholders only.
 * Velocity / spin / collisions arrive with Physics epic.
 */
export interface Ball {
  readonly position: PitchPoint;
  readonly possession: BallPossession;
  readonly ownerPlayerId: PlayerId | null;
  readonly lastTouchPlayerId: PlayerId | null;
  readonly lastTouchSide: PitchSide | null;
  readonly phase: BallPhase;
}

export function createBall(partial?: Partial<Ball>): Ball {
  return Object.freeze({
    position: Object.freeze(partial?.position ?? { x: 52.5, y: 34 }),
    possession: partial?.possession ?? 'loose',
    ownerPlayerId: partial?.ownerPlayerId ?? null,
    lastTouchPlayerId: partial?.lastTouchPlayerId ?? null,
    lastTouchSide: partial?.lastTouchSide ?? null,
    phase: partial?.phase ?? 'dead',
  });
}
