# Roadmap — Last Football

## Cel dokumentu

Mapa postępu: **DONE / IN PROGRESS / PLANNED / FUTURE**.

## Aktualny stan

Match pipeline na `main` + GDD §3–§15 (GDD-13). CI zielony.

---

## DONE ✅

| Item                             | Notatka                                            |
| -------------------------------- | -------------------------------------------------- |
| Monorepo + infra                 | Next, Supabase, Vercel, CI                         |
| LFE EPIC-1…7                     | Foundation → Positioning                           |
| LFE Architecture Freeze          | PUBLIC API v1 kontrakt                             |
| **Gameplay Foundation**          | tactics, events, tactical commands                 |
| **Match AI**                     | MATCH-AI-01                                        |
| **Match Engine**                 | MATCH-ENGINE-01                                    |
| **Player Match Data**            | `statistics.players` + optional `playerId`         |
| Asset Pack 01                    | herby, ikony, tekstury                             |
| UI Shell Polish                  | nav / topbar / rail                                |
| Live UI + LiveMatchRuntime       | broadcast + **Live Bridge**                        |
| **Canvas Renderer**              | 2D + EventBus FX + LIVE/REPLAY (`d752d22`)         |
| **Replay**                       | buffer + controller (`cf1d68c`)                    |
| **Post Match**                   | summary + seek Replay (`b25f479`)                  |
| **Player Ratings**               | Post Match XI + MVP derive (LFE-PLAYER-RATINGS-01) |
| **Live Bridge**                  | wiring Canvas/Replay/Post Match (`33618e9`)        |
| **CI Prettier**                  | LFE-CI-PRETTIER-01 (`fbbebea`)                     |
| GDD-01…12                        | §3–5, §7–15 (+ UI Guide)                           |
| **GDD-13 §6 Rozwój klubu**       | Poziom · Reputacja · Prestiż (SSOT metryk)         |
| **Docs sync (LFE-DOCS-SYNC-01)** | Status / arch / roadmap / AI-HANDOFF               |
| **AI-DOCS-CONSOLIDATION-01**     | Handbook Agenta (SSOT FIRST; bez nowych plików)    |

## IN PROGRESS 🔄

| Item | Notatka                                     |
| ---- | ------------------------------------------- |
| —    | Brak otwartego EPIC kodu (docs lokalnie OK) |

## PLANNED ⬜

| Item                         | Zależność                  |
| ---------------------------- | -------------------------- |
| GDD-14+ (kolejny szkielet)   | Owner GO (docs)            |
| Zawężenie LFE PUBLIC exports | chore packaging            |
| Transfer Market              | GDD §12                    |
| Economy                      | GDD §14                    |
| League live                  | GDD §10 + backend          |
| Multiplayer                  | późna faza                 |
| Ratings v2 (assists/minutes) | bogatsze Player Match Data |

## FUTURE

| Item                             | Notatka                              |
| -------------------------------- | ------------------------------------ |
| LFE Physics / ball kinematics    | RESERVED stub                        |
| LFE Rules (fouls/restarts pełne) | częściowo eventy; brak pełnych rules |
| ECS storage                      | RESERVED                             |
| Replay persist / video export    | poza MVP                             |
| Mobile native                    | poza scope                           |

---

## Najważniejsze decyzje roadmapy

- Design (GDD) prowadzi produkt.
- UI/Canvas nie omija `MatchSession` / CommandBus.
- Replay nigdy nie odpala Engine.
- §6 = SSOT metryk rozwoju klubu.

## Powiązania

[`PROJECT_STATUS.md`](./PROJECT_STATUS.md) · [`AI-HANDOFF.md`](./AI-HANDOFF.md) · [`lfe/CURRENT_STATUS.md`](./lfe/CURRENT_STATUS.md)

## Last updated

2026-07-24 — GDD-13
