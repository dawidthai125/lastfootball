# Last Football — UI Design Guide

**Produkt:** Last Football  
**Dokument:** UI_DESIGN_GUIDE  
**Faza:** 2 — Game Design Foundation  
**Etap:** GDD-01  
**Status:** Zasady bazowe + **Presentation Contract** (po LFE-UI-EVOLUTION-01/02)

> Ten przewodnik jest SSOT dla **wyglądu i zachowania UI**.  
> Mechaniki gry → [GAME_DESIGN_DOCUMENT.md](./GAME_DESIGN_DOCUMENT.md).  
> Historia serii UI Evolution → [LFE-UX-POSTMORTEM-01.md](./LFE-UX-POSTMORTEM-01.md) (**REFERENCE**).  
> **W przypadku rozbieżności obowiązuje `UI_DESIGN_GUIDE`, a postmortem ma charakter referencyjny.**

---

## 1. Misja interfejsu

Last Football ma wyglądać i działać jak **profesjonalna gra menedżerska**, nie jak generyczny dashboard SaaS ani „AI admin panel”.

Gracz ma w kilka sekund wiedzieć:

1. gdzie jest,
2. co jest najważniejsze teraz,
3. jaką jedną decyzję może podjąć.

---

## 2. Zasady nadrzędne

### 2.1 Profesjonalny menedżer, nie dashboard AI

- Unikamy wyglądu „karta + fioletowe gradienty + glow + pill badges”.
- Unikamy przypadkowych statystyk w hero i przeładowanych widgetów.
- Preferujemy klarowną hierarchię: klub / rozgrywki / decyzja.

### 2.2 Nowoczesność, elegancja, ponadczasowość

- Typografia z charakterem (nie domyślny Inter/Roboto/Arial jako tożsamość marki).
- Spójna siatka, rytm odstępów, ograniczona paleta.
- Detal przez typografię i kompozycję, nie przez efekty świetlne.

### 2.3 Czytelność i szybkość

- Pierwszeństwo: skanowanie oczu (F-pattern / jasny CTA).
- Gęstość informacji kontrolowana — listy i tabele czytelne, nie „wall of cards”.
- Akcje krytyczne (kadra, mecz, transfer) zawsze w zasięgu 1–2 kliknięć z Hubu.

### 2.4 Jeden cel na ekran

- Każdy widok ma **jedną** główną intencję.
- Sekcje poboczne nie konkurują z celem ekranu.
- Modale tylko dla decyzji domykających (potwierdzenie transferu, zmiana taktyki).

### 2.5 Spójność całej gry

- Te same komponenty nawigacji, list zawodników, wyników meczów.
- Stałe znaczenie kolorów (np. sukces / ostrzeżenie / błąd) w całej aplikacji.
- Ten sam język mikrocopy (krótki, rzeczowy, po polsku w produkcie PL).

### 2.6 Oszczędność efektów

- **Bez** nadmiaru gradientów, glow, neonów, glassmorphism „dla ozdoby”.
- **Bez** przypadkowych animacji; ruch tylko gdy wzmacnia hierarchię lub feedback.
- Tła: subtelna atmosfera boiska/klubu, nie dekoracyjny chaos.

---

## 3. Hierarchia wizualna

1. **Tożsamość klubu** (nazwa / herb) — silny sygnał marki gracza na hubie i w meczu.
2. **Kontekst rozgrywek** (kolejka, wynik, termin).
3. **Decyzja / CTA**.
4. **Dane wspierające** (tabele, atrybuty).
5. **Metadane** (timestampy, ID — zawsze najniżej).

Na landingach / promo: brand first. W grze zalogowanej: **klub gracza** jest bohaterem, nie logo produktu.

---

## 4. Nawigacja

### 4.1 Struktura (do doprecyzowania w GDD §23–24)

Szkielet oczekiwany:

