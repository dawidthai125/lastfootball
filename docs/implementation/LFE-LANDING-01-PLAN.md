# LFE-LANDING-01 — PLAN (IMPLEMENTATION)

**EPIC:** LFE-LANDING-01  
**Etap:** IMPLEMENTATION  
**Data:** 2026-07-29  
**Wejście:** Owner GO · Audit `docs/game-design/LFE-LANDING-01-AUDIT-PROPOSAL.md`  
**Zakres:** wyłącznie `/` (marketing home)

---

## 0. Decyzje Ownera (lock)

| #   | Decyzja          | Wartość                                                            |
| --- | ---------------- | ------------------------------------------------------------------ |
| 1   | Hero             | **A — Tunnel** (`HERO-002` + mobile)                               |
| 2   | SVG „Twój herb”  | **Usunąć**                                                         |
| 3   | Primary CTA copy | **„Załóż klub”**                                                   |
| 4   | Support          | Krótki opis pod H1                                                 |
| 5   | S3 / Showcase    | World Art + **statyczne cropy UI** (tokeny, bez nowych ilustracji) |

**Bez zmian:** World Art pliki · Visual DNA · Design System · tokeny · branding.

---

## 1. Cel

Landing w jakości UI P0:

- pełna szerokość desktopu,
- hero „wow” (full-bleed Tunnel),
- wyraźne Primary CTA (solid gold jak Hub),
- prezentacja produktu (gabinet · mecz · sezon · UI crops),
- konwersja → `/register`,
- spójność Desktop / Tablet / Mobile.

---

## 2. IA sekcji (to-be)

| #   | Sekcja           | Implementacja                                               |
| --- | ---------------- | ----------------------------------------------------------- |
| 1   | Header           | Istniejący `LandingHeader`                                  |
| 2   | Hero Tunnel      | Full-bleed `hero-002-tunnel-*` · brand · H1 · support · CTA |
| 3   | CTA              | Primary solid + Secondary w hero (+ close)                  |
| 4   | Gabinet          | Band HERO-001 + copy tożsamości                             |
| 5   | Match Experience | Band HERO-003 + static scorebug crop                        |
| 6   | Sezon            | Edge strip HERO-004 / 005 / 006                             |
| 7   | UI Showcase      | Static crops: Decision · Scorebug · XI strip                |
| 8   | Closing CTA      | Solid „Załóż klub”                                          |
| 9   | Footer           | Legal (bez zmian treści)                                    |

---

## 3. Pliki

| Plik                          | Akcja                                     |
| ----------------------------- | ----------------------------------------- |
| `LandingPage.tsx`             | Rewrite sekcji                            |
| `landing.css`                 | Full-bleed layout · Primary solid · bands |
| `LandingUiCrops.tsx`          | Nowe — static UI crops (tokeny)           |
| `LandingArt.tsx`              | Nowe — WA `<picture>` / Image helpers     |
| `StorySection.tsx`            | Band full-width (bez max 64rem)           |
| `HeroCrest.tsx`               | Usunąć                                    |
| `index.ts`                    | Eksporty                                  |
| Docs PLAN / NOTES / TEST-PLAN | Ten EPIC                                  |

**Nie ruszamy:** AppShell · Hub · Live logika · auth flow · WA PNG.

---

## 4. Quality Gate

- [x] Desktop wykorzystuje szerokość
- [x] Hero wow (Tunnel full-bleed)
- [x] CTA wyraźne (solid gold)
- [x] Rzeczywiste elementy gry (WA + UI crops)
- [x] Desktop / Mobile spójne
- [x] typecheck · test · build (lokalnie PASS) · CI — po push

---

## Historia

| Wersja | Data       | Opis                             |
| ------ | ---------- | -------------------------------- |
| 1.0.0  | 2026-07-29 | Plan IMPLEMENT po Owner GO       |
| 1.1.0  | 2026-07-29 | Implementacja zamknięta lokalnie |
