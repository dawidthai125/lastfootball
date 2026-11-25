import { beforeEach, describe, expect, it, vi } from 'vitest';

const updates: unknown[] = [];
let count: { count: number | null; error: { message: string } | null };

vi.mock('@/lib/supabase/admin', () => ({
  tryAdminClient: () => ({
    from: () => ({
      update: (patch: unknown) => {
        updates.push(patch);
        return { eq: async () => ({ error: null }) };
      },
    }),
  }),
}));

import { ensureTransferWindow } from '@/lib/transfers/ensure-window';

const session = {
  from: (table: string) => {
    const club = { season_number: 2, season_phase: 'in_season', transfer_window_open: false };
    const chain = {
      select: () => chain,
      eq: () => chain,
      maybeSingle: async () => ({ data: club, error: null }),
      then: (done: (value: unknown) => unknown) => done(table === 'fixtures' ? count : null),
    };
    return chain;
  },
} as never;

beforeEach(() => {
  updates.length = 0;
});

describe('ensureTransferWindow', () => {
  it('leaves the window alone when the matches could not be read', async () => {
    count = { count: null, error: { message: 'timeout' } };
    await ensureTransferWindow(session, 'c1');
    expect(updates).toEqual([]);
  });

  it('opens it at the start of a season', async () => {
    count = { count: 0, error: null };
    await ensureTransferWindow(session, 'c1');
    expect(updates).toEqual([{ transfer_window_open: true }]);
  });
});
