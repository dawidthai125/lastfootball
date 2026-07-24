import type { Metadata } from 'next';

import { LandingCta } from '@/components/landing/LandingCta';
import { signOut } from '@/lib/auth/actions';
import { getAuthUser } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Witaj',
  robots: { index: false, follow: false },
};

/**
 * §4.3 Welcome — bridge to Club Wizard (P3).
 * Requires session (middleware).
 */
export default async function WelcomePage() {
  const user = await getAuthUser();
  const email = user?.email ?? null;

  return (
    <div className="lf-landing__gate lf-landing__gate--auth">
      <p className="lf-landing__eyebrow">Witaj w LastFootball</p>
      <h1>Zaraz stworzysz swój klub</h1>
      <p className="lf-landing__gate-lead">
        Zbudujesz klub i poprowadzisz go przez ligę. Jedna decyzja: zacznij kreację.
      </p>
      {email ? <p className="lf-auth-form__meta">{email}</p> : null}

      <div className="lf-landing__cta-row">
        <LandingCta href="/onboarding/club" variant="primary">
          Stwórz klub
        </LandingCta>
      </div>

      <form action={signOut} className="lf-auth-form__signout">
        <button type="submit" className="lf-landing__cta lf-landing__cta--secondary">
          Wyloguj
        </button>
      </form>
    </div>
  );
}
