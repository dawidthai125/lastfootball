import type { Metadata } from 'next';

import { ContactLink, LegalPage, LegalSection, OperatorLine } from '@/components/legal/LegalPage';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Polityka prywatności',
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Polityka prywatności">
      <LegalSection title="1. Administrator danych">
        <p>
          <OperatorLine />. Kontakt w sprawach danych: <ContactLink />.
        </p>
      </LegalSection>
      <LegalSection title="2. Jakie dane, po co i jak długo">
        <ul>
          <li>
            <strong>Konto:</strong> adres e-mail, zaszyfrowane hasło, data potwierdzenia adresu. Do
            założenia konta i logowania (umowa, art. 6 ust. 1 lit. b RODO). Do usunięcia konta.
          </li>
          <li>
            <strong>Gra:</strong> klub i przebieg gry. Do działania gry (umowa, lit. b). Do
            usunięcia konta.
          </li>
          <li>
            <strong>Dni gry:</strong> dni, w których konto grało. Do zliczania powrotów graczy
            (uzasadniony interes: rozwój gry, lit. f). Do usunięcia konta.
          </li>
          <li>
            <strong>Rejestracja i reset hasła:</strong> skrót adresu IP, a przy resecie także skrót
            adresu e-mail, trzymane około 2 dni, oraz przy rejestracji sprawdzenie przeglądarki i
            adresu IP przez Cloudflare Turnstile. Do ochrony przed botami i masowymi rejestracjami
            (uzasadniony interes: bezpieczeństwo, lit. f).
          </li>
          <li>
            <strong>Powiadomienia e-mail:</strong> Twój wybór i historia wysyłek. Tylko po włączeniu
            (zgoda, lit. a). Wybór do usunięcia konta, historia 30 dni. Wyłączysz je w Ustawieniach
            lub linkiem w liście.
          </li>
          <li>
            <strong>Listy do nas:</strong> treść i adres nadawcy. Do odpowiedzi i reklamacji
            (uzasadniony interes, lit. f, albo obowiązek prawny, lit. c). Do {LEGAL.lettersMonths}{' '}
            miesięcy od zakończenia sprawy.
          </li>
          <li>
            <strong>Zgłoszenia i blokady:</strong> który klub kogo zgłosił i dlaczego, powód blokady
            lub zmiany nazwy. Do porządku w grze (uzasadniony interes, lit. f). Zgłoszenia i
            dziennik działań do roku od zamknięcia, blokada do jej zdjęcia lub usunięcia konta.
          </li>
          <li>
            <strong>Zmiana adresu:</strong> nowy e-mail czekający na potwierdzenie, około doby
            (umowa, lit. b).
          </li>
          <li>
            <strong>Dzienniki techniczne:</strong> m.in. adres IP i czas zapytania w dziennikach
            dostawców serwerów. Do bezpieczeństwa i naprawy błędów (uzasadniony interes, lit. f).
            Przez czas ustawiony u dostawcy.
          </li>
        </ul>
        <p>Podanie e-maila i hasła jest dobrowolne, ale bez nich nie założysz konta.</p>
      </LegalSection>
      <LegalSection title="3. Komu powierzamy dane">
        <p>Danych nie sprzedajemy. Korzystamy z tych dostawców:</p>
        <ul>
          <li>Supabase: baza danych i logowanie, serwery w Szwecji.</li>
          <li>Vercel: hosting gry, serwery w Niemczech.</li>
          <li>Resend: wysyłka e-maili i odbiór listów do nas, region w Irlandii.</li>
          <li>
            Cloudflare: ochrona formularza rejestracji (Turnstile). Część danych Cloudflare
            przetwarza jako osobny administrator, żeby ulepszać wykrywanie botów.
          </li>
          <li>Dostawca skrzynki pocztowej, na którą trafiają listy do nas.</li>
        </ul>
        <p>
          Bazę i serwery gry wybraliśmy w Unii Europejskiej. Vercel, Resend i Cloudflare to jednak
          firmy z USA, a Supabase działa też przez spółki w USA i Singapurze, więc dane mogą być tam
          przekazywane lub dostępne. Podstawą są standardowe klauzule umowne Komisji Europejskiej, a
          w przypadku dostawców certyfikowanych także Ramy ochrony danych UE–USA. Kopię zabezpieczeń
          dostaniesz, pisząc na <ContactLink />.
        </p>
      </LegalSection>
      <LegalSection title="4. Co widzą inni gracze">
        <p>
          Nazwę klubu, herb, skład i wyniki. Nie widzą Twojego e-maila. Nie wpisuj danych osobowych
          w nazwie klubu.
        </p>
      </LegalSection>
      <LegalSection title="5. Ciasteczka i pamięć przeglądarki">
        <ul>
          <li>logowanie: niezbędne do gry,</li>
          <li>kod zaproszenia z linku od znajomego: do 30 dni,</li>
          <li>
            pamięć przeglądarki: zapis kreatora klubu, zamknięte okienka i ostatni dzień gry na
            urządzeniu,
          </li>
          <li>Cloudflare Turnstile: tylko to, co potrzebne do sprawdzenia przy rejestracji.</li>
        </ul>
        <p>Nie mamy reklam ani zewnętrznej analityki.</p>
      </LegalSection>
      <LegalSection title="6. Twoje prawa">
        <p>
          Możesz poprosić o dostęp do danych, kopię, poprawienie, usunięcie, ograniczenie i
          przeniesienie. Możesz wnieść sprzeciw wobec danych z uzasadnionego interesu i w każdej
          chwili cofnąć zgodę na powiadomienia. Napisz na <ContactLink />. Odpowiadamy w ciągu
          miesiąca. Możesz złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (uodo.gov.pl).
        </p>
      </LegalSection>
      <LegalSection title="7. Usunięcie konta">
        <p>
          Konto usuniesz w Ustawieniach gry. Od razu znikają konto, klub, zawodnicy, wyniki i
          powiadomienia. W tabelach innych graczy zostaje „Klub usunięty”. Kopie zapasowe dostawcy
          bazy wygasają później, według jego ustawień.
        </p>
      </LegalSection>
      <LegalSection title="8. Decyzje automatyczne">
        <p>
          Nie podejmujemy wobec Ciebie automatycznych decyzji, które wywołują skutki prawne, i nie
          profilujemy Cię w celach reklamowych.
        </p>
      </LegalSection>
      <LegalSection title="9. Zmiany">
        <p>
          O istotnej zmianie uprzedzimy na stronie i e-mailem. Polityka obowiązuje od {LEGAL.since}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
