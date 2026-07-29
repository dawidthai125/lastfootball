import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const landingHeader = readFileSync(
  join(process.cwd(), 'src/components/landing/LandingHeader.tsx'),
  'utf8',
);
const landingPage = readFileSync(
  join(process.cwd(), 'src/components/landing/LandingPage.tsx'),
  'utf8',
);
const rootLayout = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
const topBar = readFileSync(join(process.cwd(), 'src/components/layout/TopBar.tsx'), 'utf8');
const leftNav = readFileSync(
  join(process.cwd(), 'src/components/layout/LeftNavigation.tsx'),
  'utf8',
);

describe('LFE-BRANDING-01B logo rollout guards', () => {
  it('replaces legacy landing square mark with BrandLogo lockup', () => {
    expect(landingHeader).toContain('variant="lockup"');
    expect(landingHeader).toContain('BrandLogo');
    expect(landingHeader).not.toContain('lf-landing__brand-mark');
  });

  it('uses brand system in hero and footer', () => {
    expect(landingPage).toContain('lf-landing__brand-hero-mark');
    expect(landingPage).toContain('variant="wordmark"');
    expect(landingPage).toContain('lf-landing__footer-brand-logo');
  });

  it('wires metadata icons and social preview', () => {
    expect(rootLayout).toContain('/favicon.svg');
    expect(rootLayout).toContain('/favicon.ico');
    expect(rootLayout).toContain('/icon-192.png');
    expect(rootLayout).toContain('/icon-512.png');
    expect(rootLayout).toContain('/apple-touch-icon.png');
    expect(rootLayout).toContain('/social-preview.png');
  });

  it('uses monogram branding in shell top bar and left nav', () => {
    expect(topBar).toContain('variant="monogram"');
    expect(leftNav).toContain('variant="wordmark"');
    expect(leftNav).toContain('variant="monogram"');
  });
});
