import { describe, expect, it, vi } from 'vitest';

import { resolveBoardState } from '@/lib/board/board-state';
import { closeBoardSeason } from '@/lib/board/close-board-season';
import { loadBoardRecords, payBoardTask, type BoardWriteDb } from '@/lib/board/store';
import { resolveTaskClaim } from '@/lib/board/task-claim';
import { resolveNationalCup } from '@/lib/cup/resolve-national-cup';
import type { FixtureDto } from '@/lib/fixtures/types';
import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';
import {
  clearSeasonFixtures,
  lockSeasonStart,
  resolveNextTier,
  unlockSeasonStart,
} from '@/lib/season/season-start';

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

const nextSlate = fixtures.map((f): FixtureDto => ({
  ...f,
  status: 'scheduled',
  homeScore: null,
  awayScore: null,
}));

const cupTie: FixtureDto = { ...fixtures[0]!, id: 'cup', competition: 'cup', matchday: 101 };

type Failure = 'missing' | 'broken' | 'rpc' | 'clear';

type Args = {
  p_season: number;
  p_block: number;
  p_amount: number;
  p_token: string;
  p_played: number;
  p_history: Record<string, unknown> | null;
};

/** Tables in memory, SQL functions with the guards of the migration. */
function fakeDb(failure?: Failure) {
  const history: Record<string, unknown>[] = [];
  const claims: { season_number: number; block: number; amount: number }[] = [];
  const state = {
    failure,
    phase: 'offseason',
    season: 1,
    fixtures: [...fixtures] as FixtureDto[],
    lock: null as { token: string; stale: boolean } | null,
    locks: 0,
    cash: 0,
    ledger: 0,
    calls: [] as string[],
  };
  const raise = (code = 'P0001') => ({ data: null, error: { code } });
  const ok = (data: unknown) => ({ data, error: null });
  const readError = () =>
    state.failure === 'missing'
      ? { code: 'PGRST205' }
      : state.failure === 'broken'
        ? { code: '57014' }
        : null;
  const between = (season: number) => state.phase === 'offseason' && state.season === season;
  const rpcs: Record<string, (args: Args) => ReturnType<typeof raise> | ReturnType<typeof ok>> = {
    claim_board_task(args) {
      state.calls.push(`pay${args.p_block}`);
      if (state.failure === 'rpc' && args.p_block > 1) return raise('x');
      if (args.p_amount < 1 || args.p_amount > 10_000) return raise();
      const same = (c: { season_number: number; block: number }) =>
        c.season_number === args.p_season && c.block === args.p_block;
      if (claims.some(same)) return ok({ applied: false });
      if (state.season !== args.p_season) return raise();
      if (history.some((h) => h.season_number === args.p_season)) return raise();
      const league = state.fixtures.filter((f) => f.competition === 'league');
      const complete = league.length === 22 && league.every((f) => f.status === 'played');
      if (state.phase !== 'in_season' && !complete) return raise();
      claims.push({ season_number: args.p_season, block: args.p_block, amount: args.p_amount });
      state.cash += args.p_amount;
      state.ledger += 1;
      return ok({ applied: true });
    },
    begin_season_start(args) {
      if (!between(args.p_season) || (state.lock && !state.lock.stale)) return ok(null);
      state.locks += 1;
      state.lock = { token: `t${state.locks}`, stale: false };
      return ok(state.lock.token);
    },
    end_season_start(args) {
      if (state.lock?.token === args.p_token) state.lock = null;
      return ok(null);
    },
    clear_season_fixtures(args) {
      state.calls.push('clear');
      if (state.failure === 'clear') return raise('x');
      if (!between(args.p_season) || state.lock?.token !== args.p_token) return raise();
      const played = state.fixtures.filter((f) => f.status === 'played').length;
      if (played !== args.p_played) return raise();
      if (args.p_history && !history.some((h) => h.season_number === args.p_season)) {
        history.push({ ...args.p_history, season_number: args.p_season });
      }
      state.fixtures = [];
      return ok(true);
    },
  };
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
      };
      return query;
    },
    async rpc(name: string, args: Args) {
      if (state.failure === 'missing') return raise('PGRST202');
      return rpcs[name]!(args);
    },
  };
  return { db: db as unknown as BoardWriteDb, state, history, claims };
}

