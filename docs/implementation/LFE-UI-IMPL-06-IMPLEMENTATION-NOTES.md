# LFE-UI-IMPL-06 — IMPLEMENTATION NOTES

**EPIC:** LFE-UI-IMPL-06  
**Data:** 2026-07-29  
**Wejście:** IMPL-06A `00b2c2a`

---

## 0. Raport

| Obszar          | Zmiana                                                      |
| --------------- | ----------------------------------------------------------- |
| Live stage      | `live-match.css` · mobile pitch-first · desktop 3-col ≥1024 |
| Scorebug / Live | Klasy Hi-Fi · scarlet chip                                  |
| Half-time       | Soft banner `Przerwa · wynik` gdy `periodLabel=Przerwa`     |
| Loading         | `LoadingFrame` LOD                                          |
| Goal / Final    | Enter fade/slide · reduced-motion                           |
| Post            | Thin HERO-003 · Decision · Primary=continue · soft Replay   |
| Empty XI → Live | `EmptyState` + linki przedmecz / Kadra                      |
| PL residual     | Przebieg / Wszystkie / Po meczu                             |

**Nie zmieniono:** silnik · DTO · DNA · WA assety (użyto istniejących) · IA · `UI_COPY` wartości.

---

## 1. Pliki

| Ścieżka                                         | Rola              |
| ----------------------------------------------- | ----------------- |
| `components/match/live-match.css`               | Live layout       |
| `components/match/LiveMatchFoundation.tsx`      | HT · stage · load |
| `components/match/match-path.css`               | Overlay motion    |
| `components/match/post-match/post-match.css`    | Post decision     |
| `components/match/post-match/PostMatchView.tsx` | HF-MCH-08         |
| `app/(game)/match/[id]/live/page.tsx`           | EmptyState        |
| `styles/impl-06.test.ts`                        | Guardy            |

---

## 2. DoD

| Gate                  | Status |
| --------------------- | ------ |
| Live → Post ≈ Hi-Fi   | ✓      |
| D↔M parity            | ✓      |
| Brak regresji silnika | ✓      |
| typecheck · test · CI | ✓      |

---

## 3. Rekomendacja

**LFE-UI-MOTION-01** (motion system Hub/Match) lub **LFE-DOCS-BASELINE-01** (sync tip/status docs).

---

## Historia

| Wersja | Data       | Opis                     |
| ------ | ---------- | ------------------------ |
| 0.1.0  | 2026-07-29 | Notes Live/Post fidelity |