- Hub (panel główny)
- Drużyna (**Kadra** `/squad`, taktyka, trening)
- Rozgrywki (liga, puchar, mecz)
- Transfery / skauting
- Klub (stadion, finanse, sponsorzy, akademia)
- Wiadomości / zadania

**Mobile daily (Variant A, po LFE-UI-EVOLUTION-02):** Hub · Trening · Kadra · Transfery · Więcej  
(Terminarz / Mecz w „Więcej”; matchday nadal przez Hub Primary.)

### 4.2 Zasady

- Stały chrome nawigacji (desktop + adaptacja mobile).
- Chrome **wspiera** ekran domenowy, nie konkuruje (bez KPI w TopBar).
- Aktywna sekcja zawsze widoczna.
- Breadcrumbs tylko gdy głębokość > 2.
- Szczegóły kontraktu prezentacji → §16.

---

## 5. Wzorce ekranów

| Wzorzec           | Kiedy                   | Unikać                               |
| ----------------- | ----------------------- | ------------------------------------ |
| Hub               | Start sesji, CTA dnia   | Mini-dashboard z 12 kartami          |
| Decision-first    | Ekrany domenowe         | KPI wall na first viewport           |
| Kick-Off          | PreMatch                | Briefing / triptych bez dominant CTA |
| Question-day      | Trening, Kadra, Finanse | Dashboard metryk bez pytania         |
| Lista + detal     | Zawodnicy, oferty       | Karty zamiast tabeli bez potrzeby    |
| Formularz decyzji | Transfer, trening       | Wielostronicowe wizardy bez sensu    |
| Match view        | Przed / w trakcie / po  | Overlaye zasłaniające boisko         |
| Raport            | Post-match, finanse     | Infografiki bez akcji                |

**Karty:** tylko gdy niosą interakcję lub czytelność. Domyślnie — lista / sekcja bez „card for card’s sake”.  
**Pełny kontrakt:** §16 Presentation Contract.

---

## 6. Typografia (kierunek)

- Display / nagłówki: wyrazisty krój (sportowy, ale nie „esport neon”).
- Body: wysoka czytelność przy gęstych tabelach.
- Unikać: Inter / Roboto / Arial jako jedynej tożsamości marki.
- Skala typograficzna stała w design tokens (do zdefiniowania w GDD-02+).

---

## 7. Kolor i atmosfera

- Jedna, świadoma paleta klubu produktu + tokeny semantyki (success / danger / warning).
- Tła z lekką głębią (gradient/tekstura subtelna), nie płaski „#fff only” ani dark-purple default.
- Kolory klubu gracza jako akcent personalizacji — nie łamią systemu.

**Unikać biasów AI-UI:** fioletowo-indygo glow, cream+terracotta „editorial default”, gazetowy broadsheet dense layout — chyba że świadomie w GDD.

---

## 8. Motion

**SSOT implementacji Thin (LFE-UI-MOTION-01):** `apps/web/src/styles/motion.css`  
**Tokeny:** `--lf-motion-fast` (120ms) · `--lf-motion-base` (180ms) · `--lf-motion-slow` (280ms) · `--lf-motion-easing` (`ease-out`).

### 8.1 Zasady nadrzędne

1. Motion = **prezentacja** — nie zmienia domeny, resolverów, DTO, LFE ani UX flow.
2. **CSS-first** — bez Framer / Motion One / GSAP / View Transitions / nowych lib JS.
3. Właściwości animowane: wyłącznie **`opacity`** i **`transform`**.
4. Motion **krótkie, subtelne, praktycznie niewidoczne** — nigdy efektowne, gamingowe, neonowe.
5. **Motion budget:** nie wydłużać odczuwanego czasu reakcji UI; jeśli użytkownik „czeka na animację” — skrócić.
6. **REUSE:** jedne keyframes · jedne klasy · jedne tokeny — **ZERO DUPLICATE** (nie kopiować `@keyframes` w CSS ekranów).
7. Każdy wzorzec **musi** mieć `prefers-reduced-motion`.

