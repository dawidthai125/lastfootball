import { describe, expect, it } from 'vitest';

import { MORALE_ATTENTION, resolveMoraleHint } from '@/lib/squad/morale-hint';

describe('resolveMoraleHint', () => {
  it('returns null when starters are fine', () => {
    expect(
      resolveMoraleHint([
        { id: 'a', name: 'A', morale: 70, personality: 'lider', starter: true },
        { id: 'b', name: 'B', morale: 55, personality: 'wybuchowy', starter: true },
      ]),
    ).toBeNull();
  });

  it('surfaces one low-morale starter', () => {
    expect(
      resolveMoraleHint([
        {
          id: 'a',
          name: 'Adam',
          morale: MORALE_ATTENTION - 1,
          personality: 'spokojny',
          starter: true,
        },
      ]),
    ).toBe(`Adam: niskie morale (${MORALE_ATTENTION - 1}).`);
  });

  it('prefers dressing conflict copy when two explosive starters are hot', () => {
    const hint = resolveMoraleHint([
      { id: 'a', name: 'Ala', morale: 40, personality: 'wybuchowy', starter: true },
      { id: 'b', name: 'Bartek', morale: 30, personality: 'wybuchowy', starter: true },
    ]);
    expect(hint).toBe('Szatnia: Ala i Bartek — zajrzyj do Wiadomości.');
  });

  it('ignores departed and bench for single low-morale line', () => {
    expect(
      resolveMoraleHint([
        {
          id: 'd',
          name: 'Out',
          morale: 10,
          personality: 'lider',
          starter: true,
          status: 'DEPARTED',
        },
        { id: 'b', name: 'Bench', morale: 10, personality: 'lider', starter: false },
        { id: 's', name: 'Starter', morale: 70, personality: 'lider', starter: true },
      ]),
    ).toBeNull();
  });
});
