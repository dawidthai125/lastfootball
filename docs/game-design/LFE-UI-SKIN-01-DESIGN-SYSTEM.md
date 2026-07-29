# LFE-UI-SKIN-01 — DESIGN SYSTEM FOUNDATION

**EPIC:** LFE-UI-SKIN-01  
**Etap:** DESIGN SYSTEM FOUNDATION  
**Status:** DRAFT — architektura UI (bez React · bez CSS · bez nowych assetów)  
**Data:** 2026-07-28

> World Art: **CLOSED** · Style Lock: **ACTIVE** · DNA: **LOCKED** · Board: **v02**  
> Handoff: [`LFE-WORLD-ART-05-UI-HANDOFF.md`](./LFE-WORLD-ART-05-UI-HANDOFF.md)  
> Rejestr: [`LFE-WORLD-ART-05-ASSET-REGISTRY.md`](./LFE-WORLD-ART-05-ASSET-REGISTRY.md)  
> Kontrakt UX: [`UI_DESIGN_GUIDE.md`](./UI_DESIGN_GUIDE.md) **§16** (nadrzędny dla decyzji)  
> Kierunek wizualny: [`LFE-ART-DIRECTION-01-AUDIT.md`](./LFE-ART-DIRECTION-01-AUDIT.md) · [`LFE-WORLD-ART-03-VISUAL-DNA.md`](./LFE-WORLD-ART-03-VISUAL-DNA.md)

**Zasada EPICu:** nie projektujemy nowego stylu — skórujemy UI na zatwierdzonym Night Pitch Office.

---

## 0. Misja DS

Design System LastFootball = **warstwa chrome decyzji** na świecie klubu.

| Robimy                            | Nie robimy                            |
| --------------------------------- | ------------------------------------- |
| Tokeny koncepcyjne + zasady skóry | Implementacja React / CSS w tym EPICu |
| Mapowanie lokacji → World Art     | Nowe grafiki / zmiana DNA             |
| Komponenty bazowe (spec)          | Zmiana DTO / resolverów / unlock      |
| Stany interakcji                  | KPI dashboard SaaS                    |

**Rozbieżność §16 vs DS:** wygrywa **§16** (decision-first).  
**Rozbieżność DS vs World Art:** wygrywa **Style Lock + DNA + Board v02**.

---

## 1. Zasady UI (fundament)

1. **Miejsce przed panelem** — każdy ekran należy do lokacji świata (DNA Z1).
2. **Decision-first** — Hero → Decision → Context (§16.2).
3. **Jedno Primary CTA** — gold; Secondary ≤5 na Hubie; soft-linki muted.
4. **Atmosfera ≤ ~10%** — World Art BG/hero nie wygrywa z decyzją (DNA Z7).
5. **Chrome wspiera** — TopBar / Nav nie tworzą drugiego dashboardu.
6. **Ikony World Art** — brass outline; bez Material/Fluent rewrite.
7. **Clubtint ≤ 1** — kolor klubu gracza jako pojedynczy akcent.
8. **Scarlet rare** — tylko Live (`ICO-016` / Live badge).
9. **Karty rzadko** — kontener z border/tłem tylko gdy niesie interakcję.
10. **Brak purple / photoreal / cream-editorial** — anti-DNA + Guide §16.7.12.

---

## 2. Spacing

Skala **4-based** (koncepcja; mapowanie na `--lf-*` w późniejszym EPIC tokenów).

| Token      | px  | Użycie                            |
| ---------- | --- | --------------------------------- |
| `space.0`  | 0   | Reset                             |
| `space.1`  | 4   | Micro gap (ikona–label)           |
| `space.2`  | 8   | Inline cluster                    |
| `space.3`  | 12  | Gęsta lista / chip                |
| `space.4`  | 16  | Domyślny gap sekcji wewnętrznej   |
| `space.5`  | 20  | —                                 |
| `space.6`  | 24  | Między blokami Decision / Context |
| `space.8`  | 32  | Sekcja ↔ sekcja                   |
| `space.10` | 40  | First viewport breathing          |
| `space.12` | 48  | Hero padding desktop              |
| `space.16` | 64  | Rare page rhythm                  |

**Zasady:**

- First viewport: więcej powietrza wokół Primary niż wokół Context.
- Mobile: Primary full-width; touch target ≥ **44px**.
- Nie „12 równych kart z gap 16” na Hubie (anti KPI wall).

---

## 3. Grid

| Breakpoint        | Kolumny | Gutter | Margin | Uwagi                                          |
| ----------------- | ------- | ------ | ------ | ---------------------------------------------- |
| Mobile `<768`     | 4       | 16     | 16     | Lista / stack; bottom nav Variant A            |
| Tablet `768–1199` | 8       | 20     | 24     | Decision + Context stack lub 5+3               |
| Desktop `≥1200`   | 12      | 24     | 32–48  | Hero pełna szerokość; Context max ~8–10 kolumn |

**Layout shell (koncepcja):**

