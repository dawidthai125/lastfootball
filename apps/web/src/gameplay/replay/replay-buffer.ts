/**
 * Ring buffer of MatchCanvasReadModel frames for Replay.
 * Append-only during LIVE; Replay Controller reads only.
 */

import type { MatchCanvasReadModel } from '@/gameplay/canvas-host';

import type { ReplayFrame } from './types';

export type ReplayBuffer = {
  readonly capacity: number;
  get length(): number;
  /** Absolute sequence of the newest frame, or -1 if empty. */
  get latestSequence(): number;
  append(model: MatchCanvasReadModel): ReplayFrame;
  /** Index in the current window: 0 = oldest retained, length-1 = newest. */
  at(index: number): ReplayFrame | null;
  clear(): void;
  /** Snapshot of current window (oldest → newest). */
  toArray(): readonly ReplayFrame[];
};

export type ReplayBufferOptions = {
  /** Max retained frames (ring). Default ~3 min at ~20 fps. */
  capacity?: number;
};

export function createReplayBuffer(options: ReplayBufferOptions = {}): ReplayBuffer {
  const capacity = Math.max(2, options.capacity ?? 3600);
  const frames: ReplayFrame[] = [];
  let nextSequence = 0;

  return {
    capacity,
    get length() {
      return frames.length;
    },
    get latestSequence() {
      return frames.length === 0 ? -1 : frames[frames.length - 1]!.sequence;
    },
    append(model) {
      const frame: ReplayFrame = Object.freeze({
        sequence: nextSequence++,
        recordedAtMs: typeof performance !== 'undefined' ? performance.now() : Date.now(),
        model: freezeReadModel(model),
      });
      if (frames.length >= capacity) {
        frames.shift();
      }
      frames.push(frame);
      return frame;
    },
    at(index) {
      if (index < 0 || index >= frames.length) return null;
      return frames[index] ?? null;
    },
    clear() {
      frames.length = 0;
    },
    toArray() {
      return frames.slice();
    },
  };
}

/** Shallow-freeze read model shell — MatchState from LFE is already immutable per tick. */
function freezeReadModel(model: MatchCanvasReadModel): MatchCanvasReadModel {
  return Object.freeze({
    matchId: model.matchId,
    matchState: model.matchState,
    spatial: model.spatial,
    tick: model.tick,
    events: Object.freeze([...model.events]),
  });
}
