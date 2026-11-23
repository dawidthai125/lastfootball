import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Sole writer of `clubs.cash_balance` from app code (D127).
 * The database refuses cash writes from a player session, so callers authorise
 * the owner first and then come here. Every write is compare-and-set.
 */
export const CASH_STALE_ERROR = 'Kasa zmieniła się w tym czasie. Spróbuj ponownie.';

type CashDb = Pick<ReturnType<typeof createAdminClient>, 'from'>;

const CREDIT_ATTEMPTS = 5;

export type CashWrite = 'ok' | 'stale' | 'error';

/** Spend path: the decision was made on `expected`, so a changed balance is refused. */
export async function writeClubCash(
  input: {
    readonly clubId: string;
    readonly expected: number;
    readonly next: number;
    /** Columns that change in the same row, e.g. a stadium level. */
    readonly extra?: Readonly<Record<string, unknown>>;
  },
  db: CashDb = createAdminClient(),
): Promise<CashWrite> {
  const { data, error } = await db
    .from('clubs')
    .update({ ...input.extra, cash_balance: input.next } as never)
    .eq('id', input.clubId)
    .eq('cash_balance', input.expected)
    .select('id')
    .maybeSingle();
  if (error) return 'error';
  return data ? 'ok' : 'stale';
}

/**
 * Settlement path: re-reads and recomputes until the write lands.
 * Returns the balance that was written, or null when it never landed.
 */
export async function settleClubCash<T extends { readonly nextCash: number }>(
  clubId: string,
  compute: (cash: number) => T,
  db: CashDb = createAdminClient(),
): Promise<T | null> {
  for (let attempt = 0; attempt < CREDIT_ATTEMPTS; attempt += 1) {
    if (attempt > 0) await new Promise((done) => setTimeout(done, 60 * attempt));
    const { data, error } = await db
      .from('clubs')
      .select('cash_balance')
      .eq('id', clubId)
      .maybeSingle();
    if (error || !data) continue;
    const cash = (data as { cash_balance: number }).cash_balance;
    const result = compute(cash);
    const written = await writeClubCash({ clubId, expected: cash, next: result.nextCash }, db);
    if (written === 'ok') return result;
  }
  return null;
}

export async function creditClubCash(
  clubId: string,
  amount: number,
  db: CashDb = createAdminClient(),
): Promise<number | null> {
  const settled = await settleClubCash(clubId, (cash) => ({ nextCash: cash + amount }), db);
  return settled?.nextCash ?? null;
}
