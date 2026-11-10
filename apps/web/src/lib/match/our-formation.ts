import type { FormationCode } from '@lastfootball/lfe';

/** The two shapes a manager can lock before kick-off. Anything else stays 4-4-2. */
export function parseOurFormation(raw: string | string[] | undefined | null): FormationCode {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === '4-3-3' ? '4-3-3' : '4-4-2';
}
