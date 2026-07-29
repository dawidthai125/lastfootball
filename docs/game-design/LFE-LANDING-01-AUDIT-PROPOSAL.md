# LFE-LANDING-01 — AUDIT · RCA · UX · WIREFRAME · HI-FI PROPOSAL

**EPIC:** LFE-LANDING-01  
**Etap:** OWNER CHANGE REQUEST — Landing redesign (BEZ IMPLEMENTACJI)  
**Data:** 2026-07-29  
**Zakres:** wyłącznie `/` (marketing home)  
**Zakaz tego etapu:** kod · commit · push · zmiany DNA / World Art assetów / tokenów DS

> Ten dokument czeka na **Owner GO** przed IMPLEMENT.  
> Po akceptacji: osobny etap IMPLEMENT (layout + kompozycja + użycie **istniejących** WA / tokenów).

---

## 0. Metadane

| Pole                | Wartość                                                             |
| ------------------- | ------------------------------------------------------------------- |
| Kod dziś            | `LandingPage.tsx` · `landing.css` · `(marketing)/layout.tsx`        |
| SSOT produktowy     | GDD §4.1 · Guide §2–3 (brand first na landing) · Night Pitch Office |
| Production Baseline | UI P0 `54d0724` (panel) — **Landing nie był częścią IMPL-01…06**    |
| Status              | **DRAFT — oczekuje Owner GO**                                       |

---

# 1. RCA (Root Cause Analysis)

## 1.1 Objawy (Owner)

| Objaw Owner                    | Potwierdzone w kodzie / prod                    |
| ------------------------------ | ----------------------------------------------- |
| Wygląda jak MVP                | Tak                                             |
| Mała część szerokości monitora | Tak                                             |
| Ogromne puste przestrzenie     | Tak                                             |
| Słabe CTA                      | Tak                                             |
| Brak „wow”                     | Tak                                             |
| Brak charakteru marketingowego | Tak                                             |
| Nie pokazuje możliwości gry    | Tak                                             |
| Nie zachęca do założenia klubu | Częściowo (copy OK, prezentacja produktu słaba) |

## 1.2 Przyczyny źródłowe (nie „brak polishu”)

| ID  | Przyczyna                                                                            | Dowód w kodzie                                        |
| --- | ------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| R1  | **Hero = wąska kolumna treści** (`max-width: 40rem`) na full viewport                | `.lf-landing__hero-inner { width: min(40rem, 100%) }` |
| R2  | **Brak dominant image** — tylko AtmosphereLayer (flood/grain/vignette), bez HERO-00x | Hero nie ładuje `hero-001` / `hero-002` / `hero-003`  |
| R3  | **Primary CTA wizualnie soft** — `gold-soft` + outline, nie solid Primary gold       | `.lf-landing__cta--primary`                           |
| R4  | **„Wow” = pusty SVG herb**, nie produkt / świat gry                                  | `HeroCrest`                                           |
| R5  | **Story visuals = abstrakcyjne motywy** (swatche, lista, drabinka IV→I)              | `IdentityVisual` / `MatchBeatVisual` / `SeasonVisual` |
| R6  | **Sekcje story `max-width: 64rem`** + centrowanie → pas pustki na ≥1440px            | `.lf-landing__story`                                  |
| R7  | **Landing nie przeszedł UI P0 fidelity** — pozostał P0.5 PLATFORM-01                 | Komentarz „P0.5 Section Flow S0–S4”                   |
| R8  | Brand **podwójny** (header + hero wordmark) konkuruje z headline                     | `LandingHeader` + `.lf-landing__brand-hero`           |

## 1.3 Werdykt RCA

Problem **nie** wynika z Visual DNA ani tokenów.  
Problem wynika z **kompozycji marketingowej**: landing traktuje się jak „centrowany splash MVP”, podczas gdy konkurencja i GDD §4.1 wymagają **atmosfery boiska/klubu + jasnej ścieżki „Graj”**.

**Korekta:** redesign layoutu i hierarchii przy **reuse** istniejących WA (`HERO-001…003`, ewentualnie tunnel/pitch) i istniejących tokenów Primary/gold — **bez** nowych assetów DNA.

---

# 2. UX Audit

## 2.1 Stan obecny (as-is)

```
[ Sticky header: mark + Zaloguj ]
[======== Hero full-height ========]
[   Brand · H1 · support · SVG crest · soft CTA+login   ]
[   (inner ≤40rem, centered)                            ]
[ S1 Identity | abstract swatches     ]  ≤64rem centered
[ S2 Match    | beat list             ]
[ S3 Season   | ladder IV–I           ]
[ Close CTA ]
[ Footer legal ]
```

