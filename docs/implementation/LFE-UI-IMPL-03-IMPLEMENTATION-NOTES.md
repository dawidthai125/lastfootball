# LFE-UI-IMPL-03 — IMPLEMENTATION NOTES

**EPIC:** LFE-UI-IMPL-03  
**Data:** 2026-07-29  
**Wejście:** DOCS-SYNC PASS · IMPL-01/02

---

## 0. Raport

| Domena    | Zmiana                                                                                             |
| --------- | -------------------------------------------------------------------------------------------------- |
| Squad     | LocationHero **HERO-004** · Empty **EMP-002** · error Empty · loading route                        |
| Training  | HERO-006 · SoftLock **ILL-002** gdy `!canTrain` · Hub soft · StateBanner error                     |
| Transfers | HERO-005 · SoftLock **ILL-003** gdy okno zamknięte · ConfirmSubmit Accept                          |
| Finance   | HERO-007 · Empty **EMP-003** · loading **LOD-007**                                                 |
| Shared    | `LocationHero` · `SoftLockState` · `EmptyState` · `LoadingFrame` · `StateBanner` · `ConfirmSubmit` |

**Nie zmieniono:** Visual DNA · Style Lock · IA · resolvery domenowe · PTI-01 CSS.

---

## 1. Pliki kluczowe

| Ścieżka                                                             | Rola             |
| ------------------------------------------------------------------- | ---------------- |
| `components/ui/LocationHero.tsx` (+ domain-states.css)              | Hero WA          |
| `components/ui/SoftLockState.tsx`                                   | TRN-02 / XFR-03  |
| `components/ui/EmptyState.tsx`                                      | EMP-*            |
| `components/ui/LoadingFrame.tsx`                                    | loading.tsx      |
| `components/ui/StateBanner.tsx` · `DomainError.tsx`                 | error            |
| `components/ui/ConfirmSubmit.tsx`                                   | XFR settle       |
| `squad                                                              | training         | transfers | finance/*View.tsx` | domeny |
| `app/(game)/{squad,training,transfers,finance}/{loading,error}.tsx` | stany route      |
| `public/assets/world-art/hero-004…007` · emp/ill/lod/ico            | WA z rejestru 04 |

---

## 2. DoD

| Gate                                | Status      |
| ----------------------------------- | ----------- |
| 4 domeny P0                         | ✓           |
| loading / empty / error / soft-lock | ✓           |
| D↔M parity · PTI-01                 | ✓           |
| Hi-Fi / WA                          | ✓           |
| typecheck · testy                   | ✓           |
| CI GREEN                            | ✓ (po push) |

---

## 3. Świadome ograniczenia

- Modal confirm = inline ConfirmSubmit (nie pełny SYS-05 overlay) — wystarczające dla settle Accept.
- Kit thumbs `SHT-*` na każdym PlayerRow = soft polish (asset skopiowany, nie wszędzie podpięty).
- Transfers empty inbox pozostał tekstowy (P1 ILL-004 poza ścisłym P0).

---

## 4. Rekomendacja

# **GO — LFE-UI-IMPL-04** (Shell polish / More / Academy soft / fidelity P2)

albo **LFE-UI-IMPL-04 Match + XI** jeśli Owner priorytetyzuje SCR-SQD-04.

---

## Historia

| Wersja | Data       | Opis                  |
| ------ | ---------- | --------------------- |
| 0.1.0  | 2026-07-29 | Notes Core Domains P0 |
