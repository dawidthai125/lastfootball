import { describe, expect, it } from 'vitest';

import { readPages } from '@/lib/supabase/read-pages';

describe('long lists', () => {
  const all = Array.from({ length: 2300 }, (_, i) => i);

  it('reads past the first 1000 rows', async () => {
    const rows = await readPages<number>(async (from, to) => ({
      data: all.slice(from, to + 1),
      error: null,
    }));
    expect(rows).toEqual(all);
  });

  it('is unknown when a part fails', async () => {
    const rows = await readPages<number>(async (from, to) =>
      from > 0 ? { data: null, error: {} } : { data: all.slice(from, to + 1), error: null },
    );
    expect(rows).toBeNull();
  });
});
