# GDD-SEASON-END-01 — Season End Thin (kontrakt produktowy)

**Produkt:** Last Football  
**EPIC:** GDD-SEASON-END-01  
**Status:** CLOSED — kontrakt Thin (docs only) · D68–D77  
**SSOT Thin:** ten plik  
**Pointer w GDD:** [`GAME_DESIGN_DOCUMENT.md`](./GAME_DESIGN_DOCUMENT.md) §10.12 · §10.13 · **§10.20**  
**Kod / migracje / UI:** **zakaz** do czasu osobnego Owner GO na `LFE-SEASON-END-01` (D74 · D76)

> **Cel:** Domknąć łuk produktowy **K22 → uznanie → przerwa → Sezon N+1** bez awansu/spadku, bez systemów ekonomii i bez implementacji.  
> Ten dokument **nie** jest PLAN-em kodu i **nie** definiuje API / RPC / schematu DB.

---

## 1. Status i checklista

|                         |                                                               |
| ----------------------- | ------------------------------------------------------------- |
| Typ                     | Kontrakt GDD Thin (dokumentacyjny)                            |
| Kalendarz wejściowy     | 22 kolejki (GDD §10 · D28) — fakt założony, nie redefiniowany |
| Awans / spadek          | **OUT** Thin (D73)                                            |
| Implementacja lifecycle | **OUT** tego EPICu (D74 · D76)                                |

**Checklisty kontraktu**

- [x] IN / OUT
- [x] Invariants (D68–D76)
- [x] Trigger
- [x] Pipeline zdarzeń
- [x] Raport sezonu
- [x] Offseason + CTA
- [x] Co zostaje / co zaczyna nowy sezon (AC-8)
- [x] Hooki (AC-9)
- [x] Acceptance Criteria
- [x] Mapa EPIC follow-up

---

## 2. Decyzje Ownera (sedno)

| ID      | Nazwa                                     | Sedno (1 linia)                                                                 |
| ------- | ----------------------------------------- | ------------------------------------------------------------------------------- |
| **D68** | Lifecycle Before Systems                  | Najpierw domknięcie cyklu sezonu; potem systemy (Sponsors / Board / …).         |
| **D69** | Season End Is An Event Pipeline           | Season End = uporządkowany ciąg zdarzeń, nie pojedynczy ekran z side-effectami. |
| **D70** | Trigger Owns Lifecycle                    | Tylko spełniony trigger startuje pipeline; brak „ręcznego zamknięcia” bez SSOT. |
| **D71** | Report Before Consequences                | Raport / uznanie **przed** konsekwencjami i podłączeniem hooków.                |
| **D72** | Hooks Before Features                     | Hook = punkt rozszerzenia; nie specyfikacja featura.                            |
| **D73** | Promotion Is Not Part Of Season End Thin  | Thin **nie** zmienia szczebla ligowego (brak awansu/spadku).                    |
| **D74** | Documentation Before Lifecycle            | Brak kodu lifecycle bez zamkniętego kontraktu GDD.                              |
| **D75** | Lifecycle Is Deterministic                | Ten sam stan wejściowy → ten sam przebieg pipeline (zero RNG zamknięcia).       |
| **D76** | Contract Before Code                      | Kontrakt produktowy przed jakimkolwiek PLAN/IMPLEMENT kodu.                     |
| **D77** | GDD-SEASON-END-01 Is Season End Thin SSOT | SSOT Thin = ten plik; §10.12 / §10.13 / §10.20 = pointer.                       |

Pełny rejestr: [`../DECISIONS.md`](../DECISIONS.md) (D68–D77 CLOSED).

---

## 3. Filozofia Thin

