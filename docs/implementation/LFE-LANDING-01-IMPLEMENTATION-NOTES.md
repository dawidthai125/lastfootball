# LFE-LANDING-01 — IMPLEMENTATION NOTES

**EPIC:** LFE-LANDING-01  
**Data:** 2026-07-29  
**Zakres:** `/` marketing home only

---

## 1. Co zrobiono

| Obszar         | Zmiana                                                                   |
| -------------- | ------------------------------------------------------------------------ |
| Hero           | Full-bleed **HERO-002 Tunnel** (+ mobile) · brand · H1 · support · CTA   |
| Crest SVG      | **Usunięty** (`HeroCrest.tsx`)                                           |
| Primary CTA    | Solid `gold-base` / `text-on-gold` (jak Hub Primary) · copy „Załóż klub” |
| Support        | Rozszerzony opis pod H1 (Owner GO §4)                                    |
| Gabinet        | Band HERO-001 (+ mobile) + copy                                          |
| Match          | Band HERO-003 + static scorebug crop                                     |
| Sezon          | Edge strip HERO-004 / 005 / 006                                          |
| UI Showcase    | Static crops: Decision · Scorebug · XI (tokeny, bez logiki gry)          |
| Close + Footer | Solid Primary · legal bez zmian treści                                   |
| Layout         | Usunięte `max-width: 40rem/64rem` jako „cała strona” — full-bleed bands  |

## 2. Pliki

| Plik                   | Status                                  |
| ---------------------- | --------------------------------------- |
| `LandingPage.tsx`      | Rewrite                                 |
| `landing.css`          | Rewrite layout / CTA / bands / showcase |
| `LandingArt.tsx`       | **Nowy** — WA via `next/image`          |
| `LandingUiCrops.tsx`   | **Nowy** — static UI crops              |
| `StorySection.tsx`     | Full-width bands                        |
| `HeroCrest.tsx`        | **Usunięty**                            |
| `index.ts`             | Eksporty                                |
| `(marketing)/page.tsx` | Komentarz EPIC                          |

## 3. Świadomie poza zakresem

- Zmiany World Art PNG / DNA / tokenów / brandingu
- Hub / AppShell / Live logika
- Auth flow (reuse CTA styles — solid Primary także na `/login` submit)
- Nowe ilustracje / screenshot PNG assets

## 4. Performance (LCP / CLS)

- Hero Image: `priority` + `fill` + responsive desktop/mobile sources
- Stałe `aspect-ratio` / `min-height` na band art → ograniczenie CLS
- `prefers-reduced-motion`: bez enter / reveal animacji

## 5. Regresje do pilnowania

- Auth pages nadal używają `landing.css` + `LandingCta` — Primary wygląda solidniej (zamierzone)
- Wizard Club używa klas `lf-landing__cta` — spójność z nowym Primary

---

## Historia

| Wersja | Data       | Opis                  |
| ------ | ---------- | --------------------- |
| 1.0.0  | 2026-07-29 | IMPLEMENT po Owner GO |
