import { describe, expect, it } from 'vitest';

import type { SquadPlayerDto } from '@/lib/squad/types';
import { applyXiSelection, validateStartingXi } from '@/lib/squad/validate-starting-xi';

function player(
  partial: Partial<SquadPlayerDto> & Pick<SquadPlayerDto, 'id' | 'position' | 'starter'>,
): SquadPlayerDto {
  return {
    name: partial.name ?? partial.id,
    shortName: partial.id,
    age: 24,
    form: 70,
    energy: 80,
    skill: 65,
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
