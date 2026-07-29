# LFE-UI-IMPL-04 — TEST PLAN

**EPIC:** LFE-UI-IMPL-04  
**Data:** 2026-07-29

---

## 0. Automatyczne

| Test                      | Komenda                                                           |
| ------------------------- | ----------------------------------------------------------------- |
| Shell tokens              | `npm run test -w @lastfootball/web -- src/styles/impl-04.test.ts` |
| Regresja                  | `impl-01` · `impl-03` · `hub01` · `match-path`                    |
| Typecheck / lint / format | root scripts                                                      |

---

## 1. Manual

| ID  | Kroki             | Oczekiwane                                       |
| --- | ----------------- | ------------------------------------------------ |
| D1  | Desktop `/hub`    | Icon rail ~80px default · TopBar 52 · kasa muted |
| D2  | Toggle nav        | Expanded ~160 · labels · active tick gold        |
| D3  | Locked nav item   | SoftLockModal · ○ Hub outline · Zamknij          |
| M1  | Mobile Hub        | Bottom nav 5 · safe-area                         |
| M2  | Więcej            | Sheet · 44px rows · locked → modal               |
| S1  | Soft-lock trening | Exit Hub **nie** gold Primary                    |
| R1  | Match Path        | chrome nadal ukryty                              |

---

## Historia

| Wersja | Data       | Opis             |
| ------ | ---------- | ---------------- |
| 0.1.0  | 2026-07-29 | Test plan polish |
