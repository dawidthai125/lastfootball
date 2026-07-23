/** Engine configuration — EPIC-1 foundation. */

export interface LfeConfig {
  /** Fixed simulation rate. Default: 20. */
  ticksPerSecond: number;
  /** Wall-clock step multiplier for interactive runs (does not change tick math). */
  timeScale: number;
  /** Retain N most recent snapshots for replay/debug. 0 = keep none in memory. */
  snapshotHistoryLimit: number;
  /** Minimum log level emitted by the engine logger. */
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent';
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
