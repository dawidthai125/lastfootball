import { afterEach, describe, expect, it, vi } from 'vitest';

const errors: Record<string, { code: string } | undefined> = {};

vi.mock('@/config/env', () => ({ env: { isSupabaseConfigured: true } }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: () => ({
      select: (columns: string) => {
        const key = [
          'recent_ratings',
          'senior_matches',
          'origin',
          'loan_until',
          'ai_offer_declined',
        ].find((c) => columns.includes(c));
        const error = key ? errors[key] : undefined;
        const row = {
          id: 'p-1',
          club_id: 'c',
          skill: 50,
          age: 20,
          status: 'READY',
          ...(key === 'senior_matches' ? { senior_matches: 12 } : {}),
          ...(key === 'origin' ? { origin: 'academy' } : {}),
          ...(key === 'ai_offer_declined' ? { ai_offer_declined: true } : {}),
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
  });

  it('is the old rule without the column, and no squad at all after a failed read', async () => {
    errors.senior_matches = { code: '42703' };
    const [older] = await listClubPlayers('c');
    expect(older).toMatchObject({ seniorMatches: 0 });
    errors.senior_matches = undefined;

    // A failed read must never pass for an empty club or for an older database.
    for (const key of ['recent_ratings', 'senior_matches', 'origin', 'loan_until']) {
      errors[key] = { code: '57014' };
      await expect(listClubPlayers('c')).rejects.toThrow('Nie udało się odczytać kadry');
      errors[key] = undefined;
    }
  });

  it('reads the rejected computer offer', async () => {
    expect((await listClubPlayers('c'))[0]!.aiOfferDeclined).toBe(true);
  });
});