1. Sezon **musi mieć koniec** odczuwalny dla gracza (§3.5 · §10.12) — nie „idle po ostatnim meczu”.
2. Thin domyka **ciągłość klubu**: tożsamość i pamięć zostają; stawka ligowa odświeża się w **tej samej lidze**.
3. Uznanie (raport) jest Information Thin: porządkuje fakty sezonu — **nie** nagradza ekonomią i **nie** promuje klubu.
4. Systemy zależne (sponsorzy, zarząd, wiek, okno transferów) podłączają się **wyłącznie** przez nazwane hooki — osobne Owner GO.
5. Awans/spadek to **osobny** kontrakt / EPIC po Lifecycle Thin (D73).

---

## 4. IN / OUT

### 4.1 IN (Season End Thin)

- Trigger deterministyczny: **22/22** meczów ligowych klubu gracza ze statusem zakończonym (`played`).
- Fakt **Season Closed** (jedno zamknięcie na dany przebieg 22 MD).
- **Raport sezonu** (Information Thin).
- Wejście w **przerwę międzysezonową** (produktowo: faza Offseason).
- **Jedno** Primary CTA przerwy (Hub decision-first — §23).
- Start **Season N+1** po potwierdzeniu gracza: nowy kalendarz 22 · reset tabeli · **ta sama liga**.
- Opis **co zostaje / co się resetuje** (AC-8).
- **Hooki** jako moment + Owner EPIC + cel (AC-9).
- Idempotencja i determinizm lifecycle (D75).

### 4.2 OUT (jawny zakaz w Thin)

- Awans, spadek, baraże, zmiana szczebla ligowego (D73).
- Sponsors / Board / Stadium jako featura lub odnowienie §15.11.
- Automatyczne `age++` jako reguła zaimplementowana.
- Timer realny 1–3 dni jako wymóg Thin (Future; Thin = **player-paced** skip).
- Puchar / PLAYOFF w przerwie.
- Pełna rotacja AI lig / uzupełnianie piramidy po awansach innych klubów.
- Liczby ekonomii, silnik prestiżu §6, XP, Achievement Score.
- Kod, migracje, resolvery, UI, soft-lock, PLAN implementacji.
- Drugi terminarz poza SSOT §10 / D28.
- Fake Production w raporcie lub przerwie (D40 · D52).

---

## 5. Invariants

| ID  | Invariant                                                                             |
| --- | ------------------------------------------------------------------------------------- |
| I1  | Lifecycle przed systemami (D68).                                                      |
| I2  | Season End = pipeline zdarzeń w stałej kolejności (D69).                              |
| I3  | Tylko trigger uruchamia pipeline (D70).                                               |
| I4  | Raport przed konsekwencjami i przed efektami hooków (D71).                            |
| I5  | Hook ≠ feature (D72).                                                                 |
| I6  | Brak promotion/relegation w Thin (D73).                                               |
| I7  | Docs przed kodem lifecycle (D74 · D76).                                               |
| I8  | Determinizm: brak RNG w zamknięciu / kategorii raportu (D75).                         |
| I9  | SSOT kalendarza = liga §10 (22 fixtures); ten kontrakt go nie zastępuje.              |
| I10 | Wynik sezonu w raporcie = derive z tabeli ligowej sezonu (bez osobnego standings DB). |
| I11 | Jedno Season Closed na przebieg 22 MD (idempotencja).                                 |
| I12 | Offseason: **brak** nowych meczów ligowych.                                           |
| I13 | Season N+1 Thin startuje w **tej samej** lidze co zamknięty sezon.                    |

---

## 6. Trigger (D70 · D75)

**Warunek (jedyny):**  
Klub gracza ma **dokładnie 22** zaplanowane mecze ligowe sezonu bieżącego **i wszystkie** mają status zakończony (rozegrane).

**Własność:** Trigger **właścicielem** startu lifecycle — UI / gracz / admin **nie** mogą zamknąć sezonu wcześniej ani pominąć triggera.

**Poza triggerem:**

- Mecze AI↔AI w tle (jeśli istnieją) **nie** zastępują warunku 22/22 klubu gracza.
- Brak „przybliżonego” końca sezonu.
- Niespełniony trigger ⇒ pipeline **nie startuje** (klub pozostaje in-season).

