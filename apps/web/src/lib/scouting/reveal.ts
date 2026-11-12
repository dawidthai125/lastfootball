/** Paid scout report. Reveals a band label only — no player and no skill change. */

import { POTENTIAL_BAND_LABEL } from '@/lib/squad/potential';

export const SCOUT_REPORT_FEE = 2_000;

export type ScoutBand = 'low' | 'medium' | 'high' | 'elite';

const SCOUT_BANDS: readonly ScoutBand[] = ['low', 'medium', 'high', 'elite'];

function isScoutBand(value: unknown): value is ScoutBand {
  return SCOUT_BANDS.some((band) => band === value);
}

export function payForBand(input: {
  readonly cash: number;
  readonly alreadyRevealed: boolean;
  readonly band: ScoutBand;
}):
  | { ok: true; fee: number; cashAfter: number; band: ScoutBand; label: string }
  | { ok: false; reason: 'cash' | 'already' | 'band' } {
  if (input.alreadyRevealed) return { ok: false, reason: 'already' };
  if (!isScoutBand(input.band)) return { ok: false, reason: 'band' };
  if (!Number.isFinite(input.cash) || input.cash < SCOUT_REPORT_FEE) {
    return { ok: false, reason: 'cash' };
  }
  return {
    ok: true,
    fee: SCOUT_REPORT_FEE,
    cashAfter: input.cash - SCOUT_REPORT_FEE,
    band: input.band,
    label: POTENTIAL_BAND_LABEL[input.band],
  };
}
