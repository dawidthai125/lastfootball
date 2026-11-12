/**
 * Presentation types for Match Canvas Renderer — no Engine / AI imports.
 */

export type CanvasViewMode = 'tactical' | 'formation' | 'pressing' | 'balance' | string;

/** LIVE = simulation feed; REPLAY = recorded MatchCanvasReadModel only. */
export type CanvasPlaybackMode = 'live' | 'replay';

/** World metres on pitch (EPIC-7 coordinate space). */
export type VisualPoint = {
  readonly x: number;
  readonly y: number;
};

export type VisualPlayer = VisualPoint & {
  readonly playerId: string;
  readonly side: 'home' | 'away';
  readonly role: string;
  readonly shirtNumber: number;
  /** Radians. 0 attacks toward +x. */
  readonly facing: number;
};

export type VisualFxKind =
  'MATCH_START' | 'GOAL' | 'SHOT' | 'FOUL' | 'CORNER' | 'SUBSTITUTION' | 'HALF_END' | 'MATCH_END';

export type VisualFx = {
  readonly kind: VisualFxKind;
  readonly side?: string;
  readonly tick: number;
};

export type VisualFrame = {
  readonly tick: number;
  readonly phase: string;
  readonly pitchLength: number;
  readonly pitchWidth: number;
  readonly players: readonly VisualPlayer[];
  readonly ball: VisualPoint;
  /** Player the ball is going to. Null during a restart or a shot. */
  readonly ballOwnerId: string | null;
  /** Referee pose. Null when an old snapshot has no official. */
  readonly referee: VisualPoint | null;
  readonly fx: VisualFx | null;
};