type Fake = ReturnType<typeof fakeDb>;

/** The board part of confirmStartNextSeason, up to the fixture delete. */
async function close(fake: Fake, seen: readonly FixtureDto[] = fake.state.fixtures) {
  const lock = await lockSeasonStart(fake.db, club.id, 1);
  if (lock.kind !== 'held') return lock.kind;
  const board = await closeBoardSeason(fake.db, club, seen);
  const cleared =
    board.ok &&
    (await clearSeasonFixtures(fake.db, {
      clubId: club.id,
      endedSeason: 1,
      token: lock.token,
      fixtures: seen,
      history: board.history,
    }));
  await unlockSeasonStart(fake.db, club.id, lock.token);
  return cleared ? 'cleared' : 'stopped';
}

async function boardOf(fake: Fake, seen: readonly FixtureDto[] = fake.state.fixtures) {
  return resolveBoardState(club, seen, await loadBoardRecords(fake.db, club.id));
}

describe('season close', () => {
  it('pays every completed task, then stores the season with the fixture delete', async () => {
    const fake = fakeDb();
    expect(await close(fake)).toBe('cleared');
    expect(fake.state.calls).toEqual(['pay1', 'pay2', 'pay3', 'pay4', 'clear']);
    expect(fake.state).toMatchObject({ cash: 20_000, ledger: 4, fixtures: [], lock: null });
    expect(fake.history).toMatchObject([{ season_number: 1, position: 1, outcome: 'promote' }]);
  });

  it('keeps the first result on a retry over the next slate, even a finished one', async () => {
    const fake = fakeDb();
    await close(fake);
    const lost = fixtures.map((f) => ({ ...f, homeScore: f.awayScore, awayScore: f.homeScore }));
    for (const slate of [[], nextSlate, lost]) {
      fake.state.fixtures = slate;
      expect(await closeBoardSeason(fake.db, club, slate)).toMatchObject({
        ok: true,
        history: null,
        storedOutcome: 'promote',
      });
      expect(await close(fake)).toBe('cleared');
    }
    expect(fake.history).toMatchObject([{ position: 1, outcome: 'promote' }]);
    expect(fake.state.cash).toBe(20_000);
  });

  it('keeps a cup result played after a failed start', async () => {
    const silent = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fake = fakeDb('clear');
    expect(await close(fake)).toBe('stopped');
    expect(fake.history).toHaveLength(0);
    fake.state.failure = undefined;
    const tie = resolveNationalCup(club, fixtures).playerTie!;
    fake.state.fixtures.push({
      ...cupTie,
      opponentClubId: tie.opponentId,
      isHome: tie.isHome,
      homeScore: tie.isHome ? 1 : 0,
      awayScore: tie.isHome ? 0 : 1,
    });
    expect(await close(fake)).toBe('cleared');
    expect(fake.history).toMatchObject([{ cup_round_reached: 2 }]);
    expect(fake.state.cash).toBe(20_000);
    silent.mockRestore();
  });

  it('leaves collected tasks alone', async () => {
    const fake = fakeDb();
    fake.claims.push({ season_number: 1, block: 2, amount: 5_000 });
    await close(fake);
    expect(fake.state.calls).not.toContain('pay2');
    expect(fake.state.cash).toBe(15_000);
  });

  it('stops with the fixtures in place on any failure, and recovers', async () => {
    const silent = vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const failure of ['rpc', 'clear', 'broken', 'missing'] as const) {
      const fake = fakeDb(failure);
      expect(await close(fake)).toBe(failure === 'missing' ? 'error' : 'stopped');
      expect(fake.state.fixtures).toHaveLength(22);
      expect(fake.history).toHaveLength(0);
      fake.state.failure = undefined;
      expect(await close(fake)).toBe('cleared');
      expect(fake.state.cash).toBe(20_000);
    }
    // Missing tables hide the pages, but a season start waits for them.
    const missing = await closeBoardSeason(fakeDb('missing').db, club, fixtures);
    expect(missing).toMatchObject({ ok: false, error: expect.stringMatching(/Spróbuj ponownie/) });
    silent.mockRestore();
  });

  it('records nothing for a season that was cleared before', async () => {
    const fake = fakeDb();
    fake.state.fixtures = [];
    expect(await close(fake)).toBe('cleared');
    expect(fake.state.calls).toEqual(['clear']);
    expect(fake.history).toHaveLength(0);
  });
});

