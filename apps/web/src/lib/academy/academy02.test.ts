import { describe, expect, it } from 'vitest';

import {
  allocateAcademyShirt,
  generateAcademyCandidates,
  intakeWaitDays,
  isAcademyId,
  isCandidateId,
} from '@/lib/academy/intake';
import {
  academyLevel,
  academyUpgrade,
  clampAcademyLevel,
  homegrownSaleShare,
  isLastAcademySeason,
  juniorAgeNote,
  juniorTrainingBlock,
  ACADEMY_UPKEEP,
} from '@/lib/academy/levels';
import { resolveClubAcademy } from '@/lib/academy/resolve-club-academy';
import { loadAcademyRecords } from '@/lib/academy/store';
import type { AcademyState } from '@/lib/academy/types';
import { settleFixture } from '@/lib/fixtures/settle-fixture';
import { freeShirt } from '@/lib/squad/free-shirt';
import { resolveWageNote } from '@/lib/finance/unpaid-wages';
import { resolveClubMessages } from '@/lib/messages/resolve-club-messages';
import { applyMatchDevelopment } from '@/lib/squad/apply-match-development';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import { resolvePlayerPotential } from '@/lib/squad/potential';

const CLUB = '11111111-2222-3333-4444-555555555555';
const NOW = new Date('2026-11-24T12:00:00Z');

function junior(partial: Partial<PlayerDbRow> & Pick<PlayerDbRow, 'id'>) {
  return mapPlayerRow({
    club_id: CLUB,
    name: 'J. Test',
    shirt_number: 90,
    pos: 'N',
    role: 'ST',
    starter: false,
    captain: false,
    age: 17,
    skill: 45,
    potential: 93,
    status: 'READY',
    nationality: 'POL',
    version: 1,
    departed_at: null,
    academy_track: true,
    ...partial,
  });
}

const STATE: AcademyState = {
  levels: true,
  level: 1,
  offer: null,
  waitDays: 0,
  cash: 50_000,
  seasonNumber: 3,
  today: '2026-11-24',
};

describe('academy levels', () => {
  it('keeps the numbers the owner approved', () => {
    expect(
      [0, 1, 2, 3].map((level) => {
        const l = academyLevel(level);
        return [l.cost, l.upkeep, l.slots, l.intakeEveryDays, l.candidates, ...l.skill];
      }),
    ).toEqual([
      [0, 0, 3, 7, 1, 40, 52],
      [30_000, 500, 4, 6, 2, 42, 53],
      [60_000, 1_000, 5, 5, 2, 44, 54],
      [110_000, 1_500, 6, 4, 3, 46, 56],
    ]);
    expect([0, 9, 10, 21, 22].map(homegrownSaleShare)).toEqual([0.1, 0.1, 0.25, 0.25, 0.5]);
    expect(homegrownSaleShare(undefined)).toBe(0.1);
    expect([undefined, null, NaN, -1, 1.9, 7].map(clampAcademyLevel)).toEqual([0, 0, 0, 0, 1, 3]);
  });

  it('upgrades one level at a time for cash', () => {
    expect(academyUpgrade({ level: 0, cash: 30_000 })).toEqual({
      ok: true,
      level: 1,
      cost: 30_000,
      cashAfter: 0,
    });
    expect(academyUpgrade({ level: 1, cash: 59_999 })).toEqual({ ok: false, reason: 'cash' });
    expect(academyUpgrade({ level: 3, cash: 999_999 })).toEqual({ ok: false, reason: 'max' });
  });
});