**Hierarchia first viewport:** brand → H1 → support → crest → CTA.  
Brakuje: **jednego dominant visual plane** (murawa / tunel / gabinet).

## 2.2 Benchmark konkurencji (marketing home)

| Produkt                 | Hero                                         | CTA                           | Pokaz możliwości                  | Desktop width                                     | Mobile           |
| ----------------------- | -------------------------------------------- | ----------------------------- | --------------------------------- | ------------------------------------------------- | ---------------- |
| **Football Manager**    | Full-bleed art / sezon key art · brand mocny | Buy / Wishlist / Play (store) | Screenshots / features / editions | Edge-to-edge media · szerokie pásma               | Stack · duże CTA |
| **Top Eleven**          | Athletic hero + klub / zawodnicy             | Play / Download primary       | Feature tiles · social proof      | Szerokie paski · grid feature                     | App-store first  |
| **Hattrick**            | Prostszy, community / club fantasy           | Join / Login                  | „Build club” narrative            | Często wąższy content — **ale** hero z kontekstem | Prosty stack     |
| **FootballTeam**        | Sport UI + match excitement                  | Play free / Register          | Modes / leagues teaser            | Wide marketing bands                              | CTA sticky-ish   |
| **EA FC Ultimate Team** | Cinematic pack/player hero · premium motion  | Play / Buy                    | Modes, rewards, live seasons      | **Full-bleed cinematic** · zero „wąskiej kartki”  | Hero crop mobile |

### Lekcje dla LastFootball (bez kopiowania UI)

1. **Full-bleed świat** (nie pusty void + tekst).
2. **Jeden Primary CTA** o wadze „Play now” (solid, duży).
3. **Dowód gry** — real screens / lokacje (u nas: Hub gabinet, Tunnel, Pitch, Live scorebug) — nie abstrakcyjne ikonki.
4. **Desktop = szerokość jako narracja** (sekcje edge-aware), nie `max-width: 40rem` w środku pustki.
5. **Mobile = ten sam story**, Primary full-width, bez utraty brandu.

## 2.3 Ocena wymiarów (as-is)

| Wymiar          | Ocena | Komentarz                                               |
| --------------- | ----- | ------------------------------------------------------- |
| Hero            | 2/5   | Pełna wysokość, ale bez obrazu świata; wąski copy block |
| Hierarchy       | 3/5   | Copy sensowny; brand×2 + crest rozpraszają              |
| CTA             | 2/5   | Soft gold; Secondary konkuruje wagą                     |
| Sekcje          | 2/5   | Dobra intencja S1–S3; visuals nie sprzedają gry         |
| Spacing         | 2/5   | Dużo void = „pusto”, nie „premium breathing”            |
| Desktop width   | 1/5   | Główny fail vs Owner                                    |
| Mobile          | 3/5   | Stack OK; nadal słaby hero visual                       |
| Marketing / wow | 1/5   | Brak cinematic / product proof                          |

## 2.4 Co zostawić (działa)

- Osobny marketing shell (bez AppShell) — zgodne z GDD §4.1.
- One-liner kierunku: klub → liga → mecz Twój.
- Story beats: Tożsamość · Mecz · Sezon (dobra oś narracji).
- Footer legal poza hero.
- Tokeny / fonty Archivo + Source Sans 3.
- Istniejące WA gotowe do użycia w hero i proof strips.

## 2.5 Co zmienić (must)

- Dominant **full-bleed** WA w hero (HERO-002 tunnel lub HERO-003 pitch — match night).
- Hero content **nie** w `40rem` centered card mental model — szeroka siatka desktop (copy L / atmosphere R lub overlay bottom-left).
- Primary CTA = **solid gold** (jak Hub Primary), Secondary = outline.
- Zastąpić SVG crest i abstrakcyjne motywy **product proof** (crop Hub / Live / XI / Transfers z istniejących lokacji).
- Sekcje story: full-bleed lub `min(90rem, 100%)` z prawdziwym art.
- Usunąć redundantny brand-hero wordmark (brand zostaje w headerze + opcjonalnie mały w footerze).

---

# 3. Nowy układ Landing (to-be IA)

## 3.1 Cel użytkownika

**Jedna decyzja:** założyć klub (Primary) · lub zalogować się (Secondary).

## 3.2 Struktura sekcji (marketing, nie dashboard)

| #   | Sekcja          | Cel                                    | Visual (istniejące WA)                   |
| --- | --------------- | -------------------------------------- | ---------------------------------------- |
| H   | Header          | Brand · Zaloguj (soft)                 | mark gold                                |
| S0  | **Hero**        | Brand signal + promise + ◆ Załóż klub  | **HERO-002** lub **HERO-003** full-bleed |
| S1  | **Świat klubu** | Gabinet / decyzja dnia                 | HERO-001 office                          |
| S2  | **Mecz**        | Tunnel → Live emocja                   | HERO-002 + Live strip motif*             |
| S3  | **Sezon**       | Kadra / transfery / trening jako pętla | HERO-004 / 005 / 006 collage**           |
| S4  | Close           | Powtórzenie Primary                    | thin pitch wash                          |
| F   | Footer          | Legal                                  | —                                        |

