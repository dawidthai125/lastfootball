# LFE-UI-IMPL-05 — PLAN

**EPIC:** LFE-UI-IMPL-05  
**Etap:** MATCH XI / SQUAD COMPOSITION  
**Data:** 2026-07-29  
**Wejście:** IMPL-04 PASS (`d9bb5b6`)

---

## 0. Cel

SCR-SQD-04 / HF-SQD-04: ustawienie XI w Match Path (nie z Hub Nav „Kadra”), D+M, bez zmiany Match Flow / DNA.

---

## 1. Mapowanie

| Spec      | Implementacja                             |
| --------- | ----------------------------------------- |
| Route     | `/match/[id]/xi`                          |
| Wejście   | Pre ○ „Ustaw skład” → XI                  |
| Wyjście ◆ | Zapisz → Live (`MCH-04`)                  |
| Soft      | Wróć → Pre (`MCH-03`)                     |
| WA        | LocationHero HERO-004                     |
| Persist   | `players.starter` via server action       |
| SSOT      | `resolveClubSquad` · `validateStartingXi` |

---

## 2. UI

1. Decision „Ustaw skład (XI)”
2. Sloty XI (11) + ławka
3. Selection: tap XI ↔ tap ławka = swap
4. Warn: ≠11 · brak BR · INJURED/SUSPENDED w XI
5. ◆ Zapisz i dalej (disabled gdy invalid)

---

## 3. DoD

- [ ] XI działa w Match Path
- [ ] D↔M parity
- [ ] Walidacja + save
- [ ] Pre soft → `/xi` (nie `/squad`)
- [ ] typecheck · test · CI

---

## Historia

| Wersja | Data       | Opis          |
| ------ | ---------- | ------------- |
| 0.1.0  | 2026-07-29 | Plan Match XI |