describe('academy candidates', () => {
  it('depend only on the club, the number and the level', () => {
    for (const level of [0, 1, 2, 3]) {
      for (let seq = 1; seq <= 60; seq += 1) {
        const offer = generateAcademyCandidates(CLUB, seq, level);
        expect(offer).toEqual(generateAcademyCandidates(CLUB, seq, level));
        expect(offer).toHaveLength(academyLevel(level).candidates);
        expect(new Set(offer.map((c) => c.pos)).size).toBe(offer.length);
        const [low, high] = academyLevel(level).skill;
        for (const c of offer) {
          expect(c.age).toBeGreaterThanOrEqual(16);
          expect(c.age).toBeLessThanOrEqual(18);
          expect(c.skill).toBeGreaterThanOrEqual(low);
          expect(c.skill).toBeLessThanOrEqual(high);
          expect(c.potential).toBe(resolvePlayerPotential(c.skill, c.id, c.age));
          expect(isAcademyId(c.id, CLUB)).toBe(true);
          expect(isCandidateId(c.id, CLUB)).toBe(true);
        }
      }
    }
    const ids = Array.from({ length: 200 }, (_, i) => generateAcademyCandidates(CLUB, i + 1, 3))
      .flat()
      .map((c) => c.id);
    expect(new Set(ids).size).toBe(600);
    expect(isCandidateId(`a-11111111-${Date.now().toString(36)}`, CLUB)).toBe(false);
  });

  it('covers the whole skill band and all ages', () => {
    const all = Array.from({ length: 400 }, (_, i) => generateAcademyCandidates(`c${i}`, 1, 3)[0]!);
    expect(new Set(all.map((c) => c.skill)).size).toBe(11);
    expect(new Set(all.map((c) => c.age)).size).toBe(3);
  });

  it('waits 7, 6, 5 and 4 days by level', () => {
    const at = ['2026-11-24T12:00:00Z'];
    expect(
      [0, 1, 2, 3].map((level) => intakeWaitDays(at, NOW, academyLevel(level).intakeEveryDays)),
    ).toEqual([7, 6, 5, 4]);
  });
});

/** Answers each table with a fixed row set, whatever the filters. */
function fakeDb(tables: Record<string, { data?: unknown; error?: { code: string } }>) {
  return {
    from(table: string) {
      const answer = { data: null, error: null, ...tables[table] };
      const chain = {
        select: () => chain,
        eq: () => chain,
        like: () => chain,
        order: () => chain,
        limit: () => chain,
        maybeSingle: () => Promise.resolve(answer),
        then: (ok: (v: unknown) => unknown) => Promise.resolve(answer).then(ok),
      };
      return chain;
    },
  } as never;
}

describe('academy records', () => {
  const offer = generateAcademyCandidates(CLUB, 4, 1);
  const last = { seq: 4, candidates: offer, created_at: '2026-11-22T12:00:00Z' };
  const base = { clubs: { data: { academy_level: 1 } }, players: { data: [] } };

  it('returns the stored offer, so a reload cannot change it', async () => {
    const records = await loadAcademyRecords(
      fakeDb({ ...base, academy_intakes: { data: [{ ...last, status: 'open' }] } }),
      CLUB,
      NOW,
    );
    expect(records).toEqual({
      status: 'ok',
      level: 1,
      lastSeq: 4,
      open: { seq: 4, candidates: offer },
      waitDays: 4,
    });
  });

  it('keeps the waiting time after a choice and after a refusal', async () => {
    for (const status of ['taken', 'declined']) {
      expect(
        await loadAcademyRecords(
          fakeDb({ ...base, academy_intakes: { data: [{ ...last, status }] } }),
          CLUB,
          NOW,
        ),
      ).toMatchObject({ open: null, lastSeq: 4, waitDays: 4 });
    }
  });

  it('counts old juniors until the first stored intake, never a season replacement', async () => {
    const players = {
      data: [
        { id: 'a-11111111-mabc1234', created_at: '2026-11-23T12:00:00Z' },
        { id: 'a-11111111-3', created_at: '2026-11-24T11:00:00Z' },
        { id: 'a-11111111-n3-0', created_at: '2026-11-24T11:00:00Z' },
      ],
    };
    const wait = async (rows: unknown[]) =>
      loadAcademyRecords(fakeDb({ ...base, players, academy_intakes: { data: rows } }), CLUB, NOW);
    expect(await wait([])).toMatchObject({ lastSeq: 0, waitDays: 5 });
    expect(await wait([{ ...last, status: 'taken' }])).toMatchObject({ waitDays: 4 });
  });

  it('tells a missing migration from a failed read', async () => {
    const tables = { ...base, academy_intakes: { data: [] } };
    expect(
      await loadAcademyRecords(
        fakeDb({ ...tables, clubs: { error: { code: '42703' } } }),
        CLUB,
        NOW,
      ),
    ).toEqual({ status: 'missing' });
    expect(
      await loadAcademyRecords(
        fakeDb({ ...tables, clubs: { error: { code: '57014' } } }),
        CLUB,
        NOW,
      ),
    ).toEqual({ status: 'error' });
  });
});

