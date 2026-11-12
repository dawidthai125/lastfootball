import { describe, expect, it } from 'vitest';

import {
  applyMatchSquadTruth,
  attributeBars,
  bumpGroup,
  energyAfterTraining,
  groupKeyForFocus,
  groupsFromSkill,
  mapGroupsToLfeSkills,
  payWages,
  wageFromSkill,
  weeklyMatchWage,
  type SquadTruthPlayer,
} from './truth';

function player(
  partial: Partial<SquadTruthPlayer> & Pick<SquadTruthPlayer, 'id'>,
): SquadTruthPlayer {
  const skill = partial.skill ?? 60;
  return {
    id: partial.id,
    pos: partial.pos ?? 'ŚP',
    status: partial.status ?? 'READY',
    skill,
    potential: partial.potential ?? 80,
    groups: partial.groups ?? groupsFromSkill(skill),
    energy: partial.energy ?? 80,
    form: partial.form ?? 70,
    recentRatings: partial.recentRatings ?? [],
    suspensionMatches: partial.suspensionMatches ?? 0,
  };
}

describe('squad truth attributes', () => {
  it('copies skill into every group', () => {
    expect(groupsFromSkill(64)).toEqual({
      attack: 64,
      passing: 64,
      defense: 64,
      physical: 64,
      goalkeeping: 64,
    });
  });

  it('picks the training group for technique, physical, and tactics', () => {
    expect(groupKeyForFocus('technique', 'OB')).toBe('passing');
    expect(groupKeyForFocus('physical', 'N')).toBe('physical');
    expect(groupKeyForFocus('tactics', 'BR')).toBe('goalkeeping');
    expect(groupKeyForFocus('tactics', 'N')).toBe('attack');
    expect(groupKeyForFocus('regeneration', 'BR')).toBeNull();
    expect(groupKeyForFocus('tactics', 'ŚO')).toBe('defense');
    expect(groupKeyForFocus('tactics', 'ŚP')).toBe('passing');
  });

  it('does not raise a group above the ceiling', () => {
    const groups = groupsFromSkill(70);
    const next = bumpGroup(groups, 'passing', 15, 78);
    expect(next.passing).toBe(78);
    expect(next.attack).toBe(70);
    expect(next.defense).toBe(70);
    expect(next.physical).toBe(70);
    expect(next.goalkeeping).toBe(70);
    expect(groups.passing).toBe(70);
    expect(bumpGroup(groupsFromSkill(90), 'physical', 20, 150).physical).toBe(99);
  });

  it('maps attack to finishing and goalkeeping to gkDiving', () => {
    const groups = {
      attack: 77,
      passing: 60,
      defense: 55,
      physical: 50,
      goalkeeping: 12,
    };
    const skills = mapGroupsToLfeSkills(groups);
    expect(skills.finishing).toBe(groups.attack);
    expect(skills.gkDiving).toBe(groups.goalkeeping);
    expect(skills.longShots).toBe(73);
    expect(skills.gkPositioning).toBe(9);
  });

  it('labels the five bars in Polish', () => {
    const bars = attributeBars(groupsFromSkill(40));
    expect(bars.map((bar) => bar.label)).toEqual([
      'Atak',
      'Podanie',
      'Obrona',
      'Fizyczność',
      'Bramkarskie',
    ]);
    expect(bars.map((bar) => bar.value)).toEqual([40, 40, 40, 40, 40]);
  });
});

describe('squad truth wages', () => {
  it('prices a 24-year-old at skill 50', () => {
    expect(wageFromSkill(50, 24)).toBe(1200 + 50 * 35 + 8 * 50);
  });

  it('never goes negative and partial-pays', () => {
    expect(payWages(1000, 400)).toEqual({ paid: 400, nextCash: 600 });
    expect(payWages(100, 250)).toEqual({ paid: 100, nextCash: 0 });
    expect(payWages(0, 80)).toEqual({ paid: 0, nextCash: 0 });
    expect(payWages(-40, 25)).toEqual({ paid: 0, nextCash: 0 });
  });

  it('charges one seventh of the weekly bill for a match', () => {
    expect(weeklyMatchWage(7000)).toBe(1000);
    expect(weeklyMatchWage(0)).toBe(0);
    expect(weeklyMatchWage(Number.NaN)).toBe(0);
  });
});

