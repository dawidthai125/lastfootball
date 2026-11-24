import type { Metadata } from 'next';

import { LandingCta } from '@/components/landing/LandingCta';

export const metadata: Metadata = {
  title: 'Polityka prywatności',
  robots: { index: false, follow: false },
};

/** Privacy placeholder — copy in later EPIC / §28. */
export default function PrivacyPage() {
  return (
    <div className="lf-landing__gate">
      <h1>Polityka prywatności</h1>
      <p>
        Treść prawna pojawi się przed otwarciem rejestracji (P2). Placeholder pod link z Landingu.
      </p>
      <p>
        Powiadomienia są dobrowolne i domyślnie wyłączone. Po włączeniu zapisujemy wybór, adres
        powiadomień przeglądarki i historię wysyłek (60 dni). E-maile wysyła dostawca poczty na
        potwierdzony adres. Wyłączysz je w ustawieniach gry lub linkiem w e-mailu.
      </p>
      <LandingCta href="/" variant="primary">
        Wróć
      </LandingCta>
    </div>
  );
}
