import { describe, expect, it } from 'vitest';

import { openNextSeasonAfterDeparture } from '@/lib/season/open-next-season';
import type { HAgePlayersPort } from '@/lib/season/transition/h-age';
import type { SeasonAgePlayerSlice } from '@/lib/squad/season-age';
import type { PlayerRowDto, PlayerStatus } from '@/lib/squad/types';

type Filter = { kind: 'eq' | 'is'; column: string; value: unknown };
type Row = Record<string, unknown>;
type Op =
  | { op: 'update'; payload: Row; filters: Filter[] }
  | { op: 'insert'; payload: Row }
  | { op: 'delete'; filters: Filter[] }
  | { op: 'club'; payload: Row; filters: Filter[] }
  | { op: 'h-age'; id: string; age: number; skill: number };

function player(partial: {
  id: string;
  age: number;
  skill: number;
  academyTrack: boolean;
  starter: boolean;
  status?: PlayerStatus;
  shirtNumber?: number;
  clubId?: string;
}): PlayerRowDto {
  return {
    id: partial.id,
    clubId: partial.clubId ?? 'club-1',
    name: partial.id,
    shirtNumber: partial.shirtNumber ?? 10,
    pos: 'N',
    role: 'ST',
    starter: partial.starter,
    captain: false,
    age: partial.age,
    skill: partial.skill,
    potential: 70,
    status: partial.status ?? 'READY',
    nationality: 'POL',
    version: 1,
    departedAt: null,
    transferListedAt: null,
    academyTrack: partial.academyTrack,
    promotedAt: null,
  };
}

function toRow(dto: PlayerRowDto): Row {
  return {
    id: dto.id,
    club_id: dto.clubId,
    status: dto.status,
    departed_at: dto.departedAt,
    starter: dto.starter,
    academy_track: dto.academyTrack,
    promoted_at: dto.promotedAt,
    shirt_number: dto.shirtNumber,
    transfer_listed_at: dto.transferListedAt,
  };
}

function matches(row: Row, filters: readonly Filter[]): boolean {
  return filters.every((filter) => row[filter.column] === filter.value);
}