---

## 7. Pipeline zdarzeń (D69 · D71 · D75)

Kolejność **zamrożona**. Żadnego przestawiania Report za konsekwencje.

| Krok | Zdarzenie            | Opis produktowy                                                                           |
| ---- | -------------------- | ----------------------------------------------------------------------------------------- |
| 0    | In-season            | Sezon ligowy §10 (MD1–22).                                                                |
| 1    | **Trigger**          | 22/22 played (sekcja 6).                                                                  |
| 2    | **Season Closed**    | Fakt: sezon bieżący zamknięty; idempotentny.                                              |
| 3    | **Report**           | Raport sezonu (sekcja 8) — **przed** hookami.                                             |
| 4    | **Enter Offseason**  | Przerwa; brak meczów ligowych; jedno Primary CTA.                                         |
| 5    | **Hooks window**     | Moment, w którym Future EPIC _mogą_ się podłączyć (sekcja 10) — w Thin: **brak feature**. |
| 6    | **Confirm N+1**      | Świadome potwierdzenie gracza startu nowego sezonu.                                       |
| 7    | **New Season**       | Reset ligowy + nowy kalendarz 22; ta sama liga (sekcja 9).                                |
| 8    | **Return to Season** | Hub wraca do rytmu in-season; Primary CTA → kolejka 1.                                    |

**Zakaz:** wstawianie awansu/spadku między krokami 2–7 (D73).

---

## 8. Raport sezonu (Information Thin · D71)

**Cel:** Uznanie i zamknięcie emocjonalne sezonu — bez nagród ekonomicznych i bez zmiany ligi.

**Źródła faktów (wyłącznie istniejące):**

- Pozycja i kontekst tabeli ligowej sezonu.
- Bilans meczów ligowych klubu (W/R/P lub równoważne odczucie z faktów).
- Do **≤3** highlightów sezonu — tylko jeśli da się je wyprowadzić z faktów (np. seria, pozycja końcowa); **zakaz** wymyślonych historii.

**Kategoria wyniku w Thin (bez promotion):**

- Informacyjna etykieta miejsca / strefy w **tej samej** lidze (np. górna / środkowa / dolna / mistrzostwo stołu w lidze).
- **Nie** oznacza awansu ani spadku szczebla.

**Zakaz w raporcie:** kwoty €, odnowienie sponsora, ocena zarządu jako system, przycisk „Awansuj”, Fake Production, ranking ELO.

---

## 9. Offseason i start Season N+1 (AC-8)

### 9.1 Przerwa (Offseason)

- Brak meczów ligowych.
- Hub: **dokładnie jedno** Primary CTA w duchu §23 (np. „Przygotuj sezon” / równoważne).
- Tempo: **player-paced** (gracz może przejść dalej od razu). Timer realny 1–3 dni = Future, nie wymóg Thin.
- Eksploracja istniejących powierzchni klubu dozwolona; **zakaz** udawania nowych systemów.

### 9.2 Co **pozostaje** po zakończeniu sezonu (Season Closed → Offseason)

| Pozostaje (ciągłość)               | Uwagi                                                |
| ---------------------------------- | ---------------------------------------------------- |
| Tożsamość klubu                    | Nazwa, herb, kolory, kreacja                         |
| Kadra / zawodnicy                  | Skład i stany Thin jak przed zamknięciem             |
| Kasa i historia ruchów finansowych | Bez sezonowego „wypłacania” sponsora w Thin          |
| Historia / osiągnięcia już zdobyte | Bez nowych scorów                                    |
| Szczebel ligi                      | **Bez zmian** (D73)                                  |
| Pamięć sezonu zamkniętego          | Raport jako uznanie; fakty sezonu dostępne do derive |

### 9.3 Co **nie** dzieje się w Thin przy zamknięciu

