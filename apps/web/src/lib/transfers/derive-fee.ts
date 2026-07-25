import { ECONOMY_THIN } from '@/lib/finance/types';

/** Derived transfer fee — not persisted as market_value (D20). Numbers = GDD §26. */
export function deriveTransferFee(skill: number, age: number): number {
  const { SKILL_MULT, AGE_BONUS, AGE_REF, FLOOR, ROUND } = ECONOMY_THIN.TRANSFER_FEE;
  const raw = skill * SKILL_MULT + Math.max(0, AGE_REF - age) * AGE_BONUS;
  return Math.max(FLOOR, Math.round(raw / ROUND) * ROUND);
}
