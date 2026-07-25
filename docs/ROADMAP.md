# Roadmap — Last Football

## Cel

Mapa postępu: **DONE / IN PROGRESS / PLANNED / FUTURE**.

## Aktualny stan

Production baseline **`0b960b5`** (LFE-PLAYERS-01 CLOSED) — PRODUCTION VERIFIED · GREEN.  
CI zielony (feat + prettier `d43fa3d`); Vercel Production Ready; migracja `players` applied.

---

## DONE ✅

| Item                                                   | Notatka                                                   |
| ------------------------------------------------------ | --------------------------------------------------------- |
| Monorepo + infra                                       | Next, Supabase, Vercel, CI                                |
| LFE EPIC-1…7                                           | Foundation → Positioning                                  |
| LFE Architecture Freeze                                | PUBLIC API v1                                             |
| Gameplay · Match AI · Match Engine · Player Match Data | silnik gameplay                                           |
| Asset Pack · UI Shell                                  | chrome                                                    |
| Live Bridge · Canvas · Replay · Post Match · Ratings   | match UI pipeline                                         |
| CI Prettier                                            | format gate                                               |
| GDD-01…15                                              | §3–§15 + §20 + §23                                        |
| **LFE-PLATFORM-01** P1–P3                              | Landing · Auth · Club Wizard · Club DTO                   |
| **LFE-INFRA-01**                                       | Supabase `anoeimngwptucjdugjme`                           |
| **LFE-MATCH-01**                                       | First Match tunnel · `first_match_completed_at`           |
| **LFE-HUB-01**                                         | EARLY_CLUB · `resolveHubPhase` / `resolvePrimaryCta`      |
| **LFE-DOCS-01**                                        | Konsolidacja docs AI / handoff                            |
| **LFE-LEAGUE-01** Thin A                               | **CLOSED** · fixtures SSOT · next match · Squad seed      |
| **LFE-LEAGUE-02**                                      | **CLOSED** · table derive · Hub SEASON · `/league` · chip |
| **LFE-ECONOMY-01**                                     | **CLOSED** · cash SSOT · movements · `/finance` · SEASON  |
| **LFE-PLAYERS-01**                                     | **CLOSED** · `players` SSOT · `resolveClubSquad` · D19    |

## IN PROGRESS 🔄

| Item | Notatka |
| ---- | ------- |
| —    | Brak    |

## PLANNED ⬜

| Item                            | Zależność                    |
| ------------------------------- | ---------------------------- |
| GDD-16+                         | Owner GO (docs)              |
| GDD §26 balance numbers         | zastąpi `ECONOMY_THIN` (D18) |
| Transfer Market                 | GDD §12 · na bazie `players` |
| Training system                 | GDD §8 · statusy kadry       |
| Full 11-fixture calendar (opt.) | po LEAGUE-02                 |
| Zawężenie LFE PUBLIC exports    | chore                        |
| Ratings v2                      | bogatsze Player Match Data   |

## FUTURE

| Item                          | Notatka                     |
| ----------------------------- | --------------------------- |
| LFE Physics / full Rules      | RESERVED / częściowe eventy |
| ECS storage                   | RESERVED                    |
| Replay persist / video export | poza MVP                    |
| Mobile native                 | poza scope                  |

---

## Next Recommended EPIC

**GDD-16+** (Owner wybiera) **lub** **Transfers** (GDD §12) / **Training** (§8).  
Uzasadnienie: trwała kadra (`players`) jest na produkcji — rynek i trening mogą mutować SSOT; §26 dla liczb ekonomii.

## Decyzje roadmapy

- Design (GDD) prowadzi produkt; implementacja może mieć udokumentowane wyjątki (First Match przed Hubem).
- Hub = decyzja (§23), nie dashboard.
- UI/Canvas nie omija `MatchSession` / CommandBus.
- Replay nigdy nie odpala Engine.
- Tabela ligowa = pure derive (`resolveLeagueTable`); brak standings DB (D17).
- Kasa = `cash_balance`; UI tylko przez `resolveClubFinance` (D18); stałe Thin tymczasowe do §26.
- Kadra = `players`; UI tylko przez `resolveClubSquad` (D19); seed ≠ runtime.

## Powiązania

[`PROJECT_STATUS.md`](./PROJECT_STATUS.md) · [`AI/PROJECT_STATE.md`](./AI/PROJECT_STATE.md)

## Last updated

2026-07-25 — LFE-PLAYERS-01 CLOSE
