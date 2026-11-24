import type { Metadata } from 'next';
import Link from 'next/link';

import { ContactLink, LegalPage, LegalSection } from '@/components/legal/LegalPage';
import { formatMoney } from '@/lib/finance/format-money';
import { ECONOMY_THIN } from '@/lib/finance/types';
import { HUMAN_AWARD_MIN_PLAYED, HUMAN_PRIZES } from '@/lib/league/human-awards';
import { LIVE_SUB_LIMIT } from '@/lib/match/manager-commands';
import { TRAINING_THIN } from '@/lib/training/types';
import { TRANSFERS_THIN } from '@/lib/transfers/types';

export const metadata: Metadata = {
  title: 'Jak grać',
  description: 'Krótki przewodnik po Last Football: mecz, skład, pieniądze, liga i rywale.',
};

/** Help for new players. Numbers come from the rules, so they cannot drift. */
export default function HelpPage() {
  return (
    <LegalPage title="Jak grać">
      <LegalSection title="W skrócie">
        <p>
          Prowadzisz klub od IV ligi w górę. Codziennie grasz jeden mecz ligowy albo pucharowy i
          jedno towarzyskie wyzwanie. Nowy dzień zaczyna się o północy czasu polskiego.
        </p>
      </LegalSection>
      <LegalSection title="Mecz">
        <ul>
          <li>Przed meczem ustaw jedenastkę i układ. Pomoże przycisk „Najlepsza jedenastka”.</li>
          <li>
            W trakcie zmieniasz styl gry i robisz do {LIVE_SUB_LIMIT} zmian. Mecz można zatrzymać i
            przyspieszyć.
          </li>
          <li>
            Gdy wyjdziesz w trakcie, mecz czeka. Po powrocie idzie dalej od miejsca, w którym
            wyszedłeś. Nie da się go zacząć od nowa.
          </li>
          <li>
            Na wynik działają umiejętności, energia, forma i morale zawodników oraz Twoje decyzje.
          </li>
        </ul>
      </LegalSection>
      <LegalSection title="Kadra">
        <ul>
          <li>Mecz zabiera energię. Wraca ona z każdą nocą i przy regeneracji na treningu.</li>
          <li>
            Zmęczeni częściej łapią kontuzje. Kartki i kontuzje oznaczają pauzę w kolejnych meczach.
          </li>
          <li>Trening odblokujesz po {TRAINING_THIN.UNLOCK_AFTER_PLAYED} meczach ligowych.</li>
          <li>Kontrakty są na sezony. Przed ich końcem porozmawiaj z zawodnikiem.</li>
          <li>W akademii wybierasz juniorów i możesz ich przenieść do kadry.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Pieniądze">
        <ul>
          <li>
            Na start masz {formatMoney(ECONOMY_THIN.STARTER_CASH)}. W IV lidze wygrana daje{' '}
            {formatMoney(ECONOMY_THIN.REWARD_WIN)}, remis {formatMoney(ECONOMY_THIN.REWARD_DRAW)}, a
            porażka {formatMoney(ECONOMY_THIN.REWARD_LOSS)}. Wyżej płacą lepiej.
          </li>
          <li>Po każdym meczu o stawkę płacisz pensje. Gdy kasy brakuje, spada morale.</li>
          <li>Zarabiasz też na biletach u siebie, sponsorze, zadaniach zarządu i sprzedaży.</li>
          <li>Potwierdzony e-mail daje raz 10 000 € i otwiera rywalizację z innymi graczami.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Transfery">
        <p>
          Rynek otwiera się po {TRANSFERS_THIN.UNLOCK_AFTER_PLAYED} meczach ligowych. Kupujesz,
          sprzedajesz, wypożyczasz i negocjujesz z innymi klubami. Kadra ma najwyżej{' '}
          {TRANSFERS_THIN.MAX_ROSTER} zawodników.
        </p>
      </LegalSection>
      <LegalSection title="Liga i puchar">
        <ul>
          <li>Sezon ma 22 kolejki i 12 klubów. Miejsca 1–2 dają awans, 11–12 spadek.</li>
          <li>Puchar Krajowy zaczyna się po 8. kolejce. Remis rozstrzyga dogrywka, potem karne.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Inni gracze">
        <ul>
          <li>
            Wyzwanie jest towarzyskie: grasz obie kadry, rywal dostaje wynik. Nie ma nagród ani
            pensji.
          </li>
          <li>
            Liga ludzi: 12 klubów, wspólny początek o 18:00. Taktyka jest zamknięta, decyduje skład.
            Za miejsca 1–{HUMAN_PRIZES.length} są nagrody, jeśli rozegrasz co najmniej{' '}
            {HUMAN_AWARD_MIN_PLAYED} z 22 kolejek.
          </li>
          <li>Klub z niewłaściwą nazwą lub nieuczciwą grą zgłosisz w Rywalizacji.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Konto">
        <p>
          Hasło, e-mail, powiadomienia i usunięcie konta znajdziesz w{' '}
          <Link href="/settings">Ustawieniach</Link>. Pytania: <ContactLink />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
