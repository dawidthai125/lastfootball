import { describe, expect, it, vi } from 'vitest';

let broken = '';

vi.mock('@/config/env', () => ({
  env: { isSupabaseConfigured: true, supabaseServiceRoleKey: 'key' },
}));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    rpc: async () => ({
      data: {
        leagues: 1,
        clubs: 1,
        league: {
          id: 1,
          season_key: '2026-12-01',
          season_number: 1,
          cycle: 1,
          frozen: true,
          seats: Array.from({ length: 12 }, (_, slot) => ({
            slot,
            kind: slot === 0 ? 'human' : 'bot',
            id: slot === 0 ? 'c1' : `bot-${slot}`,
            name: `Klub ${slot}`,
            shortName: 'KLU',
          })),
        },
      },
      error: null,
    }),
    from: (table: string) => {
      const chain = {
        select: () => chain,
        eq: () => chain,
        not: () => chain,
        then: (done: (value: unknown) => unknown) =>
          done(
            table === broken ? { data: null, error: { message: 'x' } } : { data: [], error: null },
          ),
      };
      return chain;
    },
  }),
}));

import type { ClubDto } from '@/lib/club/types';
import { loadHumanLeagueCard } from '@/lib/league/human-league-store';

describe('human league card', () => {
  it('says so when results or played rounds could not be read', async () => {
    for (const table of ['human_broadcasts', 'fixtures']) {
      broken = table;
      const card = await loadHumanLeagueCard(
        { id: 'c1' } as ClubDto,
        new Date('2026-11-30T12:00:00Z'),
      );
      expect(card).toMatchObject({ round: null, fixtureId: null, standings: [] });
      expect(card.note).toContain('Nie udało się wczytać');
    }
    broken = '';
    const card = await loadHumanLeagueCard(
      { id: 'c1' } as ClubDto,
      new Date('2026-11-30T12:00:00Z'),
    );
    expect(card.standings).toHaveLength(12);
  });
});
