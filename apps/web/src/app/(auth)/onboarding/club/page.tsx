import type { Metadata } from 'next';

import { LandingCta } from '@/components/landing/LandingCta';

export const metadata: Metadata = {
  title: 'Stwórz klub',
  robots: { index: false, follow: false },
};

/**
 * Club Wizard placeholder — full §5 flow in P3.
 * Route reserved so Welcome CTA and middleware onboarding path are live.
 */
export default function ClubOnboardingStubPage() {
  return (
    <div className="lf-landing__gate lf-landing__gate--auth">
      <p className="lf-landing__eyebrow">Kreacja klubu</p>
      <h1>Wizard klubu — następny etap</h1>
      <p className="lf-landing__gate-lead">
        Tu powstanie kreacja tożsamości (nazwa, barwy, herb) i zapis do tabeli{' '}
        <code>clubs</code>. Po P3 ten ekran odblokuje Hub.
      </p>
      <div className="lf-landing__cta-row">
        <LandingCta href="/welcome" variant="secondary">
          Wróć do powitania
        </LandingCta>
      </div>
    </div>
  );
}
