export type ScheduledJobId = number;

export type ScheduledJobCallback = (tick: number) => void;

export interface ScheduledJob {
  id: ScheduledJobId;
  dueTick: number;
  callback: ScheduledJobCallback;
  label?: string;
}

export interface Scheduler {
  /** Fire at an absolute tick index. */
  scheduleAtTick(dueTick: number, callback: ScheduledJobCallback, label?: string): ScheduledJobId;
  /** Fire after N ticks from now (currentTick + delay). */
  scheduleInTicks(
    delayTicks: number,
    callback: ScheduledJobCallback,
    label?: string,
  ): ScheduledJobId;
  /** Fire after wall-sim seconds (converted via ticksPerSecond). */
  scheduleInSeconds(
    seconds: number,
    callback: ScheduledJobCallback,
    label?: string,
  ): ScheduledJobId;
  /**
   * Fire after match-minutes of clock time.
   * EPIC-1: 1 match minute ≡ 60 sim seconds (configurable later).
   */
  scheduleInMatchMinutes(
    minutes: number,
    callback: ScheduledJobCallback,
    label?: string,
  ): ScheduledJobId;
  cancel(id: ScheduledJobId): boolean;
  /** Run all jobs due at or before currentTick (stable: ascending dueTick, then id). */
  runDue(currentTick: number): number;
  pending(): readonly ScheduledJob[];
  clear(): void;
}

export interface CreateSchedulerOptions {
  ticksPerSecond: number;
  /** Match minute length in sim seconds. Default 60. */
  matchMinuteSeconds?: number;
  getCurrentTick: () => number;
}

export function createScheduler(options: CreateSchedulerOptions): Scheduler {
  const matchMinuteSeconds = options.matchMinuteSeconds ?? 60;
  let nextId = 1;
  const jobs: ScheduledJob[] = [];

  function insert(job: ScheduledJob): ScheduledJobId {
    jobs.push(job);
    return job.id;
  }

  return {
    scheduleAtTick(dueTick, callback, label) {
      return insert({ id: nextId++, dueTick, callback, label });
    },
    scheduleInTicks(delayTicks, callback, label) {
      const dueTick = options.getCurrentTick() + Math.max(0, Math.floor(delayTicks));
      return insert({ id: nextId++, dueTick, callback, label });
    },
    scheduleInSeconds(seconds, callback, label) {
      const delayTicks = Math.round(seconds * options.ticksPerSecond);
      return this.scheduleInTicks(delayTicks, callback, label);
    },
    scheduleInMatchMinutes(minutes, callback, label) {
      return this.scheduleInSeconds(minutes * matchMinuteSeconds, callback, label);
    },
    cancel(id) {
      const idx = jobs.findIndex((j) => j.id === id);
      if (idx < 0) return false;
      jobs.splice(idx, 1);
      return true;
    },
    runDue(currentTick) {
      const due = jobs
        .filter((j) => j.dueTick <= currentTick)
        .sort((a, b) => a.dueTick - b.dueTick || a.id - b.id);
      let ran = 0;
      for (const job of due) {
        const idx = jobs.findIndex((j) => j.id === job.id);
        if (idx >= 0) jobs.splice(idx, 1);
        job.callback(currentTick);
        ran += 1;
      }
      return ran;
    },
    pending() {
      return jobs;
    },
    clear() {
      jobs.length = 0;
    },
  };
}
