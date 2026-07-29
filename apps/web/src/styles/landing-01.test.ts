import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const landingCss = readFileSync(
  join(process.cwd(), 'src/components/landing/landing.css'),
  'utf8',
);
const landingPage = readFileSync(
  join(process.cwd(), 'src/components/landing/LandingPage.tsx'),
  'utf8',
);

/**
 * LFE-LANDING-01 — marketing home full-bleed + solid CTA guards.
 */
describe('LFE-LANDING-01 landing redesign', () => {
  it('uses Tunnel HERO-002 as full-bleed hero art', () => {
    expect(landingPage).toContain('hero-002-tunnel-night.png');
    expect(landingPage).toContain('hero-002-tunnel-mobile.png');
    expect(landingPage).toContain('waId="HERO-002"');
    expect(landingPage).not.toContain('HeroCrest');
  });

  it('keeps Primary CTA copy „Załóż klub” and solid gold styles', () => {
    expect(landingPage).toContain('Załóż klub');
    expect(landingCss).toMatch(/\.lf-landing__cta--primary[\s\S]*?gold-base/);
    expect(landingCss).toMatch(/\.lf-landing__cta--primary[\s\S]*?text-on-gold/);
  });

  it('does not constrain hero/story to legacy narrow max-width column', () => {
    expect(landingCss).not.toMatch(/\.lf-landing__hero-inner[\s\S]*?width:\s*min\(40rem/);
    expect(landingCss).toContain('.lf-landing__story--band');
    expect(landingCss).toMatch(/\.lf-landing__story--band[\s\S]*?max-width:\s*none/);
  });

  it('shows product proof: season WA strip + UI showcase crops', () => {
    expect(landingPage).toContain('hero-004-locker-night.png');
    expect(landingPage).toContain('hero-005-transfer-night.png');
    expect(landingPage).toContain('hero-006-training.png');
    expect(landingPage).toContain('LandingUiCrops');
    expect(landingCss).toContain('.lf-landing__showcase-grid');
  });
});
