import type { Metadata } from 'next';

import { ContactLink, LegalPage, LegalSection, OperatorLine } from '@/components/legal/LegalPage';
import { LEGAL, OPERATOR } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Regulamin',
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <LegalPage title="Regulamin">
      <LegalSection title="1. Kto prowadzi grę">
        <p>
          Grę Last Football ({OPERATOR.site}) prowadzi <OperatorLine /> („my”). Kontakt:{' '}
          <ContactLink />.
        </p>
      </LegalSection>
      <LegalSection title="2. Czym jest gra">
        <p>
          Last Football to przeglądarkowy menedżer piłkarski. Gra jest bezpłatna. Waluta, zawodnicy,
          nagrody i trofea istnieją tylko w grze: nie mają wartości pieniężnej i nie można ich
          wymienić na pieniądze ani sprzedać. W grze nie ma zakładów ani płatnych losowań.
        </p>
      </LegalSection>
      <LegalSection title="3. Czego potrzebujesz">
        <p>
          Aktualnej przeglądarki, połączenia z internetem i adresu e-mail. Grać mogą osoby, które
          ukończyły {LEGAL.minAge} lat. Potwierdzasz to przy zakładaniu konta.
        </p>
      </LegalSection>
      <LegalSection title="4. Konto">
        <p>
          Umowa o korzystanie z gry zaczyna się z chwilą założenia konta i trwa bezterminowo. Jedna
          osoba ma jedno konto. Podajesz swój prawdziwy adres e-mail i chronisz hasło. Część meczów
          wymaga potwierdzenia adresu.
        </p>
      </LegalSection>
      <LegalSection title="5. Zasady uczciwej gry">
        <p>Nie wolno:</p>
        <ul>
          <li>zakładać wielu kont ani używać botów i skryptów,</li>
          <li>wykorzystywać błędów gry zamiast je zgłosić,</li>
          <li>omijać zabezpieczeń, zakłócać działania gry i wchodzić na cudze konta,</li>
          <li>nadawać klubom nazw bezprawnych, obraźliwych albo naruszających cudze prawa.</li>
        </ul>
      </LegalSection>
      <LegalSection title="6. Naruszenia">
        <p>
          Za naruszenie zasad możemy zmienić nazwę klubu, cofnąć nieuczciwe korzyści, zablokować
          albo usunąć konto. Podajemy powód. Możesz się odwołać na <ContactLink />. Na ten adres
          zgłosisz też bezprawną treść: podaj, gdzie jest i dlaczego jest bezprawna.
        </p>
      </LegalSection>
      <LegalSection title="7. Zmiany i przerwy w grze">
        <p>
          Grę rozwijamy: zmieniamy zasady, liczby i funkcje, naprawiamy błędy i robimy przerwy
          techniczne. Jeśli zakończymy grę, uprzedzimy co najmniej 30 dni wcześniej na stronie i
          e-mailem.
        </p>
      </LegalSection>
      <LegalSection title="8. Rezygnacja">
        <p>
          Umowę możesz zakończyć w każdej chwili: konto usuniesz w Ustawieniach. Konsument może też
          odstąpić od umowy w ciągu 14 dni bez podania powodu, pisząc na <ContactLink />.
        </p>
      </LegalSection>
      <LegalSection title="9. Reklamacje">
        <p>
          Reklamację wyślij na <ContactLink />: podaj adres e-mail konta i opisz problem.
          Odpowiadamy w ciągu 14 dni. Nic w regulaminie nie ogranicza praw konsumenta wynikających z
          przepisów, w tym praw w razie niezgodności usługi cyfrowej z umową. Konsument może
          skorzystać z pomocy rzecznika konsumentów i pozasądowego rozwiązania sporu (informacje:
          uokik.gov.pl).
        </p>
      </LegalSection>
      <LegalSection title="10. Prawa do gry">
        <p>
          Kod, grafika, nazwa i treści gry należą do nas lub naszych licencjodawców. Możesz z nich
          korzystać, grając. Zawodnicy i kluby sterowane przez komputer są zmyśleni.
        </p>
      </LegalSection>
      <LegalSection title="11. Zmiana regulaminu">
        <p>
          O zmianie uprzedzimy co najmniej 14 dni wcześniej na stronie i e-mailem, z podaniem
          powodu: zmiana prawa, nowa funkcja, bezpieczeństwo albo poprawa błędu. Jeśli się nie
          zgadzasz, możesz usunąć konto.
        </p>
      </LegalSection>
      <LegalSection title="12. Prawo">
        <p>
          Obowiązuje prawo polskie. Konsument zachowuje ochronę, którą daje mu prawo kraju jego
          zamieszkania. Regulamin obowiązuje od {LEGAL.since}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