```
[ TopBar — chrome thin ]
[ Nav rail / bottom — lokacje ]
[ Main: Hero (full) → Decision → Context ]
```

- Right rail: tylko gdy wspiera decyzję; na Hubie **off / lekki**.
- Hero World Art: full-bleed lub edge-aware crop — **nie** inset card gallery.

---

## 4. Typography

Zestaw z Art Direction Audit (kierunek DS 2.0) — **nie Inter/Roboto/Arial** jako tożsamość.

| Rola        | Kierunek kroju             | Token skali                  | Użycie                           |
| ----------- | -------------------------- | ---------------------------- | -------------------------------- |
| Display     | Archivo Black / Bebas Neue | `type.display` 40–48 / 28–32 | Kick-off, post-match, rare brand |
| Heading UI  | Archivo 600–700            | `type.h1` 24–28 / 20–22      | Pytanie dnia / sprawa            |
| Subhead     | Archivo                    | `type.h2` 16–18              | Sekcje Context                   |
| Body        | Source Sans 3              | `type.body` 14               | Listy, wyjaśnienie 1 zdanie      |
| Caption     | Source Sans 3              | `type.caption` 12            | Meta                             |
| Label       | Archivo / Source caps      | `type.label` 11 + tracking   | Sekcje chrome                    |
| Score / VS  | Archivo tabular            | `type.score` 28–36           | Wynik                            |
| KPI (max 1) | Archivo tabular            | `type.kpi` 18–22             | Pojedyncza liczba kontekstu      |

**Kolory tekstu (koncepcja):** `text.primary #EDF2F8` · `secondary #C5D0DE` · `muted #8494A8` · `gold #C9A85C` · `on-gold #12100A`.

**Zasady:** Display nie konkuruje z Brand na first viewport Hub (wyjątek: match moments). H1 = decyzja, nie „Dashboard”.

---

## 5. Elevation & surfaces

Warstwy głębokości Night Pitch Office (nie Material ladder 0–24):

| Poziom    | Token koncept    | Hex kierunek | Rola                  |
| --------- | ---------------- | ------------ | --------------------- |
| 0 Void    | `bg.void`        | `#02060C`    | Za teksturą World Art |
| 1 Base    | `bg.base`        | `#07111C`    | Body                  |
| 2 Raised  | `bg.raised`      | `#0C1826`    | Chrome TopBar/Nav     |
| 3 Surface | `bg.surface`     | `#101E2E`    | Treść decyzji         |
| 4 Alt     | `bg.surface-alt` | `#142536`    | Alternacja wierszy    |
| 5 Inset   | `bg.inset`       | `#060E18`    | Input / well          |
| Hover     | `bg.hover`       | `#1A2C40`    | Row / nav             |

**World Art layers (kolejność od tyłu):**

1. Void / grain (`BG-001` / `TEX-001`)
2. Location BG lub Hero (≤10% uwagi gdy pod UI)
3. Optional flood wash / mist (`FLD-*` · pitch mist)
4. Surface chrome
5. Treść + CTA

---

## 6. Shadows

| Token              | Spec koncepcyjna               | Kiedy                            |
| ------------------ | ------------------------------ | -------------------------------- |
| `shadow.none`      | —                              | Default flat surfaces            |
| `shadow.soft`      | `0 12px 32px` rgba(0,0,0,0.35) | Modal / decision sheet           |
| `shadow.deep`      | `0 20px 48px` rgba(0,0,0,0.45) | Rare prestige panel              |
| `shadow.glow-gold` | radial soft gold @ 8–12%       | Primary CTA fokus (subtelnie)    |
| `shadow.flood`     | corner wash z `FLD-003`        | Matchday — nie na każdym ekranie |

**Zakaz:** multi-layer neon glow, purple bloom, ostre Material elevation chips.

---

## 7. Icon usage

| Źródło      | ID (przykłady)            | Reguła                                           |
| ----------- | ------------------------- | ------------------------------------------------ |
| Nav core    | `ICO-001…007`, `013…015`  | Outline brass ~1.75–2px; active = gold-soft fill |
| Depth       | `ICO-009·010·012·022·023` | Te same stroke family                            |
| Fan / match | `ICO-024…026·028`         | Moments / badges                                 |
| Live        | `ICO-016`                 | Scarlet rare                                     |
| Form        | `ICO-017…019`             | W/D/L                                            |
| Soft-lock   | `ICO-020`                 | Access                                           |

**Must:**

- Używaj assetów z rejestru — nie zamieniaj na Lucide „gear farm”.
- Active state: outline gold + soft fill — nie thick filled Material icon.
- Size touch: min 24px glyph w 44px hit area.

**Must-not:**

- Kolorowe ikony rainbow.
- Photoreal glyph.
- Marketing key art jako ikona nav.

---

## 8. Kolor & semantyka (skrót DS)

