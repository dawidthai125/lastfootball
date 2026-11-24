import { afterEach, describe, expect, it, vi } from 'vitest';

const errors: Record<string, { code: string } | undefined> = {};

vi.mock('@/config/env', () => ({ env: { isSupabaseConfigured: true } }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: () => ({
      select: (columns: string) => {
        const key = ['senior_matches', 'origin', 'loan_until'].find((c) => columns.includes(c));
        const error = key ? errors[key] : undefined;
        const row = {
          id: 'p-1',
          club_id: 'c',
          skill: 50,
          age: 20,
          status: 'READY',
          ...(key === 'senior_matches' ? { senior_matches: 12 } : {}),
          ...(key === 'origin' ? { origin: 'academy' } : {}),
        };
        const answer = error ? { data: null, error } : { data: [row], error: null };
        const chain = {
          eq: () => chain,
          is: () => chain,
          order: () => chain,
          then: (ok: (v: unknown) => unknown) => Promise.resolve(answer).then(ok),
        };
        return chain;
      },
    }),
  }),
}));

import { listClubPlayers } from '@/lib/squad/get-players';

afterEach(() => {
  for (const key of Object.keys(errors)) delete errors[key];
});

describe('sale facts of the squad (D134)', () => {
  it('reads origin and senior matches', async () => {
    const [player] = await listClubPlayers('c');
    expect(player).toMatchObject({ origin: 'academy', seniorMatches: 12 });
    expect(player!.saleUnknown).toBeUndefined();
  });

  it('is the old rule without the column, and no sale after a failed read', async () => {
    errors.senior_matches = { code: '42703' };
    const [older] = await listClubPlayers('c');
    expect(older).toMatchObject({ seniorMatches: 0 });
    expect(older!.saleUnknown).toBeUndefined();

    for (const key of ['senior_matches', 'origin']) {
      errors.senior_matches = undefined;
      errors[key] = { code: '57014' };
      expect((await listClubPlayers('c'))[0]!.saleUnknown).toBe(true);
      errors[key] = undefined;
    }
  });
});
