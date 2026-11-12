import { describe, expect, it } from 'vitest';

import { applyCoachYield, COACH_THIN, hireCoach, isCoachGroup } from './coach';

const groups = {
  attack: 40,
  passing: 50,
  defense: 60,
  physical: 70,
  goalkeeping: 10,
};

describe('hireCoach', () => {
  it('fails without enough cash', () => {
    expect(COACH_THIN).toEqual({ HIRE_FEE: 8_000, EXTRA_GROUP_DELTA: 1 });
    expect(hireCoach({ cash: 7_999, current: null, next: 'attack' })).toEqual({
      ok: false,
      reason: 'cash',
    });
    expect(hireCoach({ cash: 0, current: 'defense', next: 'passing' })).toEqual({
      ok: false,
      reason: 'cash',
    });
  });

  it('charges once and a second hire of the same group is free', () => {
    const first = hireCoach({ cash: 8_000, current: null, next: 'passing' });
    expect(first).toEqual({ ok: true, group: 'passing', fee: 8_000, cashAfter: 0 });

    const again = hireCoach({ cash: 0, current: 'passing', next: 'passing' });
    expect(again).toEqual({ ok: true, group: 'passing', fee: 0, cashAfter: 0 });

    const kept = hireCoach({ cash: 50, current: 'passing', next: 'passing' });
    expect(kept).toEqual({ ok: true, group: 'passing', fee: 0, cashAfter: 50 });

    const switched = hireCoach({ cash: 9_000, current: 'passing', next: 'defense' });
    expect(switched).toEqual({ ok: true, group: 'defense', fee: 8_000, cashAfter: 1_000 });
  });

  it('rejects a group outside the coach roster', () => {
    expect(isCoachGroup('passing')).toBe(true);
    expect(isCoachGroup('elite')).toBe(false);
    expect(hireCoach({ cash: 20_000, current: null, next: 'elite' })).toEqual({
      ok: false,
      reason: 'group',
    });
    expect(hireCoach({ cash: 20_000, current: null, next: 88 })).toEqual({
      ok: false,
      reason: 'group',
    });
    expect(hireCoach({ cash: 0, current: null, next: 'nope' })).toEqual({
      ok: false,
      reason: 'group',
    });
    expect(hireCoach({ cash: 20_000, current: null, next: null })).toEqual({
      ok: false,
      reason: 'group',
    });
  });
});

describe('applyCoachYield', () => {
  it('raises only passing by 1 and does not invent skill', () => {
    const player = { potential: 80, groups: { ...groups } };
    const next = applyCoachYield(player, 'passing', 'passing');
    expect(next.groups).toEqual({ ...groups, passing: 51 });
    expect(player.groups.passing).toBe(50);
    expect(next).not.toHaveProperty('skill');
    expect(next).not.toHaveProperty('status');
    expect(next).not.toHaveProperty('energy');
  });

  it('keeps an existing skill, status, and energy', () => {
    const player = {
      potential: 80,
      skill: 40,
      status: 'READY',
      energy: 55,
      groups: { ...groups, passing: 40 },
    };
    const next = applyCoachYield(player, 'passing', 'passing');
    expect(next.skill).toBe(40);
    expect(next.status).toBe('READY');
    expect(next.energy).toBe(55);
    expect(next.groups?.passing).toBe(41);
    expect(next.potential).toBe(80);
  });

  it('does not change passing when the coach covers attack', () => {
    const player = { potential: 90, groups };
    const next = applyCoachYield(player, 'attack', 'passing');
    expect(next).toBe(player);
    expect(next.groups).toBe(groups);
    expect(next.groups?.passing).toBe(50);
  });

  it('returns the same object when groups are missing', () => {
    const player = { potential: 77, name: 'A' };
    expect(applyCoachYield(player, 'passing', 'passing')).toBe(player);
    expect(player).not.toHaveProperty('groups');
  });

  it('returns the same object when the coach is null', () => {
    const player = { potential: 90, groups };
    expect(applyCoachYield(player, null, 'passing')).toBe(player);
    expect(applyCoachYield(player, null, null)).toBe(player);
  });

  it('does not boost on regeneration', () => {
    const player = { potential: 90, groups };
    const next = applyCoachYield(player, 'passing', null);
    expect(next).toBe(player);
    expect(next.groups?.passing).toBe(50);
  });

  it('does not raise a group above potential', () => {
    const capped = {
      potential: 50,
      groups: { ...groups, passing: 50 },
    };
    const next = applyCoachYield(capped, 'passing', 'passing');
    expect(next.groups?.passing).toBe(50);
    expect(next.groups?.attack).toBe(40);
  });
});
