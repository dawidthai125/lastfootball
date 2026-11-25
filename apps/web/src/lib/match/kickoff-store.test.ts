import { beforeEach, describe, expect, it, vi } from 'vitest';

const tables: Record<string, Record<string, unknown> | null> = {};
let deleted = 0;

vi.mock('@/lib/supabase/admin', () => ({
  tryAdminClient: () => ({
    from: (table: string) => {
      const chain = {
        select: () => chain,
        eq: () => chain,
        maybeSingle: async () => ({ data: tables[table] ?? null, error: null }),
        delete: () => {
          deleted += 1;
          return chain;
        },
        update: () => chain,
        then: (done: (value: unknown) => unknown) => done({ error: null }),
      };
      return chain;
    },
  }),
}));

import { enterMatch, playsInOpenMatch } from '@/lib/match/kickoff-store';

const squad = Array.from({ length: 13 }, (_, i) => ({ id: `p${i}`, name: `P${i}` }));

beforeEach(() => {
  deleted = 0;
  tables.fixtures = { status: 'upcoming' };
  tables.match_kickoffs = {
    fixture_id: 'f1',
    started_at: new Date().toISOString(),
    progress_tick: 1700,
    manager_log: [],
    snapshot: {
      club: { id: 'c1' },
      fixture: { id: 'f1' },
      ourXi: squad.slice(0, 11),
      ourBench: squad.slice(11, 12),
      formation: '4-4-2',
    },
  };
});

describe('a match that went on', () => {
  it('resumes when a bench player is on loan', async () => {
    const seniors = squad.map((p) => ({ ...p, onLoan: p.id === 'p11' }));
    expect(await enterMatch('c1', 'f1', seniors)).toMatchObject({ kind: 'resume', tick: 1700 });
    expect(deleted).toBe(0);
  });

  it('is dropped only when a player left the club', async () => {
    const seniors = squad.filter((p) => p.id !== 'p11');
    expect(await enterMatch('c1', 'f1', seniors)).toEqual({ kind: 'new' });
    expect(deleted).toBe(1);
  });

  it('keeps its players until it is finished', async () => {
    expect(await playsInOpenMatch('c1', 'p0')).toBe(true);
    expect(await playsInOpenMatch('c1', 'p11')).toBe(true);
    expect(await playsInOpenMatch('c1', 'p12')).toBe(false);
    tables.fixtures = { status: 'played' };
    expect(await playsInOpenMatch('c1', 'p0')).toBe(false);
    tables.match_kickoffs = null;
    expect(await playsInOpenMatch('c1', 'p0')).toBe(false);
  });
});
