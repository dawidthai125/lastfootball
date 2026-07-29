import Link from 'next/link';
import { BrandLogo } from '@/components/assets';

type LandingHeaderProps = {
  /** `auth` hides login CTA (session pages / forms). */
  variant?: 'marketing' | 'auth';
};

/** Minimal marketing chrome — brand + secondary login. */
export function LandingHeader({ variant = 'marketing' }: LandingHeaderProps) {
  return (
    <header className="lf-landing__header">
      <Link href="/" className="lf-landing__brand" aria-label="LastFootball — strona główna">
        <BrandLogo size="md" variant="lockup" />
      </Link>
      {variant === 'marketing' ? (
        <Link href="/login" className="lf-landing__header-login">
          Zaloguj się
        </Link>
      ) : (
        <span className="lf-landing__header-login" style={{ visibility: 'hidden' }} aria-hidden>
          —
        </span>
      )}
    </header>
  );
}
