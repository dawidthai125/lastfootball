import { formatMoney } from '@/lib/finance/format-money';
import { ECONOMY_THIN, type FinanceMovementDto } from '@/lib/finance/types';

export const WAGES_LABEL = 'Pensje kolejki';
export const WAGES_SHORT_LABEL = 'Pensje kolejki niepełne, zabrakło';

const ARREARS_NOTE = 'Kasa nie pokryła pensji za ostatni mecz. Morale kadry spadło.';

/** 0 when paid in full, else -1..-UNPAID_WAGE_MORALE_MAX by the unpaid share. */
export function unpaidWageMoraleDelta(due: number, paid: number): number {
  if (!Number.isFinite(due) || due <= 0) return 0;
  const covered = Number.isFinite(paid) ? Math.max(0, Math.min(due, paid)) : 0;
  const unpaid = due - covered;
  if (unpaid === 0) return 0;
  return -Math.ceil((ECONOMY_THIN.UNPAID_WAGE_MORALE_MAX * unpaid) / due);
}

/** Unpaid wages win over the runway warning. A full payment clears the first one. */
export function resolveWageNote(input: {
  readonly cash: number;
  readonly nextWage: number;
  readonly movements: readonly FinanceMovementDto[];
}): string | null {
  const last = input.movements
    .filter((m) => m.category === 'wages')
    .reduce<FinanceMovementDto | null>(
      (latest, m) => (latest == null || m.createdAt > latest.createdAt ? m : latest),
      null,
    );
  if (last?.label.startsWith(WAGES_SHORT_LABEL)) return ARREARS_NOTE;
  if (input.nextWage > 0 && input.cash < input.nextWage * ECONOMY_THIN.WAGE_WARNING_MATCHES) {
    return `Kasy starczy na mniej niż ${ECONOMY_THIN.WAGE_WARNING_MATCHES} mecze pensji (${formatMoney(input.nextWage)} za mecz).`;
  }
  return null;
}
