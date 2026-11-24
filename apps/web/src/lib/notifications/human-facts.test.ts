import { describe, expect, it } from 'vitest';

import { humanFixtureMatchday } from '@/lib/league/human-league';
import { loadHumanFacts } from '@/lib/notifications/store';

// 17:20 in Warsaw.
const NOW = new Date('2026-12-10T16:20:00Z');
const PAGE = 1000;

function database(league: { season_key: string; frozen: boolean }, played: number) {
  const fixtures = Array.from({ length: played }, (_, i) => ({
    club_id: 'c1',
    matchday: humanFixtureMatchday((i % 22) + 1, 2),
    played_at: i === played - 1 ? '2026-12-10T10:00:00Z' : '2026-12-01T10:00:00Z',
  }));
  const asked: Record<string, unknown>[] = [];
  const db = {
    from: (table: string) => {
      const query: Record<string, unknown> = { table };
      asked.push(query);
      const all =
        table === 'human_league'
          ? [{ id: 1, season_number: 2, ...league }]
          : table === 'human_league_seats'
            ? [{ ref_id: 'c1', league_id: 1 }]
            : fixtures;
      let data: unknown[] = all.slice(0, PAGE);
      const chain = {
        select: () => chain,
        eq: () => chain,
        in: () => chain,
        order: () => chain,
        gte: (column: string, value: unknown) => {
          query[column] = value;
          return chain;
        },
        range: (from: number, to: number) => {
          data = all.slice(from, to + 1);
          return chain;
        },
        then: (done: (value: unknown) => unknown) => done({ data, error: null }),
      };
      return chain;
    },
  };
  return { db: db as never, asked };
}

describe('facts of the human round letter', () => {
  it('reads past the first thousand rounds, of this season on', async () => {
    const { db, asked } = database({ season_key: '2026-12-01', frozen: true }, PAGE + 5);
    const facts = await loadHumanFacts(db, ['c1'], NOW);
    expect(facts?.playedByClub.get('c1')?.rounds).toHaveLength(PAGE + 5);
    expect(facts?.playedByClub.get('c1')?.playedAt).toContain('2026-12-10T10:00:00Z');
    expect(asked.at(-1)).toMatchObject({ matchday: humanFixtureMatchday(1, 2) });
  });

  it('writes about no round of a league that has not started', async () => {
    const waiting = database({ season_key: '2026-12-09', frozen: false }, 0);
    expect(await loadHumanFacts(waiting.db, ['c1'], NOW)).toBeNull();
    const today = database({ season_key: '2026-12-10', frozen: false }, 0);
    expect((await loadHumanFacts(today.db, ['c1'], NOW))?.playedByClub.get('c1')).toMatchObject({
      seasonKey: '2026-12-10',
    });
  });
});
