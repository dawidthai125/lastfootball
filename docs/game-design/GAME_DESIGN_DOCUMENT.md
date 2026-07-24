# Last Football — Game Design Document (GDD)

**Produkt:** Last Football  
**Dokument:** GAME_DESIGN_DOCUMENT  
**Faza:** 2 — Game Design Foundation  
**Etap:** GDD-15 (§3–§15, §20 oraz §23 uzupełnione; pozostałe rozdziały = szkielet)  
**Status:** SSOT w budowie — kod gameplay nie wyprzedza decyzji z wypełnionych rozdziałów  
**Powiązanie techniczne:** LFE (Last Football Engine) — fundament gotowy (EPIC-1…7); ten dokument **nie** opisuje implementacji silnika.

> **SSOT:** To jest jedyne źródło prawdy dla mechanik gry. Kolejne EPIC-y gameplay mają wynikać z uzupełnionych rozdziałów tego dokumentu.

---

## Spis treści

1. [Wizja gry](#1-wizja-gry)
2. [Grupa docelowa](#2-grupa-docelowa)
3. [Główna pętla rozgrywki](#3-główna-pętla-rozgrywki) ← **GDD-02**
4. [Rejestracja gracza](#4-rejestracja-gracza) ← **GDD-03**
5. [Tworzenie klubu](#5-tworzenie-klubu) ← **GDD-03**
6. [Rozwój klubu](#6-rozwój-klubu) ← **GDD-13**
7. [Rozwój zawodników](#7-rozwój-zawodników) ← **GDD-06**
8. [Trening](#8-trening) ← **GDD-07**
9. [Mecze](#9-mecze) ← **GDD-04**
10. [Liga](#10-liga) ← **GDD-05**
11. [Puchary](#11-puchary) ← **GDD-08**
12. [Transfery](#12-transfery) ← **GDD-09**
13. [Stadion](#13-stadion) ← **GDD-12**
14. [Finanse](#14-finanse) ← **GDD-10**
15. [Sponsorzy](#15-sponsorzy) ← **GDD-11**
16. [Akademia](#16-akademia)
17. [Skauting](#17-skauting)
18. [Ranking](#18-ranking)
19. [Osiągnięcia](#19-osiągnięcia)
20. [Zadania dzienne](#20-zadania-dzienne) ← **GDD-15**
21. [Wiadomości](#21-wiadomości)
22. [Powiadomienia](#22-powiadomienia)
23. [Panel główny](#23-panel-główny) ← **GDD-14**
24. [Interfejs użytkownika](#24-interfejs-użytkownika)
25. [Styl graficzny](#25-styl-graficzny)
26. [System ekonomii](#26-system-ekonomii)
27. [Premium](#27-premium)
28. [Bezpieczeństwo](#28-bezpieczeństwo)
29. [Multiplayer](#29-multiplayer)
30. [Roadmapa rozwoju](#30-roadmapa-rozwoju)

---

## 1. Wizja gry

**Cel**  
Ustalić, czym jest Last Football jako produkt i jakie doświadczenie ma dostarczać graczowi.

**Opis**  
Last Football to przeglądarkowy menedżer piłkarski z własnym silnikiem meczu (LFE). Gracz prowadzi klub: skład, trening, transfery, finanse i rozgrywki — w stylu klasycznych menedżerów (klasa footballteam.pl), ale z nowoczesnym UX i deterministyczną symulacją meczów.

**Do opracowania**

- [ ] One-liner / elevator pitch
- [ ] USP względem footballteam / Football Manager / Softstar-like
- [ ] Ton narracji (realizm vs arcade)
- [ ] Scope MVP vs wizja długoterminowa
- [ ] Kryteria sukcesu produktu (retencja, DAU, długość sesji)

---

## 2. Grupa docelowa

**Cel**  
Zdefiniować, dla kogo budujemy grę i jakie potrzeby zaspokajamy.

**Opis**  
Dokumentacja person i kontekstów użycia (sesje krótkie w przeglądarce, powroty dzienne, rywalizacja w lidze).

**Do opracowania**

- [ ] Persony (casual / hardcore menedżer)
- [ ] Wiek, region, język (PL first?)
- [ ] Motywacje: rywalizacja, kolekcjonowanie, budowa klubu, social
- [ ] Ograniczenia (mobile vs desktop)
- [ ] Anti-persona (czego nie budujemy)

---

## 3. Główna pętla rozgrywki

**Status rozdziału:** GDD-02 — opracowany (doświadczenie gracza; bez ekonomii / treningu / transferów / AI / fizyki w detailu)

**Cel rozdziału**  
Ustalić, **co robi gracz** od pierwszego uruchomienia do wielomiesięcznego prowadzenia klubu — jako SSOT przepływu rozgrywki.

**Zasada nadrzędna**  
Mecz (wynik, emocja, feedback) jest sercem pętli. Reszta systemów **obsługuje** drogę do kolejnego meczu i rozwój tożsamości klubu. Szczegóły liczbowe systemów → późniejsze rozdziały GDD.

**Mapa horyzontów czasowych**

| Horyzont    | Gracz czuje               | Główny „beat”                          |
| ----------- | ------------------------- | -------------------------------------- |
| Minuty 0–15 | „To mój klub, zaraz gram” | Onboarding → pierwszy mecz             |
| Dzień 1     | „Wiem, co robić dziś”     | Hub + 1 decyzja + mecz / przygotowanie |
| Tydzień 1   | „Jestem w lidze”          | Kilka kolejek, rytm powrotów           |
| Sezon 1     | „Buduję historię”         | Tabela, cele sezonowe                  |
| Miesiące+   | „Mój klub ma tożsamość”   | Prestige, rywalizacja, kolekcja chwil  |

---

### 3.0 Schemat rdzenia (Core Loop)

```text
[Wejście / Hub]
      ↓
[Jedna jasna sprawa dnia / kolejki]  ← CTA na panelu głównym
      ↓
[Decyzja przedmeczowa]  ← skład / taktyka (lekko na start)
      ↓
[MECZ]  ← emocja + wynik (LFE)
      ↓
[Feedback]  ← wynik, skrót wydarzeń, „co dalej”
      ↓
[Mały progres klubu / składu]  ← odczucie wzrostu, nie spreadsheet
      ↓
[Powód do powrotu]  ← następny mecz, zadanie, wiadomość
```

Systemy (trening, transfery, finanse itd.) **wpinają się** w ten schemat jako „przygotowanie” lub „skutek” — nie zastępują meczu jako centrum.

---

### 3.1 Pierwsze uruchomienie gry

**Cel**  
W ciągu pierwszych minut sprawić, by gracz: (1) miał konto lub bezpieczny start, (2) poczuł własność klubu, (3) wiedział, że zaraz zagra mecz — bez ściany tutoriali.

**Przebieg (propozycja flow)**

1. Landing / wejście → rejestracja lub szybki start (§4).
2. Kreacja klubu: nazwa, kolory, herb — krótko (§5).
3. Ekran „Twój klub jest gotowy” — herb + nazwa jako bohater, jeden CTA: **Przejdź do panelu** / **Przygotuj pierwszy mecz**.
4. Minimalny kontekst: „Jesteś w Lidze X · najbliższy mecz: …” (bez wykładu o wszystkich systemach).
5. Soft gate: gracz **może** od razu iść w stronę pierwszego meczu; głębokie systemy są zamknięte lub wyszarzone z podpisem „odblokuje się wkrótce”.

**Decyzje gracza**

- Założyć konto vs kontynuować (jeśli guest — decyzja produktowa §4).
- Nazwa / wygląd klubu (tożsamość).
- Czy od razu grać, czy „rozejrzeć się” po hubie (oba OK; CTA faworyzuje mecz).

**Nagrody**

- Natychmiastowa: **własny klub na ekranie** (tożsamość).
- Narracyjna: krótka wiadomość powitalna od „zarządu” (§21) — 2–3 zdania, nie esej.
- Funkcjonalna: odblokowany dostęp do hubu i ścieżki pierwszego meczu.

**Zależności od innych systemów**

- §4 Rejestracja, §5 Tworzenie klubu, §23 Panel główny, §21 Wiadomości, §9 Mecze (wejście), §10 Liga (przypisanie startowe — fakt, nie reguły).

**Pytania otwarte**

- Czy wymuszamy konto przed kreacją klubu, czy po pierwszym meczu?
- Czy pierwszy przeciwnik to zawsze bot / tutorial match, czy od razu kolejka ligowa?
- Ile pól kreacji klubu w MVP (tylko nazwa+kolory vs herb builder)?

---

### 3.2 Pierwsze 15 minut

**Cel**  
Domknąć **pierwszy pełny cykl emocji**: „ustawiłem coś → zagrałem → zobaczyłem wynik → wiem, co robić dalej”. Cel metryczny (produktowy): ukończony pierwszy mecz + powrót na hub bez frustracji.

**Przebieg**

1. Hub z jednym dominującym CTA: **Pierwszy mecz** / **Ustaw skład**.
2. Ekran przedmeczowy uproszczony: formacja domyślna już ustawiona; gracz może zaakceptować lub lekko zmienić XI (bez głębokiej taktyki).
3. Mecz: podgląd / skrót / wynik (szczegół UX meczu → §9 + UI Guide) — ważne, by trwał subiektywnie krótko w onboardingu.
4. Ekran po meczu: wynik, 3–5 kluczowych eventów, przycisk **Wróć do klubu**.
5. Hub odświeżony: gratulacje + **następny konkret** (kolejny mecz w kalendarzu lub „jutro / w kolejce”).

**Decyzje gracza**

- Zaakceptować skład startowy vs podmienić 1–2 nazwiska (niski koszt poznawczy).
- Obejrzeć mecz vs szybciej przejść do wyniku (jeśli produkt na to pozwala).
- Czy przeczytać wiadomość powitalną / pominąć.

**Nagrody**

- Wynik meczu (wygrana = euforia; porażka = „następny raz” + łagodny feedback, nie kara).
- Pierwszy „progress tick” (np. odblokowanie zakładki Drużyna w pełniejszym zakresie — **bez** liczb ekonomii).
- Poczucie sprawczości: „to mój wynik”.

**Zależności**

- §9 Mecze, §7 Zawodnicy (podgląd składu), §23 Hub, §19 Osiągnięcia (opcjonalnie „Pierwszy mecz”), LFE MatchSession jako nośnik doświadczenia (kontrakt produktowy, nie API).

**Pytania otwarte**

- Czy w pierwszych 15 min pokazujemy **żywą** symulację, czy wynik + highlights?
- Czy porażka w pierwszym meczu ma osobny ton copy (ochrona early churn)?
- Skip tutorial — jak mocno chronimy przed pustym hubem bez CTA?

---

### 3.3 Pierwszy dzień

**Cel**  
Zbudować mentalny model: **Hub = centrum**, **kalendarz mówi co ważne**, nie trzeba znać całej gry.

**Przebieg**

1. Powrót / kontynuacja sesji tego samego dnia → ten sam hub, ten sam jasny CTA.
2. Gracz widzi: najbliższy mecz, stan „czy skład gotowy”, 1 krótką wiadomość, ewentualnie 1 zadanie dzienne (§20 — jako hak, nie obowiązek).
3. Opcjonalna eksploracja: skład, tabela ligowa (read-only na start).
4. Zamknięcie dnia: albo zagrany mecz dnia, albo świadome „wrócę na kolejny mecz” z zapisanym stanem.

**Decyzje gracza**

- Czy dziś grać mecz, czy tylko obejrzeć klub.
- Czy kliknąć w wiadomość / zadanie (opcjonalne).
- Czy wejść głębiej w skład (ciekawość) — bez wymuszenia.

**Nagrody**

- Ukończenie „dnia meczu” (subiektywne domknięcie).
- Lekki progress odkrywania UI (progressive disclosure).
- Spokój: nic krytycznego nie „gnije” niewidocznie (jasny status kolejki).

**Zależności**

- §23 Hub, §20 Zadania, §21–22 Komunikacja, §10 Liga (terminarz), §9 Mecze.

**Pytania otwarte**

- Ile meczów maksymalnie w pierwszym dniu kalendarza gry (1 vs 2–3)?
- Czy dzień gry = dzień realny, czy przyspieszony czas gry (§10 / §30)?
- Co jeśli gracz nie zagra „zaległego” meczu — soft reminder vs hard block kolejki?

---

### 3.4 Pierwszy tydzień

**Cel**  
Ustabilizować **rytm powrotów**: gracz wie, że „w tygodniu są mecze”, a między nimi jest powód zajrzeć na chwilę (niekoniecznie godzinę).

**Przebieg**

1. 2–4 kolejki / spotkania w pierwszym tygodniu doświadczenia (dokładna liczba → §10).
2. Po 2–3 meczach: odsłonięcie kolejnej warstwy (np. pełniejszy skład, tabela „Twoja pozycja”).
3. Pierwszy kontakt z „przygotowaniem” jako **konceptem** (trening jako zapowiedź, nie pełny system — §8 później).
4. Podsumowanie tygodnia (lekki ekran lub wiadomość): bilans meczów, pozycja w tabeli, CTA na kolejny tydzień.

**Decyzje gracza**

- Priorytet: grać na bieżąco vs nadrabiać.
- Lekkie rotacje składu po zmęczeniu / kontuzji (jeśli już widoczne jako status, bez algorytmów tutaj).
- Czy czytać tabelę i „cel sezonu” (np. utrzymać się / mid-table — narracja).

**Nagrody**

- Pozycja w tabeli jako historia.
- Odblokowanie kolejnego obszaru UI (np. zakładka Rozgrywki w pełni).
- Pierwsze poczucie rywalizacji (nawet z botami).

**Zależności**

- §10 Liga, §9 Mecze, §6–7 Rozwój (odczucie, nie formuły), §20–22 retencja, §18 Ranking (opcjonalnie później).

**Pytania otwarte**

- Tempo odblokowań w tygodniu 1 (ile systemów naraz)?
- Czy tydzień 1 kończy się mini-bossem (derby / trudniejszy rywal) dla dramaturgii?
- Jak komunikujemy AFK — czy kolejka czeka, czy idzie auto-result (§9 / §29)?

---

### 3.5 Pierwszy sezon

**Cel**  
Dać **łuk narracyjny**: start → środek tabeli/walka → finał sezonu → przerwa / nowy sezon. Gracz kończy sezon z poczuciem „coś osiągnąłem / mam co poprawić”.

**Przebieg (fazy doświadczenia, nie reguły ligowe)**

1. **Otwarcie sezonu** — cele miękkie („Zakończ w bezpiecznej strefie”), kalendarz widoczny.
2. **Faza środka** — rutyna kolejek; hub coraz bardziej „o mnie” (forma, seria wyników).
3. **Faza końcowa** — napięcie tabeli; CTA meczy nabierają wagi.
4. **Zamknięcie sezonu** — ekran podsumowania: pozycja, bilans, 3 highlighty sezonu, odblokowanie międzysezonia (transfery jako **zapowiedź**, nie pełny design).
5. **Most do sezonu 2** — „Klub wraca mocniejszy” (motywacja, nie liczby).

**Decyzje gracza**

- Ambicja (bezpieczeństwo vs ryzyko w ustawieniu — na poziomie doświadczenia „gram o coś”).
- Czy dokańczać sezon mimo słabej passy.
- Co robić w przerwie (eksploracja klubu vs czekanie na nowy sezon).

**Nagrody**

- Uznanie sezonowe (miejsce, puchar jeśli dotyczy — §11).
- Osiągnięcia sezonowe (§19).
- Narracja tożsamości: „Sezon 1 — Last Football FC”.

**Zależności**

- §10–11 Rozgrywki, §6 Rozwój klubu, §19 Osiągnięcia, §18 Ranking, §30 Roadmapa contentu.

**Pytania otwarte**

- Długość sezonu w MVP (ile kolejek / czas realny)?
- Czy sezon 1 jest krótszy „tutorial season”?
- Czy przegrany sezon ma atrakcyjny soft landing (nie pure punishment)?

---

### 3.6 Codzienna pętla gracza

**Cel**  
Zdefiniować powtarzalną sesję **5–15 minut**: wejść → zrozumieć → zrobić jedną rzecz → wyjść z poczuciem domknięcia.

**Przebieg**

1. Wejście → Hub.
2. Odczyt stanu: „Co jest pilne?” (mecz dziś / wiadomość / zadanie).
3. Jedna ścieżka główna (zwykle: przygotuj → mecz **lub** przygotuj pod jutro).
4. Opcjonalnie 1 poboczna czynność (skład, wiadomość).
5. Wyjście z jasnym „następny powód powrotu”.

**Decyzje gracza**

- Co jest dziś główną akcją (system powinien podpowiadać, nie zmuszać do wyboru spośród 12 równych CTA).
- Głębokość sesji (szybki wynik vs dłuższy mecz).

**Nagrody**

- Domknięcie CTA dnia.
- Mikro-feedback (seria form, krótki status).
- Zadanie dzienne — jeśli nie koliduje z meczem (§20).

**Zależności**

- §23 Hub, §20 Zadania, §22 Powiadomienia, §9 Mecze.

**Pytania otwarte**

- Co gdy w danym dniu **nie ma** meczu — jaka jest domyślna pętla 5 min?
- Limit „sprawy do zrobienia”, by nie przytłoczyć (inbox zero menedżerski)?

---

### 3.7 Tygodniowa pętla

**Cel**  
Ułożyć rytm **kolejek + oddechów**: mecze jako beat, między nimi krótkie wizyty „utrzymaj klub”.

**Przebieg**

1. Na początku tygodnia (lub widoku kolejki): przegląd nadchodzących spotkań.
2. W dniach meczowych: codzienna pętla z meczu.
3. W dniach niemeczowych: lekki kontakt (skład, wiadomość, zadanie) — **bez** wymuszania grindu.
4. Podsumowanie / anticipation weekendu lub kolejnej kolejki.

**Decyzje gracza**

- Planowanie uwagi (które mecze oglądać „pełniej”).
- Czy nadrabiać zaległości w weekend.

**Nagrody**

- Seria wyników tygodnia.
- Pozycja w tabeli tydzień do tygodnia.
- Odblokowania tempa sezonu (progressive disclosure).

**Zależności**

- §10 Liga (kalendarz), §23 Hub, §20–22, §6–7 (odczucie formy drużyny).

**Pytania otwarte**

- Czy tydzień gry = tydzień realny zawsze?
- Jak wygląda „bye week” / brak meczu w produkcie?

---

### 3.8 Sezonowa pętla

**Cel**  
Opisać powtarzalny cykl **sezon → przerwa → nowy sezon**, który skaluje motywację bez spalenia early game.

**Przebieg**

1. Sezon ligowy (+ opcjonalnie puchar równolegle — §11).
2. Finał i ceremonia podsumowania.
3. Przerwa: przestrzeń na historię klubu, zapowiedź zmian składu / stadionu (systemy mogą być jeszcze płytkie).
4. Nowy sezon: reset tabeli, kontynuacja tożsamości klubu i pamięci gracza (nie „new save”).

**Decyzje gracza**

- Cele na nowy sezon (miękkie deklaracje).
- Czy wracać po przerwie (most narracyjny + powiadomienie).

**Nagrody**

- Trofea / miejsca w historii klubu.
- Prestige długoterminowe (§6 / §18).
- Content międzysezonowy (nawet prosty).

**Zależności**

- §10–11, §6, §18–19, §22, §30.

**Pytania otwarte**

- Czy przerwa ma content aktywny, czy jest tylko bramką czasową?
- Jak uniknąć „pustki” między sezonami w MVP?

---

### 3.9 Długoterminowa motywacja

**Cel**  
Utrzymać gracza **miesiącami**: tożsamość klubu, historia wyników, cele rosnące, rywalizacja społeczna — nie tylko codzienne checkboxy.

**Przebieg (filary doświadczenia)**

1. **Tożsamość** — herb, nazwa, kolory, „mój klub” na każdym ważnym ekranie.
2. **Historia** — sezony, serie, pamiętne mecze (highlight reel klubu).
3. **Mastery** — coraz lepsze czytanie składu i meczów (głębia odsłaniana stopniowo).
4. **Rywalizacja** — tabela, ranking, kiedyś MP (§18, §29).
5. **Kolekcja chwil** — osiągnięcia, wiadomości-epizody, derby.

**Decyzje gracza**

- Jaką historię chce budować (bezpieczny mid-table vs ambicja — narracyjnie).
- Czy angażować się w warstwy social / ranking.

**Nagrody**

- Prestige i rozpoznawalność w ekosystemie gry.
- Odblokowania kosmetyczne / klubowe (Premium = osobno §27 — tu tylko hak motywacyjny).
- Poczucie „klub żyje”, gdy wracam po przerwie.

**Zależności**

- §6–7, §18–19, §25 styl (tożsamość), §29 MP, §27 Premium (granice fair).

**Pytania otwarte**

- Co jest „north star” long-term: ranking, trofea, czy budowa składu-ikony?
- Jak pokazać historię klubu bez ciężkiego CMS?

---

### 3.10 Elementy zachęcające do regularnego powrotu

**Cel**  
Zdefiniować **uczciwe** haki retencji zgodne z menedżerem piłkarskim — nie dark pattern spam.

**Zestaw haków (doświadczenie)**

| Hak                         | Jak działa w pętli          | Uwagi                                      |
| --------------------------- | --------------------------- | ------------------------------------------ |
| Następny mecz w kalendarzu  | Najsilniejszy powód powrotu | Zawsze widoczny na hubie                   |
| Seria form / streak wyników | Emocja kontynuacji          | Nie karać brutalnie za zerwanie            |
| Wiadomość „pilna”           | 1 rzecz do przeczytania     | Limit, by nie spamować (§21–22)            |
| Zadanie dzienne             | Lekki bonus za wizytę       | Opcjonalne względem meczu (**SSOT → §20**) |
| Pozycja w tabeli            | Ambicja tygodnia            | Czytelna zmiana vs poprzednio              |
| Odblokowanie warstwy        | Progressive disclosure      | Nagroda za czas w grze                     |
| Powiadomienie o meczu       | Soft remind                 | Opt-in, quiet hours (§22)                  |
| Historia klubu              | „Wróć do swojej historii”   | Long-term                                  |

**Przebieg typowego powrotu po 24–48 h**

1. Powiadomienie lub organiczna wizyta.
2. Hub: „Od ostatniego razu…” (1–2 linie) + CTA meczu / sprawy.
3. Domknięcie w 5–15 min.
4. Nowy hak na kolejne 24–48 h.

**Decyzje gracza**

- Czy włączyć powiadomienia.
- Czy gonić zadania, czy tylko mecze.

**Nagrody**

- Utrzymanie ciągłości sezonu.
- Uniknięcie poczucia „zostawiłem klub” (status zawsze jasny).

**Zależności**

- §20–23, §9–10, §18–19, §22, UI Guide (hub CTA).

**Pytania otwarte**

- Polityka FOMO: czy mecze „przeterminowują się”?
- Czy Premium może **przyspieszać wygodę**, ale nie wynik meczu (§27)?
- Jak mierzymy „zdrowy” powrót (sesje / tydzień) vs toksyczny grind?

---

### 3.11 Kontrakty produktowe (dla kolejnych rozdziałów)

Decyzje z §3, które **wiążą** resztę GDD (bez implementacji):

1. **Hub-first** — każdy powrót ląduje na panelu z jednym głównym CTA (**szczegół ekranu → §23**).
2. **Mecz w centrum** — inne systemy są przygotowaniem lub konsekwencją (§8–15 podporządkowane).
3. **Progressive disclosure** — tydzień 1 ≠ pełna gra; odblokowania są nagrodą pętli.
4. **Sesja 5–15 min jest first-class** — deep play opcjonalny.
5. **Tożsamość klubu > meta UI** — brand gracza na pierwszym planie (UI Guide).
6. **Retencja przez kalendarz meczów**, nie przez sztuczny stamina gate (do potwierdzenia w §26–27).

---

### 3.12 Status checklisty §3

- [x] Pierwsze uruchomienie
- [x] Pierwsze 15 minut
- [x] Pierwszy dzień / tydzień / sezon
- [x] Pętle: dzienna, tygodniowa, sezonowa
- [x] Motywacja long-term + haki powrotu
- [x] Synchronizacja z §4–5 (GDD-03) — spójność onboarding flow
- [ ] Synchronizacja z §10 (gdy będzie liczba kolejek / czas gry)

---

## 4. Rejestracja gracza

**Status rozdziału:** GDD-03 — opracowany (doświadczenie; bez API / Supabase / kodu)

**Cel rozdziału**  
Doprowadzić gracza od pierwszego wejścia do stanu „mam konto i wiem, że zaraz założę klub” — szybko, czytelnie, bez zbędnych formularzy.

**Zasada nadrzędna (decyzja GDD-03)**  
**Konto przed utworzeniem klubu.** Chroni postęp i tożsamość klubu; kreacja klubu jest drugim aktem emocjonalnym (własność), nie pierwszym formularzem technicznym.

**Budżet czasu:** rejestracja + logowanie ≤ **2 minuty** na typowej ścieżce (OAuth / prosty email).

---

### 4.1 Wejście do gry

**Cel**  
Pierwszy ekran ma sprzedać obietnicę gry menedżerskiej i jasno powiedzieć, co zrobić dalej — bez ściany feature’ów.

**Przebieg**

1. Gracz otwiera `lastfootball.pl` (lub deep link).
2. Widzi landing / splash produktowy: marka **Last Football**, krótki one-liner, atmosfera boiska/klubu (UI Guide — bez AI-dashboard).
3. Dwa główne CTA (hierarchia):
   - **Graj / Załóż klub** (primary) → ścieżka nowego gracza (§4.2 → §5),
   - **Zaloguj się** (secondary) → istniejące konto.
4. Linki pomocnicze (footer / małe): Regulamin, Polityka prywatności — bez blokowania hero.
5. Jeśli sesja już aktywna → pomiń landing, wejdź na Hub (§23) lub wznów kreację klubu, jeśli niedokończona.

**Decyzje gracza**

- Nowy start vs logowanie.
- Czy przeczytać regulamin teraz, czy później (musi zaakceptować przy rejestracji).

**Dane wymagane od użytkownika**

- Na tym kroku: **brak** (tylko wybór ścieżki).

**Walidacje**

- Deep link / stale session: bezpieczne przekierowanie, komunikat gdy sesja wygasła.
- Utrzymanie języka UI (PL w MVP).

**Zależności od innych systemów**

- §1 Wizja (one-liner), §25 / UI Guide (hero), §4.2, §28 (zgody przy rejestracji), §23 (powrót zalogowanego).

**Pytania otwarte**

- Czy landing jest osobną stroną marketingową, czy ten sam app shell?
- Czy pokazujemy social proof (liczba menedżerów) na MVP?

---

### 4.2 Rejestracja / logowanie

**Cel**  
Minimalny, zaufany dostęp do konta — zero zbędnych pól.

**Przebieg**

**A. Nowy gracz (preferowana ścieżka szybka)**

1. Ekran „Utwórz konto”.
2. Opcje (kolejność UI):
   - **Kontynuuj z Google** (lub inny OAuth — primary UX),
   - **Email + hasło** (secondary).
3. Checkboxy wymagane: akceptacja Regulaminu + Polityki prywatności (jasne linki).
4. Opcjonalnie: zgoda marketingowa (domyślnie **wyłączona**).
5. Sukces → §4.3 Powitanie (lub od razu §5, jeśli powitanie jest jednym ekranem przejściowym).

**B. Powracający gracz**

1. „Zaloguj się” — te same metody (OAuth / email).
2. Sukces → Hub (§23), chyba że brak klubu → §5.
3. „Nie pamiętam hasła” → reset email (flow standardowy, bez projektowania backendu tutaj).

**C. Czego nie robimy w MVP onboardingu**

- Długi profil (imię, nick osobny, kraj, telefon) — **nie** na starcie.
- Wymuszenie avatara gracza przed klubem.
- Guest bez konta z pełnym klubem (ryzyko utraty postępu) — jeśli kiedyś guest, tylko do landingu; decyzja: **nie w MVP**.

**Decyzje gracza**

- Metoda konta (OAuth vs email).
- Akceptacja dokumentów prawnych.
- (Opcjonalnie) zgoda marketingowa.

**Dane wymagane od użytkownika**

| Ścieżka   | Pola                                      |
| --------- | ----------------------------------------- |
| OAuth     | Token dostawcy + akceptacja regulaminu    |
| Email     | Adres email, hasło, akceptacja regulaminu |
| Logowanie | Email+hasło **lub** OAuth                 |

**Walidacje (produktowe)**

- Email: format poprawny; hasło: minimalna siła (komunikat czytelny, nie „policy essay”).
- Konto już istnieje przy rejestracji → zaproponuj logowanie, nie „anonymous error”.
- Rate limit / zbyt wiele prób → spokojny komunikat (§28).
- Brak akceptacji regulaminu → nie da się kontynuować.

**Zależności**

- §28 Bezpieczeństwo, §22 Powiadomienia (opt-in później), auth tech (poza zakresem GDD — tylko wymaganie UX).

**Pytania otwarte**

- Którzy dostawcy OAuth w MVP (tylko Google vs Google+Apple)?
- Czy weryfikacja email jest wymagana **przed** pierwszym meczem, czy soft (przypomnienie)?
- Limit kont na urządzenie / anti-multi (§28)?

---

### 4.3 Powitanie nowego gracza

**Cel**  
Krótki most emocjonalny: „Zaraz stworzysz swój klub” — bez tutorial-wall.

**Przebieg**

1. Po udanej rejestracji: ekran powitalny (1 viewport).
2. Treść: powitanie + 1 zdanie obietnicy („Zbudujesz klub i poprowadzisz go przez ligę”).
3. Jedno CTA: **Stwórz klub**.
4. Brak checklisty 10 systemów; brak wymuszonego wideo.
5. Pomijalne? **Nie w MVP** — ekran jest krótki; „Pomiń” = to samo co CTA (nie komplikujemy).

**Decyzje gracza**

- Tylko kontynuacja do kreacji klubu (celowo mało wyboru).

**Dane wymagane**

- Brak nowych danych.

**Walidacje**

- Konto musi być zalogowane; w przeciwnym razie wróć do §4.2.

**Zależności**

- §5 Tworzenie klubu, §21 (opcjonalna wiadomość powitalna może pojawić się **po** klubie, nie tu).

**Pytania otwarte**

- Czy powitanie łączyć wizualnie z preview pustego herbu / „Twój klub”?
- Lokalizacja imienia z OAuth w copy („Cześć, Dawid”) — tak/nie (prywatność)?

---

### 4.4 Status checklisty §4

- [x] Wejście do gry
- [x] Rejestracja / logowanie
- [x] Powitanie
- [ ] Finalizacja listy OAuth po decyzji biznesowej
- [ ] Copy regulaminu (prawny)

---

## 5. Tworzenie klubu

**Status rozdziału:** GDD-03 — opracowany

**Cel rozdziału**  
W kilka minut dać graczowi **własny, rozpoznawalny klub** i doprowadzić go do hubu z pierwszym zadaniem = droga do pierwszego meczu (§3).

**Zasada nadrzędna**  
Gracz **projektuje tożsamość** (nazwa, skrót, barwy, herb).  
**Pakiet startowy** (stadion, skład, trener, liga) jest **przyznawany i prezentowany**, nie wypełniany w długim formularzu — uzasadnienie: szybkość + poczucie „dostałem klub do prowadzenia”, nie „wypełniłem CRMa”.

**Budżet czasu kreacji tożsamości:** ok. **2–4 minuty**.  
**Cały onboarding (konto + klub + hub):** cel **≤ 5–7 minut** do CTA pierwszego meczu.

**Wizard (propozycja kroków UI)**

```text
[1. Nazwa + skrót] → [2. Barwy + herb] → [3. Podsumowanie pakietu startowego (reveal)] → [Potwierdź]
```

Mobile: te same kroki, pełna szerokość, duże CTA; desktop: opcjonalny podgląd klubu na żywo (herb+nazwa) obok formularza.

---

### 5.1 Tworzenie klubu (ramowy przebieg)

**Cel**  
Jedna spójna sekwencja od „Stwórz klub” do zapisanego klubu w koncie gracza.

**Przebieg**

1. Wejście z §4.3.
2. Kroki tożsamości (§5.2–5.5).
3. Ekran reveal pakietu startowego (§5.6–5.9) — read-only + krótkie opisy.
4. Potwierdzenie → zapis → §5.10 pierwszy ekran po utworzeniu.
5. Niedokończona kreacja: przy kolejnym logowaniu **wznów wizard** (nie twórz drugiego klubu w tle).

**Decyzje gracza**

- Parametry tożsamości.
- Potwierdzenie pakietu (akceptacja startu — bez micro-managementu składu na tym etapie).

**Dane wymagane**

- Patrz podsekcje; łącznie: nazwa, skrót, barwy, wybór herbu (szablon).

**Walidacje**

- Nie można zakończyć bez wymaganych pól tożsamości.
- Jedno aktywne „tworzenie w toku” na konto.

**Zależności**

- §4, §6 (start rozwoju), §10 (liga), §13 (stadion), §7 (skład), §23 (hub), §3.1–3.2.

**Pytania otwarte**

- Czy 1 klub na konto w MVP, czy sloty (§27 / później)?
- Czy „Losuj nazwę / herb” jako helper (przyspiesza mobile)?

---

### 5.2 Nazwa klubu

**Cel**  
Główny sygnał tożsamości — to, co gracz będzie widział wszędzie.

**Przebieg**

1. Pole „Nazwa klubu” z live preview.
2. Placeholder z przykładem (np. „Bóbrka United”) — nie losowy śmieciowy string.
3. Opcjonalnie: przycisk „Propozycje” (3 gotowe nazwy) — nie obowiązek.

**Decyzje gracza**

- Wybór / wpisanie nazwy.

**Dane wymagane**

- `clubName` (string).

**Walidacje**

- Długość: min 3, max 24 znaków (do potwierdzenia).
- Dozwolone: litery (w tym PL), cyfry, spacje, ograniczone znaki (`.'-`).
- Zakaz: puste, tylko spacje, same znaki specjalne.
- Unikalność globalna w MVP **lub** unikalność „wyświetlana + tag” — decyzja otwarta; preferencja UX: **unikalna nazwa** z jasnym błędem „Nazwa zajęta”.
- Filtrowanie słów zakazanych (lista + soft moderation) — §28.
- Trim spacji; zakaz wielokrotnych spacji w środku (normalizacja).

**Zależności**

- §25 / UI (preview), §28, §29 (później: czytelność w MP).

**Pytania otwarte**

- Czy dopuszczamy duplikaty nazw z #ID w UI (jak wiele gier), czy strict unique?
- Czy zmiana nazwy później jest płatna / limitowana (§27)?

---

### 5.3 Skrót nazwy

**Cel**  
Krótki kod do tabel, wyników, herbu (3–4 znaki).

**Przebieg**

1. Pole „Skrót” obok lub pod nazwą (ten sam krok wizarda co nazwa — mniej ekranów).
2. Autopodpowiedź z nazwy (np. pierwsze litery) — edytowalna.
3. Preview na koszulce / tabeli mock.

**Decyzje gracza**

- Akceptacja / korekta skrótu.

**Dane wymagane**

- `clubShortName` (string).

**Walidacje**

- Długość: **3–4** znaki.
- Wielkie litery w UI (normalizacja do uppercase).
- Tylko A–Z / A–Z+PL? Preferencja MVP: **A–Z oraz cyfry**, bez spacji (czytelność w tabelach).
- Unikalność: nie wymagana globalnie, jeśli nazwa jest unikalna; unikaj kolizji w tej samej lidze przy generowaniu (soft).

**Zależności**

- §10 tabela, §9 wynik meczu, UI Guide.

**Pytania otwarte**

- Czy skrót 3 czy sztywno 3–4?
- Czy znaki PL w skrócie (Ę, Ł) — tak dla immersji PL, nie dla czytelności mobile?

---

### 5.4 Herb

**Cel**  
Natychmiastowy symbol klubu — rozpoznawalność bez heavy editora.

**Przebieg**

1. Krok „Herb”: siatka **szablonów** (kształt tarczy + motyw: piłka, animal, geometry — styl spójny z Guide).
2. Podgląd na żywo z aktualnymi barwami (§5.5).
3. Wybór jednego szablonu + ewentualnie wariant (wypełnienie).
4. **Brak** uploadu własnego PNG w MVP (moderacja, bezpieczeństwo).
5. **Brak** złożonego vector editora w MVP.

**Decyzje gracza**

- Wybór szablonu herbu (i wariantu, jeśli są).

**Dane wymagane**

- `crestTemplateId` (+ opcjonalnie `crestVariantId`).

**Walidacje**

- Wymagany wybór przed przejściem dalej.
- Template musi istnieć w katalogu aktywnych herbów.

**Zależności**

- §25 styl, §23 hub, §9 mecz (herb na magazie), UI Guide.

**Pytania otwarte**

- Ile szablonów w MVP (np. 12–24)?
- Kiedy odblokować upload / generator zaawansowany?

---

### 5.5 Barwy klubowe

**Cel**  
Personalizacja koszulki / UI akcentów klubu gracza.

**Przebieg**

1. Ten sam krok co herb lub bezpośrednio przed/po (rekomendacja: **razem z herbem**).
2. Wybór: **kolor główny** + **kolor dodatkowy** (2 swatche).
3. Presety „popularne pary” + opcjonalnie free picker (ograniczony do bezpiecznej palety kontrastu).
4. Preview: herb + pasek nazwy + mini koszulka.

**Decyzje gracza**

- Para kolorów.

**Dane wymagane**

- `primaryColor`, `secondaryColor` (np. hex).

**Walidacje**

- Oba kolory wymagane.
- Kontrast tekstu na primary (AA dla nazwy na pasku) — odrzuć skrajnie jasne na jasnym tle UI **lub** automatycznie dobierz kolor tekstu.
- Zakaz identycznych primary=secondary (soft warning + block).

**Zależności**

- UI Guide (tokeny klubu gracza), §25, herb.

**Pytania otwarte**

- Trzeci kolor (akcent) w MVP?
- Czy barwy wpływają na wygląd boiska / magazu w LFE view (tylko koszulki)?

---

### 5.6 Stadion startowy

**Cel**  
Dać poczucie „mamy dom” bez budowania infrastruktury na starcie.

**Przebieg**

1. Na ekranie podsumowania pakietu: karta **Stadion** — nazwa szablonowa (np. „Arena [Nazwa klubu]”), pojemność startowa jako fakt z presetu.
2. Gracz **nie konfiguruje** trybun w onboardingu.
3. Jedno zdanie: „Dom klubu — rozbudowa obiektu później” (Future → §13.10).

**Decyzje gracza**

- Brak (akceptacja pakietu).

**Dane wymagane**

- Brak inputu gracza; system ustawia `stadiumPresetId` / nazwę / pojemność bazową.

**Walidacje**

- Preset zawsze poprawny dla nowej ligi startowej.

**Zależności**

- §13 Stadion (SSOT), §14 Finanse, domena Stadium w LFE (kontrakt nazwy).

**Decyzje (domknięte w GDD-12 / §13)**

- Nazwa stadionu w MVP: **szablon automatyczny**; ręczne nazwanie = Future.
- Preset startowy: **jeden** dla ligi startowej (IV); warianty per szczebel = Future / content.

---

### 5.7 Pierwszy skład

**Cel**  
Klub od razu ma drużynę gotową do meczu — gracz zarządza, nie rekrutuje od zera.

**Przebieg**

1. Reveal: „Otrzymujesz skład startowy (XI + ławka)” — liczba zawodników jako fakt (np. 18–22; dokładna liczba → §7).
2. Mini-podgląd: 3–5 „wyróżnionych” twarzy/pozycji (nie pełna tabela 22 wierszy na mobile).
3. CTA na podsumowaniu: nie „Edytuj wszystkich”, tylko informacja że skład ustawisz przed meczem.
4. Formacja domyślna zgodna z LFE / §9 (np. 4-4-2) — bez wyboru taktyki w kreacji.

**Decyzje gracza**

- Brak w kreacji (poza akceptacją pakietu). Pierwsza decyzja składu = przed pierwszym meczem (§3.2).

**Dane wymagane**

- Brak inputu; system generuje / przypisuje zestaw startowy.

**Walidacje**

- Skład kompletny do XI + minimalna ławka.
- Pozycja bramkarza zawsze obecna.

**Zależności**

- §7 Rozwój zawodników, §9 Mecze, LFE Match Domain / positioning (późniejsza implementacja).

**Pytania otwarte**

- Losowy seed składu vs stałe archetypy jakości?
- Czy pokazujemy oceny/gwiazdki na revealu (ryzyko min-max) czy tylko pozycje i nazwiska?

---

### 5.8 Pierwszy trener

**Cel**  
Dodać twarz „sztabu” i narrację — bez drzewka umiejętności w onboardingu.

**Przebieg**

1. Karta na revealu: imię/nazwisko trenera (wygenerowane), krótkie motto lub styl (1 tag: np. „Zrównoważony”) — **bez** slajdera atrybutów.
2. Gracz nie wybiera trenera z listy w MVP onboardingu.

**Decyzje gracza**

- Brak (akceptacja).

**Dane wymagane**

- Brak inputu; `coachPreset` systemowy.

**Walidacje**

- Zawsze przypisany 1 trener główny.

**Zależności**

- §8 Trening (później), §21 wiadomości od trenera.

**Pytania otwarte**

- Czy trener jest tylko narracją w MVP, czy już wpływa na mecz (nie projektujemy wpływu tu)?
- Płeć / lokalizacja imion — reprezentatywność PL?

---

### 5.9 Liga startowa

**Cel**  
Od razu osadzić gracza w rozgrywkach — „gram w lidze”, nie w sandboxie bez kontekstu.

**Przebieg**

1. Reveal: nazwa ligi startowej + krótki kontekst („IV liga · sezon 1” — przykładowo; realna hierarchia → §10).
2. W MVP: **brak wyboru ligi** przez gracza (jeden tor onboardingowy).
3. Ewentualnie później: wybór regionu / kraju jako 1 tap — nie w GDD-03 jako wymóg.

**Decyzje gracza**

- Brak w MVP (akceptacja).

**Dane wymagane**

- Brak; `startingLeagueId` systemowy.

**Walidacje**

- Liga istnieje, ma wolne miejsce / slot bota do zastąpienia według reguł §10 (do opisania później).

**Zależności**

- §10 Liga, §3.4–3.5, §18.

**Pytania otwarte**

- Start w najniższej lidze zawsze vs lekki placement?
- Czy nazwa ligi jest fikcyjna brandowa, czy „realistyczna PL”?

---

### 5.10 Pierwszy ekran po utworzeniu klubu

**Cel**  
Natychmiastowe potwierdzenie własności: **klub gracza jako bohater ekranu** + jedno CTA zgodne z §3 / UI Guide.

**Przebieg**

1. Po „Potwierdź” — krótki success (herb + nazwa, animacja oszczędna).
2. Wejście na **Hub** (§23) w wariancie „nowy klub”:
   - Herb, nazwa, skrót, barwy — hero.
   - Linia kontekstu: liga + „Najbliższy mecz: …”.
   - Primary CTA: **Przygotuj pierwszy mecz** / **Ustaw skład na mecz**.
   - Secondary: „Zobacz skład” (opcjonalne).
3. Inbox: 1 wiadomość powitalna od zarządu (§21) — nie blokuje CTA.
4. Progressive disclosure: inne działy widoczne, ale nie konkurują wizualnie z CTA.

**Decyzje gracza**

- Iść w pierwszą ścieżkę meczową vs rozejrzeć się (CTA faworyzuje mecz).

**Dane wymagane**

- Brak nowych.

**Walidacje**

- Klub zapisany i powiązany z kontem; inaczej błąd krytyczny + retry (§5.12).

**Zależności**

- §3.1–3.2, §9, §23, §21, UI Guide (brand first / klub first).

**Pytania otwarte**

- Czy success jest osobnym pełnoekranowym beat, czy od razu hub z toastem?
- Czy od razu pokazywać tabelę ligową (może przytłaczać)?

---

### 5.11 Pierwsze zadanie dla gracza

**Cel**  
Jedno jasne zadanie = most do core loop (§3): doprowadzić do **pierwszego meczu**.

**Przebieg**

1. Na hubie / w panelu zadań: zadanie startowe  
   **„Rozegraj pierwszy mecz”** (lub „Ustaw skład i rozegraj pierwszy mecz” jako 2-krokowy checklist w jednym zadaniu).
2. Stan: niedokończone → CTA prowadzi do flow przedmeczowego (§9).
3. Po meczu: zadanie completed + krótki gratulacyjny feedback (§3.2) + odsłonięcie kolejnego lekkiego celu (np. „Zagraj mecz kolejki” — §20).
4. Zadanie startowe **nie wygasa** w day-1; nie jest paywallem.

**Decyzje gracza**

- Kiedy wykonać (natychmiast rekomendowane).

**Dane wymagane**

- Brak; status zadania systemowy.

**Walidacje**

- Ukończenie tylko po faktycznie domkniętym pierwszym meczu (wynik zapisany).

**Zależności**

- §3, §9, §20, §23, §19 (opcjonalnie achievement „Pierwszy mecz”).

**Pytania otwarte**

- Czy zadanie startowe jest częścią §20, czy osobnym „onboarding quest”?
- Nagroda za first match: tylko feedback vs mały unlock UI?

---

### 5.12 Możliwe błędy i wyjątki (cały onboarding §4–§5)

**Cel**  
Przewidzieć awarie UX, by gracz nigdy nie utknął bez CTA i bez utraty klubu „w połowie”.

| Scenariusz                              | Zachowanie produktowe                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Nazwa zajęta / nieprawidłowa            | Inline error przy polu; zostań na kroku                                                                 |
| OAuth anulowany                         | Wróć do wyboru metody; bez alarmu                                                                       |
| Email już zarejestrowany                | CTA „Zaloguj się”                                                                                       |
| Sesja wygasła w trakcie wizarda         | Zachowaj draft klubu po ponownym logowaniu **lub** poproś o powtórzenie tożsamości z jasnym komunikatem |
| Utrata sieci przy Potwierdź             | Retry; nie twórz duplikatu klubu                                                                        |
| Podwójne kliknięcie Potwierdź           | Idempotencja — jeden klub                                                                               |
| Konto bez klubu po crashu               | Przy logowaniu → wznów §5                                                                               |
| Konto z klubem wchodzi w „Załóż klub”   | Redirect do Hub                                                                                         |
| Słowa zakazane w nazwie                 | Odrzuć z neutralnym komunikatem                                                                         |
| Brak szablonów herbów (awaria katalogu) | Fallback 1 domyślny herb + log wewnętrzny                                                               |
| Gracz zamyka przeglądarkę w revealu     | Draft / dokończenie przy powrocie                                                                       |
| Weryfikacja email soft-fail             | Pozwól grać; przypomnij w hubie (jeśli wybrano soft policy)                                             |

**Decyzje gracza przy błędach**

- Poprawić dane / zalogować się / spróbować ponownie / skontaktować się z supportem (link w ostateczności).

**Dane / walidacje**

- Komunikaty po polsku, konkretne, bez kodów HTTP w UI.
- Każdy błąd kończy się **jedną** rekomendowaną akcją.

**Zależności**

- §28, §22, §4–5, UI Guide (stany error / empty).

**Pytania otwarte**

- Czy draft kreacji trzymamy po stronie (local) czy tylko serwerowo (późniejsza decyzja tech)?
- Polityka usuwania konta / klubu w early game (§28)?

---

### 5.13 Kontrakty produktowe §4–§5

1. **Konto → Klub → Hub → Pierwszy mecz** (stała kolejność MVP).
2. **Tożsamość wybierana; pakiet startowy przyznawany.**
3. **Herb = szablony; bez uploadu w MVP.**
4. **1 aktywny klub na konto w MVP** (sloty = później).
5. **Pierwsze zadanie = pierwszy mecz** (zgodne z §3).
6. **Mobile i desktop: te same kroki, inny układ** — nie inna logika.

---

### 5.14 Status checklisty §5

- [x] Wizard tożsamości (nazwa, skrót, herb, barwy)
- [x] Reveal pakietu (stadion, skład, trener, liga)
- [x] Pierwszy hub + pierwsze zadanie
- [x] Macierz błędów onboardingu
- [ ] Katalog herbów (content)
- [ ] Finalne limity znaków po testach UX copy

---

## 6. Rozwój klubu

**Status rozdziału:** GDD-13 — opracowany (**rozwój klubu MVP — filozofia i doświadczenie gracza**; bez liczb, progów, wzorów i balansu — → §26)

**Cel rozdziału**  
Dać klubowi czytelny **łuk instytucjonalny**: organizacja rośnie przez sport, buduje tożsamość i otwiera sensowne możliwości — spójnie z §3 (pętla), §7 (kadra), §10–§11 (rozgrywki), §12 (transfery), §13 (stadion), §14–§15 (ekonomia).

**Zasady nadrzędne (decyzje GDD-13)**

1. **§6 = jedyny SSOT** definicji rozwoju klubu (metryki, unlocki jakościowe, caps, relacje).
2. **Trzy metryki w tej kolejności:** Poziom klubu → Reputacja → Prestiż.
3. **Model zależności:** Sukces sportowy → **Prestiż** → **Reputacja** → atrakcyjność klubu; **Poziom klubu** opisuje długofalowy rozwój organizacji.
4. **MVP = filozofia i odczucie**, nie algorytmy, progi ani formuły.
5. **Stadion** pozostaje zgodny z §13 (statyczny w MVP); rozbudowa tylko jako **Future**.
6. **Unlocki** wyłącznie jakościowo (kategorie odczucia / otwarcia funkcji).
7. **Preferowane soft caps**; hard caps tylko ochronnie (fair-play / anti-snowball — opis jakościowy).
8. **Bez liczb / wzorów / balansu** w tym rozdziale — → §26.
9. **Premium nie kupuje** poziomu, prestiżu, reputacji ani wyniku meczu (§27).
10. **ZERO DUPLICATE:** pozostałe rozdziały odsyłają do §6 zamiast redefiniować metryki.

**Szybki kontrakt MVP (SSOT)**

| Parametr            | Wartość MVP                                       |
| ------------------- | ------------------------------------------------- |
| Cel                 | Łuk klubu odczuwalny w Sezonie 1                  |
| Metryki             | Poziom klubu · Reputacja · Prestiż (słownik §6.2) |
| Napęd wzrostu       | Sport (liga / puchar / sezon) jako primary        |
| Łańcuch wpływu      | Sport → Prestiż → Reputacja → atrakcyjność        |
| Poziom klubu        | Długofalowa dojrzałość organizacji                |
| Caps                | Soft preferowane                                  |
| Unlocki             | Jakościowe kategorie                              |
| Stadion             | §13 statyczny; rozbudowa = Future                 |
| Infrastruktura poza | Brak systemu budowy w MVP                         |
| Liczby / balance    | OUT → §26                                         |

---

### 6.1 Filozofia rozwoju klubu

**Cel**  
Ustawić ton: klub to instytucja z historią, nie spreadsheet.

**Przebieg**

1. Gracz ma czuć, że **klub coś znaczy** po serii decyzji i wyników — nie po samym upływie dni.
2. Rozwój klubu **wspiera** pętlę meczową (§3); nie konkuruje z CTA „zagraj mecz”.
3. Sukces sportowy jest głównym paliwem tożsamości; ekonomia i rynek są **konsekwencją**, nie zamiennikiem.
4. Słaby sezon boli odczuciem (prestiż / reputacja / miejsce), nie „game over” instytucji (soft landing §3 / §14).
5. Future może dodać głębię infrastruktury — MVP tego nie wymaga.

**Decyzje gracza**

- Grać o wyniki, by budować klub pośrednio.
- Czy czytać sygnały rozwoju klubu na Hubie / w raporcie (opcjonalne pogłębienie).

**Zależności**

- §3, §5 (start klubu), §10–§11, §14, §27.

**Pytania otwarte**

- Jak mocno Hub eksponuje metryki klubu vs ukrywa je za „statusem sezonu”?

---

### 6.2 Słownik metryk (Poziom klubu · Reputacja · Prestiż)

**Cel**  
Jedna, niepowtarzalna definicja trzech metryk — **SSOT**.

| #   | Metryka          | Czym jest                                                                            | Czym nie jest                                       | Gracz czuje                              |
| --- | ---------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------- | ---------------------------------------- |
| 1   | **Poziom klubu** | Długofalowa dojrzałość / „rozmiar organizacji” — rama odczucia progresu i odblokowań | Nie wynik meczu; nie OVR zawodnika; nie ranking §18 | „Klub rośnie jako instytucja”            |
| 2   | **Reputacja**    | Jak klub jest postrzegany na rynku i w świecie gry (wiarygodność, atrakcyjność)      | Nie tożsame z Prestiżem; nie punkty ligowe          | „Chcą z nami handlować / brać nas serio” |
| 3   | **Prestiż**      | Kapitał sukcesów sportowych i historii (liga, puchar, kamienie sezonu)               | Nie waluta; nie kupuje wyniku LFE; nie = Reputacja  | „Mamy historię / szacunek za wyniki”     |

**Model zależności (Owner)**

```
Sukces sportowy → Prestiż → Reputacja → Atrakcyjność klubu
Poziom klubu = długofalowy rozwój organizacji (wspiera / jest wspierany przez sport i reputację)
```

**Zasady zapisu**

1. Zawsze używać trzech osobnych nazw — bez synonimicznego mieszania.
2. Inne rozdziały **odsyłają** tutaj; nie definiują metryk od nowa.
3. Brak progów numerycznych i wzorów w §6.

**Zależności**

- Konsumenci: §7.17, §11.16, §12.8, §13.8, §14, §15.8, §18, §19.

---

### 6.3 Poziom klubu — doświadczenie gracza

**Cel**  
Opisać odczucie długofalowego wzrostu organizacji.

**Przebieg**

1. Poziom klubu komunikuje „jak dojrzały jest nasz projekt” w skali sezonów, nie pojedynczego meczu.
2. W MVP może być widoczny jako status / etykieta / pasmo — bez tabeli XP.
3. Wspiera narrację odblokowań jakościowych (§6.9), nie zastępuje tabeli ligowej.
4. Awans/spadek ligowy (§10) wpływa na **odczucie kontekstu**, ale definicja poziomu żyje w §6.

**Decyzje gracza**

- Budować klub decyzjami sezonowymi (skład, cele), nie mikrogrindingiem poziomu.

**Zależności**

- §5.9–5.10, §10, §6.9.

**Pytania otwarte**

- Czy Poziom klubu jest zawsze widoczny w Hubie w MVP, czy tylko w karcie klubu?

---

### 6.4 Reputacja — doświadczenie gracza

**Cel**  
Opisać, jak świat gry „widzi” klub.

**Przebieg**

1. Reputacja jest odczuwalna przy okazjach rynkowych i partnerskich (transfery, sponsor — kategorie).
2. Rośnie głównie w ślad za Prestiżem (§6.6), nie jako osobny grind.
3. Spadek / słaba passa może obniżyć odczucie reputacji **miękko** (soft landing).
4. Reputacja **nie** zmienia reguł fair-play wyniku meczu.

**Decyzje gracza**

- Traktować reputację jako skutek sportu i stabilności klubu.

**Zależności**

- §12, §15, §7.17 (sygnał lekki).

---

### 6.5 Prestiż — doświadczenie gracza

**Cel**  
Opisać kapitał sukcesu sportowego jako tożsamość.

**Przebieg**

1. Prestiż zbiera się z wyników ligi, głębokości pucharu i kamieni sezonu — **jakościowo**.
2. Prestiż ≠ punkty ligowe; to osobna warstwa dumy i historii (§11.16 odsyła tutaj).
3. Soft landing: wczesne odpadnięcie / słaby sezon nie niszczy tożsamości destrukcyjnie w Sezonie 1.
4. Prestiż zasila Reputację (§6.6); nie jest walutą do wydania.

**Decyzje gracza**

- Celować w runy i cele sezonu także dla tożsamości klubu.

**Zależności**

- §10, §11, §19 (wyrażenie historii).

---

### 6.6 Relacja Prestiż → Reputacja (nie tożsamość)

**Cel**  
Utrzymać dwie metryki bez kolizji znaczeń.

**Przebieg**

1. **Prestiż** = „co osiągnęliśmy sportowo / historycznie”.
2. **Reputacja** = „jak jesteśmy przez to postrzegani na zewnątrz”.
3. Wzrost prestiżu **poprawia** reputację; spadek prestiżu może ją osłabiać — zawsze jako odczucie, bez wzoru.
4. Możliwe Future: reputacja reaguje też na stabilność finansową / kulturę klubu — poza MVP.

**Decyzje gracza**

- Rozumieć, że trofeum buduje prestiż, a rynek „czyta” reputację.

**Zależności**

- §12.8, §15.8.

---

### 6.7 Impulsy wzrostu (liga / puchar / sezon) — jakościowo

**Cel**  
Wskazać, skąd klub „rośnie”, bez liczb.

**Przebieg**

1. **Liga (§10):** primary tor — kolejki, pozycja, awans/spadek jako główne impulsy prestiżu i kontekstu poziomu.
2. **Puchar (§11):** satelita emocji i prestiżu KO; nie zamiennik tabeli.
3. **Sezon:** podsumowanie kategorii (mistrz / awans / utrzymanie / uczestnictwo / run) zasila historię i prestiż.
4. Brak osobnego grindu „zadań poziomu klubu” w MVP.
5. Nagrody zasobowe pozostają w §14 / §26 — tu tylko sygnał instytucjonalny.

**Decyzje gracza**

- Priorytetyzować ligę; traktować puchar jako bonusową ścieżkę prestiżu.

**Zależności**

- §10.16, §11.14–11.16, §14.

---

### 6.8 Soft caps (preferowane) vs hard caps

**Cel**  
Ochronić early game i fair-play bez twardego muru frustracji.

**Przebieg**

1. **Soft caps (preferowane):** spowolnienie odczucia wzrostu, delikatniejsze pasma atrakcyjności, komunikaty „klub potrzebuje czasu”.
2. **Hard caps:** tylko gdy chronią fair-play / anti-snowball / integralność rozgrywek — opisane jakościowo, bez progów tu.
3. Sezon 1: ochrona przed ruiną reputacji i „pustym klubem”.
4. Caps **nie** blokują możliwości zagrania meczu (§3).

**Decyzje gracza**

- Akceptować tempo rozwoju; nie szukać exploitów pay-to-skip (§27).

**Zależności**

- §3 soft landing, §14, §27.

**Pytania otwarte**

- Które Future hard gate’y (np. wyższe szczeble contentu) wymagają jawnego komunikatu UI?

---

### 6.9 Odblokowania funkcji — jakościowo

**Cel**  
Opisać kategorie otwierania się gry wraz z rozwojem klubu — bez listy ID i progów.

**Przebieg — kategorie MVP (odczucie)**

| Kategoria odblokowania   | Sens dla gracza                                       |
| ------------------------ | ----------------------------------------------------- |
| Głębsze narzędzia kadry  | Więcej sensu w zarządzaniu składem / statusami        |
| Rynek / okna transferowe | Zgodnie z §12 — klub „dojrzewa” do handlu             |
| Partnerstwa (sponsor)    | Zgodnie z §15 — pasma odnowienia, nie marketplace MVP |
| Informacja / historia    | Więcej kontekstu klubu (sezon, trofea — §19)          |
| Zapowiedzi Future        | Infrastruktura / akademia jako obietnica, nie wymóg   |

1. Unlocki są **jakościowe**: „coś staje się dostępne / czytelniejsze”, nie „osiągnięto X punktów”.
2. Niektóre funkcje startują z kreacji klubu (§5); §6 opisuje **dalsze dojrzewanie**.
3. Brak pay-to-unlock rozwoju klubu.

**Decyzje gracza**

- Odkrywać nowe opcje naturalną grą, nie checklistą osobnego meta-grindu.

**Zależności**

- §5, §8 (trening), §12, §15, §16 Future.

---

### 6.10 Infrastruktura poza stadionem (MVP vs Future)

**Cel**  
Oddzielić obietnicę rozbudowy od zakresu MVP.

**Przebieg**

1. **MVP:** brak systemu budowy obiektów (akademia, ośrodek, medycyna itd. jako zarządzalne poziomy).
2. Klimat „mamy zaplecze” może istnieć jako flavor / disabled preview — bez ekonomii budowy.
3. **Future:** infrastruktura jako kamienie milowe rozwoju organizacji (powiązane z Poziomem klubu / prestiżem — bez wzoru tu).
4. Akademia pozostaje rozdziałem §16 — §6 tylko kotwiczy relację Future.

**Decyzje gracza**

- W MVP nie zarządza budową; skupia się na sporcie i kadrze.

**Zależności**

- §13, §16, §8 (jakość ośrodka — Future).

---

### 6.11 Stadion a rozwój klubu (odesłanie §13; rozbudowa = Future)

**Cel**  
Zachować spójność z GDD-12 bez duplikacji.

**Przebieg**

1. Stadion w MVP = **obiekt statyczny** (§13) — dom tożsamości, nie city-builder.
2. Frekwencja / bilety / utrzymanie = reguły §13 i wpływ na kasę §14 — **nie redefiniowane tutaj**.
3. Rozbudowa pojemności / hospitality / rename = **Future** (kierunek poza MVP; może być kamieniem §6 Future).
4. §6 mówi tylko: stadion należy do łuku klubu jako tło tożsamości.

**Decyzje gracza**

- Brak decyzji budowy w MVP (jak §13).

**Zależności**

- §13 (SSOT stadionu), §14.9.

---

### 6.12 Relacja klub ↔ zawodnicy (§7)

**Cel**  
Rozdzielić rozwój klubu od rozwoju zawodnika.

**Przebieg**

1. Zawodnik rośnie przez mecze/trening (§7 / §8); klub rośnie przez sukces instytucji (§6).
2. Reputacja klubu może **lekko** wpływać na odczucie wartości rynkowej (§7.17) — bez wzoru.
3. Morale / klimat (§7.9) może czerpać z atmosfery sukcesu klubu — jakościowo.
4. Brak drugiej siatki „XP klubu na zawodnika” w MVP.

**Decyzje gracza**

- Selekcja składu buduje sport → prestiż → reputację; nie „poziomuje” zawodników sztucznie.

**Zależności**

- §7, §8, §9.14.

---

### 6.13 Relacja klub ↔ transfery (§12)

**Cel**  
Ustawić reputację/prestiż jako kontekst rynku.

**Przebieg**

1. Definicje metryk = §6; §12 opisuje **skutki rynkowe** (atrakcyjność ofert / zainteresowanie AI).
2. Łańcuch: sport → prestiż → reputacja → łatwiejszy handel (odczucie).
3. Prestiż/reputacja **nie** kupują wyniku meczu i nie omijają envelope (§14 / §27).
4. Boost po runie pucharowym = szczegół timingowy w §12 (pytanie otwarte tam); tu tylko zasada wpływu.

**Decyzje gracza**

- Budować klub sportem, by wzmocnić rynek pośrednio.

**Zależności**

- §12.8, §14.5.

---

### 6.14 Relacja klub ↔ finanse / sponsorzy (§14 / §15)

**Cel**  
Spiąć instytucję z kasą bez drugiej ekonomii.

**Przebieg**

1. Jedna kasa + envelope (§14) — §6 nie dodaje waluty „prestiż do wydania”.
2. Sukces sportowy zasila **kategorie** środków i prestiż; porażka boli prestiżem/reputacją mocniej niż ruiną.
3. Sponsor (§15): pasma odnowienia mogą rosnąć z prestiżem/reputacją — definicje metryk w §6.
4. Soft protection finansowa (§14) ważniejsza niż kara reputacyjna.

**Decyzje gracza**

- Czytać finanse i status klubu jako dwa sprzężone sygnały, nie dwa grywalne arkusze.

**Zależności**

- §14, §15.8–15.10.

---

### 6.15 Relacja klub ↔ ranking / osiągnięcia (§18 / §19)

**Cel**  
Uniknąć kolizji z przyszłymi rozdziałami rankingów i achievementów.

**Przebieg**

1. **§18 Ranking** będzie **konsumował** sygnały klubu (np. kontekst sezonu) — nie definiuje Poziomu / Reputacji / Prestiżu.
2. **§19 Osiągnięcia** wyrażają kamienie i historię; Prestiż jako pojęcie = §6.
3. Leaderboard ≠ Poziom klubu; achievement ≠ Reputacja.
4. Do czasu wypełnienia §18–§19: obowiązuje ta kotwica.

**Decyzje gracza**

- (Future) przeglądać rankingi/osiągnięcia jako warstwę retencji, nie jako definicję klubu.

**Zależności**

- §18, §19 (szkielet), §11.16.

---

### 6.16 Sygnały UI (produkt; bez wireframe kodu)

**Cel**  
Wskazać, co gracz powinien móc szybko odczytać.

**Przebieg**

1. Hub / karta klubu: czytelny status sezonu + sygnały metryk (pasma / etykiety — bez spreadsheetu). **Hierarchia i stany Hubu → §23** (konsumpcja metryk §6, bez redefinicji).
2. Po meczu / po sezonie: krótki feedback instytucjonalny możliwy jako 1–2 linie (kategorie), bez breakdownu XP.
3. Rynek / sponsor: kontekst „klub atrakcyjny dzięki reputacji” jako copy — bez osobnego mini-UI algorytmu.
4. UI Guide: jeden cel ekranu; bez glow / pill clutter.

**Decyzje gracza**

- Jak głęboko czytać status klubu vs iść do następnego meczu.

**Zależności**

- UI Guide, §9.12–9.15, §23.

---

### 6.17 MVP vs Future

**Cel**  
Freeze zakresu.

**MVP — wchodzi**

- Słownik: Poziom klubu · Reputacja · Prestiż
- Łańcuch: sport → prestiż → reputacja → atrakcyjność
- Poziom klubu jako długofalowy rozwój organizacji
- Impulsy jakościowe z ligi / pucharu / sezonu
- Soft caps preferowane
- Unlocki jako kategorie jakościowe
- Odesłania z §7 / §12 / §13 / §14 / §15 / §18 / §19
- Stadion zgodny z §13 (statyczny)

**MVP — nie wchodzi**

- Liczby, progi, krzywe, wzory (§26)
- System budowy infrastruktury
- Rozbudowa stadionu / hospitality
- Pay-to-prestige / pay-to-level
- Osobna waluta prestiżu
- Redefinicje metryk poza §6

**Future (kierunek poza MVP)**

1. Poziomy infrastruktury (ośrodek, medycyna, akademia jako zarządzalne obiekty — spójnie z §16)
2. Rozbudowa stadionu jako kamień §6 / §13 Future
3. Głębsze soft/hard caps po danych z §26
4. Reputacja z kultury klubu / finansów (poza samym sportem)
5. Bogatsze UI historii i badge’y sezonowe

---

### 6.18 Kontrakty produktowe §6

1. **§6 jest jedynym SSOT** rozwoju klubu.
2. Metryki w kolejności: **Poziom klubu → Reputacja → Prestiż**.
3. **Sport → Prestiż → Reputacja → atrakcyjność**; Poziom = rozwój organizacji.
4. MVP opisuje **filozofię i UX**, nie algorytmy.
5. Unlocki **tylko jakościowo**; Future oznaczony jednoznacznie.
6. Caps: **soft preferowane**.
7. Stadion = **§13**; rozbudowa = **Future**.
8. Brak liczb / progów / wzorów / balansu w §6.
9. Inne rozdziały **odsyłają** do §6 (ZERO DUPLICATE).
10. Premium nie kupuje metryk klubu ani wyniku (§27).

---

### 6.19 Checklista §6

- [x] Filozofia rozwoju klubu
- [x] Słownik: Poziom klubu · Reputacja · Prestiż
- [x] Model Prestiż → Reputacja; Poziom jako organizacja
- [x] Impulsy liga / puchar / sezon (jakościowo)
- [x] Soft vs hard caps
- [x] Unlocki jakościowe
- [x] Infrastruktura poza stadionem (MVP vs Future)
- [x] Stadion = odesłanie §13
- [x] Relacje §7 / §12 / §14–§15 / §18–§19
- [x] Sygnały UI, MVP vs Future, kontrakty
- [ ] Widoczność Poziomu klubu na Hubie vs karcie klubu (Owner UX)
- [ ] Sync copy „prestiż” w contentcie sezonowym po playtestach
- [ ] Balance / liczby (§26) — Future

---

## 7. Rozwój zawodników

**Status rozdziału:** GDD-06 — opracowany (**zasady i odczucie rozwoju**; bez formuł, algorytmów, LFE/AI, kodu UI)

**Cel rozdziału**  
Sprawić, by każdy zawodnik miał **własną historię w czasie**: rośnie z gry, ma momenty peaku i regresu, a gracz czuje satysfakcję z budowania kadry — spójnie z §3 (progres składu w pętli), §9.14 (feedback po meczu) i §10 (liga jako główny dostarczyciel impulsów meczowych).

**Zasady nadrzędne (decyzje GDD-06)**

1. **Unikalność** — zawodnicy różnią się profilem, potencjałem, temperamentem statusów; nie są klonami z inną naklejką.
2. **Rozwój z gry > z zegara** — mecze (i sensowny trening) napędzają wzrost; sam upływ dni nie „poziomuje” kadry.
3. **Czytelność przed spreadsheetem** — na starcie: poziom + kilka statusów + sygnały; pełna siatka atrybutów = progressive disclosure.
4. **Satysfakcja z kadry** — po meczu widać „kto urósł / kto potrzebuje odpoczynku”; to paliwo decyzji składu.
5. **MVP proste, model skalowalny** — te same pojęcia (potencjał, forma, zmęczenie…) mają miejsce na głębię później bez resetu fantazji.

**Mapa pojęć (warstwy)**

```text
Tożsamość (pozycja, talenty)
    → Potencjał (sufit)
    → Poziom aktualny + atrybuty
    → Statusy krótkie: forma · morale · kondycja · zmęczenie · kontuzja
    → Impulsy: mecz (§9) · trening (§8) · wiek / sezon
    → Sygnał rynkowy: wartość (pod §12)
```

**Granice rozdziałów**

| Tu (§7)                              | Nie tu                              |
| ------------------------------------ | ----------------------------------- |
| Co zawodnik „jest” i jak się zmienia | Sesje/plany treningu → **§8**       |
| Statusy wpływające na gotowość       | Taktyka XI → **§9**                 |
| Wartość jako sygnał                  | Negocjacje/okna → **§12**           |
| Regres / starzenie (zasady)          | Formuły liczbowe → później / balans |

---

### 7.1 Cykl życia zawodnika

**Cel**  
Dać łuk biograficzny: pojawia się → rośnie → peak → schyłek → odejście — żeby kadra miała historię, nie tylko listę ratingów.

**Przebieg**

1. **Wejście do świata:** pakiet startowy (§5.7), późniejszy transfer/akademia (zapowiedź).
2. **Faza wzrostu:** dużo impulsów z minut meczowych + treningu; widoczne „↑”.
3. **Faza dojrzałości (peak):** stabilny poziom blisko potencjału; wartość i rola w XI wysokie.
4. **Faza schyłku:** wolniejszy wzrost / regres atrybutów fizycznych; większa waga doświadczenia i mentalności.
5. **Wyjście:** koniec kariery / odejście z klubu (mechanika odejścia → §12; tu tylko fakt cyklu).
6. Kamienie milowe narracyjne: debiut, pierwsza bramka, setny mecz, kapitan — jako historia (§19), nie obowiązek.

**Decyzje gracza**

- Kogo stawiać, by rósł (minuty).
- Kiedy rotować weterana vs stawiać na młodzież.
- Kiedy zaakceptować schyłek (rola z ławki / pożegnanie później).

**Wpływ na inne systemy**

- §9 skład i zmiany; §10 długość sezonu = tempo biografii; §8 obciążenie; §12 kiedy sprzedawać/trzymać; §3.9 mastery kadry.

**Pytania otwarte**

- Czy w MVP jest „emerytura” z beatem pożegnalnym, czy tylko spadek użyteczności?
- Akademię młodzieżową w v1 czy później?

---

### 7.2 Wiek

**Cel**  
Wiek jako czytelny kontekst oczekiwań: „młody = upside”, „weteran = teraz”.

**Przebieg**

1. Każdy zawodnik ma **wiek** widoczny na karcie.
2. Pasma produktowe (etykiety, nie formuły): **młodzież / wschodząca gwiazda / peak / weteran**.
3. Wiek rośnie w **punktach sezonowych** (np. przy starcie nowego sezonu §10.13) — nie codziennie o ułamek w UI.
4. Wiek **nie** jest jedynym silnikiem rozwoju (patrz zasada „z gry”).
5. Na przedmeczu/składzie: wiek jako secondary info, nie hub clutter.

**Decyzje gracza**

- Budować pod przyszłość vs wynik „dziś”.
- Rotacja wiekowa w długim sezonie.

**Wpływ na inne systemy**

- §7.3–7.4 (oczekiwania vs potencjał/poziom); §7.14–7.15; §12 wartość i perspektywa kontraktu; §10.16 odczucie rozwoju klubu.

**Pytania otwarte**

- Czy pokazujemy dokładny wiek (22) czy tylko pasmo na mobile liście?
- Wiek startowy w pakiecie §5.7 — rozkład archetypów (ile młodzieży w XI)?

---

### 7.3 Potencjał

**Cel**  
Sufit rozwoju — powód, by inwestować minuty w konkretne nazwiska.

**Przebieg**

1. Każdy zawodnik ma **potencjał** (ceiling) niezależny od aktualnego poziomu.
2. UX MVP: potencjał jako **pasmo / wskaźnik jakościowy** (np. gwiazdki lub „wysoki / średni / ograniczony”), nie surowa liczba na starcie.
3. Potencjał jest **trwały w krótkim horyzoncie**; rzadkie eventy mogą go lekko skorygować później (poza MVP lub bardzo rzadko).
4. Gracz uczy się potencjału przez: wskaźnik + zachowanie wzrostu po meczach + (później) skauting.
5. Zbliżenie się do potencjału spowalnia odczuwalny wzrost (soft ceiling) — bez wall „0 XP”.

**Decyzje gracza**

- Kogo „hodować” mimo słabszego dziś poziomu.
- Czy trzymać wysokipotencjałowego na ławce vs forsować minuty.

**Wpływ na inne systemy**

- §7.4, §7.12–7.13; §12 cena/atrakcyjność; §9.14 sygnały wzrostu; §20 zadania „rozwiń młodzież” (opcjonalnie).

**Pytania otwarte**

- Potencjał częściowo ukryty vs zawsze widoczny w MVP (rekomendacja: **widoczne pasmo**, szczegóły później)?
- Czy kontuzje ciężkie mogą obniżyć potencjał (dramat vs frustration)?

---

### 7.4 Aktualny poziom

**Cel**  
Jedna czytelna miara „jak dobry jest teraz” do porównań w składzie.

**Przebieg**

1. **Poziom aktualny** (Overall / CA — nazwa UX do brandingu) jako główna liczba/odznaka na karcie.
2. Poziom wynika z atrybutów (§7.5), ale gracz **nie musi** liczyć ręcznie.
3. Poziom zmienia się wskutek impulsów (mecz, trening, regres, wiek) — widać Δ po raporcie / na karcie.
4. Progressive disclosure: lista składu = poziom + statusy; detal atrybutów po wejściu w kartę.
5. Porównanie „poziom vs potencjał” = natychmiastowy story hook („jeszcze urośnie”).

**Decyzje gracza**

- Kogo wybrać do XI przy podobnych pozycjach (poziom + forma + zmęczenie).
- Czy poświęcić poziom „dziś” dla potencjału „jutro”.

**Wpływ na inne systemy**

- §9.3 wybór składu; §10 odczucie siły vs liga; §12 wartość; LFE (kontrakt: poziom/atrybuty zasilają mecz — bez mapowania tu).

**Pytania otwarte**

- Skala prezentacji (1–20 / 1–100 / litery)? Rekomendacja robocza: **czytelna skala liczbowa jedna dla całego produktu**.
- Czy poziom pozycji-agnostic, czy „OVR zależny od roli na boisku”?

---

### 7.5 Atrybuty

**Cel**  
Zróżnicować zawodników jakościowo (nie tylko jednym OVR) i dać głębię dla mastery.

**Przebieg**

1. Atrybuty pogrupowane produktowo, np.: **technika · fizyczność · mentalność · (bramkarz osobno)**.
2. MVP UI karty: **3–6 kluczowych atrybutów** pod pozycję + reszta zwinięta / odblokowana po 2–3 meczach (§3 progressive disclosure).
3. Pełna siatka istnieje w modelu na rozbudowę; nie dumpujemy 30 suwaków w dniu 1.
4. Atrybuty zasilają odczucie stylu („szybki skrzydłowy”, „twórczy środkowy”) i decyzje taktyczne później.
5. Brak projektowania formuł wzrostu per atrybut tutaj — tylko zasada: **impulsy mogą faworyzować grupy** (np. mecz → lekki wzrost powiązany z rolą; trening → ukierunkowanie §8).

**Decyzje gracza**

- Czy czytać detal przed meczem (opcjonalne).
- Dobór pod formację/rolę (kompromis pozycji §9.5).

**Wpływ na inne systemy**

- §9 taktyka/formacja (fit); §8 fokus treningu; LFE Match Domain (przyszły kontrakt nazw); §12 scouting.

**Pytania otwarte**

- Ile atrybutów w modelu docelowym vs ile w MVP UI?
- Czy atrybuty mają hard cap per potencjał grupowy?

---

### 7.6 Doświadczenie

**Cel**  
Nagradzać granie: minuty i wydarzenia budują „ograństwo”, nie tylko trening.

**Przebieg**

1. Doświadczenie to warstwa **historii meczowej**: minuty, starty, gole/asysty, czyste konta itd. (lista eventów produktowa, nie XP-bar obowiązkowy).
2. Główny skutek: lepsza stabilność mentalna / odporność na regres early — odczucie „ograł się”.
3. Debiut i progi (np. 10/50 meczów) mogą odblokować mikro-feedback lub achievement (§19).
4. Samo „leżenie na ławce bez minut” **nie** buduje doświadczenia meczowego.
5. UX: nie wymagamy oddzielnego ekranu XP w MVP — sygnały w raporcie i na karcie („+ doświadczenie”).

**Decyzje gracza**

- Dać minuty młodzieży vs pewniakom.
- Rotować, by ograć szerszą kadrę.

**Wpływ na inne systemy**

- §7.12; §9.14; §10 (22 kolejki = rytm); §19; §8 (trening ≠ zamiennik minut).

**Pytania otwarte**

- Czy pokazujemy pasek XP, czy tylko eventy jakościowe w MVP (rekomendacja: **jakościowe + Δ poziomu**)?
- Czy kartki czerwone / kontuzje odejmują „rytm doświadczenia” narracyjnie?

---

### 7.7 Forma

**Cel**  
Krótkoterminowy sygnał „gorąca ręka / dołek” wpływający na zaufanie do XI.

**Przebieg**

1. Forma = status krótkookresowy wynikający głównie z **ostatnich występów** (i wyniku drużyny — lekko).
2. UX: kropki / strzałka / kolor na liście składu (§9.3) — spójnie z formą klubu w tabeli.
3. Forma **waha się szybciej** niż poziom; nie zastępuje OVR.
4. Dobra forma = powód postawić kogoś „na fali”; zła = sygnał do rotacji lub cierpliwości.
5. Reset częściowy między sezonami / po dłuższej absencji (zasada produktowa; detail → balans).

**Decyzje gracza**

- Trzymać się formy vs zaufać klasie (poziom/potencjał).
- Zmiany w przerwie przy dołku (§9.10).

**Wpływ na inne systemy**

- §9 skład/live; §10.7 forma w tabeli (klub) vs forma zawodnika (osobne!); §7.9 morale może współgrać.

**Pytania otwarte**

- Okno formy: ostatnie 5 meczów zawodnika vs ważone minuty?
- Czy forma wpływa odczuwalnie na mecz, czy głównie na UX decyzji (rekomendacja: **oba, ale subtelnie** — bez snowball extreme)?

---

### 7.8 Kondycja

**Cel**  
Odpowiedzieć: „czy ten zawodnik jest gotowy na mecz?” — zanim padnie zmęczenie/kontuzja.

**Przebieg**

1. Kondycja = **gotowość fizyczna** (zdrowie/fit) na osi krótkiej; etykiety: gotowy / osłabiony / niegotowy.
2. Spada po intensywnym obciążeniu; wraca z odpoczynkiem / lżejszym treningiem (§8).
3. Na przedmeczu: ostrzeżenia miękkie (§9.2) przy niskiej kondycji.
4. Kondycja ≠ forma (forma = performance streak; kondycja = body readiness).
5. MVP: prosty wskaźnik 1 warstwy; bez medycznego kokpitu.

**Decyzje gracza**

- Rest vs risk w XI.
- Plan treningu / regeneracji w dniach niemeczowych (§8).

**Wpływ na inne systemy**

- §8; §9; §7.10–7.11 (pokrewne statusy); §3.4 rotacje.

**Pytania otwarte**

- Czy kondycja i zmęczenie to **dwa widoki jednego zasobu**, czy dwa osobne paski (rekomendacja MVP: **jeden czytelny status „Gotowość”** + zmęczenie jako tag po meczu)?
- Czy niska kondycja blokuje start, czy tylko ostrzega?

---

### 7.9 Morale

**Cel**  
Warstwa psychologiczna: zawodnik „czuje się częścią projektu” lub nie.

**Przebieg**

1. Morale reaguje na: minuty, wynik drużyny, rolę w składzie, (później) kontrakt/transfery.
2. UX MVP: niski priorytet wizualny — pokazuj gdy **wyróżniające** (bardzo niskie / bardzo wysokie), nie przy każdym nazwisku.
3. Skrajnie niskie morale → gorsza forma / ryzyko prośby o transfer (zapowiedź §12) / gorszy feedback w raporcie.
4. Nie projektujemy tu systemu rozmów 1:1; wystarczy zasada istnienia morale.
5. Early game: ochrona przed spiralą demotivacji po 1 porażce (§3 soft landing).

**Decyzje gracza**

- Rotacja minut, by utrzymać szatnię.
- (Później) reakcja na konflikt / prośbę o odejście.

**Wpływ na inne systemy**

- §7.7; §9; §12; §21 wiadomości; §6 klimat klubu.

**Pytania otwarte**

- Morale indywidualne vs „morale szatni” jako agregat — czy oba w MVP (rekomendacja: **indywidualne lekkie**, agregat później)?
- Czy kapitan wpływa na morale wokół siebie (trait)?

---

### 7.10 Zmęczenie

**Cel**  
Wymusić sensowną rotację w rytmie ligi (~1 mecz/dzień) bez stamina-gate całej kolejki.

**Przebieg**

1. Zmęczenie rośnie głównie z **minut meczowych** (i intensywnego treningu §8).
2. Spada z odpoczynkiem / pominięciem XI / lekkim dniem.
3. UX: tag „zmęczony” na składzie; w przerwie lista zmęczenia XI (§9.9).
4. Wysokie zmęczenie ↑ ryzyko słabszego występu i kontuzji (§7.11) — jako ostrzeżenie produktowe.
5. Zgodność z §3.11 / §10.5: zmęczenie **nie blokuje** odblokowania kolejki; blokuje sensowność wystawienia tych samych 11 non-stop.

**Decyzje gracza**

- Rotować skład między kolejkami.
- Zmiany w HT przy przeciążeniu.

**Wpływ na inne systemy**

- §9.3–9.10; §8; §10.5; §7.8/7.11.

**Pytania otwarte**

- Czy ławka też zbiera lekkie zmęczenie „meczowe”, czy tylko XI?
- Widoczny pasek % vs 3 stany (świeży / OK / zmęczony)?

---

### 7.11 Kontuzje

**Cel**  
Dramat i decyzje kadrowe — bez symulatora medycznego.

**Przebieg**

1. Kontuzja = status z **pasmem czasu absencji** (np. krótka / średnia / długa) + etykieta.
2. Źródła: mecz (event w feedzie §9), rzadziej trening (§8), ryzyko↑ przy zmęczeniu.
3. Zawodnik kontuzjowany: niedostępny w XI; widać datę/kolejkę powrotu (przybliżoną).
4. Po powrocie: krótki okres „wraca do rytmu” (forma/kondycja), nie natychmiastowy 100%.
5. MVP: kilka typów wystarczy; bez operacji/rehabilitacji mini-game.

**Decyzje gracza**

- Przebudowa XI na okres absencji.
- Czy ryzykować wystawienie lekko dolegliwego (jeśli kiedyś „wątpliwy”).

**Wpływ na inne systemy**

- §9; §10 (kolejki lecą); §8; §12 depth kadry; §21 komunikat sztabu.

**Pytania otwarte**

- Czy kontuzja może pojawić się już w pierwszym meczu onboardingu (rekomendacja: **bardzo rzadko / wyłączone w K1**)?
- Kartki / zawieszenia — osobny status obok kontuzji (tak; reguły dyscypliny lekko w §9/§10)?

---

### 7.12 Rozwój po meczu

**Cel**  
Główny, odczuwalny silnik wzrostu — „grałem → urósłem”.

**Przebieg**

1. Po raporcie (§9.12–9.14): sekcja 3–5 zawodników z sygnałami (↑ poziom / atrybut grupowy / forma / doświadczenie).
2. Impuls zależy od: minut, oceny występu, kontekstu (gol, czyste konto) — **jakościowo**, bez wzoru tu.
3. Rezerwowi bez minut: brak wzrostu meczowego (ew. mikro z atmosfery — opcjonalnie later).
4. Porażka nie kasuje rozwoju indywidualnego całkowicie (ochrona early); może bić w morale/formę.
5. To jest **primary XP path** względem treningu w fantazji produktu.

**Decyzje gracza**

- Kogo grać, by rósł.
- Czy czytać detal rozwoju, czy iść dalej do Hubu.

**Wpływ na inne systemy**

- §9.13–9.14; §10.16; §7.4–7.7; §3 pętla satysfakcji.

**Pytania otwarte**

- Czy zawsze pokazujemy Δ, nawet mikro, by nie było „pustego” raportu?
- Cap dzienny wzrostu anti-binge przy backlogu 2 meczów (§10.5)?

---

### 7.13 Rozwój na treningu

**Cel**  
Dać drugi tor wzrostu między meczami — podporządkowany meczowi, nie grind-replacer.

**Przebieg**

1. Trening (§8) dostarcza **ukierunkowane** impulsy (grupa atrybutów / regeneracja / taktyka).
2. Zasada nadrzędna: trening **uzupełnia** minuty, nie zastępuje historii meczowej.
3. W dniach niemeczowych (§3.7): lekki kontakt treningowy jako sensowna czynność.
4. Przeciążony trening ↑ zmęczenie / ryzyko kontuzji — trade-off do zaprojektowania w §8.
5. MVP: nawet prosty „trening tygodnia” wystarczy, by §7 miało haczyk; detal planów → §8.

**Decyzje gracza**

- Jaki fokus treningu wybrać (gdy system odblokowany).
- Rest day vs push.

**Wpływ na inne systemy**

- §8 (właściciel UX sesji); §7.5/7.8/7.10; §3.6; §26 (koszty — później).

**Decyzje (domknięte w GDD-07 / §8)**

- Odblokowanie treningu: po **2 rozegranych meczach** (§8.14).
- MVP: trening **zespołowy**; indywidualny = Future (§8.2, §8.13).

---

### 7.14 Starzenie się zawodników

**Cel**  
Uczynić czas sezonów odczuwalnym: peak nie trwa wiecznie.

**Przebieg**

1. Przy przejściu sezonu (§10.13): aktualizacja wieku + ewentualny shift pasma.
2. Po wyjściu z okna peaku: wolniejszy wzrost; większa szansa regresu fizycznego (§7.15).
3. Weterani mogą dłużej trzymać mentalność / doświadczenie jako kompensatę odczuciową.
4. Soft landing: nie „śmierć statystyk w jedną noc” — schyłek stopniowy.
5. UI: bez tragic copy; fakt wieku + sygnały trendu.

**Decyzje gracza**

- Plan sukcesji w kadrze.
- Rola mentora / rotacja (narracyjnie).

**Wpływ na inne systemy**

- §10.13; §7.1–7.3; §12 timing sprzedaży; §6 długi łuk klubu.

**Pytania otwarte**

- Czy wiek rośnie tylko 1×/sezon, czy też mid-season birthday flavor?
- Peak window zależny od pozycji (GK dłużej) — tak w post-MVP?

---

### 7.15 Regres

**Cel**  
Konsekwencja braku gry, starzenia i skrajnych statusów — bez karania new player harshly.

**Przebieg**

1. Źródła regresu (produktowo): długo bez minut, schyłek wieku, skrajne zmęczenie/kontuzje długie, (rzadko) morale.
2. Objaw: lekki spadek poziomu / atrybutów fizycznych / formy — sygnał w UI.
3. Early game / Sezon 1: **łagodniejszy regres** (ochrona churn).
4. Regres jest odwracalny przez powrót do minut + regenerację (w granicach wieku/potencjału).
5. Nie mylić z losowym „decay codziennym” — unikamy idle punishment przy 1 dniu AFK (§10.5 soft backlog).

**Decyzje gracza**

- Przywrócić zawodnika minutami.
- Zaakceptować schyłek i zmienić rolę.

**Wpływ na inne systemy**

- §9 rotacja; §10 AFK policy; §12 sell-before-decline; §3 soft landing.

**Pytania otwarte**

- Czy regres od „braku minut” startuje po ilu kolejkach absencji?
- Czy pokazujemy ostrzeżenie „ryzyko regresu” zanim spadnie?

---

### 7.16 Talenty

**Cel**  
Unikalność i storytelling: „ten to nie tylko OVR 72”.

**Przebieg**

1. Talent = **cecha / specjalizacja** (trait): np. „Finisher”, „Szybki”, „Lider szatni”, „Filar obrony”.
2. MVP: **0–2 talenty** na zawodnika; lista talentów krótka i czytelna.
3. Talent wpływa na: odczucie stylu, lekki bias decyzji AI/UX, czasem morale wokół kapitana — bez ukrytych 15% wall of text.
4. Odkrywanie: widoczne od razu na karcie lub po X minutach (discovery fantasy) — decyzja otwarta.
5. Nie mylić talentu z potencjałem (talent = charakter; potencjał = sufit).

**Decyzje gracza**

- Dobierać XI pod talenty / role.
- Budować tożsamość taktyczną wokół kilku ikon.

**Wpływ na inne systemy**

- §9 taktyka; §7.9; §19; §12 unikalność rynkowa; UI Guide (ikony cech).

**Pytania otwarte**

- Discovery vs always-visible w MVP?
- Czy talenty negatywne („Kontrowersyjny”) w early game (ryzyko frustration)?

---

### 7.17 Wartość rynkowa

**Cel**  
Dać sygnał „ile ten piłkarz znaczy na rynku” pod przyszłe transfery — bez projektowania rynku.

**Przebieg**

1. Wartość = **wypadkowa sygnałów**: poziom, potencjał, wiek, forma, status (kontuzja↓), szczebel ligi (§10), reputacja klubu (**definicja SSOT → §6.2 / §6.4** — lekko).
2. UX MVP: wartość jako **pasmo lub skrót waluty** na karcie; pełna ekonomia → §14/§26.
3. Wartość aktualizuje się w punktach sensownych (po meczu / co kolejkę / po sezonie) — nie tick co sekundę.
4. Gracz używa wartości do: poczucia dumy, decyzji „trzymać vs (później) sprzedać”.
5. Świadomie **bez** krzywych cen i AI kupujących tutaj.

**Decyzje gracza**

- Timing sprzedaży / kupna w oknach (§12).
- Czy trzymać wysoką wartość vs rotować kadrę.

**Wpływ na inne systemy**

- §12; §14/§26; §6; §10.16; §9.14 (duma z wzrostu wartości).

**Decyzje (domknięte w GDD-09 / §12)**

- Wartość widoczna od **odblokowania rynku transferowego** (§12.2).
- Brak scouting fog wartości młodzieży w MVP (pasmo widoczne jak u seniorów).

---

### 7.18 MVP oraz plan rozbudowy

**Cel**  
Zamknąć shipowalny wycinek i ścieżkę głębi.

**MVP — wchodzi**

- Wiek + pasma, potencjał (pasmo), poziom aktualny
- Atrybuty: grupy + 3–6 kluczowych na karcie
- Doświadczenie jakościowe z meczów
- Forma, gotowość/zmęczenie, kontuzje (proste), morale (lekkie)
- Rozwój po meczu jako **primary**
- Haczyk treningu (impulsy) — UX sesji w §8
- 0–2 talenty
- Wartość jako sygnał (pasmo)
- Soft regres / starzenie sezonowe

**MVP — nie wchodzi**

- Pełna siatka 30+ atrybutów na starcie UI
- Symulator medyczny / rehab mini-game
- Formuły publikowane graczowi
- Zaawansowany scouting potencjału
- Indywidualne programy 12-tygodniowe
- Negatywne talenty dense
- Dynamiczny rynek z AI ofertami (→ §12)

**Plan rozbudowy (roboczy)**

1. §8 pełny trening (plany, obciążenie)
2. Głębsze atrybuty + role na boisku
3. Akademię / youth intake
4. Scouting & hidden potential
5. Szczegółowa wartość + §12
6. Personality / media / leadership layer

**Decyzje gracza**

- Odczuwa tylko odblokowane warstwy (progressive disclosure §3).

**Wpływ na inne systemy**

- §8, §9, §12, §23, §30 roadmap.

**Pytania otwarte**

- Feature cut: talenty w v1 czy v1.1?
- Jedna waluta wartości vs „prestiż zawodnika” osobno?

---

### 7.19 Kontrakty produktowe §7

1. **Rozwój napędzają mecze**; trening jest uzupełnieniem (§8).
2. **Poziom + potencjał + statusy krótkie** wystarczą do decyzji XI w MVP.
3. **Unikalność = atrybuty grupowe + talenty + historia minut.**
4. **Zmęczenie/kontuzja wpływają na skład, nie na odblokowanie kolejki ligowej.**
5. **Regres jest łagodny w early game** i nie karze 1 dnia AFK.
6. **Wartość rynkowa to sygnał**, nie system transferowy.
7. **Bez formuł w GDD** — balans liczbowy osobnym etapem.

---

### 7.20 Status checklisty §7

- [x] Cykl życia, wiek, potencjał, poziom, atrybuty
- [x] Doświadczenie, forma, kondycja, morale, zmęczenie, kontuzje
- [x] Rozwój po meczu i na treningu (kontrakt)
- [x] Starzenie, regres, talenty, wartość
- [x] MVP cut + roadmap
- [ ] Finalna skala OVR (20 vs 100)
- [ ] Kondycja vs zmęczenie: 1 czy 2 wskaźniki w UI
- [x] Moment odblokowania treningu — po 2 rozegranych meczach (§8)

---

## 8. Trening

**Status rozdziału:** GDD-07 — opracowany (**system treningowy produktowy**; bez algorytmów, formuł, LFE, kodu UI)

**Cel rozdziału**  
Zaprojektować kompletny, czytelny system przygotowania kadry między meczami — **wspierający** rozwój z §7, nigdy go nie zastępujący — spójnie z GDD-06, §3 (dni niemeczowe), §9 (gotowość do XI) i §10 (rytm 1 mecz / dzień).

**Zasady nadrzędne (decyzje GDD-07 — zgodność z GDD-06)**

1. **Mecz = główne źródło rozwoju**; trening = mechanika wspierająca (ukierunkowanie + regeneracja + lekki impuls).
2. **Trening nie jest grindem** — 1 sensowna decyzja na slot czasu, sesja mieści się w budżecie 5–15 min całego dnia gry.
3. **Trade-off czytelny:** więcej intensywności → więcej impulsu / taktycznego przygotowania, ale ↑ **zmęczenie** i ryzyko **kontuzji**; regeneracja odwrotnie.
4. **Terminologia SSOT (§7):** wyłącznie **kondycja**, **zmęczenie**, **gotowość** — bez „energii”.
5. **Progressive disclosure:** najpierw prosty trening zespołowy; indywidualny i plany długie = później.
6. **Bez formuł** — tylko kierunki wpływu i UX decyzji.

**Granice rozdziałów**

| Tu (§8)                                 | Nie tu                                   |
| --------------------------------------- | ---------------------------------------- |
| Sesje, fokus, intensywność, harmonogram | Model zawodnika / potencjał → **§7**     |
| Wpływ na statusy i lekki rozwój         | Doświadczenie meczu / raport → **§9**    |
| Koszt zmęczenia (zasada)                | Kwoty finansowe treningu → **§14 / §26** |
| UX ekranu treningu (produkt)            | Implementacja UI / kod                   |

**Odpowiedzi na otwarte z §7.13 (domknięcie produktowe w §8)**

| Pytanie §7.13             | Decyzja §8 (SSOT)                                                           |
| ------------------------- | --------------------------------------------------------------------------- |
| Kiedy odblokować trening? | Po **2 rozegranych meczach** — soft unlock z 1 CTA.                         |
| Indywidualny w MVP?       | **Nie** — MVP = trening **zespołowy**; indywidualny = Future (§8.2, §8.13). |

---

### 8.1 Filozofia treningu

**Cel**  
Ustawić oczekiwanie gracza: trening to **przygotowanie i uzupełnienie**, nie farmienie poziomu.

**Przebieg**

1. Narracja: „Ustawiasz fokus sztabu na dziś / do kolejki” — nie mini-gra arcade.
2. Po sesji: krótki feedback (kto zyskał sygnał ↑ / kto odpoczął / ostrzeżenie zmęczenia).
3. Porównanie z meczem zawsze jasne w copy pomocy: rozwój kariery buduje **piłka meczowa**.
4. Dni niemeczowe (§3.7): trening jest naturalnym primary CTA, gdy nie ma kolejki do zagrania.
5. Dni meczowe: trening opcjonalny / lekki lub zablokowany przy wysokim zmęczeniu przed kick-off (patrz §8.11).

**Decyzje gracza**

- Czy dziś trenować, regenerować, czy pominąć.
- Jaki fokus i intensywność (gdy odblokowane).

**Wpływ na inne systemy**

- §7.12–7.13 hierarchia rozwoju; §3 hub CTA; §10 kalendarz.

**Pytania otwarte**

- Czy w dniu meczu trening jest zawsze niedostępny, czy tylko „lekki” dozwolony?

---

### 8.2 Trening indywidualny

**Cel**  
(Docelowo) ukierunkować rozwój konkretnego zawodnika; w MVP — poza shipem.

**Przebieg MVP**

1. **Wyłączony** — brak osobnego ekranu „trening 1 gracza”.
2. Zapowiedź w UI: wyszarzone / „Wkrótce” po odblokowaniu zespołowego (opcjonalnie).

**Przebieg Future**

1. Wybór 1 zawodnika + fokus grupy atrybutów (§7.5).
2. Limit: 1 sesja indywidualna / dzień + nie koliduje z hard limitami zespołu.
3. Wyższy koszt zmęczenia na jednostkę niż ekwiwalent zespołowy.
4. Zablokowane dla kontuzjowanych; ograniczone przy niskiej gotowości.

**Decyzje gracza**

- MVP: brak.
- Future: kogo „dopieszczać” minutami treningu vs minutami meczu.

**Wpływ na inne systemy**

- §7.5, §7.16; §12 (inwestycja w talent); §23.

**Pytania otwarte**

- Od którego sezonu / szczebla ligi odblokować indywidualny?

---

### 8.3 Trening zespołowy

**Cel**  
Główna (MVP) forma treningu: jedna decyzja dla całej dostępnej kadry.

**Przebieg**

1. Gracz wybiera **fokus zespołowy** (preset), np.:
   - **Technika**
   - **Fizyczność**
   - **Taktyka / zespół**
   - **Bramkarze** (lekki bias GK) — opcjonalnie w MVP lub v1.1
   - **Regeneracja** (osobny tryb — §8.10)
2. Wybiera **intensywność** (§8.5).
3. Potwierdza → krótki beat „Trening zakończony” + sygnały statusów.
4. Kontuzjowani: automatycznie poza obciążeniem rozwojowym (ew. lekka regeneracja medyczna — bez mini-game).
5. Default po odblokowaniu: fokus **Taktyka / zespół** + intensywność **Normalna**.

**Decyzje gracza**

- Fokus dnia.
- Intensywność.
- Regeneracja zamiast rozwoju.

**Wpływ na inne systemy**

- §7.5 grupy atrybutów; §7.8–7.11 statusy; §9 gotowość XI; §10 dni kolejki.

**Pytania otwarte**

- Czy fokus „Taktyka” daje też lekki buff odczuwalny w następnym meczu (1 mecz), czy tylko rozwój długi?

---

### 8.4 Harmonogram

**Cel**  
Wpiąć trening w kalendarz ligowy bez konfliktu z „1 sprawą dnia”.

**Przebieg**

1. **Slot treningowy:** co do zasady **1 sesja treningowa na dzień realny** (timezone gracza), niezależnie od backlogu meczów.
2. **Dzień niemeczowy:** Hub CTA może wskazywać trening jako primary (obok zadań §20).
3. **Dzień meczowy:** rekomendacja produktowa — trening **niedostępny po rozpoczęciu przygotowań do meczu** / po wejściu w przedmecz; przed tym opcjonalnie tylko Regeneracja lub brak (patrz OQ §8.1).
4. Sezon / przerwa (§10.12): trening dostępny jako content przerwy (lekki).
5. Brak wielodniowych planów w MVP (Future: plan tygodnia).

**Decyzje gracza**

- Kiedy wykorzystać slot dnia.
- Czy poświęcić dzień na regenerację przed ciężką kolejką.

**Wpływ na inne systemy**

- §3.6–3.7; §10.5; §23; §20.

**Pytania otwarte**

- Czy niewykorzystany slot przepada o północy, czy stackuje 1 zaległość (jak mecze — rekomendacja: **przepada**, anti-grind)?

---

### 8.5 Intensywność

**Cel**  
Jedna oś decyzji „jak mocno dziś pchamy”.

**Przebieg — pasma MVP**

| Intensywność    | Odczucie    | Impuls rozwojowy             | Zmęczenie                     | Ryzyko kontuzji | Morale                         |
| --------------- | ----------- | ---------------------------- | ----------------------------- | --------------- | ------------------------------ |
| **Lekka**       | Bezpiecznie | Niski                        | Niski                         | Niskie          | Neutral / lekki +              |
| **Normalna**    | Default     | Średni (wsparcie)            | Średni                        | Umiarkowane     | Neutral                        |
| **Wysoka**      | Push        | Wyższy (nadal poniżej meczu) | Wysoki                        | Wyższe          | + krótko / − przy przeciążeniu |
| **Regeneracja** | Odnowa      | Brak / mikro                 | Spadek zmęczenia / ↑ kondycja | Minimalne       | + przy zmęczeniu               |

1. Gracz widzi jakościowe skutki przed potwierdzeniem (ikony strzałek, nie liczby formuł).
2. Przy bardzo wysokim zmęczeniu kadry: ostrzeżenie + sugestia Regeneracji.
3. Wysoka intensywność nie odblokowuje „farmy” przewyższającej mecz (§8.7).

**Decyzje gracza**

- Wybór pasma intensywności / regeneracji.

**Wpływ na inne systemy**

- §7.8–7.11; §9.2 ostrzeżenia; §8.6–8.10.

**Pytania otwarte**

- Czy „Wysoka” wymaga odblokowania (np. po 5 meczach), by ochronić onboarding?

---

### 8.6 Koszt zmęczenia

**Cel**  
Uczynić zmęczenie realnym kosztem treningu — spójnie z §7.10.

**Przebieg**

1. Sesja zespołowa (nie-regeneracyjna) **podnosi zmęczenie** dostępnej kadry według intensywności.
2. Regeneracja **obniża zmęczenie** i poprawia odczucie **kondycji / gotowości**.
3. Zawodnicy już „zmęczeni” dostają ostrzejszy feedback ryzyka przy wysokiej intensywności.
4. Zmęczenie z treningu **sumuje się** z meczu w ramach tych samych statusów §7 — jeden model.
5. Trening **nie blokuje** odblokowania kolejki ligowej (§10.5); blokuje sens wystawienia przeciążonych.

**Decyzje gracza**

- Push przed meczem vs rest.
- Rotacja XI w reakcji na koszt (§9.3).

**Wpływ na inne systemy**

- §7.8, §7.10; §9; §10.

**Pytania otwarte**

- Czy ławka / rezerwy męczą się tak samo w treningu zespołowym, czy mniej?

---

### 8.7 Wpływ na rozwój

**Cel**  
Zdefiniować trening jako **ukierunkowany, mniejszy** impuls względem meczu.

**Przebieg**

1. Trening (fokus rozwojowy) daje sygnał wzrostu w **grupie atrybutów** zgodnej z fokusem — odczucie „pracujemy nad X”.
2. Magnituda: zawsze **wspierająca**; mecz pozostaje primary (§7.12, §9.14).
3. Blisko potencjału (§7.3): impuls treningowy też słabnie odczuwalnie (soft ceiling) — bez wzoru.
4. Brak minut meczowych: trening **nie zastępuje** doświadczenia meczowego (§7.6).
5. Feedback po sesji: 0–5 nazwisk z mikro-sygnałem (mniej dramatyczny niż raport meczu).

**Decyzje gracza**

- Który fokus wspiera plan kadrowy (np. fizyczność przed serią kolejek).

**Wpływ na inne systemy**

- §7.4–7.5, §7.13; §9.14 hierarchia; §19 (opcjonalne zadanie „przeprowadź trening”).

**Pytania otwarte**

- Czy pokazywać Δ poziomu po treningu, czy tylko tag grupy atrybutów (rekomendacja: **tag + rzadki Δ**)?

---

### 8.8 Wpływ na morale

**Cel**  
Trening jako lekki regulator szatni — bez symulatora psychologii.

**Przebieg**

1. Udział w sensownym treningu (gdy zawodnik gotowy): lekki plus / utrzymanie morale.
2. Forsowanie wysokiej intensywności przy wysokim zmęczeniu: ryzyko lekkiego minus morale.
3. Regeneracja przy zmęczonej kadrze: plus odczuwalny („sztab dba”).
4. Pomijanie treningu wiele dni z rzędu: **brak twardej kary** early (spójnie z no-AFK-punish krótkiego); najwyżej brak plusów.
5. Morale skrajne → sygnał w Hubie / §21 (później), nie popup co sesję.

**Decyzje gracza**

- Balans push vs care.
- (Future) indywidualna uwaga dla gwiazdy.

**Wpływ na inne systemy**

- §7.9; §21; §6 klimat klubu.

**Pytania otwarte**

- Czy brak minut + brak treningu razem przyspieszają spadek morale bardziej niż samo ławniczenie?

---

### 8.9 Wpływ na kontuzje

**Cel**  
Ryzyko treningowe jako ostrzeżenie, nie losowy grief w onboardingu.

**Przebieg**

1. Sesje rozwojowe (zwłaszcza **Wysoka**) podnoszą **ryzyko kontuzji treningowej** jakościowo.
2. Ryzyko↑ gdy: wysokie zmęczenie, niska kondycja/gotowość, (Future) wiek weterana.
3. Kontuzja treningowa = ten sam model statusu co meczowa (§7.11) — pasmo absencji.
4. **Ochrona early:** do odblokowania treningu + pierwsze 1–2 sesje — ryzyko mocno ograniczone / wyłączone przy Lekkiej.
5. Regeneracja: ryzyko minimalne; nie leczy ciężkiej kontuzji (osobny status — powrót z czasem).

**Decyzje gracza**

- Czy pchać intensywność mimo ostrzeżeń.
- Rest dla zagrożonych nazwisk (przez fokus regeneracji zespołu).

**Wpływ na inne systemy**

- §7.11; §9 skład; §10 kolejki bez danego gracza.

**Pytania otwarte**

- Czy kontuzja treningowa ma osobny copy („na boisku treningowym”), czy ten sam event type?

---

### 8.10 Regeneracja

**Cel**  
Jawna, pozytywna opcja: odzyskać **gotowość** zamiast pchać rozwój.

**Przebieg**

1. Regeneracja to wybór intensywności/trybu w treningu zespołowym (lub osobny preset).
2. Skutki odczuwalne: ↓ zmęczenie, ↑ kondycja / gotowość, morale lekki +, brak (lub mikro) rozwoju atrybutów.
3. Rekomendowana przed serią meczów lub gdy Hub pokazuje wiele tagów „zmęczony”.
4. Nie zastępuje pauzy od kolejki — kolejka i tak istnieje (§10).
5. UX: równy priorytet wizualny co fokusy rozwojowe (żeby nie wyglądała na „przegraną opcję”).

**Decyzje gracza**

- Regeneracja vs fokus rozwojowy w danym dniu.

**Wpływ na inne systemy**

- §7.8, §7.10; §9.2–9.3; §3.7.

**Pytania otwarte**

- Czy regeneracja może być domyślna, gdy średnie zmęczenie XI > progu jakościowego?

---

### 8.11 Ograniczenia

**Cel**  
Zamknąć anti-abuse i czytelne soft-gate’y.

**Przebieg — limity MVP**

1. **1 sesja / dzień realny.**
2. Brak treningu indywidualnego.
3. Kontuzjowani poza obciążeniem rozwojowym.
4. Zawodnicy o krytycznie niskiej gotowości: ostrzeżenie; przy Wysokiej — soft-block lub auto-suggest Regeneracja.
5. Trening niedostępny, dopóki nie spełniono warunku odblokowania (§8 intro).
6. Nie można „doublować” sesji za premium w sposób pay-to-progress ponad mecz (§27 — fair: wygoda UI OK, nie 3× XP treningu).
7. Skip / brak sesji: dozwolony; brak hard punishment za 1–2 dni.

**Decyzje gracza**

- Akceptacja limitów; planowanie w kalendarzu.

**Wpływ na inne systemy**

- §10.5; §27; §28; §7.15.

**Pytania otwarte**

- Soft-block vs hard-block przy krytycznej gotowości całej XI?

---

### 8.12 UX / UI (produkt)

**Cel**  
Ekran treningu: jeden cel, mobilny, zgodny z UI Guide — bez kokpitu.

**Przebieg / struktura ekranu**

1. **Wejście:** Hub CTA „Trening” / kalendarz dnia niemeczowego.
2. **Nagłówek:** „Trening · dziś” + skrót gotowości kadry (np. 3 stany zbiorcze).
3. **Wybór fokusu** — 3–4 duże opcje (nie lista 20 ćwiczeń).
4. **Intensywność** — segment control / 3–4 chipy z podglądem skutków (strzałki).
5. **CTA primary:** **Przeprowadź trening**.
6. **Wynik sesji:** bottom sheet / krótki ekran sygnałów → powrót Hub.
7. Brak kart zawodników-excel na tym ekranie; link „Skład” secondary.
8. Desktop = ten sam flow, szerszy układ; mobile-first.

**Decyzje gracza**

- Fokus + intensywność + potwierdzenie (max 2–3 tapnięcia).

**Wpływ na inne systemy**

- UI Guide; §23; §24–25 (szkielet); §9.2 spójność statusów.

**Pytania otwarte**

- Czy wynik sesji kiedykolwiek auto-otwiera kartę zawodnika (discovery), czy zawsze Hub?

---

### 8.13 MVP vs Future

**Cel**  
Shipowalny wycinek + ścieżka rozbudowy.

**MVP — wchodzi**

- Trening zespołowy (3–4 fokusy + Regeneracja)
- Intensywność Lekka / Normalna / Wysoka (+ Regeneracja)
- 1 sesja / dzień
- Wpływ na zmęczenie, kondycję/gotowość, lekki rozwój grupowy, morale lekkie, ryzyko kontuzji
- Odblokowanie po **2 rozegranych meczach**
- UX 2–3 tapnięcia

**MVP — nie wchodzi**

- Trening indywidualny
- Plany tygodniowe / periodyzacja
- Mini-gry treningowe
- Szczegółowe ćwiczenia per atrybut
- Staff skill trees trenerów (głębia)
- Formuły / widoczne XP bary treningu
- Pay-to-train power

**Future (kolejność robocza)**

1. Trening indywidualny
2. Lekki buff taktyczny na 1 mecz
3. Plany 3–7 dni
4. Personel / jakość ośrodka (§6 / infrastruktura)
5. Integracja akademii (§16)

**Decyzje gracza**

- Odczuwa tylko odblokowane warstwy.

**Wpływ na inne systemy**

- §7.18; §30; §6; §16.

**Pytania otwarte**

- Feature cut: fokus „Bramkarze” w MVP vs v1.1?

---

### 8.14 Kontrakty produktowe §8

1. **Trening wspiera rozwój; nie przebija meczu** jako źródła wzrostu.
2. **MVP = trening zespołowy**; indywidualny później.
3. **1 sesja / dzień**; slot niewykorzystany nie buduje nieskończonego backlogu (MVP: przepada).
4. **Intensywność ↔ zmęczenie / kontuzja / regeneracja** — jawny trade-off.
5. **Terminologia:** kondycja, zmęczenie, gotowość.
6. **Odblokowanie po 2 rozegranych meczach.**
7. **Bez formuł i bez pay-to-progress treningowego.**
8. **Nie blokuje kolejki ligowej**; wpływa na decyzje składu.

---

### 8.15 Checklista §8

- [x] Filozofia treningu
- [x] Indywidualny (Future) vs zespołowy (MVP)
- [x] Harmonogram i intensywność
- [x] Koszt zmęczenia
- [x] Wpływ: rozwój, morale, kontuzje
- [x] Regeneracja
- [x] Ograniczenia
- [x] UX/UI produktowe
- [x] MVP vs Future
- [x] Kontrakty
- [ ] Finalna lista fokusów branding (nazwy PL)
- [ ] Reguła dnia meczowego: lock vs lekka regeneracja
- [ ] Potwierdzenie soft vs hard block przy krytycznej gotowości

---

## 9. Mecze

**Status rozdziału:** GDD-04 — opracowany (**doświadczenie gracza**; nie specyfikacja silnika LFE / AI / physics / Canvas)

**Cel rozdziału**  
Opisać kompletny przebieg: wejście → przygotowanie → mecz → raport → powrót do Hubu — spójnie z §3 (sesja 5–15 min, mecz w centrum) i §5.11 (pierwsze zadanie = pierwszy mecz).

**Zasady nadrzędne (decyzje GDD-04)**

1. **Czytelność > spektakl** — gracz zawsze wie wynik, czas i „co się dzieje”.
2. **Niski próg** — domyślny skład/formacja pozwalają kliknąć „Graj” w < 30 s; głębokość jest opcjonalna.
3. **Kontrola ograniczona i sensowna** — w trakcie meczu kilka jasnych akcji, nie kokpit symulatora.
4. **Szacunek do czasu** — zawsze ścieżka szybszego domknięcia (np. przyspieszenie / skrót), bez utraty poczucia sprawczości.
5. **Hub-in, hub-out** — mecz zaczyna się z jasnego CTA i kończy powrotem z jasnym „co dalej”.

**Mapa faz (produkt)**

```text
Hub CTA → Wejście → Przedmecz (skład / taktyka / formacja) → Kick-off
    → Mecz na żywo (± przerwa / zmiany) → Koniec → Raport → Nagrody / feedback
    → Hub
```

---

### 9.1 Wejście do meczu

**Cel**  
Przenieść gracza z Hubu (lub kalendarza) w kontekst **tego** spotkania bez gubienia „z kim i po co gram”.

**Przebieg**

1. Źródła wejścia: Hub CTA („Najbliższy mecz” / „Pierwszy mecz”), kalendarz ligowy (§10), zadanie (§5.11 / §20), powiadomienie (§22).
2. Ekran przejściowy lub od razu przedmeczowy z nagłówkiem starcia.
3. Jeśli skład nie był ruszany: domyślne XI już załadowane (onboarding-friendly).
4. Blokada wejścia tylko gdy mecz niedostępny (termin, już rozegrany, kara) — z jasnym powodem i CTA powrotu.

**Decyzje gracza**

- Wejść w przygotowanie vs anulować / wrócić do Hubu.
- (Później) wybrać inne spotkanie z listy, jeśli wiele dostępnych.

**Informacje prezentowane**

- Twój klub (herb, nazwa) vs rywal (herb, nazwa).
- Rozgrywki: liga/puchar, kolejka / runda.
- Dom / wyjazd.
- Data/termin w świecie gry (jeśli różny od „teraz”).
- Status: „Do rozegrania” / „W trakcie” (reconnect) / „Zakończony”.

**Zależności**

- §3, §5.10–5.11, §10–11, §23, §22, §28 (anti-abuse wejść).

**Pytania otwarte**

- Czy niedokończony mecz (crash) wznawia się od przerwy / od startu / auto-result?
- Czy wejście z powiadomienia omija Hub, czy zawsze Hub → mecz?

---

### 9.2 Ekran przedmeczowy

**Cel**  
Jeden ekran „gotowości”: kontekst + skrót stanu drużyny + droga do składu/taktyki + **Graj**.

**Przebieg**

1. Nagłówek starcia (jak wyżej).
2. Strefa gotowości: „Skład gotowy” / „Uzupełnij skład” (checklist 1–2 punkty max).
3. Skróty: **Skład**, **Taktyka / formacja** (mogą być zakładki lub dolne CTA).
4. Primary CTA: **Rozpocznij mecz** (nieaktywne, gdy brak XI / bramkarza).
5. Secondary: Wróć.

**Decyzje gracza**

- Iść od razu w mecz (accept defaults) vs wejść w skład/taktykę.
- Potwierdzić start.

**Informacje prezentowane**

- Rywal + forma skrótowa (np. ostatnie 5 wyników jako kropki — bez deep scouting w MVP).
- Ostrzeżenia miękkie: kontuzje / zawieszenia oraz niska **gotowość** (**kondycja**, **zmęczenie**) w kadrze — terminologia §7.
- Domniemana formacja (np. 4-4-2).
- Szacunek czasu trwania doświadczenia („ok. 5–10 min” / opcje tempa — jeśli produkt je ma).

**Zależności**

- §7 (stan zawodników: kondycja, zmęczenie, gotowość), §8 (trening jako wpływ na te statusy — bez formuł), §10, UI Guide (jeden cel ekranu).

**Pytania otwarte**

- Czy pokazujemy „siłę” / rating starcia (ryzyko min-max i tilt)?
- Czy pogodę / frekwencję pokazujemy na przedmeczu w MVP (§13)?

---

### 9.3 Wybór składu

**Cel**  
Umożliwić szybkie ustawienie XI + ławki; na pierwszym meczu — domyślnie OK „jak jest”.

**Przebieg**

1. Widok: boisko z pozycjami **lub** lista XI + lista ławki (mobile: lista + prosty pitch schematyczny — bez wymogu Canvas).
2. Domyślny skład z pakietu startowego / ostatnio użytego.
3. Zamiana: tap na zawodnika → wybór z listy dostępnych (filtr pozycji lekki).
4. Walidacja live: 1× GK, 11 w XI, brak zawieszonych w XI.
5. Zapis składu na „Wróć do przedmeczu” / auto-save przy zmianie.
6. CTA: **Gotowe**.

**Decyzje gracza**

- Kogo postawić w XI / na ławce.
- Czy zostawić propozycję systemu.

**Informacje prezentowane**

- Nazwisko, pozycja naturalna / aktualna, status (OK / zmęczony / kontuzja — etykiety).
- Lekki wskaźnik formy (np. strzałka / kolor) — bez tabeli 20 atrybutów na tym ekranie.
- Licznik: „XI 11/11”, „Ławka n/n”.

**Zależności**

- §5.7, §7, §8 (kondycja / gotowość jako informacja), LFE lineup (kontrakt produktowy, nie API).

**Pytania otwarte**

- Max ławki w MVP?
- Czy auto-skład „najlepsza jedenastka” jako 1 przycisk (wygoda vs utrata sprawczości)?
- Drag&drop na desktop vs tylko tap (spójność mobile)?

---

### 9.4 Taktyka

**Cel**  
Dać **poczucie wpływu** bez kokpitu FM dla hardkorów — szczególnie w onboardingu.

**Przebieg**

1. Ekran/zakładka „Taktyka” z 1 osią lub 3 presetami (np. Ofensywnie / Zrównoważono / Defensywnie).
2. Domyślnie: **Zrównoważono**.
3. Brak slajderów szerokości/linii/pressingu w MVP onboardingu; głębokość = późniejszy unlock (§3 progressive disclosure).
4. Krótki opis presetu (1 zdanie).
5. CTA: **Gotowe** → przedmecz.

**Decyzje gracza**

- Wybór presetu taktycznego (lub akceptacja default).

**Informacje prezentowane**

- Nazwa presetu + jednozdaniowy efekt odczuwalny („więcej ryzyka w ataku”).
- Formacja powiązana / niezależna (patrz §9.5).

**Zależności**

- §3 (progressive disclosure), §7–8, przyszłe GDD AI (nie tu).

**Pytania otwarte**

- Czy taktyka i formacja to jeden ekran, czy dwa?
- Kiedy odblokować zaawansowane instrukcje (pressing, szerokość)?
- Czy rywal „widzi” naszą taktykę w UI (nie)?

---

### 9.5 Ustawienie formacji

**Cel**  
Wybrać kształt XI w sposób zrozumiały i zgodny z pozycjonowaniem (produktowo: „ustawienie”, nie silnik spawn).

**Przebieg**

1. Lista formacji dostępnych na start (np. 4-4-2, 4-3-3 — jak w fundamencie gry).
2. Podgląd schematu boiska (statyczny diagram pozycji).
3. Po zmianie formacji: miękkie remapowanie zawodników na sloty + ostrzeżenie, gdy ktoś „nie na swojej” pozycji.
4. Default: formacja z kreacji / ostatnio użyta (4-4-2).

**Decyzje gracza**

- Wybór formacji.
- Ewentualna korekta składu po zmianie kształtu.

**Informacje prezentowane**

- Kod formacji, miniatury slotów, dopasowanie pozycji (OK / kompromis).

**Zależności**

- §5, §7, §9.3, dokumentacja pozycjonowania (produktowo: „skąd biorą się miejsca na boisku”).

**Pytania otwarte**

- Ile formacji w MVP (2 vs 5)?
- Czy zmiana formacji w przerwie jest dozwolona (§9.9)?

---

### 9.6 Rozpoczęcie meczu

**Cel**  
Czysty moment „zaczynamy” — rytuał krótki, bez loadera-ściany.

**Przebieg**

1. Tap **Rozpocznij mecz** na przedmeczu.
2. Krótki beat: herby / vs / „1. połowa” (oszczędna animacja wg UI Guide — bez spekuły technicznej).
3. Wejście w widok meczu na żywo (§9.7).
4. Jeśli walidacja składu fail → zostań na przedmeczu z błędem.

**Decyzje gracza**

- Potwierdzenie startu (jedyny moment „point of no return” przed pierwszym gwizdkiem doświadczenia).

**Informacje prezentowane**

- Potwierdzenie składu/taktyki w skrócie (opcjonalny 1-liner).
- Komunikat „Mecz się rozpoczyna”.

**Zależności**

- §3.2, MatchSession jako nośnik (kontrakt: sesja istnieje) — bez opisu CommandBus w UX.

**Pytania otwarte**

- Czy jest countdown 3–2–1, czy od razu live?
- Czy można anulować w trakcie beatu startowego?

---

### 9.7 Widok meczu na żywo

**Cel**  
Dać poczucie **meczu piłkarskiego**: wynik, czas, wydarzenia, kontekst boiska — czytelnie na mobile i desktop.

**Przebieg**

1. Layout (produktowo):
   - góra: wynik + minutnik / połowa,
   - środek: strefa boiska / reprezentacja akcji (bez wymagań renderera),
   - dół lub bok: feed wydarzeń + szybkie akcje (§9.8).
2. Wydarzenia kluczowe pojawiają się w feedzie (gol, kartka, kontuzja, zmiana…).
3. Tempo domyślne dopasowane do sesji 5–15 min całego flow (niekoniecznie 90 min wall-clock).
4. Gracz może przyspieszyć / skrócić (§9.8).

**Decyzje gracza**

- Patrzeć vs przyspieszać.
- Wejść w akcje sterowania, gdy dostępne.

**Informacje prezentowane**

- Wynik (dom–wyjazd), minuta / faza (1H, HT, 2H…).
- Kto ma piłkę / ostatnie wydarzenie (język prosty).
- Nazwy klubów + herby.
- Opcjonalnie: posiadanie / strzały jako **proste** liczniki (nie pełny HUD FM).

**Zależności**

- §3 (czas sesji), UI Guide, §10 (kontekst rozgrywek), przyszły widok LFE (osobno).

**Pytania otwarte**

- Live „symulacja ciągła” vs „highlights co X sekund” jako domyślny UX MVP?
- Czy pauza zatrzymuje tylko UI, czy też mecz (§9.8)?

---

### 9.8 Sterowanie podczas meczu

**Cel**  
Kilka zrozumiałych dźwigni — nie przejęcie kontroli nad każdym zawodnikiem.

**Przebieg (zestaw MVP — propozycja)**

| Akcja                             | Kiedy                                      | Uwagi                                     |
| --------------------------------- | ------------------------------------------ | ----------------------------------------- |
| Pauza / wznów                     | Zawsze                                     | Czytelny stan                             |
| Tempo: normalne / szybciej        | Zawsze                                     | Pod sesję 5–15 min                        |
| Do przerwy / do końca (skip fazy) | Od 1H                                      | Z potwierdzeniem, jeśli skip całego meczu |
| Taktyka preset (szybka zmiana)    | W trakcie + przerwa                        | 3 presety z §9.4                          |
| Otwórz zmiany                     | Przerwa lub limity w trakcie (patrz §9.10) |                                           |

**Czego nie ma w MVP onboardingu**

- Sterowanie pojedynczym zawodnikiem na boisku.
- Rysowanie strzałek / instructions per player.
- Chat / emotki spam.

**Decyzje gracza**

- Tempo i głębokość oglądania.
- Lekka korekta taktyki.
- Wejście w zmiany, gdy dostępne.

**Informacje prezentowane**

- Aktualny preset taktyki.
- Liczba pozostałych zmian.
- Przyciski disabled z powodem („Dostępne w przerwie”).

**Zależności**

- §9.4, §9.9–9.10, §3 (czas), §27 (czy Premium = tylko wygoda tempa — fair policy).

**Pytania otwarte**

- Skip całego meczu od razu z przedmeczu („Symuluj wynik”) — tak w MVP czy dopiero później?
- Czy zmiany taktyki w trakcie mają cooldown UX (anti-spam), bez mówienia o silniku?

---

### 9.9 Przerwa

**Cel**  
Naturalny moment decyzji: oddech, wynik połowy, zmiany, ewentualnie formacja/taktyka.

**Przebieg**

1. Automatyczne wejście w ekran przerwy po 1. połowie.
2. Podsumowanie połowy: wynik, 3–5 eventów, skrót „co poszło dobrze / źle” (język prosty).
3. CTA: **Zmiany**, **Taktyka**, **Kontynuuj 2. połowę**.
4. Limit czasu na decyzję? Preferencja: **bez twardego timera** w single-player / vs bot — gracz wraca gdy gotowy (szacunek mobile). W MP — osobne reguły (§29).

**Decyzje gracza**

- Czy zmieniać skład/taktykę.
- Kiedy wznowić.

**Informacje prezentowane**

- Wynik po 1H, minuta, kartki/kontuzje.
- Zmęczenie XI (etykiety).
- Licznik zmian.

**Zależności**

- §9.7–9.10, §7, §29 (timer tylko jeśli MP).

**Pytania otwarte**

- Czy jest też „przerwa napojowa” / inne stoppage jako UI — czy tylko HT?
- Czy po wznowieniu pokazywać krótki beat „2. połowa”?

---

### 9.10 Zmiany zawodników

**Cel**  
Klasyczna dźwignia menedżera: kogo ściągnąć / wpuścić — czytelnie i szybko.

**Przebieg**

1. Dostęp: przede wszystkim **w przerwie**; w trakcie 2H — według prostych reguł produktu (np. tylko przy pauzie / dead-ball UX — do ustalenia).
2. UI: lista XI vs ławka; wybór pary „schodzi / wchodzi”.
3. Potwierdzenie zmiany → feedback w feedzie meczu („75' Kowalski ↔ Nowak”).
4. Limit zmian zgodny z regułami rozgrywek (liczba jako fakt UI; reguła formalna → §10).

**Decyzje gracza**

- Kogo zmienić i kiedy (w ramach okien dostępności).

**Informacje prezentowane**

- Status zawodników (zmęczenie, kartka).
- Pozostałe zmiany.
- Pozycja slotu po wejściu.

**Zależności**

- §9.3, §9.9, §7, §10 (limit zmian).

**Pytania otwarte**

- Zmiany w trakcie gry vs tylko HT w MVP (prostsze onboardingowo: **tylko HT + ewentualnie late window**)?
- Zmiana bramkarza — osobne potwierdzenie?

---

### 9.11 Koniec meczu

**Cel**  
Wyraźne zamknięcie starcia i przejście do raportu — bez urwania mid-action.

**Przebieg**

1. Gwiazdka / komunikat „Koniec meczu” + wynik końcowy na pełnym fokusie.
2. Krótki beat (herby, wynik) — oszczędnie.
3. Auto-przejście lub CTA **Zobacz raport**.
4. Brak natychmiastowego hard redirect do Hubu (najpierw raport).

**Decyzje gracza**

- Wejść w raport (rekomendowane / jedyna droga domknięcia).

**Informacje prezentowane**

- Wynik końcowy, rozgrywki, ewentualnie „zwycięstwo / remis / porażka” jako ton copy.

**Zależności**

- §3.2 (feedback), §9.12.

**Pytania otwarte**

- Czy dogrywka / karne mają osobne akty UI (§10–11), gdy wystąpią?
- Walkover — osobny skrócony flow bez live view?

---

### 9.12 Raport pomeczowy

**Cel**  
Zrozumieć **co się stało** i co zabrać sobie do kolejnej decyzji — w 30–90 sekund czytania.

**Przebieg**

1. Nagłówek: wynik + MVP meczu (1 zawodnik) opcjonalnie.
2. Skrót wydarzeń (timeline goli/kartek).
3. Proste statystyki: posiadanie, strzały, (ew.) celne — max kilka płytek, nie Excel.
4. Oceny zawodników jako lista czytelna (ocena + status).
5. CTA primary: **Wróć do klubu** / **Odbierz i wróć** (jeśli nagrody na osobnym kroku).
6. Secondary: „Szczegóły” (collapse) — progressive disclosure.

**Decyzje gracza**

- Jak głęboko czytać raport.
- Czy przejść od razu dalej.

**Informacje prezentowane**

- Wynik, eventy, podstawowe statystyki, oceny XI/ławki użytej.
- Komunikat narracyjny 1–2 zdania („Solidne zwycięstwo w domu” / „Ciężka porażka — czas na korektę składu”).

**Zależności**

- §7, §3, §21 (może dublować skrót w wiadomości), UI Guide.

**Pytania otwarte**

- Oceny 1–10 vs gwiazdki?
- Czy pokazujemy heatmapy / wykresy w MVP (raczej nie)?

---

### 9.13 Nagrody

**Cel**  
Domknąć emocję wyniku nagrodą odczuwalną — **bez projektowania ekonomii** (kwoty → §14/§26).

**Przebieg**

1. Po raporcie lub w jego stopce: sekcja „Po meczu”.
2. Lista nagród jako **kategorie** (nie liczby finalne tu): prestiż / postęp zadania / odblokowanie / zasoby.
3. Wygrana vs remis vs porażka — różny ton, nie „zero za porażkę” w early game (§3.2).
4. Oznaczenie ukończenia pierwszego zadania (§5.11), jeśli dotyczy.

**Decyzje gracza**

- Odbierz / kontynuuj (zwykle jedno kliknięcie).

**Informacje prezentowane**

- Lista „co dostałeś” w języku produktu (ikony + etykiety).
- Progress bar zadania dziennego / onboardingowego, jeśli aktywny.

**Zależności**

- §3, §5.11, §14, §19–20, §26–27 (granice — bez formuł).

**Pytania otwarte**

- Czy nagrody są na osobnym ekranie, czy w raporcie?
- Czy Premium dodaje tylko kosmetyk / wygodę, nigdy „wygraną”?

---

### 9.14 Rozwój zawodników po meczu

**Cel**  
Pokazać, że mecz **coś zmienia** w ludziach klubu — feedback sprawczości, nie arkusz treningowy.

**Przebieg**

1. W raporcie: sekcja „Forma / rozwój” — 3–5 zawodników z krótkim sygnałem (↑ forma, ↓ zmęczenie, debiut, gol).
2. Bez pełnego breakdownu XP / atrybutów w MVP onboardingu.
3. Link „Zobacz skład” prowadzi do §7 UI — nie zmusza.
4. Kontuzje/kartki — wyraźne ostrzeżenia na przyszły mecz.

**Decyzje gracza**

- Czy zgłębiać karty zawodników po meczu (opcjonalne).

**Informacje prezentowane**

- Sygnały jakościowe przy nazwiskach (strzałki / tagi).
- Lista niedostępnych na kolejny mecz (jeśli dotyczy).

**Zależności**

- §7, §8 (jako konsekwencja odczuwalna), §3.9 (mastery długoterminowa).

**Decyzja (zgodna z GDD-06 / §7)**  
Mecz pozostaje głównym źródłem rozwoju zawodnika. Trening pełni rolę wspierającą.

**Pytania otwarte**

- Jak mocno pokazywać regres po słabym meczu (ochrona early churn)?

---

### 9.15 Powrót do Hubu

**Cel**  
Zamknąć pętlę §3: z powrotem na Hub z **jednym jasnym „co dalej”**.

**Przebieg**

1. CTA z raportu → Hub.
2. Hub w stanie „po meczu”: krótki pasek „Ostatni wynik: …” + primary CTA kolejnej sprawy (następny mecz / zadanie / wiadomość). **Szczegół stanu Hubu → §23.8**.
3. Odblokowania UI (progressive disclosure) mogą tu błysnąć **jednym** toasłem — nie listą 10 systemów.
4. Sesja 5–15 min może się naturalnie skończyć; deep dive opcjonalny.

**Decyzje gracza**

- Zakończyć sesję vs kontynuować kolejną sprawę.

**Informacje prezentowane**

- Ostatni wynik, pozycja w tabeli (jeśli się zmieniła), następny mecz, stan pierwszego/dziennego zadania.

**Zależności**

- §3.6, §5.10–5.11, §10, §20–23, UI Guide.

**Pytania otwarte**

- Czy po pierwszym meczu zawsze pokazujemy krótki „co odblokowano”?
- Czy auto-open kolejnego meczu, gdy jest dostępny tego samego dnia (ryzyko zmęczenia)?

---

### 9.16 Kontrakty produktowe §9

1. **Przedmecz → Live → Raport → Hub** jest kanoniczną ścieżką.
2. **Defaulty pozwalają grać od razu**; skład/taktyka/formacja są opcjonalnym pogłębieniem.
3. **Sterowanie w meczu = tempo + pauza + taktyka preset + zmiany (głównie HT).**
4. **Raport jest obowiązkowym mostem** zanim wrócisz do Hubu (nie skip całego post-match w MVP — można zwinąć szczegóły).
5. **Nagrody i rozwój** pokazujemy jako odczucie; liczby ekonomii/treningu = inne rozdziały.
6. **Mobile i desktop: ta sama logika decyzji**, inny układ informacji.

---

### 9.17 Status checklisty §9

- [x] Wejście i przedmecz
- [x] Skład / taktyka / formacja
- [x] Start, live, sterowanie, przerwa, zmiany
- [x] Koniec, raport, nagrody, rozwój, powrót do Hubu
- [ ] Ustalenie MVP: highlights vs continuous live
- [ ] Ustalenie reguły zmian w trakcie 2H (limit ligowy: **5** — §10.17)
- [x] Spójność z §10 (limity zmian, brak dogrywki w lidze)

---

## 10. Liga

**Status rozdziału:** GDD-05 — opracowany (**zasady rozgrywek**; bez ekonomii liczbowej, transferów, treningu, LFE, UI kodu)

**Cel rozdziału**  
Ustanowić ligę jako **fundament kalendarza** i główne źródło motywacji sezonowej — spójnie z §3 (codzienny / tygodniowy / sezonowy rytm) oraz §9 (każdy mecz ma kontekst kolejki i tabeli).

**Zasady nadrzędne (decyzje GDD-05)**

1. **Liga = główny tryb** — puchary są satelitą (§11), nie konkurentem o uwagę w MVP.
2. **Każdy mecz liczy się do tabeli** — brak „friendly bez konsekwencji” w ścieżce ligowej (friendly później, jeśli w ogóle).
3. **Rytm codziennych powrotów** — terminarz zachęca do 1 sprawczego meczu dziennie, nie do maratonu 5 kolejek w jednej sesji.
4. **Proste MVP, skalowalna piramida** — mało reguł na start; więcej szczebli / baraży / formatów później.
5. **Soft landing** — słaby sezon boli prestiżem i miejscem, nie „game over” (§3.5).

**Szybki kontrakt liczbowy MVP (SSOT)**

| Parametr           | Wartość MVP                                     |
| ------------------ | ----------------------------------------------- |
| Szczeble widoczne  | 4 (Liga IV → Liga I)                            |
| Start gracza       | Liga IV                                         |
| Klubów w lidze     | **12**                                          |
| Format             | Dwukrotny każdy z każdym (home + away)          |
| Kolejek w sezonie  | **22**                                          |
| Punkty             | **3 / 1 / 0**                                   |
| Awans              | miejsca **1–2** (automat)                       |
| Spadek             | miejsca **11–12** (automat)                     |
| Baraże             | **brak w MVP**                                  |
| Tempo kalendarza   | **~1 mecz ligowy / dzień realny** (patrz §10.5) |
| Rywal w tabeli MVP | kluby AI (bot) — PvP później                    |

---

### 10.1 Struktura lig

**Cel**  
Dać zrozumiałą piramidę: „jestem tu → mogę awansować wyżej”.

**Przebieg**

1. Świat gry ma **piramidę szczebli** o wspólnych regułach (ten sam format tabeli).
2. Gracz widzi: swoją ligę (pełna tabela) + nazwy lig powyżej/poniżej (kontekst awansu/spadku).
3. Nazewnictwo robocze MVP: **Liga IV → III → II → I** (branding finalny później).
4. W obrębie jednego szczebla: jedna grupa 12 klubów (brak podziału na „grupa A/B” w MVP).

**Decyzje gracza**

- Brak wyboru ligi przy starcie (§5 — liga przyznana).
- Cel sezonu (miękki): utrzymać / mid-table / awans — narracja, nie hard quest obowiązkowy.

**Zależności**

- §5.8 (reveal ligi startowej), §3.5–3.8, §11 (puchary czerpią kontekst z szczebla).

**Wpływ na doświadczenie**

- Natychmiastowy sens „buduję drogę w górę”.
- Unika chaosu „20 lig o różnych regułach”.

**Pytania otwarte**

- Finalne nazwy brandowe (np. regionalne vs numerowane)?
- Czy Liga I ma podział na „mistrzostwo / europa” bez zmiany formatu tabeli?

---

### 10.2 Liczba poziomów rozgrywkowych

**Cel**  
Wystarczająco dużo szczebli na poczucie drogi, za mało by przytłoczyć mapą.

**Przebieg**

1. **MVP: 4 szczeble** aktywne w produkcie.
2. Roadmapa: +2–4 niższe/wyższe lub poziome regiony — bez zmiany reguł punktowych.
3. Sezon 1 gracza zaczyna zawsze na **najniższym aktywnym** (IV) — ochrona onboardingu.

**Decyzje gracza**

- Brak; awans/spadek wynika z tabeli.

**Zależności**

- §3.9 (długoterminowa motywacja), §19 (osiągnięcia „Awans do Ligii X”).

**Wpływ na doświadczenie**

- 1–3 sezony = realna szansa poczuć awans bez multi-year grind wall.
- Skalowanie contentu później bez przepisywania MVP.

**Pytania otwarte**

- Czy po dojściu do Ligii I dodajemy „superligę” / sezon mistrzowski jako osobny akt?
- Czy boty na wyższych szczeblach są wyraźnie „silniejsze” w odczuciu (bez formuł tu)?

---

### 10.3 Liczba klubów w lidze

**Cel**  
Zbalansować długość sezonu, czytelność tabeli i częstotliwość derbów narracyjnych.

**Przebieg**

1. **12 klubów** w każdej lidze MVP.
2. Dwukrotny RR → **22 kolejki** (§10.4).
3. Skład ligi: 1 klub gracza + 11 AI w MVP (miejsce na PvP: ten sam slot „klub”).
4. Identyfikacja rywali: herb, nazwa, skrót formy — spójnie z §9.2.

**Decyzje gracza**

- Brak wpływu na liczbę; wpływ na **pozycję** poprzez wyniki.

**Zależności**

- §9 (kontekst rywala), §23 (tabela na Hubie), przyszłe PvP (§29).

**Wpływ na doświadczenie**

- Tabela mieści się na mobile bez „ściany scrolla”.
- Sezon nie ciągnie się jak 38-kolejkowa imitacja PL w early game.

**Pytania otwarte**

- Czy po MVP skalujemy wybrane szczeble do 14/16 (dłuższy sezon dla hardkorów)?
- Unikalne nazwy AI vs generowane — content pipeline?

---

### 10.4 Terminarz sezonu

**Cel**  
Dać łuk: otwarcie → środek → climax → zamknięcie, czytelny w kalendarzu.

**Przebieg**

1. **Kolejki 1–22** ponumerowane; każda ma datę w kalendarzu gry / realnym dniu (§10.5).
2. Fazy narracyjne (UI copy, nie osobne reguły):
   - **K1–4** — otwarcie sezonu,
   - **K5–16** — trzon,
   - **K17–22** — finisz (napięcie awansu/spadku).
3. Po K22: ekran zamknięcia sezonu (§10.12–10.13).
4. Home/away: zbalansowany rozkład (nie 5 wyjazdów z rzędu na start — zasada komfortu).

**Decyzje gracza**

- Kiedy rozegrać dostępny mecz kolejki (w oknie dostępności).
- Czy śledzić „strefę awansu/spadku” w tabeli.

**Zależności**

- §3.5, §3.8, §9.1, §10.14, §23.

**Wpływ na doświadczenie**

- Gracz zawsze wie „która kolejka / ile zostało”.
- Finisz sezonu ma wagę bez osobnego trybu.

**Pytania otwarte**

- Czy Sezon 1 jest krótszy (np. 11 kolejek single RR) jako tutorial — **rekomendacja: nie**; ten sam format, łagodniejszy ton copy?
- Czy pokazujemy „matematyka awansu” (clinched) w UI?

---

### 10.5 Częstotliwość meczów

**Cel**  
Wspierać powroty codzienne i sesje 5–15 min — bez presji „musisz zagrać 3 mecze dziś”.

**Przebieg**

1. **Bazowo: 1 mecz ligowy odblokowany na 1 dzień realny** (timezone gracza).
2. Hub pokazuje: „Mecz kolejki N — dostępny” / „Następny jutro”.
3. **Zaległości (soft):** jeśli gracz nie zagra, mecz zostaje w kolejce jako „do zagrania” (max backlog **2** w MVP).
4. Powyżej limitu backlogu: **soft resolution** (wynik bez pełnego live UX) — ton ochronny, nie kara destrukcyjna; szczegóły UX → §9 + §28/29.
5. W jednej sesji: gracz **może** domknąć 1 zaległy + 1 dzisiejszy, ale Hub nie zachęca do maratonu (jedno primary CTA).
6. Pierwszy dzień / onboarding: 1 mecz (spójnie z §3.2–3.3); nie 3 kolejki naraz.

**Decyzje gracza**

- Grać dziś / jutro.
- Domknąć zaległość vs odłożyć (w limicie).

**Zależności**

- §3.6–3.7, §3.10, §9, §22 (przypomnienia), §20 (zadania „zagraj kolejkę”).

**Wpływ na doświadczenie**

- Jasny rytm „wróć jutro na kolejny mecz”.
- AFK nie niszczy sezonu od razu, ale nie pozwala nieskończenie stackować.

**Pytania otwarte**

- Dokładna reguła soft resolution (losowy wynik ważony siłą vs walkover 0–3)?
- Czy weekend = 2 odblokowania (ryzyko binge vs retencja)?
- Stamina / energy gate — **świadomie nie** jako bloker kolejki w MVP (§3.11); potwierdzić w §26–27.

---

### 10.6 Punkty za zwycięstwo, remis i porażkę

**Cel**  
Natychmiastowo zrozumiały system punktowy (standard piłkarski).

**Przebieg**

1. **Wygrana = 3**, **remis = 1**, **porażka = 0**.
2. Punkty aktualizują tabelę natychmiast po raporcie meczu (§9.12 → Hub/tabela).
3. Brak punktów bonusowych za „styl” w MVP (fairness + czytelność).

**Decyzje gracza**

- Brak decyzji o samym systemie; decyzje meczowe wpływają na wynik → punkty.

**Zależności**

- §9.11–9.12, §10.7–10.8.

**Wpływ na doświadczenie**

- Zero nauki „exotycznego” scoringu.
- Emocja 3 punktów jest uniwersalna.

**Pytania otwarte**

- Czy kiedyś fair-play tie-break / fair-play league — poza MVP.
- Walkover: czy 3 pkt + ustalony bilans bramek (np. 3–0) — **propozycja: tak**, do potwierdzenia z §9.11.

---

### 10.7 Tabela ligowa

**Cel**  
Główny artefakt postępu sezonu: „gdzie jestem i co mnie czeka”.

**Przebieg**

1. Widoki: Hub (skrót: pozycja + strefa), pełna tabela (ekran ligi), kontekst przedmeczowy (pozycje obu klubów).
2. Kolumny MVP: **Poz · Klub · M · Z · R · P · Br+ · Br− · Bilans · Pkt** (na mobile: Poz · Klub · M · Pkt · Bilans; reszta w expand).
3. Kolory/strefy: awans (1–2), bezpieczna, spadek (11–12) — dyskretne, nie krzykliwe.
4. Forma: ostatnie 5 wyników jako kropki przy klubie (opcjonalnie).
5. Po meczu: highlight Twojego wiersza + zmiana pozycji (↑↓).

**Decyzje gracza**

- Czy otwierać pełną tabelę (opcjonalne pogłębienie).
- Czy śledzić konkretnego rywala (później: „obserwuj”).

**Zależności**

- §9, §23, UI Guide, §19.

**Wpływ na doświadczenie**

- Natychmiastowy feedback sprawczości po każdym meczu.
- Motywacja mid-season bez nowych systemów.

**Pytania otwarte**

- Czy pokazujemy „odległość punktową” do awansu jako CTA?
- Sortowanie tapnięciem kolumn — nice-to-have vs stały order?

---

### 10.8 Kryteria kolejności w tabeli

**Cel**  
Deterministyczny, sprawiedliwy i komunikowalny porządek przy remisie punktowym.

**Przebieg — kolejność tie-break MVP**

1. **Punkty** (malejąco)
2. **Bilans bramek** (Br+ − Br−)
3. **Bramki zdobyte**
4. **Punkty w meczach bezpośrednich** (H2H)
5. **Bilans w meczach bezpośrednich**
6. **Bramki zdobyte w H2H**
7. **Nazwa klubu A→Z** (ostatni, czysto deterministyczny — unika losu)

**Decyzje gracza**

- Brak; reguła jest transparentna (link „Jak działa tabela?” 1 ekran help).

**Zależności**

- §10.6–10.7, §28 (brak ambiguity przy sporach).

**Wpływ na doświadczenie**

- Poczucie fair play; brak „RNG zdecydował o awansie”.
- H2H nagradza bezpośrednie starcia narracyjnie.

**Pytania otwarte**

- Czy zamiast H2H użyć większej liczby wygranych (W) przed bilansem — prostsze, mniej „piłkarskie”?
- Czy przy braku rozegranych H2H przeskakujemy dalej automatycznie (tak)?

---

### 10.9 Awanse

**Cel**  
Najsilniejsza nagroda sezonowa w lidze: wejście poziom wyżej.

**Przebieg**

1. Po zamknięciu sezonu: miejsca **1 i 2** awansują automatycznie (jeśli istnieje szczebel wyżej).
2. Liga I: miejsce 1 = **Mistrz**; miejsce 2 = wicemistrz (bez awansu wyżej w MVP).
3. Ekran awansu: herb, nowa liga, krótki beat celebracji → most do przerwy / nowego sezonu.
4. Soft landing: awans nie wymaga „idealnego składu” — klub startuje w nowej lidze z tą samą tożsamością.

**Decyzje gracza**

- Dążenie do strefy awansu (cel miękki).
- Po awansie: przygotowanie mentalne na trudniejszy sezon (copy, nie hard gate).

**Zależności**

- §10.2, §10.12–10.13, §3.5, §19, §14 (nagrody sezonowe — kategorie).

**Wpływ na doświadczenie**

- Peak emocji sezonu; paliwo retencji long-term.
- Jasny north star dla early/mid game.

**Pytania otwarte**

- Czy mistrz Ligii I dostaje specjalny badge / sezon commemorative?
- Ile klubów awansuje przy skalowaniu do 14/16 drużyn?

---

### 10.10 Spadki

**Cel**  
Konsekwencja słabego sezonu — odczuwalna, ale nie zabijająca motywacji.

**Przebieg**

1. Miejsca **11 i 12** spadają o szczebel (jeśli istnieje niższy).
2. Liga IV: **brak spadku** (podłoga świata MVP) — walka o honor / uniknięcie ostatniego miejsca jako motyw narracyjny.
3. Ekran spadku: empatyczny ton („Nowy start poziom niżej”), 1–2 highlighty do poprawy — bez shame spiral.
4. Sezon po spadku: ten sam format; prestiż/odczucie trudności niższe.

**Decyzje gracza**

- Walczyć o utrzymanie vs „odpuścić sezon” (gra nadal pozwala dokończyć).

**Zależności**

- §3.5 (soft landing), §10.12, §19, §21 (wiadomość zarządu — ton).

**Wpływ na doświadczenie**

- Stawka w dolnej połowie tabeli.
- Ochrona churnu na dnie piramidy.

**Pytania otwarte**

- Czy ostatnie miejsce w Lidze IV ma symboliczną „tarczę wstydu” (kosmetyka) czy lepiej unikać?
- Ile spadkowiczów przy większych ligach?

---

### 10.11 Baraże (jeśli występują)

**Cel**  
(Docelowo) dodać dramat mid-table; w MVP — **nie komplikować**.

**Przebieg MVP**

1. **Baraże wyłączone.**
2. Awans/spadek wyłącznie automatyczny (§10.9–10.10).

**Przebieg (plan rozbudowy)**

1. Opcja A: miejsce 3 vs spadek z wyższej (dwumecz).
2. Opcja B: mini-playoff 3–6.
3. Wymaga: slotów w kalendarzu po K22, UX KO (§11-like), reguł zmian/dogrywek.

**Decyzje gracza**

- MVP: brak.
- Później: przygotowanie do barażu jak do meczu o wysokiej stawce.

**Zależności**

- §9, §11, §10.4, §10.17.

**Wpływ na doświadczenie**

- MVP: prostota i szybkie domknięcie sezonu.
- Post-MVP: dodatkowy peak dramaturgiczny.

**Pytania otwarte**

- Priorytet baraży vs wcześniejsze dodanie pucharu krajowego?
- Czy baraż liczy się do „meczów sezonu” w statystykach klubu?

---

### 10.12 Przerwa między sezonami

**Cel**  
Odetchnąć, celebrować / przeżyć wynik, uniknąć pustki „nie ma co robić”.

**Przebieg**

1. Po K22 + ekranie sezonu: **przerwa** (MVP: **1–3 dni realne** lub skip „Rozpocznij przygotowania” jeśli gracz chce iść dalej).
2. Content przerwy (lekki, bez pełnego designu systemów):
   - podsumowanie sezonu,
   - odblokowanie zapowiedzi (transfery / trening jako „wkrótce” jeśli jeszcze gated),
   - porządki w klubie (eksploracja Hubu).
3. Brak meczów ligowych w przerwie.
4. Unikanie pustki: zawsze **jedno CTA** („Przygotuj sezon” / „Dalej”).

**Decyzje gracza**

- Przejść od razu vs poczekać (jeśli timer).
- Co zwiedzić w klubie w przerwie.

**Zależności**

- §3.8, §12–14 (zapowiedzi), §23, §20.

**Wpływ na doświadczenie**

- Rytm „sezon ma koniec”.
- Most emocjonalny bez hard resetu tożsamości.

**Pytania otwarte**

- Timer realny vs w pełni player-paced skip w MVP (**rekomendacja: skip dostępny**)?
- Czy w przerwie wolno grać puchar dokończony / baraż (gdy dojdą)?

---

### 10.13 Rozpoczęcie nowego sezonu

**Cel**  
Świeża tabela, kontynuacja klubu — „nowy rozdział”, nie new game.

**Przebieg**

1. Beat otwarcia: nazwa sezonu (Sezon 2…), liga (po awansie/spadku/utrzymaniu), soft cel.
2. Reset: tabela, kolejki 1–22, forma startowa (reguły formy → §7/§8 później).
3. **Nie resetujemy:** nazwy/herbu klubu, historii sezonów, osiągnięć, pamięci gracza.
4. Skład ligi: awansujący/spadkowicze + uzupełnienie AI (produktowo: liga zawsze pełna 12).
5. Pierwsza kolejka odblokowana wg §10.5.
6. Kalendarz przebudowany; Hub: „Kolejka 1 dostępna”.

**Decyzje gracza**

- Potwierdzenie startu sezonu (1 tap).
- Ewentualny przegląd składu przed K1 (opcjonalnie).

**Zależności**

- §3.8–3.9, §5 (tożsamość), §9, §10.14, §19.

**Wpływ na doświadczenie**

- Continuity + fresh stakes.
- Motywacja „w tym sezonie awansuję”.

**Pytania otwarte**

- Czy numerujemy sezony globalnie per konto, czy per szczebel?
- Draft AI opponentów: stałe rywale narracyjni vs rotacja co sezon?

---

### 10.14 Integracja z kalendarzem gry

**Cel**  
Kalendarz = SSOT „co jest ważne” — liga wypełnia większość slotów.

**Przebieg**

1. Każda kolejka = wydarzenie kalendarza: data, rywal, dom/wyjazd, status (zaplanowany / dostępny / zakończony / zaległy).
2. Hub czyta **następne wydarzenie ligowe** jako primary CTA (§3, §23).
3. Widok kalendarza: lista/agenda (mobile-first), nie pełny Excel sezonu na start.
4. Kolizje z pucharem: liga ma priorytet slotu dziennego w MVP; puchar dostaje wolne dni / osobne sloty (§10.15).
5. Po meczu: kalendarz oznacza kolejkę jako zagrana; odświeża „next”.

**Decyzje gracza**

- Które wydarzenie otworzyć (gdy >1 — rzadkie w MVP).
- Filtrowanie przeszłość / przyszłość (opcjonalne).

**Zależności**

- §3.3–3.7, §9.1, §11, §22–23.

**Wpływ na doświadczenie**

- Zero zgadywania „co mam robić”.
- Retencja przez daty, nie przez spam questów.

**Pytania otwarte**

- Kalendarz w czasie gry (dni sezonu) vs tylko real-time days — **MVP: real-time days mapowane 1:1 na kolejki**?
- Czy pokazujemy mecze innych klubów w kolejce (wyniki AI) live w tle?

---

### 10.15 Powiązanie z pucharami

**Cel**  
Ustalić hierarchię uwagi: liga prowadzi, puchar urozmaica — szczegóły formatu → §11.

**Przebieg (kontrakt pod §11)**

1. W MVP: **lekki Puchar Krajowy** jest w shipie (§11) — liga pozostaje trybem podstawowym.
2. Zasada kalendarza: **nie zastępować** kolejki ligowej pucharem tego samego dnia, jeśli wymusi skip ligi (§11.9–11.10).
3. Stawka pucharu: prestiż / ścieżka równoległa, nie zamiennik tabeli.
4. Awans ligowy nie zależy od pucharu.

**Decyzje gracza**

- Gdy puchar aktywny: czy priorytetyzować skład pod ligę vs puchar (gdy kolizja gotowości / zmęczenia składu — §11.11–11.12; terminologia §7).

**Zależności**

- §11, §10.14, §9, §3.

**Wpływ na doświadczenie**

- Unika konfliktu „nie wiem w co grać”.
- Zostawia miejsce na dramat KO.

**Pytania otwarte**

- Czy mistrz ligi / pucharu dostaje seed w pucharze kontynentalnym (post-MVP / §11 Future)?

---

### 10.16 Wpływ ligi na ekonomię i rozwój

**Cel**  
Opisać **kierunki wpływu** bez kwot, formuł treningu i reguł transferowych.

**Przebieg (kategorie, nie liczby)**

1. **Po meczu ligowym:** feedback zawodników / formy (§9.13–9.14) — liga jest głównym dostarczycielem tych impulsów.
2. **Po sezonie:** nagrody pozycyjne (mistrz / awans / utrzymanie / uczestnictwo) jako **kategorie prestiżu i zasobów** → szczegół §14 / §26.
3. **Szczebel ligi:** odczucie „wyższy poziom = większe wyzwanie i większy prestiż klubu” (tożsamość, nie spreadsheet).
4. **Pozycja w tabeli:** wpływa na narrację Hubu i cele (§20), nie na hard-lock systemów w MVP.
5. Świadomie **poza zakresem tu:** kwoty nagród, płace, ceny transferów, XP treningu.

**Decyzje gracza**

- Dążyć do wyższej pozycji / awansu jako dźwigni długoterminowego rozwoju klubu (motywacja).

**Zależności**

- §9.13–9.14, §14, §19–20, §26–27, §7–8 (później).

**Wpływ na doświadczenie**

- Liga czuje się „opłacalna” emocjonalnie i progresywnie.
- Unika early pay-to-win narracji (pozycja z gry, nie ze sklepu).

**Pytania otwarte**

- Czy nagroda za miejsce jest skokowa (1–2 vs reszta) czy płynna 1…12?
- Czy spadek zmniejsza „budżet odczuwalny” mocno, czy głównie prestiż?

---

### 10.17 Ograniczenia MVP oraz plan rozbudowy

**Cel**  
Zamknąć zakres shipowalny i ścieżkę skalowania.

**MVP — wchodzi**

- 4 szczeble × 12 klubów × 22 kolejki × 3/1/0
- Awans 1–2 / spadek 11–12 / podłoga bez spadku
- 1 mecz/dzień + soft backlog 2
- Tabela + tie-breaki §10.8
- Kalendarz ligowy jako rdzeń Hubu
- Rywal AI
- **Lekki Puchar Krajowy** (satelita kalendarza — §11)

**MVP — nie wchodzi**

- Baraże
- Multi-grupy / regiony
- Pełny PvP w jednej tabeli
- Rozbudowane puchary kontynentalne / multi-cup
- Zmienne reguły punktów / bonusy stylu
- Sezon 38 kolejek

**Reguły meczowe ligi (kontrakt dla §9)**

| Temat                    | MVP                                                           |
| ------------------------ | ------------------------------------------------------------- |
| Limit zmian              | **5** (okna: głównie HT + late — spójnie z otwartym UX §9.10) |
| Dogrywka / karne w lidze | **nie** (puchar: tak — §11)                                   |
| Walkover / soft AFK      | wynik ustalony; tabela się aktualizuje                        |

**Plan rozbudowy (kolejność robocza)**

1. ~~Puchar krajowy (§11)~~ — MVP (GDD-08)
2. Baraże
3. Więcej szczebli / branding
4. PvP mixed leagues / regiony
5. Opcjonalnie dłuższy format na top szczeblu
6. Puchary kontynentalne (§11 Future)

**Decyzje gracza**

- Brak meta-decyzji; odczuwa tylko to, co odblokowane.

**Zależności**

- §9, §11, §29, §30 (roadmap).

**Wpływ na doświadczenie**

- Szybki time-to-fun sezonu.
- Jasny roadmap bez przepisywania fundamentu.

**Pytania otwarte**

- Czy Sezon 1 ma osobny „training wheels” w sile AI (łatwiejsza Liga IV) — rekomendacja: **tak, odczuwalnie**, bez osobnego formatu?

---

### 10.18 Kontrakty produktowe §10

1. **Liga jest SSOT kalendarza** w MVP.
2. **22 kolejki / 12 klubów / 3-1-0 / awans 2 / spadek 2** — liczby zamknięte dla designu kolejnych rozdziałów.
3. **Tempo ≈ 1 mecz ligowy / dzień** z miękkim backlogiem.
4. **Bez baraży w MVP.**
5. **Podłoga piramidy bez spadku; szczyt bez awansu wyżej.**
6. **Wpływ na ekonomię/rozwój = kategorie**; liczby → §14/§26.
7. **Puchary nie nadpisują priorytetu ligi** w dniu kolejki.

---

### 10.19 Status checklisty §10

- [x] Struktura i liczba szczebli
- [x] Kluby, terminarz, częstotliwość, punkty
- [x] Tabela i tie-breakery
- [x] Awanse, spadki, baraże (MVP: off)
- [x] Przerwa i nowy sezon
- [x] Kalendarz + powiązanie z pucharami
- [x] Wpływ na ekonomię/rozwój (kierunki)
- [x] MVP cut + roadmap
- [ ] Finalne nazwy lig (brand)
- [x] Decyzja ship: lekki Puchar Krajowy w MVP (§11 / GDD-08)
- [ ] Exact soft-resolution AFK

---

## 11. Puchary

**Status rozdziału:** GDD-08 — opracowany (**rozgrywki pucharowe MVP**; bez algorytmów, formuł, LFE, kodu UI)

**Cel rozdziału**  
Zaprojektować lekki, dramatyczny tor pucharowy, który **nie zaburza ligi** (§10) i korzysta z tego samego doświadczenia meczu (§9) oraz statusów zawodników (§7–§8).

**Zasady nadrzędne (decyzje GDD-08)**

1. **Liga = tryb podstawowy**; puchar = satelita prestiżu i emocji KO.
2. **Jeden puchar w MVP:** Puchar Krajowy.
3. **Kalendarz:** puchar **nigdy nie kasuje** kolejki ligowej tego samego dnia (§10.15).
4. **Mecz pucharowy = prawdziwy mecz** (ten sam flow §9) — rozwój z gry jak w lidze, nie osobny silnik.
5. **Terminologia SSOT:** kondycja, zmęczenie, gotowość.
6. **Bez formuł / pay-to-win** (§27).
7. **Ship:** puchar wchodzi w MVP od **Sezonu 1** (mid-season start).

**Szybki kontrakt liczbowy MVP (SSOT)**

| Parametr         | Wartość MVP                                        |
| ---------------- | -------------------------------------------------- |
| Nazwa robocza    | Puchar Krajowy                                     |
| Format           | Puchar eliminacyjny (KO), **1 mecz** (bez rewanżu) |
| Drużyn           | **16**                                             |
| Rundy            | 1/8 → 1/4 → 1/2 → Finał (**4**)                    |
| Start            | Po **kolejce ligowej 8** (mid-season)              |
| Dogrywka / karne | **Tak** (tylko puchar; liga: nie)                  |
| Priorytet dnia   | **Liga > Puchar**                                  |

---

### 11.1 Filozofia pucharów

**Cel**  
Dać „noc pucharową”: wyższa stawka emocjonalna, niski koszt poznawczy, zero konkurencji z sensem tabeli.

**Przebieg**

1. Puchar jest **opcjonalnym dramaturgicznie**, ale **obecny w MVP** — gracz może odpaść wcześnie bez kary dla awansu ligowego.
2. Copy i UI mówią: „bonusowa ścieżka prestiżu”, nie „musisz wygrać puchar, by rozwijać klub”.
3. Przegrana w pucharze = koniec ścieżki w sezonie + soft landing (wracasz do ligi).
4. Nie ma osobnego „trybu pucharowego” poza kontekstem meczu.

**Decyzje gracza**

- Jak mocno rotować skład pod puchar vs ligę.
- Czy grać puchar od razu, gdy dostępny (po lidze dnia, jeśli kolizja).

**Zależności**

- §3 (mecz w centrum), §10, §9.

**Pytania otwarte**

- Ton porażki w finale vs 1/8 — czy osobny copy?

---

### 11.2 Miejsce pucharów w świecie gry

**Cel**  
Osadzić jeden turniej krajowy w piramidzie ligowej bez drugiego „świata”.

**Przebieg**

1. Puchar Krajowy jest **ogólnokrajowy** względem piramidy 4 szczebli (§10.1–10.2).
2. Nie ma w MVP pucharu ligowego / regionalnego / kontynentalnego.
3. Widoczność: Hub (gdy aktywny), kalendarz, ekran Rozgrywki (bracket + historia).
4. Sezon pucharu = sezon ligowy; nowy sezon → nowa edycja pucharu.

**Decyzje gracza**

- Wejść w widok bracketu (opcjonalne pogłębienie).

**Zależności**

- §10, §23, §6 (prestiż klubu — odczucie).

**Pytania otwarte**

- Finalna nazwa brandowa pucharu?

---

### 11.3 Warunki udziału

**Cel**  
Zagwarantować udział gracza i czytelne 16 drużyn.

**Przebieg MVP**

1. **Automatyczny udział klubu gracza** w Pucharze Krajowym (Sezon 1+).
2. Pozostałe miejsca: **11 klubów z ligi gracza** (cała liga 12) + **4 kluby z wyższego szczebla** (AI) jako „goście wyższej ligi”.
   - Jeśli gracz jest w Lidze I: 12 z Ligii I + 4 „dzikie karty” AI narracyjne / top formy (bez formuł publicznych).
3. Brak osobnego play-in / kwalifikacji w MVP.
4. Kontuzje/zawieszenia nie wykluczają klubu — tylko wpływają na skład (§9).

**Decyzje gracza**

- Brak decyzji o zgłoszeniu (auto).
- Skład na mecz pucharowy.

**Zależności**

- §10.3, §5 (klub), §9.

**Pytania otwarte**

- Czy w Lidze I „dzikie karty” pochodzą z Ligii II (awans narracyjny), czy zawsze z tej samej ligi?

---

### 11.4 Format rozgrywek

**Cel**  
Jednoznaczne KO bez grup.

**Przebieg**

1. Format: **single elimination**.
2. Każda para: **jeden mecz**.
3. Remis po regulaminowym czasie → **dogrywka**, potem **rzuty karne** (produktowo; UX w §9).
4. Brak grup, baraży pucharowych, „best of”.
5. Limit zmian jak w lidze (**5**) — spójność §10.17 / §9.

**Decyzje gracza**

- Taktyka/skład pod mecz o wszystko.
- Tempo oglądania (§9.8).

**Zależności**

- §9, §10.17.

**Pytania otwarte**

- Czy finał ma dłuższy beat UI (ceremonia), bez zmiany reguł?

---

### 11.5 Liczba rund

**Cel**  
Krótka drabinka: max 4 mecze pucharowe na sezon dla finalisty.

**Przebieg**

| Runda | Mecze w turnieju | Nazwa UX   |
| ----- | ---------------- | ---------- |
| 1     | 8                | 1/8 finału |
| 2     | 4                | 1/4 finału |
| 3     | 2                | Półfinał   |
| 4     | 1                | Finał      |

1. Gracz, który odpada, nie gra dalszych rund.
2. AI domyka pozostałe pary w tle (wyniki w brackecie).

**Decyzje gracza**

- Kontynuacja ścieżki poprzez wygrane.

**Zależności**

- §11.8 terminarz; §10 długość sezonu.

**Pytania otwarte**

- Czy pokazujemy skróty meczów AI w feedzie, czy tylko wynik w brackecie?

---

### 11.6 Losowanie

**Cel**  
Czytelny, sprawiedliwy bracket bez kokpitu.

**Przebieg MVP**

1. Po starcie edycji (po K8): **jednorazowe losowanie pełnej drabinki 16**.
2. Seed: kluby wyższego szczebla rozstawione tak, by nie klikały się wszystkie w 1/8 (jakościowa reguła, bez wzoru).
3. Gracz widzi: „Wylosowano drabinkę” + swoją ścieżkę.
4. Brak losowań rundowych w MVP (prostsze).
5. Replay losowania / reroll: **zakazane**.

**Decyzje gracza**

- Brak wpływu na losowanie (akceptacja wyniku).

**Zależności**

- §28 (fairness), §23.

**Pytania otwarte**

- Czy pokazujemy animację losowania, czy od razu bracket?

---

### 11.7 Gospodarze / rewanże

**Cel**  
Ustalić miejsce meczu bez dwumeczów.

**Przebieg**

1. **Brak rewanżów** w MVP.
2. Gospodarz:
   - jeśli różny szczebel → **niższy szczebel podejmuje** (romantyczna reguła),
   - jeśli ten sam szczebel → **losowanie gospodarza** przy tworzeniu pary / drabinki.
3. Finał: **neutralny** (narracja „stadion finałowy”) — bez wyboru gracza.
4. Dom/wyjazd wpływa na copy i lekki kontekst §9; bez formuł home advantage tu.

**Decyzje gracza**

- Brak wyboru hosta; świadomość domu/wyjazdu przy składzie.

**Zależności**

- §9.1–9.2, §13 (stadion — later flavor).

**Pytania otwarte**

- Czy finał zawsze „neutralny”, czy gospodarz z drabinki?

---

### 11.8 Terminarz

**Cel**  
Wpiąć 4 rundy w sezon 22 kolejek bez kolizji z priorytetem ligi.

**Przebieg MVP (kotwice)**

| Runda pucharu | Kotwica względem ligi                                                               |
| ------------- | ----------------------------------------------------------------------------------- |
| 1/8           | Dzień **po** rozegraniu kolejki **8** (osobny slot pucharowy)                       |
| 1/4           | Po kolejce **12**                                                                   |
| 1/2           | Po kolejce **16**                                                                   |
| Finał         | Po kolejce **20** (przed finiszem ligi K21–22) **lub** w przerwie po K22 — patrz OQ |

1. Slot pucharowy = wydarzenie kalendarza typu „Puchar”, nie kolejka ligowa.
2. Odblokowanie meczu pucharowego: gdy nadeszła kotwica **i** gracz ma zagrane wymagane kolejki ligowe (nie omija ligi).
3. Soft backlog pucharu: max **1** zaległy mecz pucharowy (ciaśniej niż liga), by nie stackować KO.

**Decyzje gracza**

- Kiedy domknąć dostępny puchar (tego dnia / jutro w limicie).

**Zależności**

- §10.4–10.5, §10.14, §3.6.

**Pytania otwarte**

- Finał przed K21–22 vs w przerwie międzysezonowej — która kotwica finalna?

---

### 11.9 Relacja liga ↔ puchary

**Cel**  
Jednoznaczna hierarchia systemów.

**Przebieg**

1. Tabela / awans / spadek: **tylko liga**.
2. Puchar nie daje punktów ligowych.
3. Hub primary CTA: zawsze **najpierw zaległa/dostępna liga**, potem puchar.
4. Sezon bez awansu mimo wygrania pucharu — OK (soft landing + prestiż).
5. Odpadnięcie z pucharu nie zmienia celów ligowych (§20).

**Decyzje gracza**

- Alokacja uwagi i świeżości składu między torami.

**Zależności**

- §10.15, §10.18, §23, §20.

**Pytania otwarte**

- Czy mistrzostwo pucharu odblokowuje achievement niezależny od miejsca w tabeli (§19)?

---

### 11.10 Kolizje kalendarza

**Cel**  
Zero sytuacji „musisz skipnąć ligę dla pucharu”.

**Przebieg**

1. **Twarde:** w jednym dniu realnym nie wymuszamy meczu pucharowego kosztem dostępnej kolejki ligowej.
2. Jeśli oba wydarzenia „dojrzały” tego samego dnia: Hub pokazuje **liga = primary**, puchar = secondary („dostępny po lidze” / „jutro”).
3. Po zagraniu ligi tego dnia: puchar może odblokować się **tego samego dnia** jako drugi mecz **tylko jeśli** gracz świadomie wybierze (nie auto-chain); rekomendacja UX: sugerować regenerację / jutro przy wysokim zmęczeniu.
4. Powiadomienia (§22): nie spamują pucharem nad ligą.

**Decyzje gracza**

- Czy grać dwa mecze w jednym dniu (liga + puchar) mimo kosztu zmęczenia.

**Zależności**

- §10.5, §10.14–10.15, §7.10, §8.4, §22–23.

**Pytania otwarte**

- Czy twardy soft-cap „max 1 mecz rywalizacyjny / dzień” (liga lub puchar), czy świadome 2 dozwolone?

---

### 11.11 Wpływ na skład

**Cel**  
Te same narzędzia XI, inny kontekst stawki.

**Przebieg**

1. Flow przedmeczowy = §9 (skład / taktyka / formacja).
2. Nagłówek: „Puchar Krajowy · 1/4” + rywal.
3. Ostrzeżenia gotowości (§7 / §9.2) działają identycznie.
4. Rotacja zalecana narracyjnie przed serią ligową, nie wymuszona.
5. Zawieszenia/kartki: reguły dyscypliny jak w lidze (produktowo); OQ czy kartki pucharowe są osobną pulą.

**Decyzje gracza**

- XI pod KO vs oszczędzanie na ligę.

**Zależności**

- §9.2–9.5, §7, §10.

**Pytania otwarte**

- Kartki: wspólna pula sezonowa vs osobna pucharowa?

---

### 11.12 Wpływ na zmęczenie

**Cel**  
Mecz pucharowy zużywa ten sam model zmęczenia / gotowości co liga.

**Przebieg**

1. Minuty pucharowe ↑ **zmęczenie**, wpływają na **kondycję / gotowość** (§7.8, §7.10).
2. Brak osobnego „pucharowego” paska.
3. Dzień po pucharze: trening regeneracyjny (§8.10) ma sens.
4. Dwa mecze / dzień (jeśli dozwolone): ostrzeżenie skumulowanego zmęczenia przed drugim.

**Decyzje gracza**

- Rest / regeneracja / rotacja po KO.

**Zależności**

- §7.10, §8, §9.9–9.10.

**Pytania otwarte**

- Czy finał generuje odczuwalnie wyższy koszt zmęczenia (flavor), czy identyczny?

---

### 11.13 Wpływ na rozwój zawodników

**Cel**  
Utrzymać hierarchię GDD-06: rozwój z **meczów**; puchar jest meczem.

**Przebieg**

1. Mecz pucharowy zasila **primary path** rozwoju (§7.12, §9.14) jak mecz ligowy.
2. Nie ma osobnego mnożnika „puchar = więcej XP” w MVP (anti-farm / prostota).
3. Trening nadal wspierający (§8); nie zastępuje minut pucharowych.
4. Odpadnięcie = brak dalszych impulsów pucharowych; liga kontynuuje rozwój.

**Decyzje gracza**

- Dać minuty młodzieży w pucharze (ryzyko KO vs rozwój).

**Zależności**

- §7.12–7.13, §8, §9.14.

**Pytania otwarte**

- Czy gol w finale ma ekstra sygnał narracyjny (nie mnożnik mocy)?

---

### 11.14 Wpływ na ekonomię

**Cel**  
Kierunki nagród bez kwot — ekonomia szczegółowa → §14 / §26 (nie mylić z §12 Transfery).

**Przebieg**

1. Udział / awans rund / zwycięstwo: **kategorie** prestiżu i zasobów (bez liczb).
2. Wpływ na wartość zawodników: pośredni przez występy / prestiż klubu (§7.17) — bez rynku tu.
3. Transfery (§12): puchar może później zwiększać zainteresowanie AI; poza MVP detail.
4. Premium (§27): brak kupna awansu / easy bracket.

**Decyzje gracza**

- Dążyć do głębokiego runu dla prestiżu (motywacja).

**Zależności**

- §14, §26, §7.17, §12, §27.

**Pytania otwarte**

- Czy nagroda finansowa za rundę jest stała per runda, czy skok na finale (decyzja liczb → §26)?

---

### 11.15 Nagrody

**Cel**  
Odczuwalne domknięcie runu pucharowego.

**Przebieg**

1. Po każdej wygranej rundzie: krótki feedback + kategoria nagrody.
2. Po odpadnięciu: podsumowanie „doszedłeś do X”.
3. Po finale (W/L): ekran trofeum / prestiżu.
4. Nagrody nie zastępują nagród ligowych sezonu.

**Decyzje gracza**

- Odbierz / wróć do Hubu.

**Zależności**

- §9.13, §14, §19–20.

**Pytania otwarte**

- Czy trofeum jest itemem kosmetycznym stadionu (§13) w MVP?

---

### 11.16 Prestiż

**Cel**  
Puchar buduje tożsamość klubu obok tabeli.

> **SSOT metryki:** definicja **Prestiżu** (oraz relacji do Reputacji) → **§6.2 / §6.5–6.6**. Ta sekcja opisuje tylko skutki pucharowe.

**Przebieg**

1. Zwycięstwo / finał: trwały wpis w historii klubu (§6 / §19).
2. Prestiż ≠ punkty ligowe.
3. Hub może pokazać badge „Finalista / Zdobywca” sezonu.
4. Soft landing: wczesne odpadnięcie nie obniża prestiżu destrukcyjnie w Sezonie 1.

**Decyzje gracza**

- Celebrować / eksplorować historię (opcjonalnie).

**Zależności**

- §6, §18–19, §23.

**Pytania otwarte**

- Czy prestiż pucharowy wpływa na trudność AI w kolejnym sezonie (odczucie)?

---

### 11.17 UI / UX (produkt)

**Cel**  
Drabinka czytelna na mobile; Hub bez konfliktu CTA.

**Przebieg**

1. Wejście: Hub secondary / zakładka Rozgrywki → Puchar.
2. Widok: bracket 16 (zwijany do „Twoja ścieżka” na mobile).
3. CTA meczu pucharowego: jak liga, z etykietą Puchar.
4. Po meczu: raport §9 → aktualizacja bracketu → Hub.
5. Kolizja dnia: liga primary (§11.10).
6. UI Guide: bez glow/neon; jeden cel ekranu.

**Decyzje gracza**

- Otwórz bracket vs graj mecz vs wróć.

**Zależności**

- UI Guide, §9, §23–25.

**Pytania otwarte**

- Bracket pełny zawsze vs „odkrywanie” kolejnego rywala po wygranej?

---

### 11.18 MVP vs Future

**Cel**  
Shipowalny wycinek + rozbudowa.

**MVP — wchodzi**

- 1× Puchar Krajowy, 16 drużyn, KO 1-meczowy, 4 rundy
- Start po K8, Sezon 1
- Dogrywka + karne
- Priorytet liga > puchar
- Ten sam flow meczu §9
- Nagrody/prestiż jako kategorie

**MVP — nie wchodzi**

- Puchary kontynentalne / ligowe / puchar pucharów
- Rewanże / dwumecze
- Faza grupowa
- Play-in kwalifikacje
- Multi-bracket / regiony
- Pay-to-enter / buy replay

**Future**

1. Puchar kontynentalny (seed z ligi/pucharu)
2. Rewanże od półfinału
3. Osobne reguły kartek
4. Kosmetyczne trofeum na stadionie
5. Puchar dla akademii (§16)

**Decyzje gracza**

- Odczuwa tylko MVP.

**Zależności**

- §10.17, §30, §16.

**Pytania otwarte**

- Który Future ma priorytet: kontynentalny vs rewanże?

---

### 11.19 Kontrakty produktowe §11

1. **Liga > puchar** w kalendarzu i CTA Hubu.
2. **MVP = jeden Puchar Krajowy**, 16 drużyn, KO bez rewanżu, 4 rundy.
3. **Start po kolejce ligowej 8**, od Sezonu 1.
4. **Puchar nie wpływa na tabelę / awans / spadek.**
5. **Mecz pucharowy = mecz (§9)** pod rozwój (§7) i zmęczenie (§7/§8).
6. **Dogrywka + karne tylko w pucharze** (liga: nie).
7. **Ekonomia = kategorie** (§14/§26); brak formuł i pay-to-win.
8. **Udział gracza automatyczny.**

---

### 11.20 Checklista §11

- [x] Filozofia i miejsce w świecie
- [x] Udział, format, rundy, losowanie, gospodarze
- [x] Terminarz, relacja z ligą, kolizje
- [x] Skład, zmęczenie, rozwój, ekonomia, nagrody, prestiż
- [x] UI/UX, MVP vs Future, kontrakty
- [ ] Kotwica finału (przed K21–22 vs przerwa)
- [ ] Max 1 vs 2 mecze rywalizacyjne / dzień
- [ ] Nazwa brandowa pucharu
- [ ] Pula kartek: wspólna vs osobna

---

## 12. Transfery

**Status rozdziału:** GDD-09 — opracowany (**rynek transferowy MVP**; bez algorytmów, formuł, LFE, kodu UI)

**Cel rozdziału**  
Umożliwić budowę i korektę kadry przez kupno/sprzedaż — **wspierająco** względem pętli meczowej (§3), na bazie wartości z §7.17, prestiżu ligi/pucharu (§10 / §11) oraz budżetu jako kategorii ekonomii (§14 / §26).

**Zasady nadrzędne (decyzje GDD-09)**

1. **Transfery nie zastępują meczu** — to przygotowanie / skutek między kolejkami.
2. **Wartość rynkowa = sygnał §7.17** — tu decyzje „co z nią zrobić”, nie nowa krzywa ceny.
3. **Prestiż klubu** (szczebel ligi + run pucharowy) wpływa na **atrakcyjność** ofert, nie na wynik meczu.
4. **Okna** ograniczają churn i chronią sezon ligowy.
5. **Kwoty i formuły → §14 / §26**; tu tylko kategorie i UX decyzji.
6. **Terminologia SSOT:** kondycja, zmęczenie, gotowość (przy ocenie „czy kupować kontuzjowanego”).
7. **Bez pay-to-buy power** (§27): Premium = wygoda UI, nie lepsi zawodnicy.
8. **MVP bez wypożyczeń i klauzul złożonych.**

**Szybki kontrakt MVP (SSOT)**

| Parametr                | Wartość MVP                                        |
| ----------------------- | -------------------------------------------------- |
| Odblokowanie rynku      | Pierwsze **okno mid-season** (po kolejce **11**)   |
| Okna                    | Mid-season (krótkie) + **międzysezonowe** (główne) |
| Kadra                   | **min 18 / max 22** zawodników                     |
| Akcje                   | Kup / sprzedaj / wolny agent (lekki)               |
| Negocjacje              | Accept / Reject / **maksymalnie 1 kontroferta**    |
| Wypożyczenia / klauzule | **Future**                                         |
| Wartość UI              | Pasmo §7.17 widoczne po odblokowaniu rynku         |

---

### 12.1 Filozofia rynku transferowego

**Cel**  
Rynek jako narzędzie „ulepszam skład”, nie giełda day-trading.

**Przebieg**

1. Gracz wraca na rynek w oknie, robi **1–3 sensowne ruchy**, wraca do ligi/pucharu.
2. Early soft landing: AI nie „okradnie” starterów w Sezonie 1 bez ostrzeżenia.
3. Narracja: kluby AI mają potrzeby pozycji; gracz buduje tożsamość kadry.
4. Transfer sukcesu = odczucie na boisku (§9), nie spreadsheet ROI.

**Decyzje gracza**

- Czy w ogóle wchodzić w okno, czy grać składem startowym.
- Kupić teraz vs czekać na międzysezonie.

**Zależności**

- §3, §5.7, §7, §10–11, §23.

**Pytania otwarte**

- Czy pierwsze okno ma tutorial 1-tap „Zobacz rynek”?

---

### 12.2 Okna transferowe

**Cel**  
Jasne okresy aktywności rynku, spójne z kalendarzem ligi/pucharu.

**Przebieg MVP**

1. **Okno mid-season:** start po **kolejce ligowej 11**; trwa kilka dni realnych (krótki slot — bez dokładnej liczby balansowej tu).
2. **Okno międzysezonowe:** w przerwie §10.12 — **główne**, dłuższe, CTA Hubu „Transfery”.
3. Poza oknem: przegląd kadry i wartości **read-only**; brak finalizacji transferów.
4. Odblokowanie UI rynku = **pierwsze otwarcie okna mid-season S1**.
5. Kolizja z meczem: dzień kolejki / pucharu — Hub primary = mecz; rynek secondary.

**Decyzje gracza**

- Kiedy w oknie dokonać ruchu.
- Czy domknąć deal przed zamknięciem okna (soft reminder §22).

**Zależności**

- §10.4–10.5, §10.12, §11.8, §22–23.

**Pytania otwarte**

- Czy okno mid-season bywa skrócone / zamknięte w dniach rundy pucharowej gracza?

---

### 12.3 Skład i limity kadry

**Cel**  
Utrzymać grywalny rozmiar składu i wymusić sensowne decyzje.

**Przebieg**

1. **Minimum 18** — poniżej: ostrzeżenie; nie da się zatwierdzić XI na mecz, jeśli brak pełnego składu zdrowych (reguła §9; zawsze min. 1 GK).
2. **Maximum 22** — kupno zablokowane przy limicie (najpierw sprzedaj / zwolnij).
3. Pakiet startowy (§5.7) mieści się w limicie.
4. Wolne miejsce w kadrze = warunek przyjęcia transferu przychodzącego.
5. Pozycje: miękki balans (bramkarz min. 2 — ostrzeżenie, nie hard iron w MVP poza niemożnością meczu bez GK).

**Decyzje gracza**

- Kogo sprzedać, by zrobić miejsce.
- Czy trzymać depth vs quality.

**Zależności**

- §5.7, §7, §9.3, §10.

**Pytania otwarte**

- Czy zwolnienie kontraktu (bez kupca) istnieje w MVP, czy tylko sprzedaż?

---

### 12.4 Oferty kupna i sprzedaży

**Cel**  
Dwa kierunki ruchu zawodników z czytelnym UX.

**Przebieg — kupno**

1. Lista rynku: filtrowanie pozycja / pasmo wartości / szczebel (proste).
2. Karta zawodnika: poziom, potencjał, wartość (§7.17), status gotowości, klub.
3. Oferta gracza → AI: **Accept** / **Reject** / **maksymalnie 1 kontroferta**.
4. Po akceptacji: zawodnik w kadrze, budżet ↓ (kategoria §14/§26).

**Przebieg — sprzedaż**

1. Gracz wystawia zawodnika **na listę** (opcjonalnie) **lub** otrzymuje **ofertę AI**.
2. Oferta: pasmo względem wartości + kontekst (prestiż kupującego).
3. Akceptacja → zawodnik opuszcza klub; miejsce w kadrze wolne; budżet ↑ kategorii.

**Decyzje gracza**

- Kogo kupić / sprzedać / wystawić.
- Przyjąć ofertę AI vs czekać.

**Zależności**

- §7.17, §14/§26, §21 (wiadomość oferty).

**Pytania otwarte**

- Czy wystawienie na listę obniża morale zawodnika od razu?

---

### 12.5 Decyzje AI klubów

**Cel**  
Odczucie żywego rynku bez publikowania algorytmów.

**Przebieg (zasady jakościowe)**

1. AI kupuje, gdy ma **lukę pozycji** i pasuje **pasmo wartości / potencjału**.
2. AI chętniej handluje z klubami o **wyższym prestiżu** (szczebel + sukces pucharowy §11).
3. AI rzadziej atakuje kluczowych starterów gracza w Sezonie 1 (ochrona).
4. Odrzucenie oferty gracza: gdy oferta wyraźnie poniżej pasma wartości lub klub „nie sprzedaje”.
5. Brak widocznego „scoring formula” dla gracza.

**Decyzje gracza**

- Dostosować ofertę (kontroferta) lub poszukać innego celu.

**Zależności**

- §7.3–7.4, §7.17, §10, §11.16, §6.

**Pytania otwarte**

- Czy AI może składać oferty poza oknem (tylko do odczytu / „wrócimy w oknie”)?

---

### 12.6 Wartość rynkowa zawodnika

**Cel**  
Użyć §7.17 jako kotwicy dealu — bez nowej definicji wartości.

**Przebieg**

1. Wartość na karcie = pasmo / skrót z §7.17.
2. Oferty AI i ask cenowy **orientują się wokół pasma** (jakościowo: poniżej / w paśmie / powyżej).
3. Kontuzja / niska gotowość: odczuwalnie słabsze oferty.
4. Po transferze wartość nie „wybucha”; aktualizacja jak w §7.17.
5. Widoczność: od odblokowania rynku (§12.2); wcześniej może być ukryta / „—” na karcie.

**Decyzje gracza**

- Sprzedać przy wysokim paśmie vs trzymać pod rozwój.

**Zależności**

- §7.17 (SSOT wartości), §14/§26.

**Pytania otwarte**

- Czy pokazywać historię zmiany pasma wartości (sparkline) w MVP?

---

### 12.7 Wpływ potencjału i rozwoju (§7)

**Cel**  
Rynek nagradza hodowlę z meczów, nie tylko OVR „dziś”.

**Przebieg**

1. Wysoki potencjał + rosnący poziom (§7.3–7.4) ↑ atrakcyjność sprzedaży i cenę odczuwalną.
2. Brak minut / regres (§7.15) ↓ zainteresowanie AI.
3. Talenty (§7.16) jako tag zwiększający unikalność oferty.
4. Kupno młodzieży = inwestycja pod minuty meczowe (ryzyko KO / ligi).
5. Trening (§8) wspiera rozwój między oknami; nie zastępuje wartości z gry.

**Decyzje gracza**

- Sprzedać prospet vs dać minuty.
- Kupić „gotowego” vs upside.

**Zależności**

- §7, §8, §9, §11 (minuty pucharowe).

**Pytania otwarte**

- Czy AI przecenia potencjał bardziej niż gracz widzi (fog) — nie w MVP?

---

### 12.8 Wpływ prestiżu (liga / puchar)

**Cel**  
Sukces sportowy ułatwia handel w obie strony — bez formuł.

> **SSOT metryk:** Prestiż / Reputacja / łańcuch sport → atrakcyjność → **§6.2 / §6.6 / §6.13**. Tu tylko skutki rynkowe.

**Przebieg**

1. Wyższy szczebel ligi (§10) → łatwiej przyciągnąć lepsze pasma / zainteresowanie.
2. Głęboki run pucharowy / trofeum (§11.16) → krótki boost atrakcyjności klubu w kolejnym oknie.
3. Słaba pozycja / spadek → trudniej zatrzymać / drożej kupić (odczucie).
4. Prestiż **nie** kupuje wyniku meczu (§27).
5. Badge / copy na rynku: „Finalista Pucharu” jako kontekst oferty.

**Decyzje gracza**

- Budować prestiż sportem, by wzmocnić rynek pośrednio.

**Zależności**

- §6, §10, §11.16, §18–19.

**Pytania otwarte**

- Jak długo trwa boost po finale pucharu (1 okno vs cały sezon)?

---

### 12.9 Budżet transferowy

**Cel**  
Ograniczyć zakupy kategorią środków — liczby w §14/§26.

**Przebieg**

1. Klub ma **jedną kasę** oraz **budżet transferowy** jako **przydział (envelope)** z tej kasy — decyzja SSOT §14.5.
2. UX: pasek / pasmo „dostępne na transfery” w oknie.
3. Kupno wymaga wystarczającego budżetu transferowego; sprzedaż zasila kasę i może odświeżyć envelope (§14).
4. Nagrody ligowe/pucharowe (§10.16, §11.14) zasilają kasę (kategorie).
5. Brak pożyczek bankowych / overdraft w MVP.

**Decyzje gracza**

- Alokacja: jeden drogi vs kilku tańszych (odczucie pasm).
- Czy sprzedać, by kupić.

**Zależności**

- §14, §26, §10.16, §11.14, §27.

**Decyzja (domknięta w GDD-10 / §14)**  
Jedna kasa klubowa + budżet transferowy jako przydział (nie osobna waluta).

---

### 12.10 Negocjacje

**Cel**  
Krótki rytuał dealu bez symulatora agentów.

**Przebieg MVP**

1. Ekran oferty: zawodnik + pasmo wartości + Twoja propozycja (presety: nisko / w paśmie / agresywnie — bez wpisywania formuł).
2. AI odpowiada w ramach SSOT: **Accept** / **Reject** / **Kontroferta** (maksymalnie jedna na łańcuch negocjacji).
3. Na kontrofertę: Accept / Reject (koniec — bez dalszych kontrofert).
4. Timeout: oferta wygasa z końcem dnia / okna (soft).
5. Brak chatów agentów / klauzul % w MVP.

**Decyzje gracza**

- Poziom otwarcia oferty.
- Przyjąć kontrofertę vs wyjść (Reject).

**Zależności**

- §7.17, §12.4–12.5, §21.

**Decyzja (SSOT / GDD-09)**  
W MVP negocjacje obejmują Accept, Reject oraz maksymalnie jedną kontrofertę.

---

### 12.11 Odrzucanie i akceptacja ofert

**Cel**  
Domknąć stany oferty czytelnie dla gracza i AI.

**Przebieg**

1. Oferty przychodzące (AI → gracz): lista w Transferach + skrót §21.
2. Akceptacja: natychmiastowy transfer przy spełnionych limitach kadry/budżetu.
3. Odrzucenie: oferta znika; AI może wrócić później z inną (bez spamu).
4. Oferty wychodzące: status „oczekuje / zaakceptowana / odrzucona”.
5. Blokady: okno zamknięte, brak miejsca, brak środków, zawodnik kontuzjowany długo (soft-block sprzedaży załamanej ceny — OQ).

**Decyzje gracza**

- Inbox ofert: przyjąć / odrzucić / zignorować do końca okna.

**Zależności**

- §12.2–12.3, §21–22, §7.11.

**Pytania otwarte**

- Czy odmowa sprzedaży ulubieńca fanów ma osobny hit morale szatni?

---

### 12.12 Wpływ na morale i skład

**Cel**  
Transfery mają konsekwencje w szatni i XI.

**Przebieg**

1. Sprzedaż często grającego: ryzyko spadku morale / prośby innych (§7.9).
2. Kupno konkurenta na pozycję: morale „zagrożonego” może spaść; nowy — lekki plus.
3. Brak minut po drogim transferze: morale nowego spada (sygnał).
4. Po transferze: domyślnie nowy **nie** jest forcowany do XI — gracz decyduje w §9.
5. Prośba o transfer (niskie morale): oferta wymuszona / lista — Future lub lekki MVP (OQ).

**Decyzje gracza**

- Komunikacja przez minuty i skład, nie przez dialogi.
- Rotacja po wzmocnieniu.

**Zależności**

- §7.9, §9.3, §8, §21.

**Pytania otwarte**

- Prośba o transfer w MVP: tak (uproszczona) czy Future?

---

### 12.13 UX / UI (produkt)

**Cel**  
Rynek mobilny, 2–4 tapnięcia do oferty, zgodny z UI Guide.

**Przebieg / mapa ekranów**

1. **Hub** → „Transfery” (gdy okno otwarte; inaczej z badge „zamknięte”).
2. **Taby:** Rynek · Twoja kadra · Oferty.
3. Lista + filtry proste; karta zawodnika; sheet oferty.
4. Potwierdzenie sukcesu: herb + nazwisko + „Dołącza do klubu” → skład / Hub.
5. Desktop: ta sama logika, szersza lista.
6. Brak terminala Bloomberg / 50 kolumn.

**Decyzje gracza**

- Nawigacja tabów; finalizacja dealu.

**Zależności**

- UI Guide, §23–25, §7 (karta).

**Pytania otwarte**

- Czy po kupnie auto-open składu na pozycji nowego?

---

### 12.14 MVP vs Future

**Cel**  
Shipowalny rynek + ścieżka głębi.

**MVP — wchodzi**

- Okna mid-season + międzysezonowe
- Kupno / sprzedaż / lekki wolny agent
- Limity 18–22
- Wartość §7.17 + prestiż liga/puchar jako kontekst AI
- Budżet jako kategoria
- Accept / Reject / maksymalnie 1 kontroferta
- Morale lekkie
- Odblokowanie po K11 (pierwsze okno)

**MVP — nie wchodzi**

- Wypożyczenia
- Klauzule (sell-on, release, agent %)
- Draft / aukcje
- Scouting fog wartości
- Exchange (zawodnik+zawodnik)
- Pay-to-sign boost
- Wielowątkowe negocjacje

**Future**

1. Wypożyczenia
2. Klauzule i kontrakty wieloletnie detail
3. Scouting (§17) z discovery
4. Exchange deals
5. Prośby o transfer + mediacje

**Decyzje gracza**

- Odczuwa tylko MVP.

**Zależności**

- §7.18, §16–17, §30.

**Pytania otwarte**

- Wolny agent: pełna lista w MVP vs 3–5 losowych co okno?

---

### 12.15 Kontrakty produktowe §12

1. **Transfery wspierają pętlę meczu**; nie są dziennym grindem.
2. **Wartość = §7.17**; rynek jej używa, nie redefiniuje.
3. **Prestiż ligi/pucharu wpływa na atrakcyjność handlu**, nie na fair-play wyniku.
4. **Okna: mid (po K11) + międzysezonie**; poza oknem brak finalizacji.
5. **Kadra 18–22.**
6. **Ekonomia dealu = kategorie §14/§26.**
7. **MVP: bez wypożyczeń i klauzul złożonych.**
8. **Bez pay-to-buy power (§27).**
9. **Negocjacje: Accept / Reject / maksymalnie 1 kontroferta.**

---

### 12.16 Checklista §12

- [x] Filozofia i okna
- [x] Limity kadry, oferty, AI
- [x] Wartość §7.17, potencjał, prestiż
- [x] Budżet, negocjacje, accept/reject
- [x] Morale/skład, UX, MVP vs Future
- [x] Kontrakty
- [x] Budżet: jedna kasa + envelope transferowy (§14)
- [ ] Zwolnienie kontraktu bez kupca w MVP?
- [ ] Prośba o transfer w MVP vs Future
- [ ] Czas trwania boostu prestiżu po pucharze

---

## 13. Stadion

**Status rozdziału:** GDD-12 — opracowany (**stadion MVP — obiekt statyczny**; bez algorytmów, formuł, kwot biletowych — liczby → §26 / content)

**Cel rozdziału**  
Dać klubowi czytelny **dom**: nazwa, pojemność, lekka frekwencja i bilety zasilające kasę (§14) — bez budowania infrastruktury w MVP.

**Zasady nadrzędne (decyzje GDD-12)**

1. **MVP = stadion statyczny** (brak rozbudowy, sektorów do kupienia, skyboxów).
2. Frekwencja jest **lekka** i spójna z §14.9.
3. Bilety (dom) → kategoria przychodu do **kasy** (§14).
4. Sukces sportowy i prestiż **wpływają na pasmo frekwencji**, nie na wynik meczu.
5. **Rozbudowa / hospitality / skyboxy = Future.**
6. Nazwa w MVP: **szablon auto** (§5.6); rename = Future.
7. **Bez formuł** frekwencji; bez pay-to-expand (§27).

**Szybki kontrakt MVP (SSOT)**

| Parametr             | Wartość MVP                             |
| -------------------- | --------------------------------------- |
| Stan obiektu         | **Statyczny** preset startowy           |
| Nazwa                | Szablon auto (np. Arena + klub)         |
| Pojemność            | Stała wartość z presetu (widoczna w UI) |
| Frekwencja           | Pasmo lekkie (dom)                      |
| Bilety               | Kategoria → kasa po meczu domowym       |
| Puchar domowy        | **Ten sam** model co liga               |
| Rozbudowa            | **Future**                              |
| Hospitality / skybox | **Future**                              |

---

### 13.1 Filozofia stadionu

**Cel**  
Stadion = tożsamość „nasz dom”, nie city-builder.

**Przebieg**

1. Gracz rozpoznaje obiekt po nazwie i pojemności.
2. Po meczu domowym czuje lekki wpływ frekwencji na kasę — bez mikrozarządzania cenami biletów.
3. Rozbudowa jest obietnicą Future, nie wymogiem Sezonu 1.
4. Obiekt nie konkuruje z CTA meczu na Hubie.

**Decyzje gracza**

- Wejść w kartę stadionu (opcjonalne).
- Brak decyzji budowy w MVP.

**Zależności**

- §5.6, §6, §14, §23, UI Guide.

**Pytania otwarte**

- Czy pokazujemy ilustrację / zdjęcie presetu, czy tylko ikonę?

---

### 13.2 Stadion jako element rozwoju klubu

**Cel**  
Osadzić obiekt w łuku klubu bez systemu budowy w MVP.

**Przebieg**

1. Stadion jest częścią **tożsamości klubu** (obok herbu, nazwy, ligi).
2. W MVP rozwój klubu = sport + finanse + kadra; stadion jest **stabilnym tłem**.
3. Future: rozbudowa jako kamień milowy §6 / prestiżu.
4. Historia klubu może wspominać „domowe noce” (flavor §19).

**Decyzje gracza**

- Pośrednio: wyniki → frekwencja → środki → transfery.

**Zależności**

- §6, §10–§12, §14, §19.

**Pytania otwarte**

- Czy awans ligowy zmienia tylko copy atmosfery, czy też preset wizualny (Future)?

---

### 13.3 Pojemność stadionu

**Cel**  
Dać czytelny limit „ile ludzi się mieści” — kotwica frekwencji.

**Przebieg**

1. Pojemność = **stała** liczba/preset z pakietu startowego.
2. Widoczna na karcie stadionu i (skrót) w Finansach / przedmeczu opcjonalnie.
3. Frekwencja nigdy nie przekracza pojemności (pasmo ≤ 100% odczuciowo).
4. Brak sprzedaży miejsc / dynamicznej pojemności w MVP.
5. Wartość konkretna presetu = content / §26 — nie projektowana tu jako formuła.

**Decyzje gracza**

- Brak (odczyt).

**Zależności**

- §5.6, §13.4, §26.

**Pytania otwarte**

- Czy po awansie pojemność rośnie automatycznie (rekomendacja MVP: **nie**; Future / nowy preset)?

---

### 13.4 Frekwencja

**Cel**  
Lekki sygnał zainteresowania kibiców na meczach domowych.

**Przebieg**

1. Frekwencja = **pasmo** (np. niska / solidna / wysoka / wyprzedane odczuciowo).
2. Dotyczy meczów **domowych** (liga i puchar — ten sam model).
3. Wpływ jakościowy: forma / ostatnie wyniki, atrakcyjność rywala, prestiż (§13.7–13.8).
4. Wyjazd: brak frekwencji własnej (ew. flavor „kibice wyjazdowi” bez przychodu).
5. Nie blokuje kick-off; nie wymaga mikrozarządzania.

**Decyzje gracza**

- Pośrednio przez wyniki i kalendarz (atrakcyjne starcia).

**Zależności**

- §9.2, §10, §11, §14.9.

**Pytania otwarte**

- Czy frekwencję pokazujemy na przedmeczu w MVP (§9.2 OQ) — rekomendacja: **skrót pasma**, nie detal?

---

### 13.5 Sprzedaż biletów

**Cel**  
Przełożyć frekwencję na kategorię przychodu — bez cennika.

**Przebieg**

1. Po meczu **domowym**: kategoria „Bilety” wpływa do **kasy** (§14.2).
2. Wysokość kategorii jakościowo śledzi pasmo frekwencji.
3. Brak ustawiania cen biletów przez gracza w MVP.
4. Remis/porażka mogą obniżyć kolejne pasmo, nie kasują bieżącej wypłaty po meczu.
5. Kwoty → §26.

**Decyzje gracza**

- Brak mikro; odczyt w raporcie / Finansach.

**Zależności**

- §14.2, §14.9, §9.13, §26.

**Pytania otwarte**

- Czy derb / top rywal ma osobny tag „podwyższone zainteresowanie” w UX?

---

### 13.6 Wpływ stadionu na finanse (§14)

**Cel**  
Jasny kontrakt z kasą i utrzymaniem obiektu.

**Przebieg**

1. **Przychód:** bilety domowe → kasa.
2. **Koszt:** lekkie **utrzymanie obiektu** (kategoria cykliczna §14.3) — stałe w MVP.
3. Brak CAPEX budowy w MVP.
4. Soft protection §14.13: niska frekwencja nie soft-lockuje.
5. Sponsor (§15) osobny tor; nie mylić z biletami.

**Decyzje gracza**

- Świadomość, że domowe mecze zasilają kasę.

**Zależności**

- §14, §15, §10.5.

**Pytania otwarte**

- Cykl utrzymania obiektu: sync z utrzymaniem kadry (§14 OQ)?

---

### 13.7 Wpływ wyników sportowych na frekwencję

**Cel**  
Kibice reagują na formę — bez snowball ruinującego early game.

**Przebieg**

1. Seria zwycięstw / dobra forma → wyższe pasmo (soft).
2. Słaba passa → niższe pasmo; Sezon 1 chroniony przed spadkiem do „pustych trybun” ekstremalnych.
3. Pojedyncza porażka nie zeruje frekwencji.
4. Cel sponsorski oparty o mecze nadal osiągalny niezależnie od frekwencji.

**Decyzje gracza**

- Wygrywać / budować formę (pośrednio).

**Zależności**

- §7.7 forma klubu/zawodników, §9, §10, §15.5.

**Pytania otwarte**

- Czy pierwsze 3 mecze sezonu mają floor frekwencji (tutorial atmosphere)?

---

### 13.8 Wpływ prestiżu ligi i pucharu

**Cel**  
Większa scena = większe zainteresowanie — spójnie z §11/§12/§15.

> **SSOT:** definicja Prestiżu → **§6.2 / §6.5**. Rozbudowa stadionu jako kierunek rozwoju klubu → **§6.11 Future** (obiekt MVP nadal §13).

**Przebieg**

1. Wyższy szczebel ligi → bazowo wyższe pasmo frekwencji (odczucie po awansie — Future preset lub soft bump copy w MVP bez zmiany pojemności).
2. Puchar domowy / atrakcyjna runda → lekki boost frekwencji na ten mecz.
3. Finał na neutralnym (§11.7): brak biletów własnych / minimalny flavor.
4. Prestiż nie kupuje wyniku LFE.

**Decyzje gracza**

- Iść głęboko w puchar także dla atmosfery/domu (motywacja).

**Zależności**

- §10, §11.7–11.8, §15.8, §6.

**Pytania otwarte**

- Soft bump frekwencji po awansie w MVP bez zmiany pojemności — tak/nie?

---

### 13.9 Podstawowe informacje prezentowane w UI

**Cel**  
Minimalny zestaw faktów o obiekcie.

**Przebieg — karta stadionu MVP**

| Element                              | MVP                           |
| ------------------------------------ | ----------------------------- |
| Nazwa                                | Tak                           |
| Pojemność                            | Tak                           |
| Frekwencja ostatniego meczu domowego | Pasmo / skrót                 |
| Utrzymanie obiektu                   | Pasmo kosztu (opcjonalnie)    |
| Przycisk rozbudowy                   | Wyszarzone „Wkrótce” / ukryte |
| Mapa sektorów                        | Nie                           |
| Cennik biletów                       | Nie                           |

1. Wejście: Hub / Klub / Finanse secondary.
2. Przedmecz: opcjonalny skrót frekwencji oczekiwanej.
3. Raport pomeczowy: linia biletów (§9.13 / §14).

**Decyzje gracza**

- Czy otwierać kartę.

**Zależności**

- §9.2, §14.16, §23, UI Guide.

**Pytania otwarte**

- Frekwencja na przedmeczu: zawsze / tylko gdy wysoka?

---

### 13.10 Rozbudowa stadionu (Future)

**Cel**  
Zarezerwować ścieżkę bez shipowania w MVP.

**Przebieg Future (zarys)**

1. Poziomy pojemności / sektory.
2. Koszt z kasy + czas budowy.
3. Trade-off: wyższe utrzymanie vs wyższy sufit biletów.
4. Gate: szczebel ligi / prestiż.
5. MVP: tylko zapowiedź UI.

**Decyzje gracza**

- Future: czy i kiedy budować.

**Zależności**

- §6, §14, §26, §10.

**Pytania otwarte**

- Od którego sezonu / szczebla odblokować pierwszą rozbudowę?

---

### 13.11 Hospitality / skyboxy (Future)

**Cel**  
Oznaczyć jako poza MVP — tie-in §15.

**Przebieg Future**

1. Skyboxy / loże jako slot przychodu + branding sponsora.
2. Osobna kategoria przychodu vs bilety masowe.
3. MVP: brak.

**Decyzje gracza**

- Future.

**Zależności**

- §15.14, §14, §25.

**Pytania otwarte**

- Czy hospitality wymaga wcześniej rozbudowy pojemności?

---

### 13.12 Nazwa stadionu

**Cel**  
Domknąć tożsamość obiektu bez tarcia onboardingu.

**Przebieg MVP**

1. Nazwa = **szablon automatyczny** przy kreacji (§5.6).
2. Widoczna wszędzie: karta, przedmecz domowy, historia.
3. **Brak** pola edycji w kreacji (ochrona budżetu czasu §5).
4. Future: zmiana nazwy (ew. limit / kosmetyka §27).

**Decyzje gracza**

- MVP: brak.
- Future: rename.

**Zależności**

- §5.6, §25, §27.

**Pytania otwarte**

- Czy szablon lokalizuje język (Arena / Stadion)?

---

### 13.13 UX / UI (produkt)

**Cel**  
Jedna spokojna karta obiektu; mobile-first.

**Przebieg**

1. Ekran **Stadion**: bohater = nazwa; pojemność; ostatnia frekwencja; CTA secondary do Finansów.
2. Brak builder UI.
3. Live mecz: bez wymogu renderu stadionu 3D — Canvas LFE osobno; tu tylko dane produktowe.
4. UI Guide: atmosfera obiektu bez glow/neon sponsor splash.

**Decyzje gracza**

- Wejść / wyjść.

**Zależności**

- UI Guide, §23–25, LFE (kontrakt, nie implementacja).

**Pytania otwarte**

- Czy herb klubu jest watermarkiem na karcie stadionu?

---

### 13.14 MVP vs Future

**Cel**  
Freeze zakresu.

**MVP — wchodzi**

- Preset statyczny (nazwa auto, pojemność stała)
- Frekwencja lekka (pasma)
- Bilety domowe → kasa
- Ten sam model liga/puchar domowy
- Lekkie utrzymanie obiektu
- Karta UI read-mostly
- Zapowiedź rozbudowy (opcjonalnie disabled)

**MVP — nie wchodzi**

- Rozbudowa pojemności / sektory
- Hospitality / skyboxy
- Cennik biletów
- Rename stadionu
- Budowa w czasie rzeczywistym
- Pay-to-expand

**Future**

1. Rozbudowa poziomów
2. Hospitality + sponsor slot
3. Rename / kosmetyka
4. Presety wizualne po awansie
5. Atmosfera / crowdy wpływ na morale (§7.9) lekko

**Decyzje gracza**

- Odczuwa MVP.

**Zależności**

- §6, §14–§15, §30, §27.

**Pytania otwarte**

- Priorytet Future: rozbudowa vs rename?

---

### 13.15 Kontrakty produktowe §13

1. **MVP = stadion statyczny** (bez rozbudowy).
2. **Nazwa auto**; rename = Future.
3. **Frekwencja lekka** na meczach domowych (liga = puchar).
4. **Bilety → kasa (§14)**; kwoty → §26.
5. **Wyniki i prestiż** wpływają na pasmo frekwencji, nie na fair-play wyniku.
6. **Hospitality / skyboxy = Future.**
7. **Utrzymanie obiektu** = lekka kategoria kosztu.
8. **Spójność z §5.6, §14.9, §15.**
9. **Bez algorytmów i pay-to-expand.**

---

### 13.16 Checklista §13

- [x] Filozofia, rozwój klubu, pojemność
- [x] Frekwencja, bilety, finanse
- [x] Wyniki, prestiż, UI info
- [x] Future: rozbudowa, hospitality
- [x] Nazwa, UX, MVP vs Future, kontrakty
- [ ] Preset pojemności (wartość content)
- [ ] Frekwencja na przedmeczu: zawsze vs conditional
- [ ] Soft bump po awansie bez zmiany pojemności
- [ ] Wariant językowy nazwy szablonowej

---

## 14. Finanse

**Status rozdziału:** GDD-10 — opracowany (**finanse klubowe MVP**; kategorie i UX — bez kwot, algorytmów, formuł; liczby → §26)

**Cel rozdziału**  
Dać menedżerowi czytelny obraz „stać mnie / nie stać” wspierający decyzje (skład, transfery, cele sezonu) — **bez karania** early game i bez soft-locka bankructwa.

**Zasady nadrzędne (decyzje GDD-10)**

1. **Ekonomia wspiera decyzje**, nie jest minigrą kary.
2. **Kategorie > liczby** w tym rozdziale; kwoty i krzywe → **§26**.
3. **Jedna kasa klubowa** + **budżet transferowy jako przydział (envelope)** z kasy (§12.9).
4. **Nagrody ligowe i pucharowe** zasilają kasę (i mogą odświeżać envelope) — zgodnie z §10 / §11.
5. **Brak pożyczek / overdraft / pay-to-bailout** w MVP (§27: Premium ≠ pieniądze na wynik).
6. **Soft landing:** ujemne trendy komunikowane wcześnie; brak game-over finansowego.
7. **Terminologia:** środki / kasa / budżet transferowy — bez mylenia z kondycją/zmęczeniem/gotowością zawodników.

**Szybki kontrakt MVP (SSOT)**

| Parametr   | Wartość MVP                                                       |
| ---------- | ----------------------------------------------------------------- |
| Model kasy | **1 kasa** + **envelope transferowy**                             |
| Waluta UX  | Jedna waluta gry (nazwa brandowa later)                           |
| Raport     | Po meczu (skrót) + ekran Finansów + podsumowanie sezonu           |
| Bankructwo | **Brak hard fail** — tryb ochrony / soft recovery                 |
| Sponsorzy  | **1 sponsor bazowy** (prosty); głębokość → §15                    |
| Frekwencja | **Lekki wpływ** na przychód meczowy (pasmo); detal stadionu → §13 |
| Pożyczki   | **Nie**                                                           |

---

### 14.1 Filozofia ekonomii gry

**Cel**  
Finanse jako feedback sprawczości i ograniczenie sensownych wyborów — nie Excel frustracji.

**Przebieg**

1. Gracz zawsze wie: stan kasy (pasmo/poziom), czy stać go na ruch transferowy, co właśnie wpłynęło.
2. Porażki sportowe bolą prestiżem i nagrodami, nie natychmiastowym ruinowaniem klubu.
3. Sezon 1: start z bezpiecznym buforem (pakiet §5) — bez tutorialowego bankruta.
4. Sukces (liga/puchar/sprzedaż) = odczuwalny zastrzyk, nie wykładniczy snowball bez limitu odczucia (balans → §26).

**Decyzje gracza**

- Wydać na transfer vs trzymać bufor.
- Czy czytać raport finansowy (opcjonalne pogłębienie).

**Zależności**

- §3 soft landing, §5 pakiet, §12, §27, §26.

**Pytania otwarte**

- Nazwa waluty / branding?

---

### 14.2 Źródła przychodów

**Cel**  
Wymienić kategorie wpływów bez kwot.

**Przebieg — kategorie MVP**

| Kategoria                    | Kiedy                     | Uwagi                                |
| ---------------------------- | ------------------------- | ------------------------------------ |
| Nagroda meczowa (liga)       | Po meczu ligowym          | Zależna od wyniku jakościowo (W/R/P) |
| Nagroda pozycyjna / sezonowa | Po sezonie / kamieniach   | §10.16                               |
| Nagroda pucharowa            | Po rundzie / trofeum      | §11.14–11.15                         |
| Bilety / dzień meczowy       | Po meczu domowym          | Lekka frekwencja (§14.9)             |
| Sponsor bazowy               | Cyklicznie / start sezonu | Prosty (§14.8, §15)                  |
| Transfer sprzedaży           | Przy finalizacji §12      | Zasilenie kasy                       |
| Inne                         | —                         | Future (merch, TV deal detail)       |

**Decyzje gracza**

- Pośrednio: grać u siebie, iść w puchar, sprzedawać.

**Zależności**

- §9.13, §10, §11, §12, §13, §15.

**Pytania otwarte**

- Czy remis daje zawsze >0 nagrody meczowej (ochrona early)?

---

### 14.3 Źródła kosztów

**Cel**  
Wymienić kategorie obciążeń bez kwot.

**Przebieg — kategorie MVP**

| Kategoria                   | Kiedy                        | Uwagi                                 |
| --------------------------- | ---------------------------- | ------------------------------------- |
| Pensje / utrzymanie kadry   | Cyklicznie (tydzień/kolejka) | §14.10                                |
| Premie meczowe / sezonowe   | Po wydarzeniach              | §14.11                                |
| Transfer kupna              | W oknie §12                  | Z envelope                            |
| Utrzymanie obiektu (bazowe) | Cyklicznie                   | Lekkie; upgrade’y → §13 Future/detail |
| Kary / niespodzianki        | Rzadko                       | Unikać w Sezonie 1                    |

**Decyzje gracza**

- Wielkość kadry vs koszt utrzymania (odczucie).
- Kupno vs oszczędność.

**Zależności**

- §7, §12, §13, §26.

**Pytania otwarte**

- Cykl potrąceń: co kolejkę vs co tydzień realny?

---

### 14.4 Budżet klubu (kasa)

**Cel**  
Jeden czytelny zasób „pieniądze klubu”.

**Przebieg**

1. **Kasa** = główne saldo środków.
2. UX: wartość pasmowa lub skrót liczby (gdy §26 dostarczy skalę) + trend ↑↓.
3. Hub: mini-wskaźnik kasy (nie dominuje CTA meczu).
4. Ekran Finansów: lista ostatnich ruchów (kategorie).
5. Kasa nie spada w „ukryciu” — każdy duży ruch ma feedback.

**Decyzje gracza**

- Czy otwierać ekran Finansów.
- Reakcja na ostrzeżenie niskiej kasy.

**Zależności**

- §23, §12, §26, UI Guide.

**Pytania otwarte**

- Czy pokazujemy dokładną liczbę od dnia 1, czy najpierw tylko pasma?

---

### 14.5 Budżet transferowy

**Cel**  
Domknąć model z §12.9: envelope, nie druga waluta.

**Przebieg**

1. **Budżet transferowy** = część kasy **przydzielona** na okna transferowe (envelope).
2. Kupno §12 zużywa envelope (i kasę spójnie).
3. Sprzedaż zasila **kasę**; system może **auto-odświeżyć** envelope w oknie (zasada jakościowa).
4. Poza oknem: envelope widoczny jako plan / niedostępny do wydania.
5. Gracz w MVP **nie** mikro-zarządza suwakiem alokacji (Future); przydział jest systemowy / sezonowy.

**Decyzje gracza**

- Wydawać envelope vs czekać na lepszy deal.
- Sprzedaż w celu odblokowania kupna.

**Zależności**

- §12.2, §12.9, §26.

**Pytania otwarte**

- Czy w międzysezoniu envelope = większy udział kasy niż mid-season (odczucie)?

---

### 14.6 Nagrody ligowe

**Cel**  
Zmapować kategorie nagród z §10 na finanse.

**Przebieg**

1. **Po meczu ligowym:** nagroda meczowa (kategoria wynikowa).
2. **Po sezonie:** nagroda za miejsce — **pasmowa / skokowa u topu** (mistrz / awans / mid / utrzymanie / dół) — bez kwot; szczegół skali → §26.
3. Awans: dodatkowy zastrzyk kategorii „prestiż + środki”.
4. Spadek: głównie prestiż; środki — miękki spadek odczuwalny, nie ruin (§10 soft landing).
5. Nie mylić z punktami tabeli.

**Decyzje gracza**

- Dążyć do wyższej półki nagród poprzez wyniki.

**Zależności**

- §10.9–10.10, §10.16, §9.13, §26.

**Pytania otwarte**

- Wypłata sezonowa: jeden zrzut po K22 vs rata w przerwie?

---

### 14.7 Nagrody pucharowe

**Cel**  
Zmapować §11 na wpływy kasy.

**Przebieg**

1. Wygrana rundy → kategoria nagrody (§11.15).
2. Finał / trofeum → większy zastrzyk kategorii + prestiż.
3. Odpadnięcie: brak kary finansowej (tylko brak dalszych nagród).
4. Nagrody pucharowe **nie zastępują** ligowych.
5. Mogą zasilić kasę w trakcie sezonu (pomoc mid-window).

**Decyzje gracza**

- Priorytet składu pod puchar przy potrzebie środków (trade-off zmęczenia §11.12).

**Zależności**

- §11.14–11.16, §12, §26.

**Pytania otwarte**

- Stała kategoria per runda vs skok na finale — rekomendacja produktowa: **skok na SF/finale**, mniejsze pasma wcześniej (§26 ustali liczby).

---

### 14.8 Sponsorzy (MVP vs Future)

**Cel**  
Prosty zastrzyk stabilności w MVP; głębokość w §15.

**Przebieg MVP**

1. **1 sponsor bazowy** — reguły pozyskania, celów i odnowienia → **§15** (SSOT).
2. Wpływ: cykliczny przychód kategorii + **1 cel sezonowy** (nie daily) — bez kar ciężkich.
3. Brak negocjacji wieloofertowych w MVP.
4. Branding UI: dyskretny (UI Guide), nie spam.

**Future**

- Wiele slotów, marketplace ofert, renegocjacje, kary za zerwanie, branding koszulek (§15.14).

**Decyzje gracza**

- MVP: przegląd celu / odbór nagrody; brak shopu sponsorów.
- Future: wybór oferty sponsora.

**Zależności**

- §15, §5, §20, §25, §14.

**Decyzja (domknięta w GDD-11 / §15)**  
Sponsor bazowy jest **odnawiany co sezon** (może pozostać ten sam brand lub lekka rotacja narracyjna — §15.11).

---

### 14.9 Wpływ frekwencji (MVP)

**Cel**  
Lekki związek dzień meczowy ↔ przychód — bez pełnego symulatora stadionu.

**Przebieg MVP**

1. Mecz **domowy** (liga lub puchar) generuje kategorię „bilety” zależną jakościowo od frekwencji — model SSOT → **§13.4–13.5**.
2. Mecz wyjazdowy: brak / minimalny przychód biletowy własny.
3. Pojemność, nazwa, UI obiektu → **§13**; upgrade’y = Future.
4. Frekwencja nie blokuje meczu i nie soft-lockuje.

**Decyzje gracza**

- Pośrednio przez wyniki i atrakcyjność starć.

**Zależności**

- §9, §10, §13, §11.

**Decyzja (domknięta w GDD-12 / §13)**  
Puchar domowy używa **tego samego** lekkiego modelu frekwencji / biletów co liga.

---

### 14.10 Koszty utrzymania kadry

**Cel**  
Większa / droższa kadra = wyższe utrzymanie (odczucie).

**Przebieg**

1. Koszt utrzymania zależy jakościowo od: liczby zawodników, pasm wartości/poziomu, (lekko) wieku.
2. Po transferze przychodzącym: utrzymanie ↑; po sprzedaży ↓.
3. Ostrzeżenie, gdy utrzymanie „zjada” bufor kasy.
4. Brak indywidualnych negocjacji pensji w MVP (Future).
5. Nie mylić z zmęczeniem zawodnika.

**Decyzje gracza**

- Limit 22 vs kosztowny lux composition.
- Sprzedaż „martwych” miejsc w kadrze.

**Zależności**

- §12.3, §7.17, §26.

**Pytania otwarte**

- Czy kontuzjowany nadal liczy pełne utrzymanie (tak — rekomendacja)?

---

### 14.11 Premie

**Cel**  
Krótkie, czytelne premie za osiągnięcia — bez arkusza bonusów.

**Przebieg MVP**

1. Premie kategorialne: np. zwycięstwo, awans rundy pucharu, awans ligowy.
2. Wypłata z kasy (koszt) **lub** neutralny flavor „premia wliczona w nagrodę” — **rekomendacja MVP:** premie zawodnicze jako **koszt kategorii** tylko przy dużych eventach (awans, trofeum), by nie spamować co mecz.
3. Brak ręcznego ustawiania premii przez gracza w MVP.
4. Future: suwak premii szatni.

**Decyzje gracza**

- MVP: brak mikro; świadomość kosztu przy dużych eventach.

**Zależności**

- §7.9 morale, §10–11, §26.

**Pytania otwarte**

- Potwierdzić: premie co mecz wyłączone w MVP — tylko eventy duże?

---

### 14.12 Saldo sezonowe

**Cel**  
Domknięcie roku finansowego obok sportowego.

**Przebieg**

1. Po K22 / w przerwie: **raport sezonowy** — przychody vs koszty (kategorie), bilans ↑↓.
2. Porównanie do startu sezonu (pasmo).
3. Nie blokuje startu nowego sezonu.
4. Highlight 3 największych ruchów (np. sprzedaż, trofeum, pensje).

**Decyzje gracza**

- Przejrzeć raport vs skip do przygotowań (§10.12).

**Zależności**

- §10.12–10.13, §23, §19.

**Pytania otwarte**

- Czy raport finansowy jest osobnym ekranem, czy sekcją podsumowania sezonu?

---

### 14.13 Bankructwo / ochrona przed soft-lockiem

**Cel**  
Nigdy nie zostawić gracza w stanie „nie mogę grać meczów / utknąłem”.

**Przebieg**

1. **Brak** bankructwa kończącego save w MVP.
2. Przy krytycznie niskiej kasie:
   - ostrzeżenia wcześniej,
   - soft aid: tymczasowy bufor / ograniczenie kupna / sugestia sprzedaży,
   - mecze ligowe/pucharowe **nadal dostępne**.
3. Envelope transferowy może spaść do zera — to OK; gra trwa.
4. Brak wymuszonej sprzedaży przez AI w Sezonie 1 bez ostrzeżenia (spójnie z §12.5).
5. Premium nie sprzedaje „pakietu ratunkowego wygrywającego ligę” (§27).

**Decyzje gracza**

- Posłuchać ostrzeżeń; sprzedać / zacisnąć envelope.

**Zależności**

- §3, §12, §27, §28, §10.5.

**Pytania otwarte**

- Nazwa trybu ochrony (copy): „Wsparcie federacji” vs neutralne „Stabilizacja”?

---

### 14.14 Relacje z transferami (§12)

**Cel**  
Jeden spójny przepływ środków ↔ rynek.

**Przebieg**

1. Kupno: wymaga envelope + spójność z kasą.
2. Sprzedaż: +kasa; odświeżenie envelope wg §14.5.
3. Poza oknem: brak finalizacji wydatków transferowych.
4. Wartość §7.17 kotwiczy odczucie ceny; kwoty → §26.
5. Limity kadry 18–22 niezależne od kasy (osobny gate).

**Decyzje gracza**

- Sekwencja sprzedaj→kup w oknie.

**Zależności**

- §12 (całość), §7.17, §26.

**Pytania otwarte**

- Czy odrzucona oferta AI generuje jakikolwiek koszt (nie — rekomendacja)?

---

### 14.15 Relacje z pucharami (§11)

**Cel**  
Puchar jako równoległy tor zasilania kasy i prestiżu.

**Przebieg**

1. Nagrody rund/trofeum → kasa (§14.7).
2. Prestiż → atrakcyjność transferowa (§12.8), nie bezpośredni cheat finansowy.
3. Priorytet kalendarza liga > puchar bez zmian (§11.9–11.10).
4. Brak kary finansowej za odpadnięcie.

**Decyzje gracza**

- Czy pchać puchar przy potrzebie mid-season cash.

**Zależności**

- §11, §12.8, §10.15.

**Pytania otwarte**

- Czy finał domowy (gdy nie neutralny — OQ §11) zwiększa frekwencję?

---

### 14.16 UX / UI (produkt)

**Cel**  
Finanse czytelne w 10 sekund; mobile-first.

**Przebieg**

1. Hub: mały wskaźnik kasy + alert tylko gdy krytycznie.
2. Ekran **Finanse**: saldo, envelope transferowy, ostatnie 5–10 ruchów, skrót sezonu.
3. Po meczu: 1 linia „+ kategoria nagrody” w raporcie (§9.13).
4. W oknie transferowym: envelope prominentny.
5. Brak wykresów candlestick; proste paski/pasma.
6. UI Guide: bez glow; jeden cel ekranu.

**Decyzje gracza**

- Wejść w detal vs zostać na Hubie.

**Zależności**

- §9.13, §12.13, §23–25, UI Guide.

**Pytania otwarte**

- Waluta: ikona + liczba vs tylko pasmo na mobile liście Hubu?

---

### 14.17 MVP vs Future

**Cel**  
Shipowalny model + miejsce na §26 i §15.

**MVP — wchodzi**

- 1 kasa + envelope transferowy
- Kategorie przychodów/kosztów (§14.2–14.3)
- Nagrody ligowe + pucharowe (kategorie)
- 1 sponsor bazowy
- Lekka frekwencja biletowa
- Utrzymanie kadry (uproszczone)
- Premie tylko przy dużych eventach (rekomendacja)
- Raport sezonowy
- Soft protection (bez hard bankruptcy)
- Brak pożyczek

**MVP — nie wchodzi**

- Pełny model §26 liczbowy (osobny etap balansu)
- Multi-sponsor marketplace
- Pożyczki / inwestorzy / emisja akcji
- Ręczne pensje i klauzule premiowe
- Podatki / fair-play finansowy detail
- Pay-to-refill kasy

**Future**

1. §15 głębocy sponsorzy
2. §13 upgrade’y stadionu ↔ przychód
3. §26 liczby i krzywe
4. Negocjacje pensji
5. Inwestycje / pożyczki soft

**Decyzje gracza**

- Odczuwa MVP.

**Zależności**

- §15, §13, §26, §30.

**Pytania otwarte**

- Kolejność: najpierw liczby §26 czy sponsorzy §15?

---

### 14.18 Kontrakty produktowe §14

1. **Ekonomia wspiera decyzje; nie soft-lockuje gry.**
2. **Jedna kasa + envelope transferowy** (nie druga waluta).
3. **Kwoty i formuły → §26**; tu kategorie i UX.
4. **Nagrody ligowe i pucharowe zasilają kasę.**
5. **Sponsor bazowy w MVP**; głębokość → §15.
6. **Frekwencja = lekki wpływ** na bilety; detal → §13.
7. **Brak pożyczek i hard bankruptcy w MVP.**
8. **Premium ≠ doładowanie wygrywające** (§27).
9. **Spójność z §12:** kupno z envelope; sprzedaż do kasy.

---

### 14.19 Checklista §14

- [x] Filozofia, przychody, koszty
- [x] Kasa i envelope transferowy
- [x] Nagrody ligowe i pucharowe
- [x] Sponsorzy MVP, frekwencja, utrzymanie, premie
- [x] Saldo sezonowe, ochrona soft-lock
- [x] Relacje §12 / §11, UX, MVP vs Future
- [x] Kontrakty
- [ ] Nazwa waluty
- [ ] Cykl potrąceń utrzymania (kolejka vs tydzień)
- [ ] Potwierdzenie zakresu premii (tylko duże eventy)
- [ ] Forma wypłaty nagrody sezonowej

---

## 15. Sponsorzy

**Status rozdziału:** GDD-11 — opracowany (**sponsoring MVP**; bez algorytmów, formuł, kwot — liczby → §26)

**Cel rozdziału**  
Dać stabilne, uzupełniające źródło dochodu i lekki cel sezonowy — spójne z kasą (§14), kalendarzem (§10–§11) i bez presji codziennego logowania.

**Zasady nadrzędne (decyzje GDD-11)**

1. **MVP = 1 sponsor bazowy** (potwierdzenie §14.8).
2. Sponsoring **uzupełnia** ekonomię, nie zastępuje nagród ligowych/pucharowych.
3. Cele są **sezonowe / kamieniowe**, nie daily-login gates.
4. **Brak ciężkich kar** za niewykonanie celu w MVP (soft miss).
5. Prestiż ligi/pucharu wpływa na **jakość oferty przy odnowieniu** (Future mocniej; MVP lekko).
6. **Bez marketplace** i multi-slotów w MVP.
7. **Bez formuł / pay-to-sponsor-win** (§27).

**Szybki kontrakt MVP (SSOT)**

| Parametr                | Wartość MVP                                   |
| ----------------------- | --------------------------------------------- |
| Liczba sponsorów        | **1** (bazowy)                                |
| Pozyskanie              | Auto przy kreacji klubu + odnowienie sezonowe |
| Długość                 | **1 sezon ligowy**                            |
| Cele                    | **1 cel sezonowy** prosty                     |
| Kara za miss            | **Brak** (tylko brak bonusu)                  |
| Przychód bazowy         | Kategoria cykliczna → kasa (§14)              |
| Zmiana w trakcie sezonu | **Nie** (tylko przy odnowieniu)               |

---

### 15.1 Filozofia sponsoringu

**Cel**  
Sponsor = partner tła: spokojny cashflow + jeden jasny cel, zero korporacyjnego CRM.

**Przebieg**

1. Gracz wie: kto sponsoruje, co płaci (kategoria), jaki jest cel sezonu.
2. Cel da się domknąć grając ligę/puchar naturalnie — bez „zaloguj się 7 dni”.
3. Miss celu nie psuje sezonu finansowo.
4. Branding jest dyskretny (UI Guide).

**Decyzje gracza**

- Śledzić postęp celu (opcjonalnie).
- Odbierać bonus po realizacji.

**Zależności**

- §14, §3, §20, UI Guide.

**Pytania otwarte**

- Ton copy sponsora: serio B2B vs lekko humorystyczny?

---

### 15.2 Sponsor bazowy w MVP

**Cel**  
Zdefiniować jedyny slot sponsorski shipowany w MVP.

**Przebieg**

1. Jeden podmiot (nazwa + logo szablonowe).
2. Pakiet: przychód cykliczny + 1 cel sezonowy + bonus za cel.
3. Widoczność: ekran Sponsor / skrót w Finansach / delikatny credit w Hubie.
4. Brak drugiego slotu (rękawy, board) w MVP.

**Decyzje gracza**

- Brak wyboru brandu przy starcie (auto).

**Zależności**

- §5 pakiet, §14.8, §25.

**Pytania otwarte**

- Czy nazwy sponsorów są z puli lokalnej / generycznej?

---

### 15.3 Sposób pozyskania sponsora

**Cel**  
Zero tarcia w onboardingu.

**Przebieg**

1. Przy **kreacji klubu** (§5): sponsor bazowy jest **przyznawany** wraz z pakietem (reveal 1 linia).
2. Brak mini-gry „wybierz z 5 ofert” w MVP.
3. Po odblokowaniu Finansów: pełniejsza karta sponsora.
4. Future: przetarg ofert po sezonie / awansie.

**Decyzje gracza**

- Akceptacja pakietu (jak reszta §5).

**Zależności**

- §5, §14, §23.

**Pytania otwarte**

- Czy reveal sponsora jest na ekranie pakietu, czy dopiero w Hubie?

---

### 15.4 Długość współpracy

**Cel**  
Jasny horyzont umowy.

**Przebieg**

1. Umowa = **bieżący sezon ligowy** (do zamknięcia §10.12).
2. W trakcie sezonu umowa jest stała.
3. Po sezonie: flow odnowienia (§15.11).
4. Puchar nie przedłuża osobno umowy (ten sam sezon).

**Decyzje gracza**

- Brak wcześniejszego zerwania w MVP.

**Zależności**

- §10.12–10.13, §11.

**Pytania otwarte**

- Czy umowa startuje od K1, nawet jeśli sponsor reveal był w kreacji przed pierwszym meczem? (tak — rekomendacja)

---

### 15.5 Cele sponsorskie

**Cel**  
Jeden prosty cel na sezon, mierzalny bez daily pressure.

**Przebieg MVP — typy celów (1 z puli na sezon)**

| Typ                | Przykład UX                          | Miernik                        |
| ------------------ | ------------------------------------ | ------------------------------ |
| Frekwencja meczowa | „Rozegraj X meczów ligowych”         | Licznik meczów (§10)           |
| Wynik zbiorczy     | „Zdobądź Y punktów w sezonie”        | Punkty tabeli                  |
| Pozycja            | „Zakończ w bezpiecznej strefie”      | Miejsce po sezonie             |
| Puchar             | „Dotrzyj do 1/4 Pucharu”             | Runda §11                      |
| Rozwój             | „Wypromuj minutes młodzieży” (lekki) | Sygnał §7 — tylko jeśli prosty |

1. Cel wybiera system przy starcie sezonu (dopasowanie do szczebla — jakościowo).
2. Postęp widoczny na karcie sponsora.
3. **Nie** wymaga codziennego logowania — tylko postępu sportowego.
4. Nie blokuje nagród ligowych/pucharowych.

**Decyzje gracza**

- Priorytetyzować cel vs inne cele sezonu (miękko).

**Zależności**

- §10, §11, §7, §20 (cel może dublować się wizualnie z zadaniem, ale nie jest daily).

**Pytania otwarte**

- Czy gracz może „odrzucić” cel i wylosować inny raz na sezon? (rekomendacja: **nie** w MVP)

---

### 15.6 Nagrody za realizację celów

**Cel**  
Bonus odczuwalny, nie obligatoryjny do przeżycia.

**Przebieg**

1. **Przychód bazowy** płynie niezależnie od celu (kategoria cykliczna → kasa).
2. **Bonus za cel:** jednorazowa kategoria środków (+ ewentualnie prestiż lekki) po spełnieniu.
3. Wypłata: przy spełnieniu lub przy domknięciu sezonu (jeśli cel pozycyjny).
4. Miss: **brak bonusu**, bez potrącenia z przychodu bazowego.
5. Kwoty → §26.

**Decyzje gracza**

- Odbierz bonus (1 tap) / auto w raporcie sezonu.

**Zależności**

- §14.2, §14.12, §26, §9.13.

**Pytania otwarte**

- Auto-credit vs osobny ekran „Sponsor zadowolony”?

---

### 15.7 Wpływ wyników sportowych

**Cel**  
Wyniki kształtują postęp celu i (lekko) przyszłe oferty.

**Przebieg**

1. Mecze ligowe/pucharowe naturalnie zbliżają do celu (§15.5).
2. Słaba passa nie kasuje umowy mid-season.
3. Przy odnowieniu: lepszy sezon → szansa na **lepsze pasmo** przychodu bazowego następnego kontraktu (jakościowo).
4. Brak wpływu na wynik meczu LFE / pay-win.

**Decyzje gracza**

- Grać naturalnie; cel jest spójny z ligą/pucharem.

**Zależności**

- §9, §10, §11, §14.

**Pytania otwarte**

- Czy seria porażek pokazuje copy „sponsor zaniepokojony” bez kary? (flavor)

---

### 15.8 Wpływ prestiżu ligi i pucharu

**Cel**  
Prestiż zwiększa atrakcyjność sponsorską — spójnie z §12.8.

> **SSOT metryk:** Prestiż / Reputacja → **§6.2 / §6.14**. Tu tylko skutki sponsorskie.

**Przebieg**

1. Wyższy szczebel (§10) → przy odnowieniu wyższe pasmo oferty bazowej (odczucie).
2. Głęboki run / trofeum (§11.16) → krótki boost przy odnowieniu (1 sezon).
3. MVP: gracz **nie** wybiera z listy; system przydziela pasmo.
4. Future: prestiż odblokowuje lepsze marki w marketplace.

**Decyzje gracza**

- Budować prestiż sportem (pośrednio).

**Zależności**

- §10, §11.16, §6, §12.8, §14.

**Pytania otwarte**

- Czy spadek ligowy obniża pasmo odnowienia od razu (tak — rekomendacja soft)?

---

### 15.9 Relacja z finansami (§14)

**Cel**  
Jeden spójny wpływ na kasę.

**Przebieg**

1. Przychód sponsorski = kategoria w §14.2 → **kasa**.
2. Bonus celu = osobna kategoria jednorazowa → kasa.
3. Nie tworzy osobnej waluty; nie zasila envelope bezpośrednio (chyba że §14.5 auto-refresh z kasy — bez specjalnej reguły sponsorskej).
4. Widok w ekranie Finansów: linia „Sponsor”.
5. Soft protection §14.13 nadal ważniejsza niż sponsor.

**Decyzje gracza**

- Czytać ruch w historii finansów.

**Zależności**

- §14 (całość), §26.

**Pytania otwarte**

- Częstotliwość cyklu bazowego: co kolejkę vs co tydzień realny (spiąć z §14.3 OQ)?

---

### 15.10 Wpływ na rozwój klubu

**Cel**  
Sponsor wspiera odczucie instytucji, nie OVR zawodników.

**Przebieg**

1. Stabilny cashflow ułatwia utrzymanie kadry / transfery pośrednio (§14 / §12).
2. Prestiż partnerski: badge / wpis historii klubu (§6 / §19) przy długiej współpracy Future.
3. Brak bezpośredniego buffa treningu (§8) ani atrybutów (§7).
4. Cel sponsorski może motywować minuty / wyniki = rozwój z gry.

**Decyzje gracza**

- Traktować cel jako miękki north-star sezonu.

**Zależności**

- §6, §7, §12, §14, §19.

**Pytania otwarte**

- Czy multi-sezon z tym samym sponsorem daje kosmetyczny achievement?

---

### 15.11 Odnowienie umowy

**Cel**  
Rytuał międzysezonowy bez tarcia.

**Przebieg**

1. Po zamknięciu sezonu (§10.12): ekran „Odnowienie współpracy”.
2. System proponuje: **ten sam sponsor** (często) lub **nowy brand** z puli (lekka rotacja).
3. Pasmo przychodu bazowego zależy jakościowo od sezonu + prestiżu (§15.7–15.8).
4. Nowy **1 cel** na kolejny sezon.
5. Gracz w MVP: **Akceptuj** (jedyny CTA) — brak shopu porównań.
6. Skip: auto-accept przy starcie nowego sezonu, jeśli gracz nie otworzy ekranu.

**Decyzje gracza**

- Obejrzeć warunki vs auto.

**Zależności**

- §10.12–10.13, §14, §23.

**Pytania otwarte**

- Czy kiedykolwiek pokazujemy 2 oferty już w MVP (rekomendacja: **nie**)?

---

### 15.12 Zmiana sponsora

**Cel**  
Ustalić, kiedy wolno zmienić partnera.

**Przebieg MVP**

1. **W trakcie sezonu: zmiana niemożliwa.**
2. Zmiana tylko przez odnowienie (§15.11) — system może podmienić brand.
3. Brak ręcznego „wypowiedzenia” i kar za zerwanie.
4. Future: marketplace mid-season / buyout.

**Decyzje gracza**

- MVP: brak aktywnej zmiany.

**Zależności**

- §15.11, §14.13 (brak soft-lock).

**Pytania otwarte**

- Flavor wiadomość przy zmianie brandu (§21)?

---

### 15.13 UX / UI (produkt)

**Cel**  
Jedna karta sponsora; mobilna; bez dashboardu reklamowego.

**Przebieg**

1. Wejście: Finanse → Sponsor **lub** Hub secondary „Sponsor”.
2. Karta: logo, nazwa, przychód bazowy (pasmo), cel + progress, CTA „Odbierz” gdy gotowe.
3. Odnowienie: pełnoekranowy beat międzysezonowy.
4. Branding w meczu: maksymalnie dyskretny (nie overlay na live).
5. UI Guide: bez neon sponsor splash.

**Decyzje gracza**

- Wejść w kartę / odebrać bonus.

**Zależności**

- UI Guide, §14.16, §23–25, §9.

**Pytania otwarte**

- Czy progress celu jest też w powiadomieniu (§22) przy 50%/100%?

---

### 15.14 MVP vs Future

**Cel**  
Ship vs rozbudowa.

**MVP — wchodzi**

- 1 sponsor bazowy
- Auto-przydział przy kreacji
- Umowa na 1 sezon
- 1 cel sezonowy (nie daily)
- Przychód bazowy + bonus za cel
- Soft miss (bez kary)
- Odnowienie z Accept / auto
- Brak zmiany mid-season

**MVP — nie wchodzi**

- Multi-sloty / marketplace
- Negocjacje wieloofertowe
- Kary za zerwanie
- Cele dzienne / weekly login
- Branding koszulek 3D detail
- Pay-to-upgrade sponsor

**Future**

1. Marketplace 2–3 ofert przy odnowieniu
2. Dodatkowe sloty (rękaw, board)
3. Cele dynamiczne mid-season
4. Kary / renegocjacje
5. Tie-in z §13 stadion hospitality

**Decyzje gracza**

- Odczuwa MVP.

**Zależności**

- §14.17, §13, §30, §27.

**Pytania otwarte**

- Priorytet Future: marketplace vs drugi slot?

---

### 15.15 Kontrakty produktowe §15

1. **MVP = dokładnie 1 sponsor bazowy.**
2. **Pozyskanie auto** (kreacja); odnowienie co sezon.
3. **1 cel sezonowy** — bez daily-login pressure.
4. **Miss = brak bonusu**, nie kara finansowa.
5. **Przychody → kasa (§14)**; kwoty → §26.
6. **Prestiż ligi/pucharu** wpływa na pasmo przy odnowieniu.
7. **Brak zmiany sponsora w trakcie sezonu.**
8. **Brak marketplace i multi-slotów w MVP.**
9. **Spójność z §10–§12:** cele oparte o naturalną grę, nie osobny grind.

---

### 15.16 Checklista §15

- [x] Filozofia, sponsor bazowy, pozyskanie, długość
- [x] Cele, nagrody, wyniki, prestiż
- [x] Relacja §14, rozwój klubu, odnowienie, zmiana
- [x] UX, MVP vs Future, kontrakty
- [ ] Pula nazw/brandów sponsorów
- [ ] Częstotliwość cyklu przychodu bazowego (sync §14)
- [ ] Auto-credit vs ekran odbioru bonusu
- [ ] Reveal: pakiet kreacji vs Hub

---

## 16. Akademia

**Cel**  
Zaplanować rozwój młodzieży.

**Opis**  
Generowanie talentów, promocja do seniorów.

**Do opracowania**

- [ ] Poziomy akademii
- [ ] Nabór / promowanie
- [ ] Jakość generowanych zawodników
- [ ] Koszty utrzymania
- [ ] Relacja z treningiem seniorów

---

## 17. Skauting

**Cel**  
Opisać odkrywanie zawodników na rynku / w regionach.

**Opis**  
Misje skautów, raporty, niepewność informacji.

**Do opracowania**

- [ ] Regiony / bazy danych
- [ ] Czas i koszt misji
- [ ] Jakość raportu vs rzeczywistość
- [ ] Limit skautów
- [ ] Shortlista

---

## 18. Ranking

**Cel**  
Zdefiniować rankingi graczy / klubów.

**Opis**  
Leaderboardy sezonowe i historyczne.

> **Kotwica SSOT:** Poziom klubu / Reputacja / Prestiż definiuje **§6**. Ranking **konsumuje** sygnały, nie redefiniuje metryk klubu (§6.15).

**Do opracowania**

- [ ] Metryki rankingu
- [ ] Sezon vs all-time
- [ ] Fair reset
- [ ] Widoczność (global / lokal)
- [ ] Anti-abuse

---

## 19. Osiągnięcia

**Cel**  
Zaplanować system achievementów.

**Opis**  
Nagrody za kamienie milowe — retencja i cele długie.

> **Kotwica SSOT:** Prestiż i historia klubu jako pojęcia → **§6**; osiągnięcia **wyrażają** kamienie, nie zastępują słownika metryk (§6.15).

**Do opracowania**

- [ ] Kategorie osiągnięć
- [ ] Nagrody
- [ ] Ukryte vs widoczne
- [ ] Progres UI
- [ ] Integracja z powiadomieniami

---

## 20. Zadania dzienne

**Status rozdziału:** GDD-15 — opracowany (**zadania dzienne MVP — lekki hak retencji**; opcjonalne względem meczu; bez liczb, kar, obowiązkowego loginu i pay-to-win)

**Cel rozdziału**  
Dać menedżerowi odpowiedź na: **„Co warto dziś zrobić?”** — jako lekki, uczciwy hak powrotu, który **nie** konkuruje z osią meczową i **nie** blokuje postępu sezonu.

**Zasady nadrzędne (decyzje GDD-15)**

1. Zadania odpowiadają na: **„Co warto dziś zrobić?”**
2. Zadania są **opcjonalne** i **nie blokują** postępu.
3. **Mecz pozostaje główną osią** gry (§3 / §9).
4. Hub prezentuje **dokładnie jeden główny cel dnia** (§23 warstwa 2).
5. W **dniu meczowym mecz zawsze ma wyższy priorytet** niż zadanie dnia.
6. Nagrody = **wyłącznie kategorie** z odwołaniami do §14 / §19 / §26 — **bez wartości liczbowych**.
7. **Brak kar** za opuszczenie dnia; **brak obowiązkowego logowania**.
8. **Brak pay-to-win** / pay-to-complete (§27).
9. Advanced streaks, wydarzenia sezonowe, personalizacja, zadania społecznościowe i pełny Quest Log = **Future**.
10. ZERO DUPLICATE: nie redefiniować Hubu (§23), kasy (§14), prestiżu (§6) ani achievementów (§19).

**Szybki kontrakt MVP (SSOT)**

| Parametr            | Wartość MVP                                       |
| ------------------- | ------------------------------------------------- |
| Pytanie nadrzędne   | „Co warto dziś zrobić?”                           |
| Obowiązkowość       | Opcjonalne                                        |
| Oś gry              | Mecz > zadanie                                    |
| Hub                 | Dokładnie **1** główny cel dnia                   |
| Dzień meczowy       | Primary = mecz / przygotowanie; zadanie ≠ Primary |
| Nagrody             | Kategorie → §14 / §19 / §26                       |
| Liczby / kwoty / XP | OUT                                               |
| Kary za skip        | Brak                                              |
| Obowiązkowy login   | Brak                                              |
| Pay-to-win          | Brak                                              |
| Quest Log / social  | Future                                            |

---

### 20.1 Filozofia zadań

**Cel**  
Ustawić ton: lekki bonus sprawczości, nie drugi tryb gry.

**Przebieg**

1. Zadanie dnia ma **zachęcać** do sensownej wizyty, nie wymuszać grindu.
2. Ukończenie daje satysfakcję i kategorię nagrody; brak ukończenia **nie** psuje sezonu.
3. Copy i UX mówią „warto”, nie „musisz”.
4. System wspiera sesję 5–15 min (§3), nie elonguje ją sztucznie.

**Decyzje gracza**

- Czy gonić cel dnia, czy skupić się tylko na meczu / wyjść.

**Zależności**

- §3.10, §23, UI Guide.

---

### 20.2 Relacja do meczu (mecz = oś)

**Cel**  
Zamrozić priorytet w konflikcie.

**Przebieg**

1. Kalendarz meczowy i ścieżka §9 są nadrzędne wobec zadań.
2. W dniu meczowym: Primary Hub = mecz / przygotowanie składu (§23.7).
3. Cel dnia może być **zsynchronizowany** z przygotowaniem (np. „sprawdź XI”) albo zejść do Secondary — **nigdy** nie odbiera Primary meczowi.
4. Zadanie typu „zagraj mecz” w dniu meczowym jest spójne z Primary, nie konkurencyjne.

**Zależności**

- §9, §10, §23.7.

---

### 20.3 Kontrakt dnia: jeden główny cel na Hubie

**Cel**  
Czytelność — jeden cel, nie lista questów.

**Przebieg**

1. Na Hubie widoczny jest **dokładnie jeden** główny cel dnia (warstwa 2 §23).
2. Brak MVP „quest board” z wieloma równorzędnymi celami.
3. Ukończenie zamienia slot w krótki feedback / następny sensowny stan (idle) — bez cascade nowych obowiązków.
4. Pełny Quest Log = Future.

**Zależności**

- §23.3–23.5, §23.9.

---

### 20.4 Typy jakościowe zadań

**Cel**  
Opisać rodzaje celów bez listy ID contentu i bez progów.

| Typ                       | Sens                      | Przykład jakościowy                       | Gdy naturalny           |
| ------------------------- | ------------------------- | ----------------------------------------- | ----------------------- |
| **Meczowy**               | Domknij oś sportową       | „Zagraj najbliższy mecz”                  | Dzień meczowy / kolejka |
| **Skład / przygotowanie** | Lekka decyzja menedżerska | „Sprawdź XI przed kolejką”                | Przed meczem            |
| **Hub / sprawa dnia**     | Mała sprawa poza boiskiem | „Przeczytaj 1 wiadomość / odbierz sprawę” | Idle / nowy klub        |
| **Sezonowy lekki**        | Ambicja bez grindu        | „Utrzymaj rytm kolejki” (kategoria)       | Tydzień ligowy          |

**Zasady**

1. Na dany dzień wybierany jest **jeden** główny typ (jakościowo).
2. Brak typów wymagających microtransaction.
3. Brak typów społecznościowych w MVP (Future).

---

### 20.5 Rotacja / odświeżanie (bez liczb)

**Cel**  
Opisać odczucie świeżości bez cron-spec i bez kwot.

**Przebieg**

1. Cel dnia jest związany z **kontekstem kalendarza** (mecz / idle / onboarding), nie z losowym grindem.
2. Odświeżenie następuje naturalnie wraz z dniem / kolejką — bez presji „straciłeś postęp sezonu”.
3. Brak twardego countdown FOMO w MVP (patrz §20.7).
4. Szczegóły timerów / cron → implementacja później; tu tylko zasada produktowa.

**Zależności**

- §10, §23.

---

### 20.6 Nagrody jako kategorie

**Cel**  
Nagrodzić bez arkusza liczb.

**Przebieg**

1. Nagrody opisujemy **kategoriami** (np. środki / prestiż lekki / odblokowanie / achievement hook).
2. Zasoby i kasa → reguły w **§14**; kwoty → **§26**.
3. Kamienie / achievement → **§19** (gdy wypełnione); Prestige jako pojęcie → **§6**.
4. §20 **nie** wprowadza osobnej waluty zadań ani XP bar.

**Zależności**

- §14, §19, §26, §6.

---

### 20.7 FOMO policy (soft)

**Cel**  
Retencja bez dark patterns.

**Przebieg**

1. **Brak kar** za opuszczenie dnia (reputacja/sezon/skład nie cierpią „za nieobecność w zadaniu”).
2. **Brak obowiązkowego logowania** — gra działa, gdy wracasz na mecz.
3. Zachęta = bonus kategorii / poczucie sprawczości, nie strata.
4. Powiadomienia o celach — tylko w ramach §22 (opt-in); §20 nie projektuje push spam.
5. Quiet / soft landing zgodny z §3.10.

**Zależności**

- §3.10, §22, §27.

---

### 20.8 Streaki — MVP lekki vs Future

**Cel**  
Oddzielić prostą ciągłość od advanced meta.

**Przebieg**

1. **MVP:** najwyżej lekki sygnał ciągłości (flavor / soft), bez brutalnej kary za zerwanie (§3.10).
2. **Future:** advanced streaks, mnożniki, eventy sezonowe zadań, personalizacja puli.
3. Streak nie może stać się pay-to-recover (§27).

---

### 20.9 Integracja z Hub (§23)

**Cel**  
Spiąć cel dnia z ekranem decyzji — bez redefinicji Hubu.

**Przebieg**

| Stan Hub (§23)    | Rola celu dnia                                               |
| ----------------- | ------------------------------------------------------------ |
| **Nowy klub**     | Może być pierwszą instancją celu (spójnie z §5.11)           |
| **Dzień meczowy** | Mecz = Primary; cel dnia ≤ Secondary lub zsynchronizowany    |
| **Po meczu**      | Soft complete możliwy; Primary = następna sprawa / idle      |
| **Idle**          | Cel dnia często kandydat na Primary (gdy brak pilnego meczu) |

1. Hub nadal: **1 Primary / ≤5 Secondary**.
2. §20 dostarcza treść warstwy 2; §23 dostarcza hierarchię i limity CTA.
3. Zakaz osobnego dashboardu questów w MVP.

**Zależności**

- §23 (SSOT Hub).

---

### 20.10 Relacja z §3 / §5

**Cel**  
Spójność pętli i onboardingu.

**Przebieg**

1. §3.10: zadanie dzienne = lekki bonus za wizytę, opcjonalne względem meczu — ten rozdział to doprecyzowuje.
2. §5.11: pierwsze zadanie / cel startowy może być instancją §20, nie osobnym SSOT.
3. Progressive disclosure: D1 nie zarzuca listą questów.

**Zależności**

- §3, §5.10–5.11.

---

### 20.11 Relacja z §9

**Cel**  
Typ meczowy bez dublowania flow meczu.

**Przebieg**

1. „Zagraj mecz” prowadzi do istniejącej ścieżki Przedmecz → Live → Raport → Hub.
2. §20 nie zmienia sterowania meczem ani Post Match.
3. Po meczu cel może się domknąć automatycznie, jeśli był typu meczowego.

**Zależności**

- §9.12–9.15.

---

### 20.12 Relacja z §14 / §19 / §26

**Cel**  
Nagrody bez drugiego ekonomicznego SSOT.

**Przebieg**

1. Kategorie środków → §14.
2. Achievement / kamień → §19.
3. Liczby i balance → §26 (Future względem tego rozdziału).
4. §20 tylko wskazuje **kategorię** i moment odczucia nagrody.

---

### 20.13 Fair-play / Premium (§27)

**Cel**  
Granica monetyzacji.

**Przebieg**

1. Premium nie sprzedaje ukończenia zadań ani wyniku meczu.
2. Ewentualna Future wygoda (np. reminder) nie omija fair-play.
3. Do wypełnienia §27 obowiązuje ta kotwica.

---

### 20.14 MVP vs Future

**MVP — wchodzi**

- Pytanie „co warto dziś?”
- Opcjonalność; mecz = oś
- Jeden główny cel dnia na Hubie
- Priorytet meczu w dniu meczowym
- Typy jakościowe (mecz / skład / hub / lekki sezonowy)
- Soft FOMO; brak kar / obowiązkowego loginu / P2W
- Nagrody = kategorie (§14 / §19 / §26)
- Lekki sygnał ciągłości (bez advanced streaks)

**MVP — nie wchodzi**

- Liczby, kwoty, XP bary
- Kary za skip
- Pay-to-complete
- Advanced streaks / mnożniki
- Wydarzenia sezonowe zadań
- Personalizacja puli
- Zadania społecznościowe
- Pełny Quest Log / multi-quest board

**Future**

1. Advanced streaks i eventy
2. Personalizacja zadań
3. Social / club challenges
4. Quest Log
5. Głębsza integracja §21–§22 po ich wypełnieniu
6. Balance liczb (§26)

---

### 20.15 Kontrakty produktowe §20

1. Zadania odpowiadają: **„Co warto dziś zrobić?”**
2. Są **opcjonalne** i nie blokują postępu.
3. **Mecz > zadanie**; w dniu meczowym mecz ma wyższy priorytet.
4. Hub pokazuje **dokładnie jeden** główny cel dnia.
5. Nagrody = **kategorie** (§14 / §19 / §26) — bez liczb w §20.
6. **Brak kar**, **brak obowiązkowego loginu**, **brak pay-to-win**.
7. Advanced streaks / eventy / personalizacja / social / Quest Log = **Future**.
8. Hub hierarchy i limity CTA pozostają w **§23**.

---

### 20.16 Checklista §20

- [x] Filozofia i relacja do meczu
- [x] Jeden główny cel dnia na Hubie
- [x] Priorytet meczu w dniu meczowym
- [x] Typy jakościowe
- [x] Soft FOMO / brak kar / brak obowiązkowego loginu
- [x] Nagrody = kategorie (§14 / §19 / §26)
- [x] Integracja §23 / §3 / §5 / §9
- [x] MVP vs Future + kontrakty
- [ ] Copy puli celów po playtestach
- [ ] Sync §21–§22 po ich wypełnieniu
- [ ] Liczby nagród (§26) — Future

---

## 21. Wiadomości

**Cel**  
Opisać inbox narracyjny i systemowy.

**Opis**  
Wiadomości od zarządu, mediów, agentów, systemu — limitowane, nie spam.

> **Kotwica:** cel dnia / habit loop = **§20**. Wiadomość może wskazywać cel; nie redefiniuje systemu zadań.

**Do opracowania**

- [ ] Typy wiadomości
- [ ] Priorytety / limit / rotacja
- [ ] Archiwum
- [ ] Akcje z wiadomości (CTA)
- [ ] Relacja z §20 (wskazanie celu) i §22
- [ ] Generowanie treści (szablony)

---

## 22. Powiadomienia

**Cel**  
Zdefiniować alerty in-app / push (wysoki poziom).

**Opis**  
Co i kiedy powiadamiamy, by nie spamować.

> **Kotwica:** zadania dzienne = **§20** (soft FOMO, brak obowiązkowego loginu). Push nie może karać za nieobecność.

**Do opracowania**

- [ ] Kanały (in-app, email, push)
- [ ] Kategorie i opt-in
- [ ] Quiet hours
- [ ] Deduplikacja
- [ ] Powiązanie z meczami / transferami

---

## 23. Panel główny

**Status rozdziału:** GDD-14 — opracowany (**Hub MVP — ekran decyzji**; bez kodu, dashboardu analitycznego, konfigurowalnych widgetów i rozszerzonych statystyk)

**Cel rozdziału**  
Dać menedżerowi po zalogowaniu / powrocie **jeden ekran home**, który w kilka sekund odpowiada: **„Co jako menedżer powinienem zrobić teraz?”** — spójnie z hub-first (§3), meczowym centrum (§9) i tożsamością klubu (UI Guide / §6).

**Zasady nadrzędne (decyzje GDD-14)**

1. Hub jest ekranem **decyzji**, nie dashboardem analitycznym.
2. Pytanie nadrzędne: **„Co jako menedżer powinienem zrobić teraz?”**
3. **Dokładnie 1 Primary CTA**; **maksymalnie 5 Secondary CTA**.
4. Hierarchia informacji (kolejność Ownera): mecz/wydarzenie → zadanie dnia → status klubu (§6) → skróty → pomocnicze.
5. Stany jakościowe: **nowy klub · dzień meczowy · po meczu · idle**.
6. §23 **wyłącznie konsumuje** Poziom klubu / Reputację / Prestiż z **§6** — bez redefinicji.
7. Personalizacja, konfigurowalne widgety, rozszerzone statystyki i wielokolumnowe dashboardy = **Future**.
8. Detale komponentów / tokeny / pełna IA → **UI Guide** i **§24** (odesłania; ZERO DUPLICATE).
9. Klub first — tożsamość klubu nad meta-UI (UI Guide).
10. Bez SaaS-clutter, glow i wall of cards (UI Guide §2.1).

**Szybki kontrakt MVP (SSOT)**

| Parametr          | Wartość MVP                                     |
| ----------------- | ----------------------------------------------- |
| Charakter         | Ekran decyzji (nie analytics dashboard)         |
| Pytanie nadrzędne | „Co powinienem zrobić teraz?”                   |
| Primary CTA       | **Dokładnie 1**                                 |
| Secondary CTA     | **Maksymalnie 5**                               |
| Hierarchia        | 5 warstw (poniżej)                              |
| Stany             | nowy klub / dzień meczowy / po meczu / idle     |
| Status klubu      | Sygnały z §6 (konsumpcja)                       |
| Personalizacja UI | Future                                          |
| Widgety konfig.   | Future                                          |
| Extended stats    | Future                                          |
| Kod / wireframe   | OUT tego rozdziału (produkt, nie implementacja) |

---

### 23.1 Filozofia Hub (decyzja, nie dashboard)

**Cel**  
Ustawić ton: Hub = centrum sprawczości, nie centrum danych.

**Przebieg**

1. Gracz ma w kilka sekund wiedzieć, **gdzie jest** i **jaką jedną decyzję** może podjąć teraz.
2. Hub nie konkuruje z raportem meczu, tabelą ligową ani ekranem finansów o „głębię spreadsheetu”.
3. Informacje wspierają decyzję; nie są celem samym w sobie.
4. Sesja 5–15 min (§3) startuje i często kończy się sensownie z Huba.

**Decyzje gracza**

- Wykonać Primary CTA vs zejść w Secondary (opcjonalne pogłębienie).

**Zależności**

- §3.11, UI Guide §1–§2.

---

### 23.2 Pytanie nadrzędne

**Cel**  
Zamrozić misję ekranu.

**Przebieg**

1. Każdy wariant Hubu musi dać odpowiedź na: **„Co jako menedżer powinienem zrobić teraz?”**
2. Jeśli Primary CTA tego nie komunikuje — układ jest zły (reguła produktowa).
3. Copy i hierarchia służą temu pytaniu, nie „pokazaniu wszystkiego, co mamy”.

**Zależności**

- §3 hub-first.

---

### 23.3 Hierarchia informacji

**Cel**  
Ustalić kolejność skanowania oczu i priorytet treści.

| #   | Warstwa                          | Rola                                                           |
| --- | -------------------------------- | -------------------------------------------------------------- |
| 1   | **Najbliższy mecz / wydarzenie** | Kontekst czasu: kiedy, z kim, liga/puchar                      |
| 2   | **Najważniejsze zadanie dnia**   | Jedna sprawa do domknięcia (skład, odbiór, decyzja)            |
| 3   | **Status klubu**                 | Sygnały Poziom · Reputacja · Prestiż (**definicje → §6**)      |
| 4   | **Skróty do głównych modułów**   | Wejścia kontekstowe (nie pełne menu aplikacji)                 |
| 5   | **Informacje pomocnicze**        | Flavor, skrót ostatniego wyniku, 1 linia wiadomości — najniżej |

**Zasady**

1. Primary CTA wyrasta z warstw **1–2**.
2. Secondary CTA żyją głównie w warstwie **4** (ew. jedna akcja z warstwy 2, jeśli nie jest Primary).
3. Warstwa 5 nigdy nie staje się Primary.
4. Brak wielokolumnowego „command center” w MVP.

---

### 23.4 Primary CTA (dokładnie 1)

**Cel**  
Jedna dominująca akcja na ekranie.

**Przebieg**

1. Na Hubie jest **zawsze dokładnie jeden** Primary CTA.
2. Primary zmienia się ze **stanem** (§23.6–23.9), nie z kaprysem widgetów.
3. Primary jest wizualnie i copy’owo nadrzędny wobec Secondary.
4. Zakaz dwóch równorzędnych „głównych” przycisków.

**Przykłady jakościowe (nie lista ID)**

| Stan          | Typowy Primary                                                   |
| ------------- | ---------------------------------------------------------------- |
| Nowy klub     | Pierwszy mecz / Ustaw skład                                      |
| Dzień meczowy | Idź do meczu / Przygotuj skład                                   |
| Po meczu      | Kontynuuj (następna sprawa) / Zobacz raport (jeśli niedomknięty) |
| Idle          | Najbliższy sensowny cel (kolejka / zadanie / sprawa)             |

**Zależności**

- §3, §5.10–5.11, §9.15, §10.

---

### 23.5 Secondary CTA (maksymalnie 5)

**Cel**  
Dać szybkie wejścia bez rozmywania Primary.

**Przebieg**

1. Łącznie **≤ 5** Secondary na danym stanie Hubu.
2. Secondary = skróty / sprawy wspierające, nie drugi Primary.
3. Preferowane cele: skład, liga/terminarz, transfery (gdy odblokowane), finanse, trening / wiadomość — **wybór kontekstowy stanu**, nie zawsze te same pięć.
4. Jeśli sprawa jest krytyczna „dziś”, może awansować do Primary zamiast dublować się jako Secondary.

**Zależności**

- §7–§8, §10–§15, §21.

---

### 23.6 Stan: nowy klub

**Cel**  
Domknąć onboarding na Hubie bez overwhelm.

**Przebieg**

1. Wejście po §5: wariant Hubu „nowy klub”.
2. Warstwa 1–2: pierwszy mecz / ustawienie składu jako dominanta.
3. Primary: **Pierwszy mecz** lub **Ustaw skład** (dokładnie jeden).
4. Secondary (≤5): np. podgląd składu, terminarz, krótka wiadomość powitalna, (opcjonalnie) zadanie startowe — bez pełnego rynku/finansów na siłę.
5. Status §6: startowy, czytelny, bez „pustego spreadsheetu”.
6. Unikać: wall of unlocków, dashboardu ekonomii, multi-CTA hero.

**Decyzje gracza**

- Iść w pierwszy mecz vs lekko poprawić skład.

**Zależności**

- §5.10–5.11, §3.1–3.2.

---

### 23.7 Stan: dzień meczowy

**Cel**  
Skupić dzień na meczu.

**Przebieg**

1. Warstwa 1 dominuje: najbliższy mecz (liga/puchar) z jasnym czasem/kontekstem.
2. Primary zwykle: **Idź do meczu** / **Przygotuj skład** (gdy skład wymaga uwagi).
3. Zadanie dnia (warstwa 2) nie konkuruje z Primary, chyba że jest warunkiem wejścia (np. „ustaw XI”).
4. Secondary (≤5): skład, taktyka lekka, terminarz, (ew.) wiadomość — **nie** Primary na transfer w dzień meczu bez silnego powodu produktowego.
5. Status §6 pozostaje widoczny, ale nie odbiera hierarchii meczowi.

**Decyzje gracza**

- Grać / przygotować się vs odłożyć pogłębienie na po meczu.

**Zależności**

- §9, §10–§11, §7.

---

### 23.8 Stan: po meczu

**Cel**  
Domknąć emocję wyniku i wskazać **jedną** kolejną sprawę.

**Przebieg**

1. Krótki sygnał ostatniego wyniku (warstwa 5 lub pasek przy Primary) — bez pełnego raportu na Hubie.
2. Primary: **Kontynuuj** (następna sprawa) / domknięcie raportu, jeśli niedokończony (§9.12–9.15).
3. Możliwy 1 toast odblokowania — nie lista systemów.
4. Secondary (≤5): raport (jeśli domknięty), tabela, skład, finanse skrót, wiadomość.
5. Status §6 może pokazać lekki impuls instytucjonalny (kategorie) — bez breakdownu XP.

**Decyzje gracza**

- Zakończyć sesję vs iść w kolejną sprawę.

**Zależności**

- §9.12–9.15, §3.6, §6.16.

---

### 23.9 Stan: idle

**Cel**  
Dzień bez natychmiastowego meczu nadal ma **jedną** sensowną decyzję.

**Przebieg**

1. Warstwa 1: najbliższe wydarzenie w kalendarzu (nawet jeśli „jutro / w kolejce”).
2. Primary: najbliższy sensowny cel (przygotowanie kolejki, zadanie, sprawa wiadomości) — **jeden**.
3. Unikać FOMO wall i daily-grind jako jedynego sensu Hubu (**szczegół zadań → §20**).
4. Secondary (≤5): liga, skład, transfery/finanse (gdy odblokowane), trening, wiadomości.
5. Soft landing: idle nie karze gracza pustką ani spamem.

**Decyzje gracza**

- Zrobić jedną sprawę vs wyjść i wrócić na mecz.

**Zależności**

- §3.6–3.7, §10, §20–§22 (szkielet / odesłania).

---

### 23.10 Status klubu na Hubie (konsumpcja §6)

**Cel**  
Pokazać tożsamość instytucji bez drugiego słownika metryk.

**Przebieg**

1. Warstwa 3 pokazuje sygnały: **Poziom klubu · Reputacja · Prestiż**.
2. **Definicje SSOT → wyłącznie §6.2**; Hub nie tworzy synonimów ani wzorów.
3. Forma prezentacji MVP: pasma / etykiety / krótki status — nie tabela XP.
4. Decyzja produktowa (domknięcie open Q z §6.19): sygnały §6 są **widoczne na Hubie** w skrócie; detal może iść na kartę klubu (Future/UI).
5. Status wspiera decyzję (kontekst), nie zastępuje Primary CTA.

**Zależności**

- §6.2–6.6, §6.16.

---

### 23.11 Skróty do modułów (§7–§15)

**Cel**  
Warstwa 4 jako wejścia, nie launcher całej gry.

**Przebieg**

1. Skróty odpowiadają Secondary CTA (budżet ≤5 łącznie z innymi Secondary).
2. Typowe cele: skład (§7), trening (§8), liga (§10), puchar (§11), transfery (§12), finanse (§14), stadion (§13) — **wybór pod stan**.
3. Nie pokazywać wszystkich modułów naraz, jeśli łamie limit Secondary lub hierarchię.
4. Nawigacja globalna (left nav itd.) — szczegół §24 / UI Guide; Hub nie dubluje pełnego menu jako Primary content.

**Zależności**

- §7–§15, §24.

---

### 23.12 Informacje pomocnicze

**Cel**  
Warstwa 5 bez przejęcia uwagi.

**Przebieg**

1. Dozwolone: skrót ostatniego wyniku, 1 linia wiadomości, lekki flavor sezonu.
2. Zakaz w MVP: wykresy, heatmapy, multi-stat tiles, feed aktywności jak social dashboard.
3. Pomocnicze nigdy nie generują drugiego Primary.

**Zależności**

- §9.15, §21, UI Guide.

---

### 23.13 Relacja z §3 (hub-first / core loop)

**Cel**  
Zrealizować kontrakty pętli.

**Przebieg**

1. §3.11: każdy powrót ląduje na Hubie z **jednym** głównym CTA — ten rozdział to doprecyzowuje.
2. Mecz w centrum: Primary w dniu meczowym prowadzi do przygotowania/meczu.
3. Progressive disclosure: Hub odsłania sprawy wraz z pętlą, nie wall of systems w D1.

**Zależności**

- §3.0–3.11.

---

### 23.14 Relacja z §9–§15

**Cel**  
Spiąć Hub z rozgrywkami i gospodarką bez duplikacji reguł.

**Przebieg**

1. §9: wejście do meczu i powrót z raportu → stany dzień meczowy / po meczu.
2. §10–§11: źródło „najbliższego wydarzenia”.
3. §12–§15: Secondary / kontekst — reguły rynku i kasy zostają w swoich rozdziałach.
4. Hub nie redefiniuje formatu ligi, envelope ani sponsora.

**Zależności**

- §9–§15.

---

### 23.15 Relacja z §24 / UI Guide

**Cel**  
Utrzymać granicę zakresu.

**Przebieg**

1. §23 = **co Hub komunikuje i jakie decyzje oferuje**.
2. UI Guide = wygląd i zachowanie UI (SSOT wizualny).
3. §24 = mapa ekranów / wzorce IA — Future względem pełnego wypełnienia; Hub tylko kotwiczy home.
4. Zakaz kopiowania guide do GDD i zakaz projektowania tokenów tutaj.

**Zależności**

- UI Guide, §24–§25 (szkielet).

---

### 23.16 MVP vs Future

**Cel**  
Freeze zakresu.

**MVP — wchodzi**

- Pytanie nadrzędne + filozofia decyzji
- Dokładnie 1 Primary CTA
- Maksymalnie 5 Secondary CTA
- Hierarchia 5 warstw
- Stany: nowy klub / dzień meczowy / po meczu / idle
- Status klubu jako konsumpcja §6
- Skróty kontekstowe + informacje pomocnicze lekkie
- Odesłania do §3 / §6 / §9–§15 / UI Guide

**MVP — nie wchodzi**

- Personalizacja layoutu
- Konfigurowalne widgety
- Rozszerzone statystyki / wykresy
- Wielokolumnowe dashboardy
- App-launcher zamiast decyzji
- Redefinicje metryk §6
- Specyfikacja implementacji React/kodu

**Future (kierunek poza MVP)**

1. Konfigurowalne widgety i personalizacja
2. Bogatsze sygnały sezonowe / historia na Hubie
3. Głębsza integracja §20–§22 (zadania, wiadomości, powiadomienia) po ich wypełnieniu
4. Warianty Hubu po awansie / pucharze (flavor, nie cheat)
5. Pełna mapa IA w §24 spięta z Hubem

---

### 23.17 Kontrakty produktowe §23

1. Hub odpowiada: **„Co powinienem zrobić teraz?”**
2. Hub = **decyzja**, nie dashboard analityczny.
3. **Dokładnie 1** Primary CTA; **≤ 5** Secondary CTA.
4. Hierarchia: mecz/wydarzenie → zadanie dnia → status §6 → skróty → pomocnicze.
5. Stany MVP: nowy klub / dzień meczowy / po meczu / idle.
6. Metryki klubu: **tylko konsumpcja §6**.
7. Personalizacja / widgety / extended stats / multi-column dashboards = **Future**.
8. §24 / UI Guide = wygląd i IA; §23 nie dubluje ich SSOT.
9. Hub-first z §3 pozostaje wiążący.

---

### 23.18 Checklista §23

- [x] Filozofia decyzji (nie dashboard)
- [x] Pytanie nadrzędne
- [x] Hierarchia 5 warstw
- [x] Primary = 1; Secondary ≤ 5
- [x] Stany: nowy klub / dzień meczowy / po meczu / idle
- [x] Status klubu = konsumpcja §6
- [x] Skróty i informacje pomocnicze
- [x] Relacje §3 / §9–§15 / §24 / UI Guide
- [x] MVP vs Future + kontrakty
- [ ] Copy Primary per stan po playtestach UX
- [x] Sync z §20 (zadania dzienne) — GDD-15
- [ ] Sync z §21–§22 po ich wypełnieniu
- [ ] Decyzja detalu karty klubu vs Hub dla pełnego §6 (UI)

---

## 24. Interfejs użytkownika

**Cel**  
Ustalić zasady UX całej gry.

**Opis**  
Szczegóły wizualne i komponentowe → `UI_DESIGN_GUIDE.md`. Tu: zakres ekranów i flow.

> **Kotwica:** ekran home / Hub (decyzja, 1 Primary CTA, stany) = **§23**. Ten rozdział nie redefiniuje Hubu.

**Do opracowania**

- [ ] Mapa ekranów (IA)
- [ ] Nawigacja główna
- [ ] Wzorce list / detali / modalów
- [ ] Responsywność
- [ ] Dostępność (a11y) — cele

---

## 25. Styl graficzny

**Cel**  
Zdefiniować kierunek art direction.

**Opis**  
Profesjonalny menedżer piłkarski — nie „AI dashboard”. Detale tokenów → UI Guide.

**Do opracowania**

- [ ] Moodboard / referencje
- [ ] Paleta i typografia (produkcja)
- [ ] Herb / branding klubu gracza
- [ ] Ilustracje vs UI czyste
- [ ] Motion policy (oszczędny)

---

## 26. System ekonomii

**Cel**  
Zaprojektować zrównoważoną ekonomię gry.

**Opis**  
Źródła i ujścia walut, inflacja, sinki — bez liczb na tym etapie.

**Do opracowania**

- [ ] Waluty (soft / hard)
- [ ] Źródła i sinki
- [ ] Sezonowe dostosowania
- [ ] Relacja do Premium
- [ ] Symulacje balansu (metoda)

---

## 27. Premium

**Cel**  
Określić monetyzację fair wobec core loop.

**Opis**  
Cosmetics, wygoda, boosty — bez pay-to-win jako default.

**Do opracowania**

- [ ] Co jest / nie jest płatne
- [ ] Battle pass / subskrypcja?
- [ ] Etyka P2W
- [ ] Lokalizacja cen
- [ ] Zwroty / regulacje sklepów

---

## 28. Bezpieczeństwo

**Cel**  
Wymagania bezpieczeństwa produktu i fair play.

**Opis**  
Konta, oszustwa, dane — uzupełnienie docs/SECURITY.md o warstwę produktową.

**Do opracowania**

- [ ] Abuse / multi-accounting
- [ ] Cheating w meczach / replay
- [ ] Moderacja social
- [ ] Ochrona danych gracza
- [ ] Rate limits UX

---

## 29. Multiplayer

**Cel**  
Zdefiniować formy rywalizacji między graczami.

**Opis**  
Liga live, wyzwania, asynchroniczne mecze — bez protokołu sieciowego.

**Do opracowania**

- [ ] Modele MP (async / sync)
- [ ] Matchmaking
- [ ] Determinizm LFE a sync
- [ ] Fairness / disconnect
- [ ] Social (znajomi, kluby)

---

## 30. Roadmapa rozwoju

**Cel**  
Ułożyć kolejność domykania GDD i EPIC-ów gameplay.

**Opis**  
Plan faz dokumentacji i implementacji — żywy dokument.

**Do opracowania**

- [ ] Kolejność rozdziałów do wypełnienia (priorytet)
- [ ] Mapowanie GDD → EPIC LFE / app
- [ ] MVP feature cut
- [ ] Kamienie milowe content
- [ ] Metryki go/no-go

---

## Historia dokumentu

| Wersja       | Data       | Zmiana                                                       |
| ------------ | ---------- | ------------------------------------------------------------ |
| 0.1.0-gdd01  | 2026-07-23 | Szkielet 30 rozdziałów (GDD-01)                              |
| 0.2.0-gdd02  | 2026-07-23 | §3 Główna pętla rozgrywki — pełne opracowanie (GDD-02)       |
| 0.3.0-gdd03  | 2026-07-23 | §4 Rejestracja + §5 Tworzenie klubu (GDD-03)                 |
| 0.4.0-gdd04  | 2026-07-23 | §9 Mecze — doświadczenie meczu (GDD-04)                      |
| 0.5.0-gdd05  | 2026-07-23 | §10 Liga — rozgrywki i kalendarz (GDD-05)                    |
| 0.6.0-gdd06  | 2026-07-23 | §7 Rozwój zawodników (GDD-06)                                |
| 0.6.1-dcc    | 2026-07-23 | DCC: §9.2/§9.14/§10.15 spójność z GDD-06 (bez zmian decyzji) |
| 0.7.0-gdd07  | 2026-07-23 | §8 Trening — system treningowy (GDD-07)                      |
| 0.7.1-dcc    | 2026-07-23 | DCC: unlock treningu + §7.13 (bez zmian decyzji)             |
| 0.8.0-gdd08  | 2026-07-23 | §11 Puchary — Puchar Krajowy MVP (GDD-08)                    |
| 0.9.0-gdd09  | 2026-07-23 | §12 Transfery — rynek MVP (GDD-09)                           |
| 0.9.1-dcc    | 2026-07-23 | DCC: kontroferta SSOT w §12 (bez zmian decyzji)              |
| 0.10.0-gdd10 | 2026-07-23 | §14 Finanse — kategorie i envelope (GDD-10)                  |
| 0.11.0-gdd11 | 2026-07-23 | §15 Sponsorzy — sponsor bazowy MVP (GDD-11)                  |
| 0.12.0-gdd12 | 2026-07-23 | §13 Stadion — obiekt statyczny MVP (GDD-12)                  |

---

## Powiązane dokumenty

- [UI_DESIGN_GUIDE.md](./UI_DESIGN_GUIDE.md) — zasady UI/UX
- `docs/lfe/` — dokumentacja silnika (nie zastępuje GDD)
- `docs/architecture/foundation.md` — fundament techniczny
