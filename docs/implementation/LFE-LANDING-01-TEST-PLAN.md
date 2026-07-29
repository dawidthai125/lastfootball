# LFE-LANDING-01 — TEST PLAN

**EPIC:** LFE-LANDING-01  
**Data:** 2026-07-29  
**Cel:** Quality Gate PASS przed merge / CI GREEN

---

## 1. Manual — Desktop (≥1200)

| #   | Test               | Oczekiwane                                                              |
| --- | ------------------ | ----------------------------------------------------------------------- |
| D1  | `/` first viewport | Tunnel full-bleed · brand · H1 · support · solid ◆ Załóż klub           |
| D2  | Szerokość          | Brak wąskiej „kartki” 40rem; bands / season strip wykorzystują viewport |
| D3  | Brak SVG herbu     | Brak „Twój herb” / crest                                                |
| D4  | Gabinet            | HERO-001 widoczny + copy                                                |
| D5  | Mecz               | HERO-003 + scorebug crop (Live chip)                                    |
| D6  | Sezon              | 3 panele 004/005/006 edge                                               |
| D7  | UI Showcase        | 3 crops: Decision / Scorebug / XI                                       |
| D8  | Close              | Solid „Załóż klub” → `/register`                                        |
| D9  | Header Zaloguj     | → `/login`                                                              |
| D10 | Footer             | Regulamin / Polityka                                                    |

## 2. Manual — Tablet (768–1199)

| #   | Test     | Oczekiwane                                |
| --- | -------- | ----------------------------------------- |
| T1  | Hero     | Full-bleed · copy lewo/dół · CTA czytelne |
| T2  | Story    | 2-col grid bez pustej pustki centralnej   |
| T3  | Season   | 3 kolumny                                 |
| T4  | Showcase | 3 kolumny                                 |

## 3. Manual — Mobile (≤767)

| #   | Test          | Oczekiwane                                    |
| --- | ------------- | --------------------------------------------- |
| M1  | Hero          | `hero-002-tunnel-mobile` · Primary full-width |
| M2  | Stack         | Wszystkie sekcje 1-col                        |
| M3  | Season        | Stack paneli                                  |
| M4  | Showcase      | Stack crops                                   |
| M5  | Brak H-scroll | `overflow` OK                                 |

## 4. Responsive / a11y

| #   | Test                     | Oczekiwane                              |
| --- | ------------------------ | --------------------------------------- |
| R1  | Resize 360→1440          | Bez layout break                        |
| R2  | `prefers-reduced-motion` | Story visible od razu · brak enter anim |
| R3  | Focus CTA                | Widoczny focus ring Primary             |
| R4  | Landmarky                | Hero / sekcje z `aria-labelledby`       |

## 5. Performance

| #   | Test                              | Oczekiwane                                                   |
| --- | --------------------------------- | ------------------------------------------------------------ |
| P1  | LCP                               | Hero Tunnel (Image priority) — bez dużego CLS na first paint |
| P2  | CLS                               | Band art ma aspect-ratio / min-height                        |
| P3  | Lighthouse (opcjonalnie lokalnie) | Brak regresji krytycznej vs poprzedni landing                |

## 6. Automatyczne (CI)

| #   | Komenda             | Oczekiwane |
| --- | ------------------- | ---------- |
| A1  | `npm run typecheck` | PASS       |
| A2  | `npm run test`      | PASS       |
| A3  | `npm run build`     | PASS       |
| A4  | GitHub Actions CI   | **GREEN**  |

## 7. Regresja poza Landing

| #   | Test                    | Oczekiwane                     |
| --- | ----------------------- | ------------------------------ |
| X1  | `/login` · `/register`  | Formy działają · Primary solid |
| X2  | Hub / Live / Match Path | **Bez zmian** (nie ruszane)    |

## 8. Quality Gate checklist

- [x] Landing wykorzystuje szerokość desktopu
- [x] Hero daje efekt „wow” (Tunnel)
- [x] CTA wyraźnie eksponowane (solid gold)
- [x] Pokazane rzeczywiste elementy gry (WA + UI crops)
- [x] Desktop i Mobile spójne
- [x] CI GREEN (`c6c67dd`)

---

## Historia

| Wersja | Data       | Opis                |
| ------ | ---------- | ------------------- |
| 1.0.0  | 2026-07-29 | Test plan IMPLEMENT |
