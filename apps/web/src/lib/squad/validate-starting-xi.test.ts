import { describe, expect, it } from 'vitest';

import type { SquadPlayerDto } from '@/lib/squad/types';
import {
  applyXiSelection,
  replaceUnavailableStarters,
  validateStartingXi,
} from '@/lib/squad/validate-starting-xi';

function player(
  partial: Partial<SquadPlayerDto> & Pick<SquadPlayerDto, 'id' | 'position' | 'starter'>,
): SquadPlayerDto {
  return {
    name: partial.name ?? partial.id,
    shortName: partial.id,
    shirtNumber: partial.shirtNumber ?? 1,
    age: 24,
    form: 70,
    energy: 80,
    skill: 65,
    potentialBand: 'medium',
    potentialLabel: 'Średni',
    careerPhase: 'rising',
    careerPhaseLabel: 'Rozwój',
    status: partial.status ?? 'READY',
    nationality: 'PL',
    attributes: [],
    contract: { wage: 1000, until: '2028', clause: 0, role: 'Zawodnik' },
    history: [],
    captain: false,
    version: 1,
    ...partial,
  };
}

describe('LFE-UI-IMPL-05 validateStartingXi', () => {
  it('requires exactly 11 and a goalkeeper', () => {
    const ten = Array.from({ length: 10 }, (_, i) =>
      player({ id: `p${i}`, position: i === 0 ? 'BR' : 'ŚP', starter: true }),
    );
    expect(validateStartingXi(ten).ok).toBe(false);

    const elevenNoGk = Array.from({ length: 11 }, (_, i) =>
      player({ id: `n${i}`, position: 'ŚP', starter: true }),
    );
    const noGk = validateStartingXi(elevenNoGk);
    expect(noGk.ok).toBe(false);
    expect(noGk.hasGoalkeeper).toBe(false);

    const ok = Array.from({ length: 11 }, (_, i) =>
      player({ id: `ok${i}`, position: i === 0 ? 'BR' : 'ŚP', starter: true }),
    );
    expect(validateStartingXi(ok).ok).toBe(true);
  });

  it('hard-blocks injured starters', () => {
    const xi = Array.from({ length: 11 }, (_, i) =>
      player({
        id: `w${i}`,
        position: i === 0 ? 'BR' : 'N',
        starter: true,
        status: i === 1 ? 'INJURED' : 'READY',
      }),
    );
    const v = validateStartingXi(xi);
    expect(v.ok).toBe(false);
    expect(v.errors.length).toBeGreaterThan(0);
  });

  it('hard-blocks suspended starters', () => {
    const xi = Array.from({ length: 11 }, (_, i) =>
      player({
        id: `s${i}`,
        position: i === 0 ? 'BR' : 'N',
        starter: true,
        status: i === 2 ? 'SUSPENDED' : 'READY',
      }),
    );
    expect(validateStartingXi(xi).ok).toBe(false);
  });

  it('allows tired with warning at threshold ≥4', () => {
    const xi = Array.from({ length: 11 }, (_, i) =>
      player({
        id: `t${i}`,
        position: i === 0 ? 'BR' : 'N',
        starter: true,
        status: i > 0 && i < 5 ? 'TIRED' : 'READY',
      }),
    );
    const v = validateStartingXi(xi);
    expect(v.ok).toBe(true);
    expect(v.warnings.length).toBeGreaterThan(0);
  });

  it('warns when two explosive low-morale starters create a dressing conflict', () => {
    const xi = Array.from({ length: 11 }, (_, i) =>
      player({
        id: `d${i}`,
        position: i === 0 ? 'BR' : 'N',
        starter: true,
        morale: i === 1 || i === 2 ? 40 : 70,
        personality: i === 1 || i === 2 ? 'wybuchowy' : 'spokojny',
      }),
    );
    const v = validateStartingXi(xi);
    expect(v.ok).toBe(true);
    expect(v.warnings.some((w) => w.includes('Szatnia'))).toBe(true);
  });
});

describe('LFE-UI-IMPL-05 applyXiSelection', () => {
  it('promotes bench when XI incomplete', () => {
    const players = [
      player({ id: 'gk', position: 'BR', starter: true }),
      player({ id: 'b1', position: 'N', starter: false }),
    ];
    const next = applyXiSelection(players, null, 'b1');
    expect(next.players.find((p) => p.id === 'b1')?.starter).toBe(true);
    expect(next.selectedId).toBeNull();
  });

  it('does not promote injured bench', () => {
    const players = [
      player({ id: 'gk', position: 'BR', starter: true }),
      player({ id: 'inj', position: 'N', starter: false, status: 'INJURED' }),
    ];
    const next = applyXiSelection(players, null, 'inj');
    expect(next.players.find((p) => p.id === 'inj')?.starter).toBe(false);
  });

  it('swaps starter with bench when XI full', () => {
    const players = Array.from({ length: 11 }, (_, i) =>
      player({ id: `s${i}`, position: i === 0 ? 'BR' : 'ŚP', starter: true }),
    ).concat([player({ id: 'bench', position: 'N', starter: false })]);

    const select = applyXiSelection(players, null, 's1');
    expect(select.selectedId).toBe('s1');
    const swapped = applyXiSelection(select.players, select.selectedId, 'bench');
    expect(swapped.players.find((p) => p.id === 's1')?.starter).toBe(false);
    expect(swapped.players.find((p) => p.id === 'bench')?.starter).toBe(true);
    expect(swapped.selectedId).toBeNull();
  });
});

describe('replaceUnavailableStarters', () => {
  const xi = (over: Record<number, Partial<SquadPlayerDto>> = {}) =>
    Array.from({ length: 11 }, (_, i) =>
      player({
        id: `x${i}`,
        position: i === 0 ? 'BR' : i > 8 ? 'N' : 'ŚP',
        starter: true,
        ...over[i],
      }),
    );

  it('swaps banned, injured and called-up starters for the best fit', () => {
    const squad = [
      ...xi({
        0: { status: 'SUSPENDED' },
        3: { status: 'INJURED' },
        9: { intlAbsentUntil: '2026-11-30' },
      }),
      player({ id: 'gk', position: 'BR', starter: false }),
      player({ id: 'mid', position: 'ŚP', starter: false, skill: 50 }),
      player({ id: 'fwd', position: 'N', starter: false, skill: 80 }),
    ];
    const fixed = replaceUnavailableStarters(squad, '2026-11-23');
    const starters = fixed.filter((p) => p.starter);
    expect(validateStartingXi(starters, '2026-11-23').ok).toBe(true);
    expect(starters.map((p) => p.id)).toEqual(expect.arrayContaining(['gk', 'mid', 'fwd']));
    expect(squad[0]!.starter).toBe(true);
  });

  it('keeps the gate closed when no keeper is free', () => {
    const squad = [
      ...xi({ 0: { status: 'SUSPENDED' } }),
      player({ id: 'mid', position: 'ŚP', starter: false }),
    ];
    const fixed = replaceUnavailableStarters(squad, '2026-11-23');
    expect(validateStartingXi(fixed.filter((p) => p.starter)).ok).toBe(false);
  });
});
