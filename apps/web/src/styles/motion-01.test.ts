import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const motionCss = readFileSync(join(process.cwd(), 'src/styles/motion.css'), 'utf8');
const globalsCss = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
const hubTsx = readFileSync(join(process.cwd(), 'src/components/hub/EarlyClubHub.tsx'), 'utf8');
const overlayTsx = readFileSync(
  join(process.cwd(), 'src/components/match/MatchMomentOverlay.tsx'),
  'utf8',
);
const pathCss = readFileSync(join(process.cwd(), 'src/components/match/match-path.css'), 'utf8');
const landingCss = readFileSync(join(process.cwd(), 'src/components/landing/landing.css'), 'utf8');
const navCss = readFileSync(join(process.cwd(), 'src/components/layout/left-nav.css'), 'utf8');

/**
 * LFE-UI-MOTION-01 — shared Thin motion guards.
 */
describe('LFE-UI-MOTION-01 shared contract', () => {
  it('defines one set of keyframes and classes with tokens', () => {
    expect(motionCss).toContain('@keyframes lf-motion-fade-in');
    expect(motionCss).toContain('@keyframes lf-motion-enter');
    expect(motionCss).toContain('.lf-motion-fade-in');
    expect(motionCss).toContain('.lf-motion-enter');
    expect(motionCss).toContain('.lf-motion-press:active');
    expect(motionCss).toContain('var(--lf-motion-fast)');
    expect(motionCss).toContain('var(--lf-motion-base)');
    expect(motionCss).toContain('prefers-reduced-motion');
  });

  it('imports shared motion from globals', () => {
    expect(globalsCss).toContain("import '../styles/motion.css'");
  });

  it('wires Hub decision enter and Primary press only', () => {
    expect(hubTsx).toContain('lf-hub__decision lf-motion-enter');
    expect(hubTsx).toContain('lf-hub__primary lf-motion-press');
  });

  it('wires Match Goal/Final overlay to shared enter classes', () => {
    expect(overlayTsx).toContain('lf-mp-overlay lf-motion-fade-in');
    expect(overlayTsx).toContain('lf-mp-overlay__panel lf-motion-enter');
  });

  it('does not keep duplicate overlay keyframes in match-path', () => {
    expect(pathCss).not.toMatch(/@keyframes\s+lf-mp-overlay/);
  });

  it('press feedback is active-only without transition (instant release)', () => {
    expect(motionCss).toMatch(/\.lf-motion-press:active\s*\{/);
    expect(motionCss).not.toMatch(/\.lf-motion-press\s*\{[^}]*transition:/);
  });

  it('does not attach shared motion classes to Landing or left-nav CSS', () => {
    expect(landingCss).not.toContain('lf-motion-enter');
    expect(landingCss).not.toContain('lf-motion-press');
    expect(navCss).not.toContain('lf-motion-enter');
    expect(navCss).not.toContain('lf-motion-press');
  });
});
