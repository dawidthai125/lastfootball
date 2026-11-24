import { describe, expect, it, vi } from 'vitest';

import { resolveBoardState } from '@/lib/board/board-state';
import { closeBoardSeason } from '@/lib/board/close-board-season';
import { loadBoardRecords, payBoardTask, type BoardWriteDb } from '@/lib/board/store';
import type { FixtureDto } from '@/lib/fixtures/types';
import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';

const club = {
  id: 'club-x',
  name: 'Klub',
  shortName: 'KLB',
  leagueTier: 'iv' as const,
  seasonNumber: 1,
};

const fixtures = planClubFixtures(club.id).map((p): FixtureDto => ({
  id: `f${p.matchday}`,
  clubId: club.id,
  matchday: p.matchday,
  competition: 'league',
  opponentClubId: p.opponentClubId,
  opponent: { id: p.opponentClubId, name: 'O', shortName: 'O' } as FixtureDto['opponent'],
  isHome: p.isHome,
  status: 'played',
  homeScore: p.isHome ? 3 : 0,
  awayScore: p.isHome ? 0 : 3,
  playedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
}));

type Failure = 'missing' | 'broken' | 'rpc' | 'history';

/** Tables in memory; `claim_board_task` as in the migration. */
function fakeDb(failure?: Failure) {
  const history: Record<string, unknown>[] = [];
  const claims: { season_number: number; block: number; amount: number }[] = [];
  const state = { failure, cash: 0, ledger: 0, calls: [] as string[] };
  const readError = () =>
    state.failure === 'missing'
      ? { code: 'PGRST205' }
      : state.failure === 'broken'
        ? { code: '57014' }
        : null;
  const db = {
    from(table: string) {
      const rows = table === 'club_season_history' ? history : claims;
      const query = {
        select: () => query,
        eq: () => query,
        order: () => query,
        limit: async () => {
          const error = readError();
          return { data: error ? null : rows.map((row) => ({ ...row })), error };
        },
        upsert: async (row: Record<string, unknown>, options: { ignoreDuplicates: boolean }) => {
          state.calls.push('history');
          if (state.failure === 'history') return { error: { code: 'x' } };
          const same = history.some((h) => h.season_number === row.season_number);
          if (same && !options.ignoreDuplicates) throw new Error('overwritten');
          if (!same) history.push(row);
          return { error: null };
        },
      };
      return query;
    },
    async rpc(_name: string, args: { p_season: number; p_block: number; p_amount: number }) {
      state.calls.push(`pay${args.p_block}`);
      if (state.failure === 'rpc' && args.p_block > 1) return { data: null, error: { code: 'x' } };
      const same = claims.some(
        (c) => c.season_number === args.p_season && c.block === args.p_block,
      );
      if (same) return { data: { applied: false }, error: null };
      claims.push({
        season_number: args.p_season,
        block: args.p_block,
        amount: args.p_amount,
      });
      state.cash += args.p_amount;
      state.ledger += 1;
      return { data: { applied: true }, error: null };
    },
  };
  return { db: db as unknown as BoardWriteDb, state, history, claims };
}

describe('closeBoardSeason', () => {
  it('pays every completed task and then writes the season once', async () => {
    const fake = fakeDb();
    const closed = await closeBoardSeason(fake.db, club, fixtures);
    expect(closed).toMatchObject({ ok: true, storedOutcome: null });
    expect(fake.state.calls).toEqual(['pay1', 'pay2', 'pay3', 'pay4', 'history']);
    expect(fake.state).toMatchObject({ cash: 20_000, ledger: 4 });
    expect(fake.history).toMatchObject([{ club_id: 'club-x', position: 1, outcome: 'promote' }]);
  });

  it('changes nothing on a retry, also when the fixtures are already new', async () => {
    const fake = fakeDb();
    const once = await closeBoardSeason(fake.db, club, fixtures);
    const reset = fixtures.map((f) => ({
      ...f,
      status: 'scheduled' as const,
      homeScore: null,
      awayScore: null,
    }));
    for (const retry of [fixtures, reset, []]) {
      const again = await closeBoardSeason(fake.db, club, retry);
      expect(again).toMatchObject({ ok: true, storedOutcome: 'promote' });
      if (again.ok && once.ok) expect(again.prestige?.value).toBe(once.prestige?.value);
    }
    expect(fake.history).toHaveLength(1);
    expect(fake.state.cash).toBe(20_000);
  });

  it('leaves collected tasks alone', async () => {
    const fake = fakeDb();
    fake.claims.push({ season_number: 1, block: 2, amount: 5_000 });
    await closeBoardSeason(fake.db, club, fixtures);
    expect(fake.state.calls).not.toContain('pay2');
    expect(fake.state.cash).toBe(15_000);
  });

  it('stops before the fixtures go when a payout or the history write fails, and recovers', async () => {
    const silent = vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const failure of ['rpc', 'history', 'broken'] as const) {
      const fake = fakeDb(failure);
      expect((await closeBoardSeason(fake.db, club, fixtures)).ok).toBe(false);
      expect(fake.history).toHaveLength(0);
      fake.state.failure = undefined;
      expect((await closeBoardSeason(fake.db, club, fixtures)).ok).toBe(true);
      expect(fake.state.cash).toBe(20_000);
    }
    silent.mockRestore();
  });

  it('stays neutral without the tables and for a season with no fixtures left', async () => {
    const missing = fakeDb('missing');
    expect(await closeBoardSeason(missing.db, club, fixtures)).toEqual({
      ok: true,
      prestige: null,
      storedOutcome: null,
    });
    expect(missing.state.calls).toEqual([]);
    const empty = fakeDb();
    expect((await closeBoardSeason(empty.db, club, [])).ok).toBe(true);
    expect(empty.state.calls).toEqual([]);
  });
});

describe('board records', () => {
  it('hides the feature without the tables and on a failed read', async () => {
    for (const failure of ['missing', 'broken'] as const) {
      const records = await loadBoardRecords(fakeDb(failure).db, club.id);
      expect(resolveBoardState(club, fixtures, records)).toBeNull();
    }
  });

  it('keeps prestige level when the closing season becomes history', async () => {
    const fake = fakeDb();
    const before = resolveBoardState(club, fixtures, await loadBoardRecords(fake.db, club.id))!;
    const closed = await closeBoardSeason(fake.db, club, fixtures);
    expect(closed.ok && closed.prestige).toEqual(before.prestige);
  });

  it('pays a repeated claim once', async () => {
    const fake = fakeDb();
    const { tasks } = resolveBoardState(club, fixtures, await loadBoardRecords(fake.db, club.id))!;
    const input = { clubId: club.id, seasonNumber: 1, task: tasks[0]! };
    expect(await Promise.all([payBoardTask(fake.db, input), payBoardTask(fake.db, input)])).toEqual(
      [true, true],
    );
    expect(fake.state).toMatchObject({ cash: 5_000, ledger: 1 });
  });
});
