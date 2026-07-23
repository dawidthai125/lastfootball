/**
 * Replay Controller — play / pause / stop / seek / speed.
 * Presents recorded MatchCanvasReadModel only. Never calls Match Engine.
 */

import type { MatchCanvasReadModel } from '@/gameplay/canvas-host';

import type { ReplayBuffer } from './replay-buffer';
import type { ReplaySpeed, ReplayStatus } from './types';

export type ReplayController = {
  play(): void;
  pause(): void;
  stop(): void;
  seek(index: number): void;
  seekRatio(ratio: number): void;
  setSpeed(speed: ReplaySpeed): void;
  getStatus(): ReplayStatus;
  getIndex(): number;
  getSpeed(): ReplaySpeed;
  getLength(): number;
  getCurrentModel(): MatchCanvasReadModel | null;
  subscribe(listener: () => void): () => void;
  dispose(): void;
};

export type ReplayControllerOptions = {
  /** Present a recorded frame to Canvas (no Engine). */
  onPresent: (model: MatchCanvasReadModel) => void;
  onChange?: () => void;
  /** Interval at 1× speed (ms). Matches live pulse cadence. */
  baseIntervalMs?: number;
};

export function createReplayController(
  buffer: ReplayBuffer,
  options: ReplayControllerOptions,
): ReplayController {
  const baseIntervalMs = options.baseIntervalMs ?? 50;
  let status: ReplayStatus = 'idle';
  let index = 0;
  let speed: ReplaySpeed = 1;
  let timer: ReturnType<typeof setInterval> | null = null;
  const listeners = new Set<() => void>();

  function notify() {
    options.onChange?.();
    for (const l of listeners) l();
  }

  function presentCurrent() {
    const frame = buffer.at(index);
    if (frame) options.onPresent(frame.model);
  }

  function clearTimer() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function armTimer() {
    clearTimer();
    if (status !== 'playing') return;
    const ms = Math.max(16, Math.round(baseIntervalMs / speed));
    timer = setInterval(() => {
      if (buffer.length === 0) {
        status = 'stopped';
        clearTimer();
        notify();
        return;
      }
      if (index >= buffer.length - 1) {
        status = 'paused';
        clearTimer();
        notify();
        return;
      }
      index += 1;
      presentCurrent();
      notify();
    }, ms);
  }

  return {
    play() {
      if (buffer.length === 0) return;
      if (index >= buffer.length - 1) {
        index = 0;
      }
      status = 'playing';
      presentCurrent();
      armTimer();
      notify();
    },
    pause() {
      if (status !== 'playing') return;
      status = 'paused';
      clearTimer();
      notify();
    },
    stop() {
      clearTimer();
      status = 'stopped';
      index = 0;
      presentCurrent();
      notify();
    },
    seek(nextIndex) {
      if (buffer.length === 0) {
        index = 0;
        notify();
        return;
      }
      index = clampInt(nextIndex, 0, buffer.length - 1);
      presentCurrent();
      notify();
    },
    seekRatio(ratio) {
      if (buffer.length <= 1) {
        this.seek(0);
        return;
      }
      const r = Math.min(1, Math.max(0, ratio));
      this.seek(Math.round(r * (buffer.length - 1)));
    },
    setSpeed(next) {
      speed = next;
      if (status === 'playing') armTimer();
      notify();
    },
    getStatus() {
      return status;
    },
    getIndex() {
      return index;
    },
    getSpeed() {
      return speed;
    },
    getLength() {
      return buffer.length;
    },
    getCurrentModel() {
      return buffer.at(index)?.model ?? null;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      clearTimer();
      listeners.clear();
      status = 'idle';
    },
  };
}

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.floor(n)));
}
