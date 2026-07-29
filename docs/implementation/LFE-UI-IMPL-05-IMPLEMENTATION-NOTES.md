# LFE-UI-IMPL-05 — IMPLEMENTATION NOTES

**EPIC:** LFE-UI-IMPL-05  
**Data:** 2026-07-29  
**Wejście:** IMPL-04 `d9bb5b6`

---

## 0. Raport

| Element                                   | Status       |
| ----------------------------------------- | ------------ |
| Route `/match/[id]/xi`                    | ✓ SCR-SQD-04 |
| MatchXiView · sloty · selection · warn    | ✓            |
| `validateStartingXi` · `applyXiSelection` | ✓            |
| `saveStartingXi` → `players.starter`      | ✓            |
| Pre soft → XI (nie `/squad`)              | ✓            |
| ◆ Zapisz i dalej → Live                   | ✓            |
| HERO-004 · immersive Match Path           | ✓            |
| D↔M (full-width Primary M)                | ✓            |

**Nie zmieniono:** DNA · Style Lock · IA Hub≠Skład · silnik meczu.

---

## 1. Pliki

| Ścieżka                                             | Rola                  |
| --------------------------------------------------- | --------------------- |
| `app/(game)/match/[id]/xi/page.tsx`                 | Page                  |
| `components/match/MatchXiView.tsx` · `match-xi.css` | UI                    |
| `lib/squad/validate-starting-xi.ts`                 | Pure compose/validate |
| `lib/squad/actions.ts`                              | Persist XI            |
| `lib/match/match-path.ts`                           | `matchXiPath`         |
| `components/match/PreMatchView.tsx`                 | Soft link             |

---

## 2. DoD

| Gate                    | Status |
| ----------------------- | ------ |
| Match XI zgodny z Hi-Fi | ✓      |
| D↔M                     | ✓      |
| WA HERO-004             | ✓      |
| testy · typecheck · CI  | ✓      |

---

## 3. Rekomendacja

# **GO — LFE-UI-IMPL-06** (Half-time / Live polish / soft domains)

lub **LFE-CONTENT-PASS-01** (copy residual) jeśli Owner zamyka UI P0.

---

## Historia

| Wersja | Data       | Opis           |
| ------ | ---------- | -------------- |
| 0.1.0  | 2026-07-29 | Notes Match XI |