describe('season start lock', () => {
  it('lets one request in, releases only for its owner, and expires', async () => {
    const { db, state } = fakeDb();
    const first = await lockSeasonStart(db, club.id, 1);
    expect(first).toEqual({ kind: 'held', token: 't1' });
    expect(await lockSeasonStart(db, club.id, 1)).toEqual({ kind: 'busy' });
    await unlockSeasonStart(db, club.id, 'other');
    expect(state.lock).not.toBeNull();
    state.lock!.stale = true;
    expect(await lockSeasonStart(db, club.id, 1)).toEqual({ kind: 'held', token: 't2' });
    await unlockSeasonStart(db, club.id, 't2');
    expect(state.lock).toBeNull();
  });

  it('refuses a club that moved on', async () => {
    const fake = fakeDb();
    fake.state.phase = 'in_season';
    expect(await close(fake)).toBe('busy');
    fake.state.phase = 'offseason';
    fake.state.season = 2;
    expect(await close(fake)).toBe('busy');
  });

  it('does not delete after the lock, the season or the results moved', async () => {
    const silent = vi.spyOn(console, 'error').mockImplementation(() => {});
    const clear = (fake: Fake) =>
      clearSeasonFixtures(fake.db, {
        clubId: club.id,
        endedSeason: 1,
        token: 't1',
        fixtures,
        history: null,
      });
    const changes: ((state: Fake['state']) => void)[] = [
      (state) => (state.lock = { token: 't9', stale: false }),
      (state) => (state.season = 2),
      (state) => (state.phase = 'in_season'),
      (state) => state.fixtures.push(cupTie),
    ];
    for (const change of changes) {
      const fake = fakeDb();
      await lockSeasonStart(fake.db, club.id, 1);
      change(fake.state);
      expect(await clear(fake)).toBe(false);
      expect(fake.state.fixtures.length).toBeGreaterThan(0);
    }
    silent.mockRestore();
  });
});

describe('resolveNextTier', () => {
  const input = { tier: 'iii' as const, position: 1, tableSize: 12, storedOutcome: null };

  it('moves a club only on a complete slate or a stored result', () => {
    expect(resolveNextTier({ ...input, fixtures })).toBe('ii');
    expect(resolveNextTier({ ...input, position: 12, fixtures })).toBe('iv');
    for (const slate of [[], nextSlate, fixtures.slice(1)]) {
      for (const position of [1, 12, null]) {
        expect(resolveNextTier({ ...input, position, fixtures: slate })).toBe('iii');
      }
    }
    expect(resolveNextTier({ ...input, fixtures: [], storedOutcome: 'relegate' })).toBe('iv');
    expect(resolveNextTier({ ...input, fixtures, storedOutcome: 'stay' })).toBe('iii');
  });
});

