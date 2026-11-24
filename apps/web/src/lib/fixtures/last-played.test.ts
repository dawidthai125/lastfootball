import { describe, expect, it } from 'vitest';

import { archivedLastPlayed, lastPlayedOf, laterOf } from '@/lib/fixtures/last-played';
import type { FixtureDto } from '@/lib/fixtures/types';

const MATCH = '2026-12-01T17:00:00+00:00';
const CHALLENGE = '2026-12-01T18:00:00+00:00';

function database(error: { message: string } | null = null) {
  return {
    from: (table: string) => {
      const chain = {
        select: () => chain,
        eq: () => chain,
        in: () => chain,
        order: () => chain,
        limit: async () => ({
          data: error ? null : [{ played_at: table === 'club_matches' ? MATCH : CHALLENGE }],
          error,
        }),
      };
      return chain;
    },
  } as never;
}

describe('last played', () => {
  it('keeps the day of a match whose fixture the season start deleted', async () => {
    expect(await lastPlayedOf(database(), 'c1', [])).toEqual({
      match: MATCH,
      challenge: CHALLENGE,
    });
  });

  it('takes the later of the fixtures and the archive', async () => {
    const later = '2026-12-02T10:00:00Z';
    const fixture = { status: 'played', competition: 'league', playedAt: later } as FixtureDto;
    expect((await lastPlayedOf(database(), 'c1', [fixture])).match).toBe(later);
    expect(laterOf(null, MATCH)).toBe(MATCH);
    expect(laterOf(null, null)).toBeNull();
  });

  it('tells a failed read from no match', async () => {
    expect(await archivedLastPlayed(database({ message: 'x' }), 'c1')).toBeNull();
    expect(await lastPlayedOf(database({ message: 'x' }), 'c1', [])).toEqual({
      match: null,
      challenge: null,
    });
  });
});
