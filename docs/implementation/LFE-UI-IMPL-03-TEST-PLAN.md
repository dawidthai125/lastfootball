# LFE-UI-IMPL-03 — TEST PLAN

**EPIC:** LFE-UI-IMPL-03  
**Data:** 2026-07-29

---

## 0. Automatyczne

| Test                 | Komenda                                                           |
| -------------------- | ----------------------------------------------------------------- |
| WA assets            | `npm run test -w @lastfootball/web -- src/styles/impl-03.test.ts` |
| Hub / Match regresja | `hub01` · `match-path` · `post-match01`                           |
| Domeny               | `squad01` · `training01` · `transfers01` · `economy01`            |
| Typecheck            | `npm run typecheck -w @lastfootball/web`                          |
| Format               | `npm run format:check`                                            |

---

## 1. Manual — domeny

| ID  | Kroki               | Oczekiwane                                       |
| --- | ------------------- | ------------------------------------------------ |
| S1  | `/squad`            | HERO-004 · pytanie · lista D+M                   |
| S2  | pusta kadra / error | EMP-002 · soft Hub/Trening                       |
| T1  | trening unlocked    | HERO-006 · ◆ Przeprowadź · pending copy          |
| T2  | trening locked      | SoftLock ILL-002 · Hub · bez fałszywego Odblokuj |
| X1  | okno otwarte        | HERO-005 · inbox · Confirm Accept                |
| X2  | okno zamknięte      | SoftLock ILL-003 · Hub                           |
| F1  | `/finance`          | HERO-007 · saldo · CTA Transfery                 |
| F2  | brak ruchów         | EMP-003                                          |
| L1  | wolne sieci / nav   | loading.tsx skeleton / LOD-007                   |

---

## 2. Regresja

| Check                             | Pass |
| --------------------------------- | ---- |
| Hub HERO-001 · Match Path         |      |
| PTI-01 SQD-03-M / XFR-02-M        |      |
| Nav soft-lock copy bez „Odblokuj” |      |

---

## Historia

| Wersja | Data       | Opis                   |
| ------ | ---------- | ---------------------- |
| 0.1.0  | 2026-07-29 | Test plan Core Domains |
