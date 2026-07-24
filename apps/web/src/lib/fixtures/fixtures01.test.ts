import { describe, expect, it } from 'vitest';

import { LEAGUE_FIXTURE_COUNT, pickOpponentsForClub } from '@/lib/fixtures/opponent-catalog';
import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';

describe('planClubFixtures', () => {
  it('plans exactly 3 fixtures with matchday 1 upcoming', () => {
    const plan = planClubFixtures('club-aaa-bbb');
    expect(plan).toHaveLength(LEAGUE_FIXTURE_COUNT);
    expect(plan[0]?.status).toBe('upcoming');
    expect(plan[1]?.status).toBe('scheduled');
    expect(plan[2]?.status).toBe('scheduled');
    expect(plan.map((p) => p.matchday)).toEqual([1, 2, 3]);
  });

  it('is deterministic for the same clubId', () => {
    expect(planClubFixtures('same-id')).toEqual(planClubFixtures('same-id'));
  });

  it('picks distinct opponent catalog ids', () => {
    const plan = planClubFixtures('club-xyz');
    const ids = plan.map((p) => p.opponentClubId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(pickOpponentsForClub('club-xyz', 11).some((o) => o.id === id)).toBe(true);
    }
  });
});
