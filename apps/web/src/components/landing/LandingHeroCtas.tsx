'use client';

import { LandingCta } from '@/components/landing/LandingCta';
import { useLoginModal } from '@/components/landing/LandingChrome';

/** Hero CTA group — Primary register · Secondary opens Login Modal. */
export function LandingHeroCtas() {
  const { openLogin } = useLoginModal();

  return (
    <div className="lf-landing__cta-row lf-landing__cta-row--hero">
      <LandingCta href="/register" variant="primary">
        Załóż klub
      </LandingCta>
      <button
        type="button"
        className="lf-landing__cta lf-landing__cta--secondary"
        onClick={openLogin}
      >
        Zaloguj się
      </button>
    </div>
  );
}