\*Motif = kompozycja CSS scorebug-like z tokenów (bez nowych assetów) lub crop istniejącego.  
\*\*Collage = **jeden** rząd 3 lokacji edge-to-edge (nie karty KPI) — reuse hero PNGs.

## 3.3 Hierarchia first viewport (S0)

Zgodnie z regułą hero budget + Guide brand-first:

1. **LastFootball** (hero-level brand — jeden sygnał; header mark mniejszy)
2. **Jedno H1** (promise)
3. **Jedno zdanie support**
4. **Jedna grupa CTA** (◆ Załóż klub · ○ Zaloguj)
5. **Jeden dominant image** (full-bleed WA)

**Zakaz w S0:** statystyki, feature pills, „this week”, social proof wall, karty, floating badges na art.

## 3.4 CTA strategy

| CTA             | Rola        | Wygląd                                              |
| --------------- | ----------- | --------------------------------------------------- |
| **Załóż klub**  | Primary ◆   | Solid `gold-base` · on-gold text · min-height 48–56 |
| **Zaloguj się** | Secondary ○ | Outline subtle · w hero + header                    |

Copy Primary pozostaje „Załóż klub” (GDD §4.1 „Graj / Załóż klub”) — bez zmiany `UI_COPY` domen gry.

---

# 4. Wireframe (low-fi)

## 4.1 Desktop ≥1200

```
┌──────────────────────────────────────────────────────────────────┐
│ [■ LF]                                              Zaloguj się  │
├──────────────────────────────────────────────────────────────────┤
│████████████████ HERO-003 / 002 FULL-BLEED ██████████████████████│
│█  veil bottom-left                                              █│
│█  LASTFOOTBALL                                                  █│
│█  Załóż klub. Prowadź go przez ligę.                            █│
│█  Każdy mecz jest Twój.                                         █│
│█  [◆ ZAŁÓŻ KLUB]   [○ Zaloguj się]                              █│
│█████████████████████████████████████████████████████████████████│
├──────────────────────────────────────────────────────────────────┤
│████ HERO-001 full width ████│ Decyzja w gabinecie               │
│                             │ Tożsamość klubu · jedna sprawa dnia│
├──────────────────────────────────────────────────────────────────┤
│ Tunel / mecz (copy L)       │████ HERO-002 / pitch █████████████│
├──────────────────────────────────────────────────────────────────┤
│████ HERO-004 ████████ HERO-005 ████████ HERO-006 ███████████████│
│  Kadra · Transfery · Trening — pętla sezonu (1 headline)         │
├──────────────────────────────────────────────────────────────────┤
│              Twój klub czeka · [◆ ZAŁÓŻ KLUB]                    │
├──────────────────────────────────────────────────────────────────┤
│ LastFootball · Regulamin · Polityka                              │
└──────────────────────────────────────────────────────────────────┘
```

## 4.2 Mobile ≤767

```
┌─────────────────────┐
│ [■ LF]     Zaloguj  │
├─────────────────────┤
│████ HERO (9:16/crop)│
│ LASTFOOTBALL        │
│ H1                  │
│ support             │
│ [◆ ZAŁÓŻ KLUB] full │
│ [○ Zaloguj]         │
├─────────────────────┤
│ HERO-001            │
│ copy tożsamość      │
├─────────────────────┤
│ copy mecz           │
│ HERO-002            │
├─────────────────────┤
│ Sezon strip (stack) │
├─────────────────────┤
│ Close + Primary     │
│ Footer              │
└─────────────────────┘
```

## 4.3 Flow interakcji

```
/  →  ◆ Załóż klub → /register → Club Wizard → First Match…
/  →  ○ Zaloguj   → /login
/  →  (session)   → redirect Hub / wizard (bez zmiany logiki)
```

**Bez** nowych domen · **bez** zmian auth.

---

# 5. Hi-Fi proposal (Night Pitch Office)

## 5.1 Kierunek wizualny