- Zmiana ligi (awans/spadek).
- Odnowienie sponsorów, ocena Board, `age++`, nowe okno transferów jako feature.
- Automatyczny start Season N+1 bez potwierdzenia gracza.

### 9.4 Co **rozpoczyna** nowy sezon (po Confirm N+1)

| Startuje / resetuje się | Opis                                             |
| ----------------------- | ------------------------------------------------ |
| Nowy przebieg sezonu    | Numer sezonu / etykieta „Sezon N+1” (produktowo) |
| Tabela ligowa           | Świeża — derive od zera dla nowego kalendarza    |
| Kalendarz 22            | Nowy plan kolejek 1–22 (SSOT §10 / D28)          |
| Faza Hub                | Powrót do in-season (`SEASON`)                   |
| Soft cel sezonu         | Miękka narracja (§3 / §10) — bez hard questu     |

| Nadal bez zmian przy starcie N+1 (Thin) |                      |
| --------------------------------------- | -------------------- |
| Szczebel ligi                           | Ta sama liga         |
| Tożsamość klubu                         | Bez new game         |
| Zakaz promotion                         | D73 nadal obowiązuje |

---

## 10. Hooki (D72 · AC-9)

Każdy hook opisany **wyłącznie** jako: **moment · Owner EPIC · cel**.  
Bez UX, bez kwot, bez schematu, bez kryteriów implementacji.

| ID                    | Moment (pipeline)                                  | Owner EPIC                                       | Cel                                                                        |
| --------------------- | -------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------- |
| **H-SPONSORS**        | Po **Report**, w oknie Offseason (krok 5)          | `LFE-SPONSORS-01` (po Season End w kodzie + §15) | Umożliwić odnowienie / cykl umowy sponsorskiejej bez blokowania lifecycle. |
| **H-BOARD**           | Po **Report** (krok 5)                             | `LFE-BOARD-01` (po GDD Board)                    | Umożliwić ocenę / cele władz względem wyniku sezonu.                       |
| **H-AGE**             | Przy **New Season** (krok 7) lub tuż przed nim     | osobny EPIC kariery / age Thin                   | Umożliwić sezonowy przyrost wieku zawodników.                              |
| **H-TRANSFER-WINDOW** | Offseason (krok 4–5)                               | rozszerzenie Transfers / okna §12                | Umożliwić główne okno międzysezonowe.                                      |
| **H-ACHIEVE**         | Po **Report** (krok 3–5)                           | opcjonalne wzbogacenie `LFE-ACHIEVEMENTS-*`      | Umożliwić kamienie sezonowe jako derive z faktu zamknięcia.                |
| **H-MSG**             | Po **Report** (krok 3–5)                           | opcjonalne wzbogacenie Messages                  | Umożliwić komunikat skutkowy (ton uznania / soft landing).                 |
| **H-PROMOTION**       | **Poza** Season End Thin — po domknięciu lifecycle | `LFE-PROMOTION-01` / Season End Depth            | Umożliwić awans/spadek szczebla; **zakaz** w tym kontrakcie (D73).         |

**Zasada:** dopóki Owner EPIC nie jest CLOSED, hook w produkcie Thin = **no-op** (brak feature, brak atrap).

---

## 11. Fazy Hub (kontrakt produktowy)

| Faza produktowa      | Kiedy                        | Primary                        |
| -------------------- | ---------------------------- | ------------------------------ |
| In-season (`SEASON`) | MD dostępne / sezon otwarty  | Mecz / idle wg §23             |
| Offseason            | Po Report, przed Confirm N+1 | Jedno CTA przygotowania sezonu |
| In-season N+1        | Po New Season                | Kolejka 1                      |

Nazwy techniczne faz w kodzie = Future (`LFE-SEASON-END-01`); tutaj obowiązuje **semantyka**.

---

## 12. Zakazy (skompresowane)

