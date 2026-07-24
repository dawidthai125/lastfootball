import type { ReactNode } from 'react';

import { LandingHeader } from '@/components/landing/LandingHeader';

import '@/components/landing/landing.css';

/** Public marketing shell — no game AppShell. */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lf-landing">
      <LandingHeader />
      {children}
    </div>
  );
}
