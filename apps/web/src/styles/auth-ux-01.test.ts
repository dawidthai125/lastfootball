import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const landingCss = readFileSync(join(process.cwd(), 'src/components/landing/landing.css'), 'utf8');
const landingHeader = readFileSync(
  join(process.cwd(), 'src/components/landing/LandingHeader.tsx'),
  'utf8',
);
const landingChrome = readFileSync(
  join(process.cwd(), 'src/components/landing/LandingChrome.tsx'),
  'utf8',
);
const loginModal = readFileSync(
  join(process.cwd(), 'src/components/landing/LoginModal.tsx'),
  'utf8',
);
const authStage = readFileSync(join(process.cwd(), 'src/components/auth/AuthStage.tsx'), 'utf8');
const loginPage = readFileSync(join(process.cwd(), 'src/app/(auth)/login/page.tsx'), 'utf8');
const registerPage = readFileSync(join(process.cwd(), 'src/app/(auth)/register/page.tsx'), 'utf8');
const marketingLayout = readFileSync(join(process.cwd(), 'src/app/(marketing)/layout.tsx'), 'utf8');

describe('LFE-AUTH-UX-01 auth experience guards', () => {
  it('uses premium marketing header height without changing Hub shell topbar token', () => {
    expect(landingCss).toContain('--lf-landing-header-h');
    expect(landingCss).not.toMatch(
      /\.lf-landing__header\s*\{[^}]*height:\s*var\(--lf-shell-topbar\)/,
    );
    expect(landingHeader).toContain('size="xl"');
    expect(landingHeader).toContain('onLoginClick');
  });

  it('wires LandingChrome Login Modal with a11y behaviors', () => {
    expect(marketingLayout).toContain('LandingChrome');
    expect(landingChrome).toContain('LoginModal');
    expect(loginModal).toContain('aria-modal="true"');
    expect(loginModal).toContain('Escape');
    expect(loginModal).toContain('LoginForm');
    expect(loginModal).toContain('lf-login-modal__backdrop');
  });

  it('renders /login and /register through AuthStage Tunnel experience', () => {
    expect(authStage).toContain('hero-002-tunnel-night.png');
    expect(loginPage).toContain('AuthStage');
    expect(loginPage).toContain('LoginForm');
    expect(registerPage).toContain('AuthStage');
    expect(registerPage).toContain('RegisterForm');
    expect(registerPage).toContain('tone="register"');
  });

  it('keeps auth form presentation styles without token redesign', () => {
    expect(landingCss).toContain('.lf-auth-stage');
    expect(landingCss).toContain('.lf-login-modal');
    expect(landingCss).toContain('backdrop-filter');
  });
});
