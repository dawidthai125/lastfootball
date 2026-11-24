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
        Co zapisujemy: adres e-mail i zaszyfrowane hasło, klub i przebieg gry, datę potwierdzenia
        adresu oraz dni, w których konto grało. Przy zakładaniu konta przez dwa dni trzymamy skrót
        adresu IP, żeby zatrzymać masowe rejestracje. Nie mamy reklam ani zewnętrznej analityki.
      </p>
      <p>Ciasteczka służą do logowania. Link od znajomego zapisuje na 30 dni kod zaproszenia.</p>
      <p>
        Konto usuniesz w Ustawieniach gry. Znika od razu razem z klubem, zawodnikami, wynikami i
        powiadomieniami, a w tabelach innych graczy zostaje „Klub usunięty”.
      </p>
      <p>
        Powiadomienia są dobrowolne i domyślnie wyłączone. Po włączeniu zapisujemy wybór, adres
        powiadomień przeglądarki i historię wysyłek (30 dni). E-maile wysyła dostawca poczty na
        potwierdzony adres. Wyłączysz je w ustawieniach gry lub linkiem w e-mailu.
      </p>
      <LandingCta href="/" variant="primary">
        Wróć
      </LandingCta>
    </div>
  );
}
