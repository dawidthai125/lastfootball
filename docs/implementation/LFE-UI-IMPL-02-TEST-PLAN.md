# LFE-UI-IMPL-02 — TEST PLAN

**EPIC:** LFE-UI-IMPL-02  
**Data:** 2026-07-29

---

## 0. Automatyczne

| Test            | Komenda                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| Match path unit | `npm run test -w @lastfootball/web -- src/lib/match/match-path.test.ts` |
| Hub CTA         | `npm run test -w @lastfootball/web -- src/lib/hub/hub01.test.ts`        |
| Typecheck       | `npm run typecheck -w @lastfootball/web`                                |

---

## 1. Manual — happy path

| ID  | Kroki              | Oczekiwane                                          |
| --- | ------------------ | --------------------------------------------------- |
| M1  | Hub ◆ Idź do meczu | `/match/{id}/tunnel` · **brak** BottomNav / LeftNav |
| M2  | Tunnel ◆ Wejdź     | `/vs` · HERO-003 · VS                               |
| M3  | VS ◆ Dalej         | `/match/{id}` checklist                             |
| M4  | Pre ◆ Start        | `/live` · Live scarlet                              |
| M5  | Gol w feed         | Overlay MOM-002 · dismiss · powrót Live             |
| M6  | FT                 | Final MOM-003 · ◆ Podsumowanie · Post · Hub         |

---

## 2. Desktop ↔ Mobile

| Check                      | Pass |
| -------------------------- | ---- |
| Te same trasy              |      |
| Primary full-width M       |      |
| Tunnel hero mobile asset   |      |
| Nav ukryty obu viewportach |      |

---

## 3. Stany

| Stan              | Jak                     |
| ----------------- | ----------------------- |
| Loading Live      | „Ładowanie meczu…”      |
| Pre incomplete XI | Primary disabled        |
| Error squad       | Panel kadra             |
| Soft-lock         | poza Match (nie w path) |

---

## Historia

| Wersja | Data       | Opis                 |
| ------ | ---------- | -------------------- |
| 0.1.0  | 2026-07-29 | Test plan Match Path |
