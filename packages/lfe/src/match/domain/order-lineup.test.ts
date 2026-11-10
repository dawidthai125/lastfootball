import { describe, expect, it } from 'vitest';

import { orderPlayersByRole } from './order-lineup';

const SQUAD = [
  { id: 'gk', role: 'GK' as const },
  { id: 'rb', role: 'RB' as const },
  { id: 'cb1', role: 'CB' as const },
  { id: 'cb2', role: 'CB' as const },
  { id: 'lb', role: 'LB' as const },
  { id: 'cm1', role: 'CM' as const },
  { id: 'rw', role: 'RW' as const },
  { id: 'cm2', role: 'CM' as const },
  { id: 'lw', role: 'LW' as const },
  { id: 'st', role: 'ST' as const },
  { id: 'cm3', role: 'CM' as const },
];

describe('orderPlayersByRole', () => {
  it('keeps the winger wide in 4-3-3', () => {
    const ids = orderPlayersByRole(SQUAD, '4-3-3').map((player) => player.id);
    expect(ids[0]).toBe('gk');
    expect(ids[2]).toBe('cb1');
    expect(ids[8]).toBe('rw');
    expect(ids[10]).toBe('lw');
    expect(ids[9]).toBe('st');
  });
});