function fakeDb(
  roster: readonly PlayerRowDto[],
  fail: 'club' | 'lost' | 'silent' | 'promote' | null,
) {
  const club = { season_number: 3, season_phase: 'offseason' };
  const players = roster.map(toRow);
  const ops: Op[] = [];

  class Chain implements PromiseLike<{ data: unknown; error: { message: string } | null }> {
    private readonly filters: Filter[] = [];

    constructor(
      private readonly table: string,
      private readonly mode: 'update' | 'insert' | 'select' | 'delete',
      private readonly payload: Row,
    ) {}

    eq(column: string, value: unknown): this {
      this.filters.push({ kind: 'eq', column, value });
      return this;
    }

    is(column: string, value: unknown): this {
      this.filters.push({ kind: 'is', column, value });
      return this;
    }

    select(): this {
      return this;
    }

    maybeSingle(): this {
      return this;
    }

    then<TResult1 = { data: unknown; error: { message: string } | null }, TResult2 = never>(
      onfulfilled?:
        | ((value: {
            data: unknown;
            error: { message: string } | null;
          }) => TResult1 | PromiseLike<TResult1>)
        | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2> {
      return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
    }

    private execute(): { data: unknown; error: { message: string } | null } {
      if (this.table === 'clubs' && this.mode === 'select') {
        if (fail === 'silent') return { data: null, error: { message: 'down' } };
        return { data: { ...club }, error: null };
      }
      if (this.table === 'clubs') {
        ops.push({ op: 'club', payload: this.payload, filters: [...this.filters] });
        if (fail === 'club') return { data: null, error: { message: 'open failed' } };
        Object.assign(club, this.payload);
        if (fail !== null) return { data: null, error: { message: 'lost reply' } };
        return { data: [{ id: 'club-1' }], error: null };
      }

      if (this.mode === 'update') {
        if (fail === 'promote' && this.payload.academy_track === false) {
          return { data: null, error: { message: 'promote failed' } };
        }
        ops.push({ op: 'update', payload: { ...this.payload }, filters: [...this.filters] });
        for (const row of players) {
          if (matches(row, this.filters)) Object.assign(row, this.payload);
        }
        return { data: null, error: null };
      }

      if (this.mode === 'select') {
        const data = players
          .filter((row) => matches(row, this.filters))
          .map((row) => ({ shirt_number: row.shirt_number }));
        return { data, error: null };
      }

      if (this.mode === 'insert') {
        ops.push({ op: 'insert', payload: { ...this.payload } });
        players.push({ ...this.payload });
        return { data: null, error: null };
      }

      ops.push({ op: 'delete', filters: [...this.filters] });
      for (let i = players.length - 1; i >= 0; i -= 1) {
        const row = players[i];
        if (row && matches(row, this.filters)) players.splice(i, 1);
      }
      return { data: null, error: null };
    }
  }

  const supabase = {
    from(table: string) {
      return {
        update(payload: Row) {
          return new Chain(table, 'update', payload);
        },
        insert(payload: Row) {
          return new Chain(table, 'insert', payload);
        },
        select() {
          return new Chain(table, 'select', {});
        },
        delete() {
          return new Chain(table, 'delete', {});
        },
      };
    },
  };

  return { supabase, players, ops };
}

function hAge(ops: Op[], snapshot: readonly SeasonAgePlayerSlice[]) {
  const port: HAgePlayersPort = {
    async listActiveClubPlayers() {
      return snapshot;
    },
    async writePlayerAgeSkill(_clubId, row) {
      ops.push({ op: 'h-age', id: row.id, age: row.age, skill: row.skill });
      return { ok: true as const };
    },
  };
  return port;
}

const snapshot: SeasonAgePlayerSlice[] = [{ id: 'retiree', age: 39, skill: 44, potential: 70 }];

describe('openNextSeasonAfterDeparture', () => {
  it('returns farewell names when departure + club open succeed', async () => {
    const roster = [
      player({
        id: 'retiree',
        age: 40,
        skill: 40,
        academyTrack: false,
        starter: true,
      }),
      player({
        id: 'prospect',
        age: 17,
        skill: 48,
        academyTrack: true,
        starter: false,
        shirtNumber: 91,
      }),
    ];
    const db = fakeDb(roster, null);
    const result = await openNextSeasonAfterDeparture({
      supabase: db.supabase as never,
      clubId: 'club-1',
      endedSeason: 3,
      loadRoster: async () => roster,
      nextSeason: 4,
      nextTier: 'iii',
      goalNote: 'miss',
      hAgePort: hAge(db.ops, snapshot),
      hAgeSnapshot: snapshot,
    });

    expect(result).toMatchObject({
      ok: true,
      farewell: {
        retireName: 'retiree',
        promoteName: 'prospect',
      },
    });
    expect(db.players.find((row) => row.id === 'retiree')).toMatchObject({
      status: 'DEPARTED',
      starter: false,
    });
    expect(db.players.find((row) => row.id === 'prospect')).toMatchObject({
      academy_track: false,
    });
  });

  it('undoes a promotion when the club update fails and still reverts H-AGE', async () => {
    const roster = [
      player({
        id: 'retiree',
        age: 40,
        skill: 40,
        academyTrack: false,
        starter: true,
        status: 'SUSPENDED',
      }),
      player({
        id: 'prospect',
        age: 17,
        skill: 48,
        academyTrack: true,
        starter: true,
        shirtNumber: 91,
      }),
    ];
    const db = fakeDb(roster, 'club');
    const result = await openNextSeasonAfterDeparture({
      supabase: db.supabase as never,
      clubId: 'club-1',
      endedSeason: 3,
      loadRoster: async () => roster,
      nextSeason: 4,
      nextTier: 'iii',
      goalNote: 'miss',
      hAgePort: hAge(db.ops, snapshot),
      hAgeSnapshot: snapshot,
    });

    expect(result).toEqual({ ok: false, error: 'Nie udało się otworzyć nowego sezonu.' });
    expect(db.players.find((row) => row.id === 'retiree')).toMatchObject({
      status: 'SUSPENDED',
      departed_at: null,
      starter: true,
    });
    expect(db.players.find((row) => row.id === 'prospect')).toMatchObject({
      academy_track: true,
      promoted_at: null,
      starter: true,
    });
    expect(db.ops.map((op) => op.op)).toEqual([
      'update',
      'update',
      'club',
      'update',
      'update',
      'h-age',
    ]);
    const club = db.ops.find((op) => op.op === 'club');
    expect(club).toMatchObject({
      payload: {
        season_number: 4,
        season_phase: 'in_season',
        league_tier: 'iii',
        season_goal_paid_for: 3,
        season_goal_note: 'miss',
      },
      filters: [
        { kind: 'eq', column: 'id', value: 'club-1' },
        { kind: 'eq', column: 'season_phase', value: 'offseason' },
      ],
    });
    expect(db.ops.at(-1)).toEqual({ op: 'h-age', id: 'retiree', age: 39, skill: 44 });
  });

  it('deletes only this club’s inserted youth when the club update fails', async () => {
    const roster = [
      player({
        id: 'retiree',
        age: 38,
        skill: 51,
        academyTrack: false,
        starter: false,
        shirtNumber: 7,
      }),
    ];
    const db = fakeDb(roster, 'club');
    db.players.push({
      id: 'same-id-other-club',
      club_id: 'club-2',
      status: 'READY',
      departed_at: null,
      starter: false,
      academy_track: false,
      promoted_at: null,
      shirt_number: 90,
    });

    const result = await openNextSeasonAfterDeparture({
      supabase: db.supabase as never,
      clubId: 'club-1',
      endedSeason: 2,
      loadRoster: async () => roster,
      nextSeason: 3,
      nextTier: 'iv',
      goalNote: 'met',
      hAgePort: hAge(db.ops, snapshot),
      hAgeSnapshot: snapshot,
    });

    expect(result.ok).toBe(false);
    const inserted = db.ops.find((op) => op.op === 'insert');
    expect(inserted && inserted.op === 'insert').toBe(true);
    if (!inserted || inserted.op !== 'insert') return;
    const insertedId = inserted.payload.id;
    expect(inserted.payload.contract_season).toBe(4);
    expect(
      db.players.find((row) => row.id === insertedId && row.club_id === 'club-1'),
    ).toBeUndefined();
    expect(db.players.find((row) => row.id === 'retiree')).toMatchObject({
      status: 'READY',
      departed_at: null,
      starter: false,
    });
    expect(db.players.find((row) => row.club_id === 'club-2')).toMatchObject({
      id: 'same-id-other-club',
    });
    const deleted = db.ops.find((op) => op.op === 'delete');
    expect(deleted).toEqual({
      op: 'delete',
      filters: [
        { kind: 'eq', column: 'id', value: insertedId },
        { kind: 'eq', column: 'club_id', value: 'club-1' },
      ],
    });
    expect(db.ops.at(-1)).toEqual({ op: 'h-age', id: 'retiree', age: 39, skill: 44 });
  });

  it('does not undo twice when the promotion itself fails', async () => {
    const roster = [
      player({
        id: 'retiree',
        age: 41,
        skill: 33,
        academyTrack: false,
        starter: true,
        status: 'INJURED',
      }),
      player({
        id: 'prospect',
        age: 18,
        skill: 50,
        academyTrack: true,
        starter: false,
        shirtNumber: 92,
      }),
    ];
    const db = fakeDb(roster, 'promote');
    const result = await openNextSeasonAfterDeparture({
      supabase: db.supabase as never,
      clubId: 'club-1',
      endedSeason: 1,
      loadRoster: async () => roster,
      nextSeason: 2,
      nextTier: 'iv',
      goalNote: 'miss',
      hAgePort: hAge(db.ops, snapshot),
      hAgeSnapshot: snapshot,
    });

    expect(result).toEqual({ ok: false, error: 'Nie udało się wprowadzić zawodnika z akademii.' });
    expect(db.ops.map((op) => op.op)).toEqual(['update', 'update', 'update', 'h-age']);
    expect(db.ops.filter((op) => op.op === 'club')).toHaveLength(0);
    expect(db.players.find((row) => row.id === 'retiree')).toMatchObject({
      status: 'INJURED',
      departed_at: null,
      starter: true,
    });
    expect(db.players.find((row) => row.id === 'prospect')).toMatchObject({
      academy_track: true,
      promoted_at: null,
      starter: false,
    });
  });

  it('parts with juniors older than 19 and keeps the one it promotes (D134)', async () => {
    const roster = [
      player({ id: 'retiree', age: 40, skill: 40, academyTrack: false, starter: true }),
      player({ id: 'a-1', age: 20, skill: 50, academyTrack: true, starter: false }),
      player({ id: 'a-2', age: 20, skill: 50, academyTrack: true, starter: false }),
      player({ id: 'a-3', age: 19, skill: 50, academyTrack: true, starter: false }),
      player({ id: 's-1', age: 20, skill: 50, academyTrack: false, starter: true }),
    ];
    const run = async (fail: 'club' | null) => {
      const db = fakeDb(roster, fail);
      const result = await openNextSeasonAfterDeparture({
        supabase: db.supabase as never,
        clubId: 'club-1',
        endedSeason: 3,
        loadRoster: async () => roster,
        nextSeason: 4,
        nextTier: 'iii',
        goalNote: 'miss',
        hAgePort: hAge(db.ops, snapshot),
        hAgeSnapshot: snapshot,
      });
      return {
        ok: result.ok,
        status: Object.fromEntries(db.players.map((row) => [row.id, row.status])),
        left: db.players.filter((row) => row.departed_at != null).map((row) => row.id),
      };
    };
    expect(await run(null)).toEqual({
      ok: true,
      status: {
        retiree: 'DEPARTED',
        'a-1': 'READY',
        'a-2': 'DEPARTED',
        'a-3': 'READY',
        's-1': 'READY',
      },
      left: ['retiree', 'a-2'],
    });
    // The club row did not open: everybody is back for the next try.
    expect(await run('club')).toMatchObject({ ok: false, left: [] });
  });

  it('decides on the age before the tick and reports an undo that failed (D134)', async () => {
    const roster = [
      player({ id: 'a-1', age: 19, skill: 50, academyTrack: true, starter: false }),
      player({ id: 'a-2', age: 20, skill: 50, academyTrack: true, starter: false }),
    ];
    const db = fakeDb(roster, 'club');
    const reverted: string[] = [];
    const result = await openNextSeasonAfterDeparture({
      supabase: db.supabase as never,
      clubId: 'club-1',
      endedSeason: 3,
      loadRoster: async () => roster,
      nextSeason: 4,
      nextTier: 'iii',
      goalNote: 'miss',
      hAgePort: {
        async listActiveClubPlayers() {
          return [];
        },
        async writePlayerAgeSkill(_clubId, row) {
          reverted.push(row.id);
          return row.id === 'a-1' ? { ok: false, error: 'down' } : { ok: true };
        },
      },
      // a-2 was aged by an earlier run: 20 now, 19 before.
      hAgeSnapshot: [
        { id: 'a-1', age: 18, skill: 50, potential: 70, agedForSeason: 2 },
        { id: 'x', age: 25, skill: 50, potential: 70, agedForSeason: 2 },
      ],
    });
    expect(db.ops.filter((op) => op.op === 'update').map((op) => op.filters[0]?.value)).toEqual([
      'a-2',
      'a-2',
    ]);
    expect(reverted).toEqual(['a-1', 'x']);
    expect(result).toEqual({
      ok: false,
      error: 'Nie udało się otworzyć nowego sezonu. Części zmian w kadrze nie udało się cofnąć.',
    });
  });

  it('never rolls back a season that opened although the reply was lost', async () => {
    const roster = [
      player({ id: 'retiree', age: 40, skill: 40, academyTrack: false, starter: true }),
      player({ id: 'prospect', age: 17, skill: 48, academyTrack: true, starter: false }),
    ];
    const run = async (fail: 'lost' | 'silent') => {
      const db = fakeDb(roster, fail);
      const result = await openNextSeasonAfterDeparture({
        supabase: db.supabase as never,
        clubId: 'club-1',
        endedSeason: 3,
        loadRoster: async () => roster,
        nextSeason: 4,
        nextTier: 'iii',
        goalNote: 'miss',
        hAgePort: hAge(db.ops, snapshot),
        hAgeSnapshot: snapshot,
      });
      expect(db.ops.map((op) => op.op)).toEqual(['update', 'update', 'club']);
      return result;
    };
    expect(await run('lost')).toMatchObject({ ok: true, farewell: { retireName: 'retiree' } });
    expect(await run('silent')).toMatchObject({ ok: false });
  });

  it('retires nobody else when an interrupted start already brought the replacement', async () => {
    const roster = [
      player({ id: 'late', age: 39, skill: 40, academyTrack: false, starter: true }),
      player({ id: 'a-club1-3', age: 17, skill: 45, academyTrack: false, starter: false }),
    ];
    const db = fakeDb(roster, null);
    const result = await openNextSeasonAfterDeparture({
      supabase: db.supabase as never,
      clubId: 'club-1',
      endedSeason: 3,
      loadRoster: async () => roster,
      nextSeason: 4,
      nextTier: 'iii',
      goalNote: 'miss',
      hAgePort: hAge(db.ops, snapshot),
      hAgeSnapshot: snapshot,
    });
    expect(result).toEqual({ ok: true, farewell: null });
    expect(db.ops.map((op) => op.op)).toEqual(['club']);
  });

  it('retires one player a season, also when the interrupted start promoted a junior', async () => {
    const roster = [
      player({ id: 'late', age: 39, skill: 40, academyTrack: false, starter: true }),
      player({ id: 'promoted', age: 18, skill: 45, academyTrack: false, starter: false }),
    ];
    const run = async (season: number) => {
      const db = fakeDb(roster, null);
      db.players.push({
        id: 'gone',
        club_id: 'club-1',
        departed_at: '2026-12-01',
        departed_reason: 'retired',
        aged_for_season: season,
      });
      await openNextSeasonAfterDeparture({
        supabase: db.supabase as never,
        clubId: 'club-1',
        endedSeason: 3,
        loadRoster: async () => roster,
        nextSeason: 4,
        nextTier: 'iii',
        goalNote: 'miss',
        hAgePort: hAge(db.ops, []),
        hAgeSnapshot: [],
      });
      return db.players.find((row) => row.id === 'late')?.departed_at;
    };
    expect(await run(3)).toBeNull();
    // Retired a season ago: somebody else may go now.
    expect(await run(2)).not.toBeNull();
  });
});
