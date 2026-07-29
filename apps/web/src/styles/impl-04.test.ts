import { describe, expect, it } from 'vitest';

import { grid } from '@/styles/tokens';

/**
 * LFE-UI-IMPL-04 — shell polish guards (Hi-Fi rail + typography epic).
 */
describe('LFE-UI-IMPL-04 shell tokens', () => {
  it('uses Hi-Fi icon rail width within 72–88px', () => {
    const px = Number.parseInt(grid.shell.navCollapsed, 10);
    expect(px).toBeGreaterThanOrEqual(72);
    expect(px).toBeLessThanOrEqual(88);
  });

  it('keeps expanded nav tighter than legacy 184px', () => {
    const px = Number.parseInt(grid.shell.nav, 10);
    expect(px).toBeLessThan(184);
    expect(px).toBeGreaterThanOrEqual(120);
  });

  it('keeps topbar in Hi-Fi 48–56 band', () => {
    expect(grid.shell.topbar).toBe('52px');
  });
});