1. Kod lifecycle przed CLOSE tego kontraktu i przed Owner GO implementacji (D74 · D76).
2. Awans/spadek w Thin (D73).
3. Systemy ekonomii/zarządu przed lifecycle (D68).
4. Raport po side-effectach / hookach feature (D71).
5. Zamknięcie bez triggera 22/22 (D70).
6. Fake Production / Placeholder jako „koniec sezonu” (D40 · D52).
7. Drugi planner terminarza.
8. RNG zamknięcia (D75).

---

## 13. Acceptance Criteria (kontrakt GDD)

| ID       | Kryterium                                                                                   |
| -------- | ------------------------------------------------------------------------------------------- |
| AC-1     | IN/OUT i D68–D76 są jawne w tym pliku.                                                      |
| AC-2     | Pipeline ma stałą kolejność; Report przed konsekwencjami.                                   |
| AC-3     | Trigger 22/22 jest jedynym startem lifecycle.                                               |
| AC-4     | D73: brak promotion/relegation w Thin.                                                      |
| AC-5     | Hooki bez specyfikacji feature (tylko moment · Owner · cel).                                |
| AC-6     | Pointer §10.20 w `GAME_DESIGN_DOCUMENT.md` wskazuje ten plik jako SSOT Thin.                |
| AC-7     | Brak kodu / migracji / PLAN implementacji w tym EPICu.                                      |
| **AC-8** | Sekcja 9 jednoznacznie opisuje, **co pozostaje** po sezonie i **co rozpoczyna** Season N+1. |
| **AC-9** | Każdy hook (sekcja 10) ma wyłącznie moment · Owner EPIC · cel.                              |
| AC-10    | Determinizm lifecycle zapisany (D75).                                                       |

---

## 14. Relacja do istniejących rozdziałów GDD

| Rozdział            | Relacja                                                                         |
| ------------------- | ------------------------------------------------------------------------------- |
| §3.5 · §3.8         | Łuk sezonu / most do kolejnego                                                  |
| §10.4 · §10.9–10.11 | Terminarz; awans/spadek = **poza Thin** (pełny GDD pozostaje kierunkiem Future) |
| §10.12 · §10.13     | Przerwa i nowy sezon — **uszczegółowione i zawężone** przez ten kontrakt Thin   |
| §12                 | Okno międzysezonowe = H-TRANSFER-WINDOW                                         |
| §15.11              | Odnowienie sponsora = H-SPONSORS                                                |
| §19 · §21           | Opcjonalne derive po Report                                                     |
| §23                 | Hub: jedno CTA w Offseason                                                      |

---

## 15. Mapa EPIC follow-up

| #   | EPIC                                   | Zależność                       |
| --- | -------------------------------------- | ------------------------------- |
| 0   | **GDD-SEASON-END-01** (ten)            | D74 · D76                       |
| 1   | `LFE-SEASON-END-01`                    | po CLOSE docs + Owner GO kodu   |
| 2   | Promotion / relegation GDD+LFE         | po lifecycle; D73               |
| 3   | `LFE-SPONSORS-01`                      | H-SPONSORS + fakt Season Closed |
| 4   | GDD Board → `LFE-BOARD-01`             | H-BOARD                         |
| 5   | Age++ Thin / Transfer offseason window | H-AGE / H-TRANSFER-WINDOW       |

---

## 16. MVP Thin vs Future

| Thin (ten kontrakt)                                            | Future                                        |
| -------------------------------------------------------------- | --------------------------------------------- |
| Zamknięcie + raport + offseason + Season N+1 w tej samej lidze | Awans/spadek · baraże                         |
| Player-paced przerwa                                           | Timer realny 1–3 dni                          |
| Hooki no-op                                                    | Sponsors · Board · age++ · okno transferów    |
| Highlighty z faktów                                            | Bogatsza narracja / commemorative             |
| Semantyka Offseason                                            | Pełna maszyna faz + soft-lock parity w kodzie |

---

## Last updated

2026-07-30 — GDD-SEASON-END-01 CLOSED · D68–D77 · AC-8 · AC-9