describe('academy page', () => {
  it('has the slots of its level and shows why the intake waits', () => {
    const rows = [1, 2, 3].map((n) => junior({ id: `a-11111111-${n}`, shirt_number: 89 + n }));
    const at = (state: AcademyState) =>
      resolveClubAcademy({ id: CLUB }, rows, 'SEASON', undefined, state);
    expect(at({ ...STATE, level: 0 }).intakeBlockedReason).toBe('slots_full');
    expect(at(STATE)).toMatchObject({ canIntake: true, maxProspects: 4, upkeep: 500 });
    expect(at({ ...STATE, waitDays: 2 }).intakeBlockedReason).toBe('waiting');
    expect(at(STATE).upgrade).toMatchObject({ cost: 60_000, affordable: false });
    expect(at({ ...STATE, level: 3 }).upgrade).toBeNull();
    expect(resolveClubAcademy({ id: CLUB }, rows, 'SEASON')).toMatchObject({
      hasLevels: false,
      maxProspects: 3,
    });
  });

  it('shows a band on the cards, never the number or the id', () => {
    const candidates = generateAcademyCandidates(CLUB, 1, 3);
    const dto = resolveClubAcademy({ id: CLUB }, [], 'SEASON', new Set(), {
      ...STATE,
      offer: { seq: 1, candidates },
    });
    expect(dto.intakeBlockedReason).toBe('offer_open');
    expect(dto.offer?.candidates).toHaveLength(3);
    for (const card of dto.offer!.candidates) {
      expect(Object.keys(card).sort()).toEqual(['age', 'index', 'name', 'pos', 'potentialLabel']);
      expect(card.potentialLabel).toMatch(/Niski|Średni|Wysoki|Bardzo wysoki/);
    }
  });

  it('keeps the band of a chosen junior and hides an older one', () => {
    const dto = resolveClubAcademy(
      { id: CLUB },
      [junior({ id: 'a-11111111-n1-0' }), junior({ id: 'a-11111111-mabc', shirt_number: 91 })],
      'SEASON',
      new Set(),
      STATE,
    );
    expect(dto.prospects.map((p) => p.potentialLabel)).toEqual(['Bardzo wysoki', 'Sufit ukryty']);
  });
});

describe('junior training', () => {
  const free = { age: 19, seasonGain: 5, trainedToday: false, cash: 1_000 };

  it('stops at six a season, one a day, age 19 and an empty till', () => {
    expect(juniorTrainingBlock(free)).toBeNull();
    expect(juniorTrainingBlock({ ...free, seasonGain: 6 })).toContain('Limit');
    expect(juniorTrainingBlock({ ...free, trainedToday: true })).toContain('na dziś');
    expect(juniorTrainingBlock({ ...free, age: 20 })).toContain('Za stary');
    expect(juniorTrainingBlock({ ...free, cash: 999 })).toContain('środków');
  });

  it('is one a day for the club and starts over in a new season', () => {
    const rows = [
      junior({
        id: 'a-11111111-n1-0',
        academy_trained_on: '2026-11-24',
        academy_gain: 6,
        academy_gain_season: 2,
      }),
      junior({ id: 'a-11111111-n2-0', shirt_number: 91 }),
    ];
    const today = resolveClubAcademy({ id: CLUB }, rows, 'SEASON', undefined, STATE);
    expect(today.prospects.map((p) => p.trainingBlock)).toEqual([
      'Trening na dziś wykonany.',
      'Trening na dziś wykonany.',
    ]);
    expect(today.prospects[0]!.seasonGain).toBe(0);
    const tomorrow = resolveClubAcademy({ id: CLUB }, rows, 'SEASON', undefined, {
      ...STATE,
      today: '2026-11-25',
      seasonNumber: 2,
    });
    expect(tomorrow.prospects.map((p) => p.trainingBlock)).toEqual([
      'Limit treningów w sezonie.',
      null,
    ]);
  });
});

