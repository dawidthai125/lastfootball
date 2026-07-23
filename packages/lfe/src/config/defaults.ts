import type { LfeConfig } from './types';

export const DEFAULT_LFE_CONFIG: Readonly<LfeConfig> = Object.freeze({
  ticksPerSecond: 20,
  timeScale: 1,
  snapshotHistoryLimit: 120,
  logLevel: 'warn',
});

/** Fixed delta time in milliseconds for one simulation tick. */
export function tickDurationMs(ticksPerSecond: number): number {
  return 1000 / ticksPerSecond;
}
