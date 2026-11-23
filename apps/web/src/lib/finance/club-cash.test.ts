import { describe, expect, it } from 'vitest';

import { creditClubCash, writeClubCash } from '@/lib/finance/club-cash';

/** In-memory clubs row. `before` runs ahead of each update, like a parallel request. */
function fakeDb(
  row: { cash_balance: number; [key: string]: unknown },
  before?: () => void,
  lostReply = false,
) {
  const db = {
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: { ...row }, error: null }) }),
      }),
      update: (patch: Record<string, unknown>) => {
        const filters: Record<string, unknown> = {};
        const chain = {
          eq(column: string, value: unknown) {
            filters[column] = value;
            return chain;
          },
          select: () => chain,
          maybeSingle: async () => {
            before?.();
            if (row.cash_balance !== filters.cash_balance) return { data: null, error: null };
            Object.assign(row, patch);
            return lostReply
              ? { data: null, error: { message: 'reset' } }
              : { data: { id: 'c1' }, error: null };
          },
        };
        return chain;
      },
    }),
  };
  return db as never;
}

describe('club cash', () => {
  it('refuses a spend decided on an old balance and changes nothing', async () => {
    const row = { cash_balance: 90_000, stands_level: 0 };
    const result = await writeClubCash(
      { clubId: 'c1', expected: 100_000, next: 60_000, extra: { stands_level: 1 } },
      fakeDb(row),
    );
    expect(result).toBe('stale');
    expect(row).toEqual({ cash_balance: 90_000, stands_level: 0 });
  });

  it('keeps a parallel transfer when a match settles at the same time', async () => {
    const row = { cash_balance: 100_000 };
    let parallel = 1;
    const db = fakeDb(row, () => {
      if (parallel-- > 0) row.cash_balance -= 25_000;
    });
    expect(await creditClubCash('c1', 13_000, db)).toBe(88_000);
    expect(row.cash_balance).toBe(88_000);
  });

  it('does not pay twice when a landed write reports an error', async () => {
    const row = { cash_balance: 100 };
    const db = fakeDb(row, undefined, true);
    expect(await creditClubCash('c1', 50, db)).toBe(150);
    expect(row.cash_balance).toBe(150);
  });

  it('reports an error without a server key', async () => {
    expect(await writeClubCash({ clubId: 'c1', expected: 1, next: 2 }, null)).toBe('error');
    expect(await creditClubCash('c1', 1, null)).toBeNull();
  });

  it('gives up instead of overwriting', async () => {
    const row = { cash_balance: 10 };
    const db = fakeDb(row, () => {
      row.cash_balance += 1;
    });
    expect(await creditClubCash('c1', 100, db)).toBeNull();
    expect(row.cash_balance).toBe(15);
  });
});
