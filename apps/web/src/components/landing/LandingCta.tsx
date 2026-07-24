import Link from 'next/link';
import type { ReactNode } from 'react';

type LandingCtaProps = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
};

/** Landing CTAs — Link styled with design tokens (Button is button-only). */
export function LandingCta({
  href,
  children,
  variant = 'primary',
  className = '',
}: LandingCtaProps) {
  return (
    <Link
      href={href}
      className={['lf-landing__cta', `lf-landing__cta--${variant}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Link>
  );
}
