import type { PlayerStatus } from '@/lib/squad/types';

/** Energy a player regains every night since the last match or training. */
export const REST_PER_DAY = 5;
const REST_READY_AT = 60;

function dayNumber(date: string): number | null {
  const ms = Date.parse(`${date.slice(0, 10)}T00:00:00Z`);
  return Number.isFinite(ms) ? Math.floor(ms / 86_400_000) : null;
}

/**
 * Pure rest derive. `energyOn` is stamped by the database on every energy write,
 * so saving the rested value starts the next count from that day.
 */
export function restedEnergy(energy: number, energyOn: string | null | undefined, today: string) {
  if (!energyOn) return energy;
  const from = dayNumber(energyOn);
  const to = dayNumber(today);
  if (from == null || to == null || to <= from) return energy;
  return Math.min(100, Math.max(energy, energy + (to - from) * REST_PER_DAY));
}

/** Only rest clears tiredness, so training on the same day still tires. Injuries and bans stay. */
export function restedStatus(status: PlayerStatus, stored: number, rested: number): PlayerStatus {
  return status === 'TIRED' && rested > stored && rested >= REST_READY_AT ? 'READY' : status;
}

export type Absence = {
  readonly status: PlayerStatus;
  readonly injuryMatches: number;
  readonly suspensionMatches: number;
};

/**
 * An injury or a ban also gets shorter by one for each full day without a match of the club.
 * `absenceOn` is the day of the last match save (or of the last change), stamped by the database;
 * that match counted for its own day, so only the days after it and before today count here.
 * Same rule in SQL: lf_status_today.
 */
export function servedAbsence(
  absence: Absence,
  absenceOn: string | null | undefined,
  today: string,
): Absence {
  const { status } = absence;
  if (!absenceOn || (status !== 'INJURED' && status !== 'SUSPENDED')) return absence;
  const from = dayNumber(absenceOn);
  const to = dayNumber(today);
  if (from == null || to == null) return absence;
  let days = Math.max(0, to - from - 1);
  if (days === 0) return absence;

  let { injuryMatches, suspensionMatches } = absence;
  if (status === 'INJURED') {
    const missed = Math.max(1, injuryMatches);
    if (days < missed) return { ...absence, injuryMatches: missed - days };
    days -= missed;
    injuryMatches = 0;
    suspensionMatches = Math.max(0, suspensionMatches - days);
  } else {
    suspensionMatches = Math.max(0, Math.max(1, suspensionMatches) - days);
  }
  return {
    status: suspensionMatches > 0 ? 'SUSPENDED' : 'READY',
    injuryMatches,
    suspensionMatches,
  };
}