### 8.2 Trzy wzorce Thin (kontrakt)

| Wzorzec                | Klasa CSS            | Keyframes           | Czas token         | Zastosowanie Thin                        |
| ---------------------- | -------------------- | ------------------- | ------------------ | ---------------------------------------- |
| Fade enter             | `.lf-motion-fade-in` | `lf-motion-fade-in` | `--lf-motion-fast` | Match Goal/Final overlay (scrim)         |
| Decision / panel enter | `.lf-motion-enter`   | `lf-motion-enter`   | `--lf-motion-base` | Hub decision block · Match overlay panel |
| Primary press          | `.lf-motion-press`   | — (`:active` only)  | natychmiast        | Hub Primary CTA                          |

**Primary press:** feedback **tylko** podczas `:active`. Po zwolnieniu UI **natychmiast** wraca do stanu bazowego (bez transition / efektów końcowych).

**Match overlay:** podkreśla wydarzenie; nie odciąga uwagi od przebiegu meczu (krótki enter; logika dismiss bez zmian).

### 8.3 Reduced motion

Przy `prefers-reduced-motion: reduce`:

- enter → krótki fade (`--lf-motion-fast`), bez `translateY`;
- press → brak scale / zmiany opacity.

### 8.4 Poza Thin (nie dodawać „przy okazji”)

Landing · Navigation · route transitions · Live score tick · tabele · listy · Auth/Wizard rewrite.

### 8.5 Jak użyć (bez zgadywania)

1. Zaimportowany globalnie przez `globals.css` → `@import '../styles/motion.css'`.
2. Na elemencie dodaj klasę z §8.2 (np. `className="lf-hub__decision lf-motion-enter"`).
3. Nie definiuj lokalnych kopii `lf-motion-*` keyframes.
4. Nie animuj `width` / `height` / `top` / `left` / `margin` / layout.

---

## 9. Feedback i stany

Każdy interaktywny element obsługuje:

- default / hover / active / disabled / loading / error / empty

Empty states: konkretna wskazówka „co zrobić dalej”, nie pusty ilustracyjny void.

---

## 10. Responsive

- Desktop: priorytet gęstości menedżerskiej (tabele, przegląd kadry).
- Mobile: priorytet CTA i skróconych list / kart; pełne tabele → progressive disclosure.
- Touch targets wystarczające; bez hover-only krytycznych akcji.

---

## 11. Dostępność (cele)

- Kontrast AA dla tekstu kluczowego.
- Fokus klawiatury widoczny.
- Semantyka nagłówków i etykiet formularzy.
- Nie polegać wyłącznie na kolorze w wynikach/formie.

---

## 12. Copy UI

- Krótko, po polsku (produkt PL), bez żargonu inżynierskiego (Thin, Seed, Fallback…).
- Czasowniki w CTA: „Zobacz kadrę” (→ `/squad`), „Ustaw skład” (XI przedmeczowy), „Zagraj mecz”, „Złóż ofertę”.
- Błędy: co poszło nie tak + jak naprawić.
- Glosariusz **Kadra** vs **Skład** → §16.6.

---

## 13. Czego nie robimy (hard no)

- Losowe badge’e, chipy i promo stickery na hero / boisku.
- Glow, neon, multi-layer shadow stacks.
- Emoji jako substytut ikon systemu.
- Kilka CTA równorzędnych na jednym viewportcie.
- Przebudowa całego UI „pod chwilowy trend”.

---

## 14. Proces projektowy

1. Rozdział GDD definiuje **cel ekranu**.
2. Ten guide (w tym §16) definiuje **jak** to wygląda i zachowuje się.
3. EPIC UI prezentacji musi spełniać **Presentation Contract (§16)**.
4. Dopiero potem implementacja w `apps/web` (bez zmiany resolverów/DTO bez Owner GO domenowego).
5. Zmiany wizualne globalne → aktualizacja tego dokumentu.
6. Historia decyzji UI Evolution → [LFE-UX-POSTMORTEM-01.md](./LFE-UX-POSTMORTEM-01.md) (REFERENCE).

