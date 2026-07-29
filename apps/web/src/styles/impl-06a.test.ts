import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { grid } from '@/styles/tokens';

const hubCss = readFileSync(join(process.cwd(), 'src/components/hub/hub-decision.css'), 'utf8');
const navCss = readFileSync(join(process.cwd(), 'src/components/layout/left-nav.css'), 'utf8');

/**
 * LFE-UI-IMPL-06A — desktop Hub width + nav tooltip guards.
 */
describe('LFE-UI-IMPL-06A hub desktop layout', () => {
  it('centers hub with desktop max-width ≥ 64rem (not legacy 42rem)', () => {
    expect(hubCss).toMatch(/max-width:\s*68rem/);
    expect(hubCss).toMatch(/max-width:\s*72rem/);
    expect(hubCss).toMatch(/margin-inline:\s*auto/);
    expect(hubCss).not.toMatch(/max-width:\s*42rem/);
  });

  it('exposes a larger desktop hero band', () => {
    expect(hubCss).toMatch(/min-height:\s*300px/);
    expect(hubCss).toMatch(/max-height:\s*420px/);
  });

  it('uses decision-stage + body grid for desktop hierarchy', () => {
    expect(hubCss).toContain('.lf-hub__decision-stage');
    expect(hubCss).toContain('.lf-hub__body');
    expect(hubCss).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/);
    expect(hubCss).toMatch(
      /grid-template-columns:\s*minmax\(14rem,\s*22rem\)\s+minmax\(0,\s*1fr\)/,
    );
  });
});

describe('LFE-UI-IMPL-06A nav tooltips', () => {
  it('keeps Hi-Fi collapsed rail width', () => {
    const px = Number.parseInt(grid.shell.navCollapsed, 10);
    expect(px).toBe(80);
  });

  it('defines instant tooltip (no delay) for collapsed rail', () => {
    expect(navCss).toContain("data-nav-collapsed='true'");
    expect(navCss).toContain('content: attr(data-lf-tooltip)');
    expect(navCss).toMatch(/transition:\s*none/);
  });
});
