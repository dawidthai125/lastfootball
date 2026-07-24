import type { ReactNode } from 'react';

import { LandingHeader } from '@/components/landing/LandingHeader';

import '@/components/landing/landing.css';

/** Auth shell — same world as Landing, no game chrome. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lf-landing lf-landing--auth">
      <LandingHeader variant="auth" />
      <main className="lf-landing__auth-main">{children}</main>
    </div>
  );
}
