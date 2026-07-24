import Link from 'next/link';

import { AtmosphereLayer } from '@/components/assets/AtmosphereLayer';
import { HeroCrest } from '@/components/landing/HeroCrest';
import { LandingCta } from '@/components/landing/LandingCta';
import { StorySection } from '@/components/landing/StorySection';

/**
 * Public Landing — P0.5 Section Flow S0–S4.
 * Tokens only; no game AppShell.
 */
export function LandingPage() {
  return (
    <>
      {/* S0 — Hero: brand first, one CTA group, full-bleed atmosphere */}
      <AtmosphereLayer className="lf-landing__hero" aria-label="Wejście do LastFootball" layers={['floodlight', 'vignette', 'grain']}>
        <div className="lf-landing__hero-scrim" />
        <div className="lf-landing__hero-inner">
          <p className="lf-landing__brand-hero">LastFootball</p>
          <h1 className="lf-landing__headline">Załóż klub. Prowadź go przez ligę.</h1>
          <p className="lf-landing__support">Każdy mecz jest Twój.</p>
          <HeroCrest />
          <div className="lf-landing__cta-row">
            <LandingCta href="/register" variant="primary">
              Załóż klub
            </LandingCta>
            <LandingCta href="/login" variant="secondary">
              Zaloguj się
            </LandingCta>
          </div>
        </div>
      </AtmosphereLayer>

      {/* S1 — Identity */}
      <StorySection
        id="tozsamosc"
        eyebrow="Tożsamość"
        title="Nadasz klubowi imię, barwy i herb"
        visual={<IdentityVisual />}
      >
        <p>
          Nie wypełniasz formularza CRM — projektujesz klub, który będzie Twój od pierwszej minuty.
          Nazwa, skrót, kolory, herb: to akt własności, zanim zagrasz pierwszy mecz.
        </p>
      </StorySection>

      {/* S2 — Match */}
      <StorySection
        id="mecz"
        eyebrow="Mecz"
        title="Decyzja. Mecz. Wynik."
        reverse
        visual={<MatchBeatVisual />}
      >
        <p>
          Serce gry to mecz — przygotujesz skład, wejdziesz w napięcie spotkania i wrócisz z wynikiem,
          który należy do Ciebie. Nie raport w tabeli. Przeżycie.
        </p>
      </StorySection>

      {/* S3 — Season */}
      <StorySection
        id="sezon"
        eyebrow="Sezon"
        title="Budujesz instytucję, nie listę zadań"
        visual={<SeasonVisual />}
      >
        <p>
          Kolejka po kolejce rośnie reputacja i prestiż klubu. Wracasz, bo masz powód: następny mecz,
          decyzję dnia, własną drogę w lidze.
        </p>
      </StorySection>

      {/* S4 — Close CTA */}
      <section className="lf-landing__close" aria-labelledby="close-title">
        <h2 id="close-title" className="lf-landing__close-title">
          Twój klub czeka na pierwszą decyzję
        </h2>
        <p className="lf-landing__close-support">Załóż konto i stwórz klub w kilka minut.</p>
        <div className="lf-landing__cta-row">
          <LandingCta href="/register" variant="primary">
            Załóż klub
          </LandingCta>
        </div>
      </section>

      <footer className="lf-landing__footer">
        <p className="lf-landing__footer-brand">LastFootball</p>
        <nav className="lf-landing__footer-links" aria-label="Informacje prawne">
          <Link href="/regulamin" className="lf-landing__footer-link">
            Regulamin
          </Link>
          <Link href="/prywatnosc" className="lf-landing__footer-link">
            Polityka prywatności
          </Link>
        </nav>
      </footer>
    </>
  );
}

function IdentityVisual() {
  return (
    <div className="lf-landing__motif lf-landing__motif--identity">
      <span className="lf-landing__swatch" style={{ background: 'var(--lf-color-pitch)' }} />
      <span className="lf-landing__swatch" style={{ background: 'var(--lf-color-gold-base)' }} />
      <span className="lf-landing__swatch" style={{ background: 'var(--lf-color-text-primary)' }} />
      <span className="lf-landing__motif-label">Barwy · Herb · Nazwa</span>
    </div>
  );
}

function MatchBeatVisual() {
  return (
    <ol className="lf-landing__beat">
      <li>Przygotuj</li>
      <li className="lf-landing__beat-live">Mecz</li>
      <li>Wynik</li>
    </ol>
  );
}

function SeasonVisual() {
  return (
    <div className="lf-landing__ladder" aria-hidden>
      <span>IV</span>
      <span>III</span>
      <span>II</span>
      <span className="lf-landing__ladder-focus">I</span>
    </div>
  );
}
