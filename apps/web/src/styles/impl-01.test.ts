import { describe, expect, it } from 'vitest';

import { colors, grid, radius } from '@/styles/tokens';

/**
 * LFE-UI-IMPL-01 — regression guards for Shell/Hub Night Pitch Office tokens.
 */
describe('LFE-UI-IMPL-01 tokens', () => {
  it('uses SKIN-01 Night Pitch Office base and brass', () => {
    expect(colors.bg.base.toLowerCase()).toBe('#07111c');
    expect(colors.gold.base.toLowerCase()).toBe('#c9a85c');
    expect(colors.text.onGold.toLowerCase()).toBe('#12100a');
  });

  it('uses Hi-Fi shell topbar and moderate radius', () => {
    expect(grid.shell.topbar).toBe('52px');
    expect(radius.md).toBe('8px');
    expect(radius.sm).toBe('6px');
  });
});

describe('LFE-UI-IMPL-01 PTI-01 routes', () => {
  it('documents mobile parity targets', () => {
    const targets = {
      squadDetail: '/players/[id]',
      transferOffer: '/transfers',
      pti: ['PTI-01-SQD-03-M', 'PTI-01-XFR-02-M'],
    };
    expect(targets.squadDetail).toContain('players');
    expect(targets.transferOffer).toBe('/transfers');
    expect(targets.pti).toHaveLength(2);
  });
});
