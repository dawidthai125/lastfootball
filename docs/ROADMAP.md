# Roadmap — Last Football

## Cel

Mapa postępu: **DONE / IN PROGRESS / PLANNED / FUTURE**.

## Aktualny stan

Production baseline **`71ce442`** (LFE-LEAGUE-02 CLOSED) — PRODUCTION VERIFIED · GREEN.  
CI zielony; Vercel Production Ready.

---

## DONE ✅

| Item                                                   | Notatka                                                     |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| Monorepo + infra                                       | Next, Supabase, Vercel, CI                                  |
| LFE EPIC-1…7                                           | Foundation → Positioning                                    |
| LFE Architecture Freeze                                | PUBLIC API v1                                               |
| Gameplay · Match AI · Match Engine · Player Match Data | silnik gameplay                                             |
| Asset Pack · UI Shell                                  | chrome                                                      |
| Live Bridge · Canvas · Replay · Post Match · Ratings   | match UI pipeline                                           |
| CI Prettier                                            | format gate                                                 |
| GDD-01…15                                              | §3–§15 + §20 + §23                                          |
| **LFE-PLATFORM-01** P1–P3                              | Landing · Auth · Club Wizard · Club DTO                     |
| **LFE-INFRA-01**                                       | Supabase `anoeimngwptucjdugjme`                             |
| **LFE-MATCH-01**                                       | First Match tunnel · `first_match_completed_at`             |
| **LFE-HUB-01**                                         | EARLY_CLUB · `resolveHubPhase` / `resolvePrimaryCta`        |
| **LFE-DOCS-01**                                        | Konsolidacja docs AI / handoff                              |
| **LFE-LEAGUE-01** Thin A                               | **CLOSED** · fixtures SSOT · next match · Squad SSOT        |
| **LFE-LEAGUE-02**                                      | **CLOSED** · table derive · Hub SEASON · `/league` · chip   |

## IN PROGRESS 🔄

| Item | Notatka |
| ---- | ------- |
| —    | Brak    |

## PLANNED ⬜

| Item                             | Zależność                       |
| -------------------------------- | ------------------------------- |
| GDD-16+                          | Owner GO (docs)                 |
| Economy                          | GDD §14                         |
| Transfer Market + players DB     | GDD §12                         |
| Full 11-fixture calendar (opt.)  | po LEAGUE-02                    |
| Zawężenie LFE PUBLIC exports     | chore                           |
| Ratings v2                       | bogatsze Player Match Data      |

## FUTURE

| Item                          | Notatka                     |
| ----------------------------- | --------------------------- |
| LFE Physics / full Rules      | RESERVED / częściowe eventy |
| ECS storage                   | RESERVED                    |
| Replay persist / video export | poza MVP                    |
| Mobile native                 | poza scope                  |

---

## Next Recommended EPIC

**GDD-16+** (Owner wybiera rozdział) **lub** Economy / Transfers.  
Uzasadnienie: liga thin (fixtures + tabela + SEASON) jest na produkcji — największa luka MVP to design/ekonomika i kadra DB, nie kolejny slice tabeli.

## Decyzje roadmapy

- Design (GDD) prowadzi produkt; implementacja może mieć udokumentowane wyjątki (First Match przed Hubem).
- Hub = decyzja (§23), nie dashboard.
- UI/Canvas nie omija `MatchSession` / CommandBus.
- Replay nigdy nie odpala Engine.
- Tabela ligowa = pure derive (`resolveLeagueTable`); brak standings DB (D17).

## Powiązania

[`PROJECT_STATUS.md`](./PROJECT_STATUS.md) · [`AI/PROJECT_STATE.md`](./AI/PROJECT_STATE.md)

## Last updated

2026-07-25 — LFE-LEAGUE-02 CLOSE
