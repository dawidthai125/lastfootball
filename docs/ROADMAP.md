# Roadmap — Last Football

## Cel dokumentu

Mapa postępu projektu w kategoriach Completed / In Progress / Planned / Future.

## Aktualny stan

LFE EPIC-1…7 + Architecture Freeze na `main`. GDD do §15 (bez §6). App = shell.

## Completed

| Item                    | Notatka                                  |
| ----------------------- | ---------------------------------------- |
| Monorepo foundation     | Next.js, domain, LFE stub → engine       |
| Infra                   | Vercel fra1, Supabase link, CI, ops docs |
| LFE EPIC-1…7            | Foundation → Positioning                 |
| LFE Architecture Freeze | PUBLIC API v1 kontrakt                   |
| Release A–G             | Kod LFE + docs LFE + GDD na `main`       |
| GDD-01…12               | Struktura + §3–5, §7–15                  |
| UI Design Guide         | Zasady UI                                |
| Audyty 01–03            | Repo, Public API, Freeze                 |

## In Progress

| Item                     | Notatka                                          |
| ------------------------ | ------------------------------------------------ |
| —                        | Brak aktywnego EPIC implementacyjnego po release |
| Packaging PUBLIC surface | Dług udokumentowany (over-export `index.ts`)     |

## Planned

| Item                                  | Zależność                        |
| ------------------------------------- | -------------------------------- |
| GDD-13 §6 Rozwój klubu                | Owner GO                         |
| Kolejne rozdziały GDD (szkielet)      | Po §6 / priorytet Owner          |
| Zawężenie exportów LFE do freeze      | Chore; opcjonalnie przed Physics |
| `features/match` UI (Pre/Live/Report) | GDD §9 + PUBLIC session API      |
| Supabase schema teams/players         | Po designie danych               |

## Future

| Item                        | Notatka                                    |
| --------------------------- | ------------------------------------------ |
| LFE Physics / ball          | RESERVED                                   |
| LFE AI / tactics            | RESERVED                                   |
| LFE Rules (fouls, restarts) | RESERVED                                   |
| Canvas renderer             | Poza pakietem LFE; konsumuje spatial/state |
| ECS storage                 | RESERVED stub                              |
| Liga live / tick serwerowy  | Późna faza                                 |
| Mobile native               | Poza scope MVP                             |

## Najważniejsze decyzje roadmapy

- Design (GDD) prowadzi gameplay.
- Silnik rośnie EPIC-ami; PUBLIC API zmienia się tylko przez freeze policy.
- Nie mieszać GDD i LFE w jednym „chaos commit” (release A–G = wzorzec).

## Powiązania

[`PROJECT_STATUS.md`](./PROJECT_STATUS.md) · [`game-design/ROADMAP.md`](./game-design/ROADMAP.md) · [`lfe/CURRENT_STATUS.md`](./lfe/CURRENT_STATUS.md)

## Last updated

2026-07-23
