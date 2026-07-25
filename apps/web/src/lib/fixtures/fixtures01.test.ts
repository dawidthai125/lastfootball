import { describe, expect, it } from 'vitest';

import { LEAGUE_FIXTURE_COUNT, pickOpponentsForClub } from '@/lib/fixtures/opponent-catalog';
import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';
import { resolveFixtureTopUp } from '@/lib/fixtures/resolve-fixture-top-up';

describe('planClubFixtures', () => {
  it('plans exactly 11 fixtures with matchday 1 upcoming', () => {
    const plan = planClubFixtures('club-aaa-bbb');
    expect(plan).toHaveLength(LEAGUE_FIXTURE_COUNT);
    expect(LEAGUE_FIXTURE_COUNT).toBe(11);
    expect(plan[0]?.status).toBe('upcoming');
    expect(plan.slice(1).every((p) => p.status === 'scheduled')).toBe(true);
    expect(plan.map((p) => p.matchday)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('is deterministic for the same clubId', () => {
    expect(planClubFixtures('same-id')).toEqual(planClubFixtures('same-id'));
  });

  it('picks distinct opponent catalog ids (full single RR)', () => {
    const plan = planClubFixtures('club-xyz');
    const ids = plan.map((p) => p.opponentClubId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(11);
    for (const id of ids) {
      expect(pickOpponentsForClub('club-xyz', 11).some((o) => o.id === id)).toBe(true);
    }
  });

  it('prefix of 11-plan matches legacy 3-opponent pick (deterministic top-up safe)', () => {
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

  it('empty club inserts full plan statuses', () => {
    const plan = planClubFixtures(clubId);
    const rows = resolveFixtureTopUp(plan, []);
    expect(rows).toHaveLength(11);
    expect(rows[0]?.status).toBe('upcoming');
    expect(rows.slice(1).every((r) => r.status === 'scheduled')).toBe(true);
    expect(rows.map((r) => r.opponentClubId)).toEqual(plan.map((p) => p.opponentClubId));
    expect(rows.map((r) => r.isHome)).toEqual(plan.map((p) => p.isHome));
  });

  it('top-up MD4–11 matches full plan identity without touching existing', () => {
    const plan = planClubFixtures(clubId);
    const existing = plan.slice(0, 3).map((p) => ({
      matchday: p.matchday,
      status: p.matchday === 1 ? 'played' : p.matchday === 2 ? 'upcoming' : 'scheduled',
    }));
    const rows = resolveFixtureTopUp(plan, existing);
    expect(rows.map((r) => r.matchday)).toEqual([4, 5, 6, 7, 8, 9, 10, 11]);
    for (const row of rows) {
      const planned = plan.find((p) => p.matchday === row.matchday)!;
      expect(row.opponentClubId).toBe(planned.opponentClubId);
      expect(row.isHome).toBe(planned.isHome);
      expect(row.status).toBe('scheduled'); // upcoming already exists
    }
  });

  it('when season short slate finished, promotes lowest missing to upcoming', () => {
    const plan = planClubFixtures(clubId);
    const existing = [
      { matchday: 1, status: 'played' },
      { matchday: 2, status: 'played' },
      { matchday: 3, status: 'played' },
    ];
    const rows = resolveFixtureTopUp(plan, existing);
    expect(rows[0]?.matchday).toBe(4);
    expect(rows[0]?.status).toBe('upcoming');
    expect(rows.slice(1).every((r) => r.status === 'scheduled')).toBe(true);
    expect(rows[0]?.opponentClubId).toBe(plan[3]?.opponentClubId);
    expect(rows[0]?.isHome).toBe(plan[3]?.isHome);
  });

  it('noop when calendar already complete', () => {
    const plan = planClubFixtures(clubId);
    const existing = plan.map((p) => ({ matchday: p.matchday, status: 'scheduled' }));
    expect(resolveFixtureTopUp(plan, existing)).toEqual([]);
  });
});
