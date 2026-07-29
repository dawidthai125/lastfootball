'use client';

import Link from 'next/link';

import { BrandLogo } from '@/components/assets';

type LandingHeaderProps = {
  /** `auth` hides login CTA (session pages / forms). */
  variant?: 'marketing' | 'auth';
  /** Marketing: open login modal instead of navigating to /login. */
  onLoginClick?: () => void;
};

/** Premium marketing chrome — brand + Zaloguj (LFE-AUTH-UX-01). */
export function LandingHeader({ variant = 'marketing', onLoginClick }: LandingHeaderProps) {
  return (
    <header className="lf-landing__header">
      <Link href="/" className="lf-landing__brand" aria-label="LastFootball — strona główna">
        <BrandLogo size="xl" variant="lockup" className="lf-landing__brand-logo" priority />
      </Link>
      {variant === 'marketing' ? (
        onLoginClick ? (
          <button
            type="button"
            className="lf-landing__header-login lf-landing__header-login--cta"
            onClick={onLoginClick}
          >
            Zaloguj się
          </button>
        ) : (
          <Link href="/login" className="lf-landing__header-login lf-landing__header-login--cta">
            Zaloguj się
          </Link>
        )
      ) : (
        <Link href="/" className="lf-landing__header-home">
          Strona główna
        </Link>
      )}
    </header>
  );
}
