# LFE-UI-IMPL-06A — TEST PLAN

**EPIC:** LFE-UI-IMPL-06A  
**Data:** 2026-07-29

---

## 0. Automatyczne

| Test                              | Komenda                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| Layout / tooltip                  | `npm run test -w @lastfootball/web -- src/styles/impl-06a.test.ts` |
| Hub CTA regress                   | `src/lib/hub/hub01.test.ts`                                        |
| Shell tokens                      | `src/styles/impl-04.test.ts`                                       |
| typecheck / lint / format / build | root CI                                                            |

---

## 1. Manual — Desktop (≥1200)

| ID  | Kroki                                   | Oczekiwane                                                             |
| --- | --------------------------------------- | ---------------------------------------------------------------------- |
| D1  | Hub, rail zwinięty · hover każdej ikony | Instant PL label (np. Hub, Kadra, Trening) · bez opóźnienia OS `title` |
| D2  | Soft-lock ikona · hover + click         | Tooltip nazwy · modal soft-lock                                        |
| D3  | Rozwiń nav («)                          | Label inline · tooltip ukryty                                          |
| D4  | Hub szeroki monitor                     | Content wyśrodkowany · max ~72rem · brak ogromnej pustki po prawej     |
| D5  | Hero                                    | Wyraźnie wyższy pas (≥~300px) · HERO-001 czytelny                      |
| D6  | Matchday                                | Decision + Primary w jednym rzędzie · VS wyeksponowane                 |
| D7  | Twój klub / Secondary / status          | 2 kolumny · bez sztucznego rozciągania kart                            |

---

## 2. Manual — Mobile

| ID  | Kroki             | Oczekiwane                                  |
| --- | ----------------- | ------------------------------------------- |
| M1  | Hub ≤767          | Stack jak wcześniej · Primary full-width    |
| M2  | Bottom nav        | Labels widoczne · soft-lock bez regresji    |
| M3  | Hero mobile asset | `hero-001-office-mobile` · bez desktop crop |

---

## Quality Gate

PASS gdy D1–D7 + M1–M3 + CI GREEN.

---

## Historia

| Wersja | Data       | Opis               |
| ------ | ---------- | ------------------ |
| 0.1.0  | 2026-07-29 | Test plan IMPL-06A |
