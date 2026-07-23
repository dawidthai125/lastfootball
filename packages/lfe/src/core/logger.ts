export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

export interface LogRecord {
  level: Exclude<LogLevel, 'silent'>;
  message: string;
  tick?: number;
  data?: unknown;
  at: number;
}

export type LogSink = (record: LogRecord) => void;

export interface Logger {
  level: LogLevel;
  debug(message: string, data?: unknown, tick?: number): void;
  info(message: string, data?: unknown, tick?: number): void;
  warn(message: string, data?: unknown, tick?: number): void;
  error(message: string, data?: unknown, tick?: number): void;
  records(): readonly LogRecord[];
  clear(): void;
}

export function createLogger(level: LogLevel = 'warn', sink?: LogSink): Logger {
  const buffer: LogRecord[] = [];

  function write(lvl: Exclude<LogLevel, 'silent'>, message: string, data?: unknown, tick?: number) {
    if (LEVEL_RANK[lvl] < LEVEL_RANK[level]) return;
    const record: LogRecord = {
      level: lvl,
      message,
      at: Date.now(),
      ...(tick !== undefined ? { tick } : {}),
      ...(data !== undefined ? { data } : {}),
    };
    buffer.push(record);
    sink?.(record);
  }

  return {
    get level() {
      return level;
    },
    set level(next: LogLevel) {
      level = next;
    },
    debug: (m, d, t) => write('debug', m, d, t),
    info: (m, d, t) => write('info', m, d, t),
    warn: (m, d, t) => write('warn', m, d, t),
    error: (m, d, t) => write('error', m, d, t),
    records: () => buffer,
    clear: () => {
      buffer.length = 0;
    },
  };
}
