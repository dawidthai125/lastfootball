import { tryAdminClient } from '@/lib/supabase/admin';

/**
 * Sole app writer of `clubs.cash_balance` outside SQL functions (D127).
 * The database refuses cash writes from a player session, so callers authorise
 * the owner first and then come here. Every write is compare-and-set.
 */
export const CASH_STALE_ERROR = 'Kasa zmieniła się w tym czasie. Spróbuj ponownie.';

type CashDb = Pick<NonNullable<ReturnType<typeof tryAdminClient>>, 'from'>;

const CREDIT_ATTEMPTS = 5;

export type CashWrite = 'ok' | 'stale' | 'error';

async function readCash(clubId: string, db: CashDb): Promise<number | null> {
  const { data, error } = await db
    .from('clubs')
    .select('cash_balance')
    .eq('id', clubId)
    .maybeSingle();
  return error || !data ? null : (data as { cash_balance: number }).cash_balance;
}

/** Spend path: the decision was made on `expected`, so a changed balance is refused. */
export async function writeClubCash(
  input: {
    readonly clubId: string;
    readonly expected: number;
    readonly next: number;
    /** Columns that change in the same row, e.g. a stadium level. */
    readonly extra?: Readonly<Record<string, unknown>>;
  },
  db: CashDb | null = tryAdminClient(),
): Promise<CashWrite> {
  if (!db) return 'error';
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
 * Income path: re-reads and adds until the write lands. Returns the new balance or null.
 * Only a refused write is repeated. An errored one may have landed, so it is checked first
 * and never blindly paid again.
 */
export async function creditClubCash(
  clubId: string,
  amount: number,
  db: CashDb | null = tryAdminClient(),
): Promise<number | null> {
  if (!db) return null;
  for (let attempt = 0; attempt < CREDIT_ATTEMPTS; attempt += 1) {
    if (attempt > 0) await new Promise((done) => setTimeout(done, 60 * attempt));
    const cash = await readCash(clubId, db);
    if (cash == null) continue;
    const next = cash + amount;
    const written = await writeClubCash({ clubId, expected: cash, next }, db);
    if (written === 'ok') return next;
    if (written === 'error') return (await readCash(clubId, db)) === next ? next : null;
  }
  return null;
}
