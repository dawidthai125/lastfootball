# LFE-UI-IMPL-06 — TEST PLAN

**EPIC:** LFE-UI-IMPL-06  
**Data:** 2026-07-29

---

## 0. Automatyczne

| Test         | Komenda                                                           |
| ------------ | ----------------------------------------------------------------- |
| Fidelity CSS | `npm run test -w @lastfootball/web -- src/styles/impl-06.test.ts` |
| Post summary | `post-match01.test.ts` · `player-ratings01.test.ts`               |
| Match path   | `match-path.test.ts`                                              |
| Full suite   | root `test` · `typecheck` · `lint` · `build`                      |

---

## 1. Manual — Desktop

| ID  | Kroki      | Oczekiwane                                    |
| --- | ---------- | --------------------------------------------- |
| L1  | Live ≥1024 | 3 kolumny · Live scarlet · wynik+minuta       |
| L2  | Do przerwy | Banner **Przerwa · wynik** · mecz kontynuuje  |
| L3  | Gol        | Overlay MOM-002 · auto/tap dismiss · animacja |
| L4  | Koniec     | MOM-003 · ◆ Podsumowanie → Post               |
| P1  | Post       | Thin hero · wynik > Primary Hub · soft Replay |
| P2  | Context    | Gole / stats / oceny pod fold                 |

---

## 2. Manual — Mobile

| ID  | Kroki          | Oczekiwane                                          |
| --- | -------------- | --------------------------------------------------- |
| M1  | Live ≤767      | Scorebug stack · **boisko pierwsze** · feed · panel |
| M2  | Overlay / Post | Full-width Primary · touch ≥44                      |
| M3  | Brak XI        | EmptyState · link przedmecz                         |

---

## Quality Gate

PASS: L1–P2 · M1–M3 · CI GREEN · Production Verify.

---

## Historia

| Wersja | Data       | Opis              |
| ------ | ---------- | ----------------- |
| 0.1.0  | 2026-07-29 | Test plan IMPL-06 |
