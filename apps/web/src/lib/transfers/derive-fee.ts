/** Derived transfer fee — not persisted as market_value (LFE-TRANSFERS-01). */
export function deriveTransferFee(skill: number, age: number): number {
  const raw = skill * 2_000 + Math.max(0, 30 - age) * 1_500;
  return Math.max(25_000, Math.round(raw / 1_000) * 1_000);
}