describe('manual claim', () => {
  const at = (
    board: Awaited<ReturnType<typeof boardOf>>,
    seen: readonly FixtureDto[],
    seasonPhase: 'in_season' | 'offseason' = 'offseason',
  ) => resolveTaskClaim({ club: { ...club, seasonPhase }, fixtures: seen, board, block: 1 });

  it('pays in season and after the last match', async () => {
    const fake = fakeDb();
    const board = await boardOf(fake);
    expect(at(board, fixtures).kind).toBe('pay');
    const firstTen = fixtures.map((f, i) => (i < 10 ? f : nextSlate[i]!));
    expect(at(await boardOf(fake, firstTen), firstTen, 'in_season').kind).toBe('pay');
    expect(at(await boardOf(fake, nextSlate), nextSlate, 'in_season')).toMatchObject({
      error: 'To zadanie nie jest wykonane.',
    });
  });

  it('refuses the next slate between seasons, in the app and in SQL', async () => {
    const silent = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fake = fakeDb();
    const task = (await boardOf(fake))!.tasks[0]!;
    const half = fixtures.map((f, i) => (i < 10 ? f : nextSlate[i]!));
    const pay = () => payBoardTask(fake.db, { clubId: club.id, seasonNumber: 1, task });
    expect(at(await boardOf(fake, half), half)).toMatchObject({ kind: 'refused' });
    fake.state.fixtures = half;
    expect(await pay()).toBe(false);

    fake.state.fixtures = [...fixtures];
    fake.history.push({ season_number: 1, outcome: 'stay', table_size: 12, position: 6 });
    expect(at(await boardOf(fake), fixtures)).toMatchObject({ kind: 'refused' });
    expect(await pay()).toBe(false);
    fake.history.pop();
    fake.state.season = 2;
    expect(await pay()).toBe(false);
    expect(fake.state.cash).toBe(0);
    silent.mockRestore();
  });

  it('asks for a retry when a read failed', async () => {
    const fake = fakeDb();
    expect(at(null, fixtures)).toMatchObject({ error: expect.stringMatching(/ponownie/) });
    expect(at(await boardOf(fake, []), [])).toMatchObject({
      error: expect.stringMatching(/ponownie/),
    });
  });

  it('pays a repeated claim once', async () => {
    const fake = fakeDb();
    const task = (await boardOf(fake))!.tasks[0]!;
    const input = { clubId: club.id, seasonNumber: 1, task };
    expect(await Promise.all([payBoardTask(fake.db, input), payBoardTask(fake.db, input)])).toEqual(
      [true, true],
    );
    expect(fake.state).toMatchObject({ cash: 5_000, ledger: 1 });
    expect(at(await boardOf(fake), fixtures).kind).toBe('claimed');
  });
});

describe('board state', () => {
  it('hides the feature without the tables and on a failed read', async () => {
    for (const failure of ['missing', 'broken'] as const) {
      expect(await boardOf(fakeDb(failure))).toBeNull();
    }
  });

  it('keeps prestige level when the closing season becomes history', async () => {
    const fake = fakeDb();
    const before = (await boardOf(fake))!;
    await close(fake);
    expect((await boardOf(fake))!.prestige).toEqual(before.prestige);
  });

  it('reads a stored season from its claims only', async () => {
    const fake = fakeDb();
    fake.claims.push({ season_number: 1, block: 3, amount: 5_000 });
    fake.history.push({ ...fakeHistory });
    const closed = (await boardOf(fake, fixtures))!;
    expect(closed.closed).toBe(true);
    expect(closed.tasks.map((t) => t.state)).toEqual(['failed', 'failed', 'claimed', 'failed']);
    const tasks = closed.prestige.sources.find((s) => s.label === 'Zadania zarządu');
    expect(tasks?.points).toBe(0.5);
  });
});

const fakeHistory = {
  season_number: 1,
  league_tier: 'iv',
  position: 6,
  table_size: 12,
  points: 30,
  won: 8,
  drawn: 6,
  lost: 8,
  goals_for: 28,
  goals_against: 28,
  cup_round_reached: 1,
  outcome: 'stay',
};
