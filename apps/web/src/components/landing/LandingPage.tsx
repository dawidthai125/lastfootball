import Link from 'next/link';
import { BrandLogo } from '@/components/assets';

import { LandingArt } from '@/components/landing/LandingArt';
import { LandingCta } from '@/components/landing/LandingCta';
import { LandingScorebugCrop, LandingUiCrops } from '@/components/landing/LandingUiCrops';
import { StorySection } from '@/components/landing/StorySection';

/**
 * Public Landing — LFE-LANDING-01 (UI P0 marketing home).
 * Tokens + existing World Art only; no game AppShell.
 */
export function LandingPage() {
  return (
    <>
      {/* 2–3 — Full-bleed Hero Tunnel + CTA */}
      <section className="lf-landing__hero" aria-label="Wejście do LastFootball">
        <LandingArt
          waId="HERO-002"
          desktopSrc="/assets/world-art/hero-002-tunnel-night.png"
          mobileSrc="/assets/world-art/hero-002-tunnel-mobile.png"
          alt=""
          className="lf-landing__hero-art"
          priority
        />
        <div className="lf-landing__hero-scrim" aria-hidden />
        <div className="lf-landing__hero-inner">
          <BrandLogo
            size="lg"
            variant="wordmark"
            className="lf-landing__brand-hero-mark"
            priority
          />
          <h1 className="lf-landing__headline">Załóż klub. Prowadź go przez ligę.</h1>
          <p className="lf-landing__support">
            Każdy mecz jest Twój. Budujesz tożsamość klubu w gabinecie, prowadzisz go przez sezon i
            wracasz z wynikiem, który należy do Ciebie.
          </p>
          <div className="lf-landing__cta-row lf-landing__cta-row--hero">
            <LandingCta href="/register" variant="primary">
              Załóż klub
            </LandingCta>
            <LandingCta href="/login" variant="secondary">
              Zaloguj się
            </LandingCta>
          </div>
        </div>
      </section>

      {/* 4 — Gabinet Managera */}
      <StorySection
        id="gabinet"
        eyebrow="Gabinet"
        title="Decyzja dnia w Twoim klubie"
        visual={
          <LandingArt
            waId="HERO-001"
            desktopSrc="/assets/world-art/hero-001-office-night.png"
            mobileSrc="/assets/world-art/hero-001-office-mobile.png"
            alt="Gabinet managera nocą"
            className="lf-landing__band-art"
          />
        }
      >
        <p>
          Nadasz klubowi imię, barwy i herb — potem wracasz do gabinetu, gdzie jedna sprawa dnia
          prowadzi Cię do następnego meczu. Nie dashboard KPI. Biurko managera.
        </p>
      </StorySection>

      {/* 5 — Match Experience */}
      <StorySection
        id="mecz"
        eyebrow="Mecz"
        title="Decyzja. Mecz. Wynik."
        reverse
        visual={
          <div className="lf-landing__match-visual">
            <LandingArt
              waId="HERO-003"
              desktopSrc="/assets/world-art/hero-003-pitch-night.png"
              alt="Nocna murawa"
              className="lf-landing__band-art"
            />
            <LandingScorebugCrop />
          </div>
        }
      >
        <p>
          Z tunelu na murawę: przygotujesz skład, wejdziesz w napięcie spotkania i zobaczysz wynik,
          który należy do Ciebie. Serce gry to przeżycie meczu — nie raport w tabeli.
        </p>
      </StorySection>

      {/* 6 — Sezon */}
      <section className="lf-landing__season" id="sezon" aria-labelledby="sezon-title">
        <div className="lf-landing__season-copy">
          <p className="lf-landing__eyebrow">Sezon</p>
          <h2 id="sezon-title" className="lf-landing__story-title">
            Kadra. Transfery. Trening.
          </h2>
          <p className="lf-landing__story-body">
            Kolejka po kolejce budujesz instytucję: szatnia, biuro transferowe i boisko treningowe —
            ta sama pętla, która wraca Cię do następnego meczu.
          </p>
        </div>
        <div className="lf-landing__season-strip" aria-hidden>
          <LandingArt
            waId="HERO-004"
            desktopSrc="/assets/world-art/hero-004-locker-night.png"
            alt=""
            className="lf-landing__season-panel"
          />
          <LandingArt
            waId="HERO-005"
            desktopSrc="/assets/world-art/hero-005-transfer-night.png"
            alt=""
            className="lf-landing__season-panel"
          />
          <LandingArt
            waId="HERO-006"
            desktopSrc="/assets/world-art/hero-006-training.png"
            alt=""
            className="lf-landing__season-panel"
          />
        </div>
      </section>

      {/* 7 — UI Showcase */}
      <section className="lf-landing__showcase" id="produkt" aria-labelledby="showcase-title">
        <div className="lf-landing__showcase-intro">
          <p className="lf-landing__eyebrow">Produkt</p>
          <h2 id="showcase-title" className="lf-landing__story-title">
            Tak wygląda gra
          </h2>
          <p className="lf-landing__story-body">
            Gabinet, Live scorebug i skład XI — te same ekrany, które zobaczysz po założeniu klubu.
          </p>
        </div>
        <LandingUiCrops />
      </section>

      {/* 8 — Closing CTA */}
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

      {/* 9 — Footer */}
      <footer className="lf-landing__footer">
        <BrandLogo size="sm" variant="wordmark" className="lf-landing__footer-brand-logo" />
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
