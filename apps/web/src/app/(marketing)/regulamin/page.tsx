import type { Metadata } from 'next';

import { LandingCta } from '@/components/landing/LandingCta';

export const metadata: Metadata = {
  title: 'Regulamin',
  robots: { index: false, follow: false },
};

/** Legal placeholder — copy in later EPIC / §28. */
export default function TermsPage() {
  return (
    <div className="lf-landing__gate">
      <h1>Regulamin</h1>
      <p>Treść prawna pojawi się przed otwarciem rejestracji (P2). Placeholder pod link z Landingu.</p>
      <LandingCta href="/" variant="primary">
        Wróć
      </LandingCta>
    </div>
  );
}
