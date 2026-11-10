import { describe, expect, it } from 'vitest';

import { orderForFormation, pitchSlotsFor } from '@/lib/match/order-xi';

const SQUAD = [
  { id: 'gk', role: 'GK' as const },
  { id: 'rb', role: 'RB' as const },
  { id: 'cb1', role: 'CB' as const },
  { id: 'cb2', role: 'CB' as const },
  { id: 'lb', role: 'LB' as const },
  { id: 'cm1', role: 'CM' as const },
  { id: 'cm2', role: 'CM' as const },
  { id: 'rw', role: 'RW' as const },
  { id: 'cm3', role: 'CM' as const },
  { id: 'lw', role: 'LW' as const },
  { id: 'st', role: 'ST' as const },
];

describe('orderForFormation', () => {
  it('puts a winger on the wing in 4-4-2, not at centre-back', () => {
    const ids = orderForFormation(SQUAD, '4-4-2').map((player) => player.id);
    expect(ids.slice(0, 5)).toEqual(['gk', 'rb', 'cb1', 'cb2', 'lb']);
    expect(ids[5]).toBe('rw');
    expect(ids[8]).toBe('lw');
    expect(ids[9]).toBe('st');
    expect(ids.filter((id) => id.startsWith('cm'))).toHaveLength(3);
  });

  it('draws the winger on the wing of the pre-match pitch', () => {
    const slots = pitchSlotsFor(
      SQUAD.map((player, index) => ({ ...player, number: index + 1 })),
      '4-4-2',
    );
    const wing = slots.find((slot) => slot.number === 8);
    const back = slots.find((slot) => slot.number === 3);
    expect(wing && back && wing.y).toBeLessThan(back.y);
    expect(wing?.x).toBeGreaterThan(70);
  });

  it('fills 4-3-3 wide slots with the wide players', () => {
    const ids = orderForFormation(SQUAD, '4-3-3').map((player) => player.id);
    expect(ids.slice(0, 5)).toEqual(['gk', 'rb', 'cb1', 'cb2', 'lb']);
    expect(ids.slice(5)).toEqual(['cm1', 'cm2', 'cm3', 'rw', 'st', 'lw']);
  });
});
