import type { ReactNode } from 'react';

import { LandingChrome } from '@/components/landing/LandingChrome';

import '@/components/landing/landing.css';

/** Public marketing shell — no game AppShell. */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lf-landing">
      <LandingChrome>{children}</LandingChrome>
    </div>
  );
}
