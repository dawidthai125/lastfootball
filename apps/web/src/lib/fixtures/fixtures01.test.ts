import { describe, expect, it } from 'vitest';

import {
  LEAGUE_FIXTURE_COUNT,
  LEAGUE_SINGLE_RR_COUNT,
  pickOpponentsForClub,
} from '@/lib/fixtures/opponent-catalog';
import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';
import { resolveFixtureTopUp } from '@/lib/fixtures/resolve-fixture-top-up';

/** LEAGUE-03 single-RR identity (MD1–11) — must stay stable for prod top-up. */
function planLeague03Prefix(clubId: string) {
  const n = LEAGUE_SINGLE_RR_COUNT;
  const opponents = pickOpponentsForClub(clubId, n);
  let h = 0;
  for (let i = 0; i < clubId.length; i += 1) h = (h + clubId.charCodeAt(i) * (i + 1)) | 0;
  const homeFirst = ((h >>> 0) & 1) === 0;
  return opponents.map((opp, i) => ({
    matchday: i + 1,
    opponentClubId: opp.id,
    isHome: homeFirst ? i % 2 === 0 : i % 2 === 1,
    status: (i === 0 ? 'upcoming' : 'scheduled') as 'upcoming' | 'scheduled',
  }));
}

describe('planClubFixtures', () => {
  it('plans exactly 22 fixtures with matchday 1 upcoming (LFE-LEAGUE-04)', () => {
    const plan = planClubFixtures('club-aaa-bbb');
    expect(plan).toHaveLength(LEAGUE_FIXTURE_COUNT);
    expect(LEAGUE_FIXTURE_COUNT).toBe(22);
    expect(plan[0]?.status).toBe('upcoming');
    expect(plan.slice(1).every((p) => p.status === 'scheduled')).toBe(true);
    expect(plan.map((p) => p.matchday)).toEqual(Array.from({ length: 22 }, (_, i) => i + 1));
  });

  it('is deterministic for the same clubId', () => {
    expect(planClubFixtures('same-id')).toEqual(planClubFixtures('same-id'));
  });

  it('MD1–11 matches LEAGUE-03 single RR identity', () => {
    const clubId = 'prod-compat-club';
    const plan = planClubFixtures(clubId);
    const legacy = planLeague03Prefix(clubId);
    expect(plan.slice(0, 11)).toEqual(legacy);
  });

  it('MD12–22 are return legs (!isHome, same opponent)', () => {
    const plan = planClubFixtures('return-leg-club');
    for (let i = 0; i < 11; i += 1) {
      const first = plan[i]!;
      const ret = plan[11 + i]!;
      expect(ret.matchday).toBe(12 + i);
      expect(ret.opponentClubId).toBe(first.opponentClubId);
      expect(ret.isHome).toBe(!first.isHome);
      expect(ret.status).toBe('scheduled');
    }
  });

  it('prefix of plan matches legacy 3-opponent pick (deterministic top-up safe)', () => {
    const clubId = 'legacy-club-id';
    const full = planClubFixtures(clubId);
    const opponents3 = pickOpponentsForClub(clubId, 3);
    expect(full.slice(0, 3).map((p) => p.opponentClubId)).toEqual(opponents3.map((o) => o.id));
    const homeFirst = full[0]!.isHome;
    expect(full[1]!.isHome).toBe(!homeFirst);
    expect(full[2]!.isHome).toBe(homeFirst);
  });
});

describe('resolveFixtureTopUp', () => {
  const clubId = 'top-up-club';

  it('empty club inserts full 22 plan statuses', () => {
    const plan = planClubFixtures(clubId);
    const rows = resolveFixtureTopUp(plan, []);
    expect(rows).toHaveLength(22);
    expect(rows[0]?.status).toBe('upcoming');
    expect(rows.slice(1).every((r) => r.status === 'scheduled')).toBe(true);
    expect(rows.map((r) => r.opponentClubId)).toEqual(plan.map((p) => p.opponentClubId));
    expect(rows.map((r) => r.isHome)).toEqual(plan.map((p) => p.isHome));
  });

  it('top-up MD12–22 for existing MD1–11 without touching existing', () => {
    const plan = planClubFixtures(clubId);
    const existing = plan.slice(0, 11).map((p) => ({
      matchday: p.matchday,
      status: p.matchday === 1 ? 'played' : p.matchday === 2 ? 'upcoming' : 'scheduled',
    }));
    const rows = resolveFixtureTopUp(plan, existing);
    expect(rows.map((r) => r.matchday)).toEqual([12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]);
    for (const row of rows) {
      const planned = plan.find((p) => p.matchday === row.matchday)!;
      expect(row.opponentClubId).toBe(planned.opponentClubId);
      expect(row.isHome).toBe(planned.isHome);
      expect(row.status).toBe('scheduled'); // upcoming already exists
    }
  });

  it('when first leg finished, promotes MD12 to upcoming', () => {
    const plan = planClubFixtures(clubId);
    const existing = plan.slice(0, 11).map((p) => ({
      matchday: p.matchday,
      status: 'played' as const,
    }));
    const rows = resolveFixtureTopUp(plan, existing);
    expect(rows[0]?.matchday).toBe(12);
    expect(rows[0]?.status).toBe('upcoming');
    expect(rows.slice(1).every((r) => r.status === 'scheduled')).toBe(true);
    expect(rows[0]?.opponentClubId).toBe(plan[11]?.opponentClubId);
    expect(rows[0]?.isHome).toBe(plan[11]?.isHome);
  });

  it('top-up MD4–11 matches plan identity without touching existing', () => {
    const plan = planClubFixtures(clubId);
    const existing = plan.slice(0, 3).map((p) => ({
      matchday: p.matchday,
      status: p.matchday === 1 ? 'played' : p.matchday === 2 ? 'upcoming' : 'scheduled',
    }));
    const rows = resolveFixtureTopUp(plan, existing);
    expect(rows.map((r) => r.matchday)).toEqual([
      4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    ]);
    for (const row of rows) {
      const planned = plan.find((p) => p.matchday === row.matchday)!;
      expect(row.opponentClubId).toBe(planned.opponentClubId);
      expect(row.isHome).toBe(planned.isHome);
    }
  });

  it('noop when calendar already complete (22)', () => {
    const plan = planClubFixtures(clubId);
    const existing = plan.map((p) => ({ matchday: p.matchday, status: 'scheduled' }));
    expect(resolveFixtureTopUp(plan, existing)).toEqual([]);
  });
});