describe('squad truth training energy', () => {
  it('heals injured and tired players and raises energy on regeneration', () => {
    expect(
      energyAfterTraining({
        energy: 40,
        focus: 'regeneration',
        intensity: 'high',
        status: 'INJURED',
      }),
    ).toEqual({ energy: 68, status: 'READY' });
    expect(
      energyAfterTraining({
        energy: 90,
        focus: 'regeneration',
        intensity: 'normal',
        status: 'TIRED',
      }),
    ).toEqual({ energy: 100, status: 'READY' });
  });

  it('does not change status on a light session', () => {
    expect(
      energyAfterTraining({
        energy: 40,
        focus: 'physical',
        intensity: 'light',
        status: 'TIRED',
      }),
    ).toEqual({ energy: 50, status: 'TIRED' });
    expect(
      energyAfterTraining({
        energy: 40,
        focus: 'tactics',
        intensity: 'light',
        status: 'INJURED',
      }),
    ).toEqual({ energy: 50, status: 'INJURED' });
    expect(
      energyAfterTraining({
        energy: 40,
        focus: 'technique',
        intensity: 'light',
        status: 'READY',
      }),
    ).toEqual({ energy: 50, status: 'READY' });
  });
});

describe('applyMatchSquadTruth', () => {
  const squad: SquadTruthPlayer[] = [
    player({ id: 'p-xi', pos: 'N', energy: 80 }),
    player({ id: 'p-bench', pos: 'ŚP', energy: 48 }),
    player({ id: 'p-out', pos: 'OB', energy: 30, status: 'TIRED' }),
    player({ id: 'p-ban', status: 'SUSPENDED', suspensionMatches: 1, energy: 20 }),
    player({ id: 'p-hurt', status: 'INJURED', energy: 15, pos: 'PN' }),
  ];
  const input = {
    matchKey: 'league:3:home',
    result: 'draw' as const,
    roleById: {
      'p-xi': 'xi' as const,
      'p-bench': 'bench' as const,
      'p-out': 'out' as const,
      'p-ban': 'out' as const,
      'p-hurt': 'out' as const,
    },
  };

  it('returns the same output for the same input', () => {
    expect(applyMatchSquadTruth(squad, input)).toEqual(applyMatchSquadTruth(squad, input));
    expect(squad[0]?.energy).toBe(80);
  });

  it('reduces suspensionMatches by 1 when a suspended player is out', () => {
    const before = player({
      id: 'ban-1',
      status: 'SUSPENDED',
      suspensionMatches: 2,
      energy: 40,
      recentRatings: [66],
    });
    const [after] = applyMatchSquadTruth([before], {
      matchKey: 'md-9',
      result: 'draw',
      roleById: { 'ban-1': 'out' },
    });
    expect(after?.suspensionMatches).toBe(1);
    expect(after?.status).toBe('SUSPENDED');
    expect(after?.recentRatings).toEqual([66]);
  });

  it('lowers xi energy by 22 and adds one rating', () => {
    const before = player({ id: 'xi-1', energy: 80, recentRatings: [70] });
    const [after] = applyMatchSquadTruth([before], {
      matchKey: 'md-9',
      result: 'win',
      roleById: { 'xi-1': 'xi' },
    });
    expect(after?.energy).toBe(58);
    expect(after?.recentRatings).toEqual([70, 75]);
    expect(after?.skill).toBe(before.skill);
    expect(after?.groups).toEqual(before.groups);
  });

  it('raises energy for a player left out', () => {
    const before = player({ id: 'out-1', energy: 50, status: 'READY' });
    const [after] = applyMatchSquadTruth([before], {
      matchKey: 'md-9',
      result: 'loss',
      roleById: { 'out-1': 'out' },
    });
    expect(after?.energy).toBe(64);
    expect(after?.recentRatings).toEqual([]);
    expect(after?.status).toBe('READY');
  });
});
