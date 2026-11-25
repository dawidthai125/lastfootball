/** Server only. A ledger row that belongs to cash that already moved. */

import { randomUUID } from 'node:crypto';

import { tryAdminClient } from '@/lib/supabase/admin';

export type LedgerRow = {
  readonly club_id: string;
  readonly category: string;
  readonly label: string;
  readonly amount: number;
};

/**
 * The cash is already moved, so a lost row is tried once more and then reported in the log.
 * Both tries carry one id: when only the first reply was lost, the second finds the row saved.
 */
export async function recordMovement(row: LedgerRow): Promise<boolean> {
  const admin = tryAdminClient();
  if (!admin) return false;
  const saved = { ...row, id: randomUUID() };
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { error } = await admin.from('finance_movements').insert(saved as never);
    if (!error || (attempt > 0 && error.code === '23505')) return true;
    if (attempt === 1) {
      console.error('finance movement not saved', {
        code: error.code,
        clubId: row.club_id,
        category: row.category,
        amount: row.amount,
      });
    }
  }
  return false;
}
