import type { Metadata } from 'next';

import { LandingCta } from '@/components/landing/LandingCta';

export const metadata: Metadata = {
  title: 'Konto usunięte',
  robots: { index: false, follow: false },
};

export default function AccountDeletedPage() {
  return (
    <div className="lf-landing__gate">
      <h1>Konto usunięte</h1>
      <p>Usunęliśmy konto, klub i powiadomienia. Dziękujemy za grę.</p>
      <LandingCta href="/" variant="primary">
        Strona główna
      </LandingCta>
    </div>
  );
}
