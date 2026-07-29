import type { ReactNode } from 'react';

import { BrandLogo } from '@/components/assets';
import { LandingArt } from '@/components/landing/LandingArt';

type AuthStageProps = {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
  /** Stronger career-start framing for register */
  tone?: 'login' | 'register';
};

/**
 * Auth experience shell — Tunnel hero + brand panel (presentation only).
 */
export function AuthStage({ eyebrow, title, lead, children, tone = 'login' }: AuthStageProps) {
  return (
    <section
      className={[
        'lf-auth-stage',
        tone === 'register' ? 'lf-auth-stage--register' : 'lf-auth-stage--login',
      ].join(' ')}
      aria-labelledby="auth-stage-title"
      data-lf-impl="LFE-AUTH-UX-01"
    >
      <LandingArt
        waId="HERO-002"
        desktopSrc="/assets/world-art/hero-002-tunnel-night.png"
        mobileSrc="/assets/world-art/hero-002-tunnel-mobile.png"
        alt=""
        className="lf-auth-stage__art"
        priority
      />
      <div className="lf-auth-stage__scrim" aria-hidden />
      <div className="lf-auth-stage__panel">
        <div className="lf-auth-stage__brand">
          <BrandLogo size="lg" variant="lockup" priority />
        </div>
        <p className="lf-landing__eyebrow">{eyebrow}</p>
        <h1 id="auth-stage-title" className="lf-auth-stage__title">
          {title}
        </h1>
        <p className="lf-auth-stage__lead">{lead}</p>
        <div className="lf-auth-stage__body">{children}</div>
      </div>
    </section>
  );
}
