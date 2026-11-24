import { utcDateString } from '@/lib/fixtures/played-unlock';

const CARRY_OVER_MINUTES = 45;

/**
 * Squad energy depends on the day (rest). A match watched over UTC midnight is replayed
 * with the day it started on; at any other time the claim is ignored.
 */
export function kickoffDay(claimed: unknown, now: Date = new Date()): string {
  const today = utcDateString(now);
  if (typeof claimed !== 'string' || claimed === today) return today;
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const yesterday = utcDateString(new Date(now.getTime() - 86_400_000));
  return claimed === yesterday && minutes < CARRY_OVER_MINUTES ? yesterday : today;
}