---

## 15. Do opracowania (GDD-02+)

- [ ] Design tokens (kolor, typo, spacing, radius)
- [ ] Biblioteka komponentów (nazwy + stany)
- [ ] Wireframes: Hub, Kadra (`/squad`), Mecz, Transfery
- [ ] Icon set policy
- [ ] Match view layout (Canvas LFE = dumb renderer)

---

## 16. Presentation Contract (obowiązujący)

SSOT reguł prezentacji po LFE-UI-EVOLUTION-01/02.  
Skrót dla AI: [`../AI/COMMON_PATTERNS.md`](../AI/COMMON_PATTERNS.md) → _UI Presentation Pattern_.  
Historia: [LFE-UX-POSTMORTEM-01.md](./LFE-UX-POSTMORTEM-01.md) (**REFERENCE**).

> **W przypadku rozbieżności obowiązuje `UI_DESIGN_GUIDE`, a postmortem ma charakter referencyjny.**

### 16.1 Cel i granica

- Zakres: prezentacja, nawigacja, copy UI, hierarchia first viewport.
- **Zakaz** w EPIC-u UI: zmiana DTO, resolverów biznesowych, reguł unlock, settlement, API, Supabase, silników.
- UI domenowe wyłącznie przez istniejące `resolve*` (RESOLVER FIRST).
- Soft-lock / access: konsumuj `resolveNavAccess` — **bez** nowych reguł unlock.

### 16.2 Hierarchia ekranu

1. **Hero** — kontekst decyzji (wydarzenie, pytanie dnia, VS, saldo…).
2. **Decision** — jedno Primary CTA / jedna ścieżka.
3. **Context** — browse, tabele, historia **pod** decyzją.

First viewport = **jedna sprawa** lub **jedno pytanie**. Bez KPI wall; max **jedna** linia kontekstu (np. Okno · Kasa · Budżet).

### 16.3 Primary CTA / Secondary / Soft-links

- Dokładnie **jedno** wizualnie dominujące Primary CTA (gold).
- Secondary wyraźnie niższe; na Hubie **≤ 5**.
- Soft-links = muted (underline / text) — **nigdy** drugi gold primary.
- Semantyka CTA z resolvera / istniejącego `href` / istniejącej akcji — UI tylko wyraża.

### 16.4 Dialekty first viewport

| Dialekt       | Ekrany (przykłady)       | Forma                               |
| ------------- | ------------------------ | ----------------------------------- |
| Event / inbox | Hub, Transfery, Kick-Off | Najbliższe wydarzenie / sprawa / VS |
| Question-day  | Trening, Kadra, Finanse  | Nagłówek-pytanie + jedna ścieżka    |

Nie unifikować dialektów na siłę (jeden szablon CSS ≠ jeden język decyzji).

### 16.5 Daily Manager Loop

Oś prezentacyjna dnia:

```
Hub → Trening → Kadra → Transfery → Finanse → Match path → Hub
```

- Hub = **router dnia**: Primary = event/mecz lub fallback Kadra; Secondary = pętla.
- Hub Secondary (kolejność): **Trening · Kadra · Transfery · Finanse · Terminarz** (unlock-aware).
- Mobile Variant A: **Hub · Trening · Kadra · Transfery · Więcej**.
- Soft-linki łączą sąsiadów pętli (np. Squad→Trening, Transfers→Finanse/Kadra, Finance→Transfery).
- Semantyka Hub (phase / session / CTA resolvers): [`../platform/HUB.md`](../platform/HUB.md).

### 16.6 Glosariusz: Kadra vs Skład

