/** Academy ceiling view. Hidden until a paid report; the report is a band, never a number. */

import { POTENTIAL_BAND_LABEL } from '@/lib/squad/potential';

const ALLOWED_BAND_LABELS: ReadonlySet<string> = new Set([
  POTENTIAL_BAND_LABEL.low,
  POTENTIAL_BAND_LABEL.medium,
  POTENTIAL_BAND_LABEL.high,
  POTENTIAL_BAND_LABEL.elite,
]);

const HIDDEN_LABEL = 'Sufit ukryty';

export function academyCeilingView(input: {
  readonly revealed: boolean;
  readonly bandLabel: string | null;
}): { readonly label: string; readonly hidden: boolean } {
  if (input.revealed !== true) return { label: HIDDEN_LABEL, hidden: true };
  if (typeof input.bandLabel !== 'string' || !ALLOWED_BAND_LABELS.has(input.bandLabel)) {
    return { label: HIDDEN_LABEL, hidden: true };
  }
  return { label: input.bandLabel, hidden: false };
}
