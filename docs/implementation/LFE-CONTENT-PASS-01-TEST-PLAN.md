# LFE-CONTENT-PASS-01 — TEST PLAN

**EPIC:** LFE-CONTENT-PASS-01  
**Data:** 2026-07-29

---

## 0. Automatyczne

| Test                      | Komenda                                                          |
| ------------------------- | ---------------------------------------------------------------- |
| Glossary                  | `npm run test -w @lastfootball/web -- src/lib/ui/copy.test.ts`   |
| Hub CTA labels            | `npm run test -w @lastfootball/web -- src/lib/hub/hub01.test.ts` |
| Typecheck / lint / format | root CI (`typecheck`, `lint`, `format:check`, `test`)            |

Kryteria glossary:

- `viewSquad` zawiera „kadr”, nie „skład”
- `setLineup` zawiera „skład”, nie „kadr”
- `hubExit` / `hubEnter` bez „Hubu”
- blob `UI_COPY` bez `resolveNavAccess` / `DTO` / `Supabase` / `Odblokuj`

---

## 1. Manual — mikrocopy P0

| ID  | Kroki                                | Oczekiwane                                                            |
| --- | ------------------------------------ | --------------------------------------------------------------------- |
| C1  | Hub idle                             | Primary **Zobacz kadrę** · Secondary Kadra/Trening/…                  |
| C2  | Hub matchday                         | Primary **Idź do meczu**                                              |
| C3  | Soft-lock Nav (Trening EARLY)        | Modal: „niedostępne” · reason bez żargonu · **Wróć do Hub** · Zamknij |
| C4  | Soft-lock Transfers (okno zamknięte) | SoftLockState: copy okna · **bez** „nie z UI” · exit Hub              |
| C5  | Soft-lock Training                   | reason domenowy · secondary **Kadra** · exit Hub                      |
| C6  | Pre-match                            | Primary **Zagraj mecz** · Soft **Ustaw skład**                        |
| C7  | Match XI                             | Title **Ustaw skład (XI)** · pending **Zapisuję…** · soft checklist   |
| C8  | Post complete fixture                | CTA **Wróć do Hub** (nie Hubu)                                        |
| C9  | Transfer accept confirm              | Prompt **Potwierdź akceptację oferty.**                               |
| C10 | Welcome LF                           | **Wejdź do Hub** · lead o **kadrze**                                  |
| C11 | Finance                              | Soft exit **Wróć do Hub**                                             |
| C12 | Domain error / loading               | PL retry / Ładowanie…                                                 |

---

## 2. Regresja (smoke)

| ID  | Kroki                           | Oczekiwane                                |
| --- | ------------------------------- | ----------------------------------------- |
| R1  | Tunnel → Pre → XI → Live → Post | flow bez zmian · Nav ukryty na `/match/*` |
| R2  | Squad / Transfers settle        | akcje domenowe działają jak przed passem  |
| R3  | Mobile bottom nav soft-lock     | ten sam copy co desktop                   |

---

## Quality Gate

PASS gdy:

- ✓ terminologia Kadra ≠ Skład spójna
- ✓ mikrocopy jednolite (Hub / soft-lock / Match CTA)
- ✓ brak regresji flow
- ✓ CI GREEN

---

## Historia

| Wersja | Data       | Opis                   |
| ------ | ---------- | ---------------------- |
| 1.0.0  | 2026-07-29 | Test plan Content Pass |