| Termin    | Znaczenie                            | Przykłady UI                                    |
| --------- | ------------------------------------ | ----------------------------------------------- |
| **Kadra** | Ekran / nawigacja `/squad`           | „Kadra”, „Zobacz kadrę”                         |
| **Skład** | XI / gotowość meczowa                | Kick-Off summary, „Ustaw skład”, „Skład gotowy” |
| **Zakaz** | „Zobacz skład” jako link do `/squad` | —                                               |

### 16.7 Must (EPIC UI prezentacji)

1. Jedno pytanie / jedna sprawa na first viewport.
2. Jedno Primary CTA; Secondary i soft-linki wizualnie niższe.
3. Hero → Decision → Context.
4. Brak KPI wall na first viewport.
5. Mobile-first: karty/lista na wąskim; Primary full-width; touch ≥ 44px.
6. Chrome wspiera treść — bez drugiego dashboardu w TopBar.
7. Copy gracza — bez żargonu silnika.
8. SSOT nazewnictwa: Kadra vs Skład (§16.6).
9. Unlock / trasy / akcje — tylko istniejące.
10. Zachowaj dialekt ekranu (event vs question).
11. Soft-linki łączą pętlę; nie dodają dominant akcji.
12. Tokeny `--lf-*` / system Guide — bez defaultów „AI UI” (purple glow, cream+terracotta broadsheet…).

### 16.8 Must-not (anti-patterns)

- Dashboard SaaS: równe karty KPI, wall of `Panel`, sekcje bez hierarchii.
- Drugi gold CTA / floating badges na Hero.
- Przebudowa całej IA nawigacji „przy okazji” jednego ekranu.
- Zmiana resolvera / unlock „żeby UI było prościej”.
- Unifikacja wszystkich ekranów do jednego dialektu kosztem czytelności decyzji.
- Runtime mocki na Hub / rynku / kasie / tabeli.

### 16.9 Świadomie odrzucone kierunki (UI Evolution)

| Odrzucone                                             | Dlaczego                              |
| ----------------------------------------------------- | ------------------------------------- |
| Mobile Variant B (Mecz w primary, Trening w Więcej)   | Zamrożono Variant A w 02              |
| Jeden szablon CSS / jeden dialekt na wszystkie ekrany | Zachować event vs question-day        |
| Finance jako narzędzie budżetowania                   | Tylko status + deep-link `/transfers` |
| Nowe reguły unlock pod UI                             | SSOT unlock bez zmian                 |
| KPI cards jako „kontekst” / drugi gold CTA            | Anti-dashboard                        |
| League / Live depth / Messaging w scope UI Evolution  | Poza thin slice                       |
| „Zobacz skład” → `/squad`                             | Zastąpione „Zobacz kadrę”             |

### 16.10 Definition of Done (EPIC UI prezentacji)

- Zamrożone D\* z PLAN + AC prezentacyjne.
- format · typecheck · lint · test · build GREEN (gdy EPIC kodowy).
- Potwierdzenie: presentation only; lista obszarów nietkniętych.
- Zgodność z tym kontraktem (§16).
- Pipeline: [`../AI/EPIC_WORKFLOW.md`](../AI/EPIC_WORKFLOW.md).

### 16.11 Powiązane dokumenty

| Dokument                                                     | Rola                           |
| ------------------------------------------------------------ | ------------------------------ |
| [`../platform/HUB.md`](../platform/HUB.md)                   | Semantyka phase / CTA / unlock |
| [LFE-UX-POSTMORTEM-01.md](./LFE-UX-POSTMORTEM-01.md)         | Historia (REFERENCE)           |
| [`../AI/COMMON_PATTERNS.md`](../AI/COMMON_PATTERNS.md)       | Skrót AI                       |
| [`../web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md) | Live / Canvas / Replay         |

---

## Historia

| Wersja      | Data       | Zmiana                                     |
| ----------- | ---------- | ------------------------------------------ |
| 0.1.0-gdd01 | 2026-07-23 | Zasady bazowe UI (GDD-01)                  |
| 0.2.0       | 2026-07-26 | Presentation Contract §16 (LFE-DOCS-UX-03) |
