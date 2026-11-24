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
