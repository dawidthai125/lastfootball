# LFE-UI-IMPL-05 — TEST PLAN

**EPIC:** LFE-UI-IMPL-05  
**Data:** 2026-07-29

---

## 0. Automatyczne

| Test                      | Komenda                                                                           |
| ------------------------- | --------------------------------------------------------------------------------- |
| XI validate/compose       | `npm run test -w @lastfootball/web -- src/lib/squad/validate-starting-xi.test.ts` |
| Match path                | `src/lib/match/match-path.test.ts`                                                |
| Squad regress             | `squad01.test.ts`                                                                 |
| Typecheck / lint / format | root                                                                              |

---

## 1. Manual

| ID  | Kroki             | Oczekiwane                            |
| --- | ----------------- | ------------------------------------- |
| X1  | Pre ○ Ustaw skład | `/match/{id}/xi` · HERO-004 · bez Nav |
| X2  | Swap XI↔ławka     | selection + wymiana                   |
| X3  | XI bez BR         | error · Primary disabled              |
| X4  | ◆ Zapisz i dalej  | persist · Live                        |
| X5  | Soft checklist    | powrót Pre                            |
| M1  | Mobile            | Primary full-width · rows ≥44         |

---

## Historia

| Wersja | Data       | Opis               |
| ------ | ---------- | ------------------ |
| 0.1.0  | 2026-07-29 | Test plan Match XI |
