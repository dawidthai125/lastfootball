import { describe, expect, it } from 'vitest';

import { retryDeadlock } from '@/lib/supabase/retry-deadlock';

async function callsFor(...codes: (string | null)[]) {
  let calls = 0;
  const reply = await retryDeadlock(async () => {
    const code = codes[calls] ?? null;
    calls += 1;
    return { error: code ? { code } : null };
  });
  return { calls, code: reply.error?.code ?? null };
}

describe('retryDeadlock', () => {
  it('repeats a deadlock once and nothing else', async () => {
    expect(await callsFor(null)).toEqual({ calls: 1, code: null });
    expect(await callsFor('40P01')).toEqual({ calls: 2, code: null });
    expect(await callsFor('40P01', '40P01')).toEqual({ calls: 2, code: '40P01' });
    expect(await callsFor('LFOLD')).toEqual({ calls: 1, code: 'LFOLD' });
  });
});
