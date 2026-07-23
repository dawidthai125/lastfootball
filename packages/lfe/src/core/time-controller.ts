/**
 * Controls interactive pacing only.
 * Deterministic tick content is independent of wall clock / timeScale.
 */

export type TimeControllerStatus = 'running' | 'paused';

export interface TimeController {
  status: TimeControllerStatus;
  /** Multiplier for wall-clock catch-up (UI). Default 1. */
  timeScale: number;
  pause(): void;
  resume(): void;
  setTimeScale(scale: number): void;
  isPaused(): boolean;
}

export function createTimeController(initialScale = 1): TimeController {
  let status: TimeControllerStatus = 'running';
  let timeScale = initialScale;

  return {
    get status() {
      return status;
    },
    get timeScale() {
      return timeScale;
    },
    pause() {
      status = 'paused';
    },
    resume() {
      status = 'running';
    },
    setTimeScale(scale) {
      if (!(scale > 0) || !Number.isFinite(scale)) {
        throw new Error('TimeController.setTimeScale: scale must be a positive finite number');
      }
      timeScale = scale;
    },
    isPaused() {
      return status === 'paused';
    },
  };
}
