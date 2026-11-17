import { recallWage } from '@/lib/squad/loan';

export type LoanReconcileRow = {
  readonly id: string;
  readonly onLoan: boolean;
  readonly loanedIn: boolean;
  readonly loanUntil: string | null;
  readonly wage: number;
  readonly wageBank: number | null;
};

export type LoanReconcilePatch =
  | {
      readonly id: string;
      readonly kind: 'recall';
      readonly wage: number;
    }
  | {
      readonly id: string;
      readonly kind: 'return_in';
    };

/** Pure: rows whose loan_until is before today need clearing. */
export function reconcileExpiredLoans(
  rows: readonly LoanReconcileRow[],
  today: string,
): readonly LoanReconcilePatch[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return [];
  const patches: LoanReconcilePatch[] = [];
  for (const row of rows) {
    if (!row.loanUntil || row.loanUntil >= today) continue;
    if (row.onLoan) {
      patches.push({
        id: row.id,
        kind: 'recall',
        wage: recallWage(typeof row.wageBank === 'number' ? row.wageBank : -1, row.wage),
      });
      continue;
    }
    if (row.loanedIn) {
      patches.push({ id: row.id, kind: 'return_in' });
    }
  }
  return patches;
}
