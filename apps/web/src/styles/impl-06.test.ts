import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const liveCss = readFileSync(join(process.cwd(), 'src/components/match/live-match.css'), 'utf8');
const postCss = readFileSync(
  join(process.cwd(), 'src/components/match/post-match/post-match.css'),
  'utf8',
);
const pathCss = readFileSync(join(process.cwd(), 'src/components/match/match-path.css'), 'utf8');

/**
 * LFE-UI-IMPL-06 — Live → Post fidelity guards.
 */
describe('LFE-UI-IMPL-06 live layout', () => {
  it('stacks stage on mobile and uses 3 columns from 1024px', () => {
    expect(liveCss).toContain('.lf-live__stage');
    expect(liveCss).toMatch(/grid-template-columns:\s*1fr/);
    expect(liveCss).toMatch(/@media \(min-width: 1024px\)/);
    expect(liveCss).toMatch(
      /grid-template-columns:\s*minmax\(13rem,\s*17rem\)\s+minmax\(0,\s*1fr\)\s+minmax\(13rem,\s*17rem\)/,
    );
  });

  it('defines half-time banner and Live scarlet chip', () => {
    expect(liveCss).toContain('.lf-live__ht');
    expect(liveCss).toContain('var(--lf-color-status-live)');
  });

  it('puts pitch first on mobile via order', () => {
    expect(liveCss).toContain('order: 1');
    expect(liveCss).toContain('order: 2');
    expect(liveCss).toContain('.lf-live__pitch');
    expect(liveCss).toContain('.lf-live__feed');
  });
});

describe('LFE-UI-IMPL-06 post + overlays', () => {
  it('keeps decision-first post hierarchy hooks', () => {
    expect(postCss).toContain('.lf-post__decision');
    expect(postCss).toContain('.lf-post__primary-slot');
    expect(postCss).toContain('.lf-post__hero');
  });

  it('uses shared motion classes for moment overlays (LFE-UI-MOTION-01)', () => {
    const overlayTsx = readFileSync(
      join(process.cwd(), 'src/components/match/MatchMomentOverlay.tsx'),
      'utf8',
    );
    expect(overlayTsx).toContain('lf-motion-fade-in');
    expect(overlayTsx).toContain('lf-motion-enter');
    expect(pathCss).not.toContain('@keyframes lf-mp-overlay');
    expect(pathCss).toContain('prefers-reduced-motion');
  });
});
