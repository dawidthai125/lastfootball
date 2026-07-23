/**
 * LFE-REPLAY-01 — presentation replay types (web).
 * No Engine / AI / MatchState mutation.
 */

import type { MatchCanvasReadModel } from '@/gameplay/canvas-host';

export type PlaybackSource = 'live' | 'replay';

export type ReplayStatus = 'idle' | 'playing' | 'paused' | 'stopped';

export type ReplaySpeed = 0.5 | 1 | 2 | 4;

export type ReplayFrame = {
  /** Monotonic sequence id (survives ring-buffer wrap). */
  readonly sequence: number;
  /** Wall-clock capture time (performance.now). */
  readonly recordedAtMs: number;
  /** Frozen read model for Canvas — never re-simulated. */
  readonly model: MatchCanvasReadModel;
};

export type ReplayView = {
  readonly source: PlaybackSource;
  readonly status: ReplayStatus;
  readonly index: number;
  readonly length: number;
  readonly speed: ReplaySpeed;
  readonly sequence: number | null;
  readonly tick: number | null;
};