describe('age rule', () => {
  it('warns in the season a junior is 19', () => {
    expect([18, 19, 20].map(isLastAcademySeason)).toEqual([false, true, true]);
    expect(juniorAgeNote([{ name: 'A. Lis', age: 18 }])).toBeNull();
    const note = juniorAgeNote([{ name: 'A. Lis', age: 19 }]);
    expect(note).toContain('A. Lis odejdzie');
    expect(
      resolveClubMessages({
        transferWindowOpen: false,
        incomingOffers: [],
        incomingLiveOffers: [],
        outgoingLiveOffers: [],
        academyAgeNote: note,
      }).items,
    ).toEqual([
      expect.objectContaining({ id: 'msg:academy-age', href: '/academy', subject: note }),
    ]);
  });
});

describe('upkeep and senior matches', () => {
  it('adds the upkeep to the wage forecast', () => {
    const input = { cash: 31_000, nextWage: 10_000, movements: [] };
    expect(resolveWageNote(input)).toBeNull();
    expect(resolveWageNote({ ...input, upkeep: 500 })).toContain('utrzymania akademii');
  });

  it('marks only the players who started, for the database to count once', async () => {
    const calls: { p_updates: { id: string; played?: boolean }[] }[] = [];
    const players = ['s-1', 's-2'].map((id, i) =>
      junior({ id, academy_track: false, shirt_number: i + 1, age: 30, skill: 60, potential: 60 }),
    );
    await applyMatchDevelopment(
      {
        rpc: async (_name: string, args: (typeof calls)[number]) => {
          calls.push(args);
          return { data: { ok: true }, error: null };
        },
      } as never,
      {
        clubId: CLUB,
        matchKey: 'm1',
        activePlayers: players,
        truthById: { 's-1': { energy: 60 }, 's-2': { energy: 60 } },
        startedIds: new Set(['s-1']),
      },
    );
    expect(calls[0]!.p_updates.map((u) => [u.id, u.played])).toEqual([
      ['s-1', true],
      ['s-2', undefined],
    ]);
  });

  it('turns a refused row into the Polish error, whatever the database said', async () => {
    for (const [code, error] of [
      ['P0001', 'Nie udało się zaktualizować zawodnika.'],
      ['57014', 'Nie udało się zapisać rozwoju.'],
    ]) {
      expect(
        await applyMatchDevelopment(
          { rpc: async () => ({ data: null, error: { code, message: 'x' } }) } as never,
          { clubId: CLUB, matchKey: 'm1', activePlayers: [] },
        ),
      ).toEqual({ ok: false, error });
    }
  });

  it('sends the upkeep of every level and falls back only for an older database', async () => {
    const run = async (code: string | null) => {
      const calls: Record<string, unknown>[] = [];
      const settled = await settleFixture(
        {
          rpc: async (name: string, args: Record<string, unknown>) => {
            calls.push(args);
            return code && name === 'settle_match'
              ? { data: null, error: { code } }
              : { data: { applied: true, paid: 1 }, error: null };
          },
        } as never,
        { p_home: 1 },
        [{ id: 'p', name: 'P', mine: true, goals: 1, assists: 0 }],
      );
      return { settled, calls };
    };
    expect(ACADEMY_UPKEEP).toEqual([0, 500, 1_000, 1_500]);
    const normal = await run(null);
    const full = expect.objectContaining({ p_home: 1, p_upkeep_by_level: [0, 500, 1_000, 1_500] });
    expect(normal.calls).toEqual([
      { p_args: full, p_players: [expect.objectContaining({ id: 'p', goals: 1 })] },
    ]);
    const older = await run('PGRST202');
    expect(older.calls[1]).toEqual(full);
    expect(older.settled).toEqual({ applied: true, paid: 1 });
    const failed = await run('57014');
    expect(failed.settled).toBeNull();
    expect(failed.calls).toHaveLength(1);
  });
});

describe('shirt numbers', () => {
  it('are free again after a departure', () => {
    const rows = Array.from({ length: 99 }, (_, i) => ({
      shirt_number: i + 1,
      departed_at: i + 1 === 40 ? '2026-11-01T00:00:00Z' : null,
    }));
    expect(freeShirt(rows)).toBe(40);
    expect(freeShirt(rows.slice(0, 98))).toBe(99);
    expect(freeShirt(rows.map((r) => ({ ...r, departed_at: null })))).toBeNull();
    const used = new Set(Array.from({ length: 98 }, (_, i) => i + 1));
    expect(allocateAcademyShirt(used, new Set([99]))).toBe(99);
    expect(allocateAcademyShirt(new Set(), new Set([90]))).toBe(91);
  });
});
