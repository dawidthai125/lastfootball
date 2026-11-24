import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recordMovement } from '@/lib/finance/record-movement';

const insert = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase/admin', () => ({
  tryAdminClient: () => ({ from: () => ({ insert }) }),
}));

const row = { club_id: 'c1', category: 'coach_hire', label: 'Trener', amount: -8000 };

describe('recordMovement', () => {
  beforeEach(() => {
    insert.mockReset();
  });

  it('keeps one row when only the reply of the first try was lost', async () => {
    const ids = new Set<string>();
    insert.mockImplementation(async (saved: { id: string }) => {
      const taken = ids.has(saved.id);
      ids.add(saved.id);
      return { error: taken ? { code: '23505' } : { code: 'XX001' } };
    });
    expect(await recordMovement(row)).toBe(true);
    expect(ids.size).toBe(1);
  });

  it('does not call a refused first try saved', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    insert
      .mockResolvedValueOnce({ error: { code: '23505' } })
      .mockResolvedValueOnce({ error: { code: 'XX000' } });
    expect(await recordMovement(row)).toBe(false);
  });
});
