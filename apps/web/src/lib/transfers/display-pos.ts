/**
 * Transfer market display position (LFE-TRANSFERS-10 / D117).
 * Sole helper in lib/transfers — LO / ŚO → OB; else passthrough.
 */
export function displayPos(pos: string): string {
  if (pos === 'ŚO' || pos === 'LO') return 'OB';
  return pos;
}