| Element     | Spec Hi-Fi                                                               |
| ----------- | ------------------------------------------------------------------------ |
| Paleta      | void / base / panel · brass gold · scarlet **tylko** Live motif          |
| Typo        | Archivo display/UI · Source Sans 3 body                                  |
| Hero art    | `HERO-002-tunnel-night` **lub** `HERO-003-pitch-night` (Owner wybór A/B) |
| Hero mobile | `hero-002-tunnel-mobile` jeśli tunnel; else crop pitch                   |
| Overlay     | gradient do `bg.base` — czytelność H1; **bez** stickers na art           |
| Primary     | jak Hub: `gold-base` fill · `text-on-gold` · radius md · nie pill        |
| Motion      | 2–3: hero veil breathe subtle · CTA focus · story reveal (już IO)        |
| Zakaz       | nowe kolory · purple glow · KPI cards · inset gallery hero               |

## 5.2 Wariant A vs B (Owner wybiera)

|                       | **A — Tunnel** (rekomendowany)   | **B — Pitch**                   |
| --------------------- | -------------------------------- | ------------------------------- |
| Art                   | HERO-002                         | HERO-003                        |
| Emocja                | Wejście na mecz / „wejdź do gry” | Nocna murawa / stadium prestige |
| Spójność z Match Path | Silna (IMPL-02)                  | Silna z Live/Post               |
| Mobile                | gotowy `-mobile` asset           | crop z desktop                  |

**Rekomendacja audytu:** **Wariant A (Tunnel)** — najsilniejszy most Landing → First Match / Match Path.

## 5.3 Sekcje Hi-Fi (detail)

### S0 Hero

- Full-bleed Image fill · object-position center.
- Copy block: desktop `max-width: 36rem` **w lewej/dolnej strefie**, nie center-column całej strony.
- Brand: jeden `type.h1` gold caps „LastFootball”.
- H1: zachować lub lekko wzmocnić („Załóż klub. Prowadź go przez ligę.”).
- Primary solid · Secondary outline · gap space-3.

### S1 Świat klubu

- Full-bleed lub 55/45: HERO-001 + copy „Nadasz klubowi imię, barwy i herb”.
- Bez swatchy jako głównego visuala.

### S2 Mecz

- Copy „Decyzja. Mecz. Wynik.” + HERO-002/003 + opcjonalny mini scorebug (tokeny) jako **dowód Live**, nie dashboard.

### S3 Sezon

- Jeden headline + trzy **edge-to-edge** panele lokacji (004/005/006) — bez ramek „card SaaS” (border hair ok, bez shadow stack).

### S4 Close

- Jak dziś intencją; Primary solid; tło thin pitch wash (color-mix), nie nowy asset.

## 5.4 Desktop width rules

| Breakpoint | Zachowanie                                                       |
| ---------- | ---------------------------------------------------------------- |
| ≥1200      | Hero full viewport width · story bands full · copy inset 48–64px |
| 768–1199   | Hero full · story 1-col lub 2-col bez max 64rem cap              |
| ≤767       | Stack · Primary 100% width                                       |

**Usunąć** sztuczne `max-width: 40rem` / `64rem` jako „cała strona”.  
Dopuszczalne: `max-width` **tylko** na bloku tekstu dla czytelności (36–42rem), nie na całej sekcji.

## 5.5 Poza zakresem IMPLEMENT (świadomie)

- Nowe World Art / Style Lock change.
- Zmiana tokenów kolorów / fontów.
- Social proof liczby graczy (GDD pytanie otwarte).
- Video trailer / 3D.
- A/B analytics infra.
- Zmiany Hub / AppShell.

---

# 6. DoD tego etapu (AUDIT ONLY)

- [x] RCA
- [x] UX Audit + benchmark
- [x] Nowy układ
- [x] Wireframe D/M
- [x] Hi-Fi proposal (+ wariant A/B)
- [ ] **Owner GO** (wybór Tunnel vs Pitch + akceptacja układu)
- [ ] IMPLEMENT (osobny etap — po GO)

---

# 7. Pytania do Ownera (blokery IMPLEMENT)

1. **Hero art:** Wariant **A Tunnel** czy **B Pitch**?
2. Czy akceptujesz usunięcie pustego SVG „Twój herb” z hero na rzecz full-bleed WA?
3. Czy Primary ma brzmieć nadal **„Załóż klub”**, czy wariant GDD **„Graj”** / „Załóż klub i graj”?
4. Czy sekcja S3 (3 lokacje) ma pokazywać **tylko atmosferę**, czy dopuszczalne są **statyczne cropy UI** (screenshot Hub/Live) — nadal bez nowych assetów?

---

# 8. Rekomendacja

**GO IMPLEMENT** po wyborze A/B i odpowiedzi na §7 — w ramach tokenów i WA już w repo.  
Szacunek IMPLEMENT: layout + CSS + podmiana visuals (bez logiki auth).

---

## Historia

| Wersja | Data       | Opis                                     |
| ------ | ---------- | ---------------------------------------- |
| 0.1.0  | 2026-07-29 | Audit + RCA + wireframe + Hi-Fi proposal |