| Rola            | Hex kierunek | Użycie UI              |
| --------------- | ------------ | ---------------------- |
| Brass primary   | `#C9A85C`    | Primary CTA, fokus     |
| Brass deep      | `#8B7340`    | Border prestige, press |
| Pitch success   | `#3F9A6A`    | W / OK                 |
| Danger          | `#C24B4B`    | L / błąd               |
| Warn            | `#C9A23A`    | Soft-lock / remis      |
| Info            | `#5B84A8`    | Tip                    |
| Live            | `#D62828`    | Live only              |
| Border subtle   | `#24364C`    | Default                |
| Border prestige | `#8B7340`    | Strefa decyzji         |

Club primary = dynamic slot (max 1 dominant / view).

---

## 9. Komponenty bazowe (spec)

> Specyfikacja behawioralna — **nie** kod.

| Komponent               | Rola                        | World Art                         | Uwagi                       |
| ----------------------- | --------------------------- | --------------------------------- | --------------------------- |
| **AppShell**            | TopBar + Nav + Main         | `BG-001`, grain                   | Chrome thin                 |
| **TopBar**              | Crest · kasa soft · session | `BRD-003` / crest · clubtint tick | Bez KPI wall                |
| **NavItem**             | Lokacja                     | `ICO-*`                           | Active gold-soft            |
| **LocationHero**        | First viewport atmosphere   | `HERO-*` / `BG-*`                 | ≤10% pod Decision           |
| **DecisionBlock**       | Pytanie + Primary           | —                                 | §16 dialekt                 |
| **PrimaryButton**       | Jedyna dominant akcja       | brass                             | `on-gold` text              |
| **SecondaryButton**     | Pętla / alt                 | slate                             | ≤5 Hub                      |
| **SoftLink**            | Sąsiad pętli                | —                                 | Muted underline             |
| **ContextList / Table** | Browse pod decyzją          | surface-alt                       | Nie first viewport wall     |
| **PlayerRow**           | Kadra                       | `SHT-*` opcjonalnie               | Decision > lista            |
| **StatusChip**          | W/D/L · Live · Lock         | `ICO-016…020`                     | + label                     |
| **EmptyState**          | Brak treści                 | `EMP-*` · `ILL-*`                 | CTA „co dalej”              |
| **SoftLockState**       | Unlock                      | `ILL-002/003/011` · `ICO-020`     | Konsumuj `resolveNavAccess` |
| **Modal / Sheet**       | Potwierdzenie               | shadow.soft                       | 1 Primary                   |
| **Toast / Banner**      | Feedback krótki             | —                                 | Bez overlay hero stickers   |
| **MatchMomentOverlay**  | Gol / gwizdek               | `MOM-*` · `SUP-*`                 | Rare; nie Hub idle          |
| **LoadingFrame**        | Route load                  | `LOD-*`                           | Tips: `LOD-005`             |
| **Badge**               | Matchday / prestige         | `BDG-*`                           | Flavor                      |

**Karty:** tylko gdy kontener = interakcja (np. wybór oferty). Default = lista / row na surface.

---

## 10. Stany interakcji

Każdy interaktywny element:

| Stan                 | Zachowanie wizualne                                          |
| -------------------- | ------------------------------------------------------------ |
| **Default**          | Surface / outline brass icons                                |
| **Hover**            | `bg.hover`; border → strong; bez parallax                    |
| **Focus**            | Ring brass soft (a11y); widoczny klawiaturą                  |
| **Active / Pressed** | Gold deep; lekki scale ≤2% opcjonalnie                       |
| **Selected**         | Gold-soft fill + prestige border                             |
| **Disabled**         | Opacity ↓ + brak hover; nie „szary SaaS flat” przypadkowy    |
| **Loading**          | Skeleton inset / spinner dyskretny; hero bez losowego tekstu |
| **Error**            | Danger + ikona + copy gracza                                 |
| **Empty**            | `EMP`/`ILL` + jedno Secondary/Primary „co zrobić”            |
| **Soft-lock**        | Desat + lock icon + wyjaśnienie unlock (resolver)            |

**Motion (2–3 wzorce globalne):**

1. Hub → detal: fade/slide krótki ease-out.
2. Primary press: gold feedback.
3. Match moment: `MOM-*` bloom rare.

Szanuj `prefers-reduced-motion`.

---

## 11. Mapowanie warstw ekranu

```
Void + Grain
  → Location Hero/BG (World Art)
    → optional Flood/Mist (≤ budget)
      → Shell chrome
        → DecisionBlock (Primary)
          → Context
```

---

## 12. DoD fundamentu DS (ten EPIC)

- [x] Zasady UI zgodne z §16 + DNA + Handoff
- [x] Spacing / grid / typography / elevation / shadows opisane
- [x] Icon usage ze World Art
- [x] Komponenty bazowe + stany
- [ ] Wireframes (kolejny etap)
- [ ] Tokeny w kodzie / React (późniejszy EPIC)

---

## Historia

| Wersja | Data       | Opis                                    |
| ------ | ---------- | --------------------------------------- |
| 0.1.0  | 2026-07-28 | Foundation DS · architektura · bez kodu |
