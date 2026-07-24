# Project Overview — Last Football

## Cel dokumentu

Opisuje czym jest Last Football, jaki ma stack i jakie ma granice fazy obecnej.

## Aktualny stan

**Last Football** — przeglądarkowy football manager (klasa: footballteam.pl) z własnym silnikiem meczu **LFE**.

| Warstwa               | Stan                                                               |
| --------------------- | ------------------------------------------------------------------ |
| Produkt (GDD)         | Faza 2 — §3–§5, §7–§15 wypełnione; §6 = szkielet                   |
| Silnik LFE            | EPIC-1…7 + Gameplay + Match AI + Match Engine · `0.9.1-match-ai01` |
| App web               | Shell + Live match + Canvas + Replay + Post Match                  |
| Supabase              | Projekt podłączony, migracje/types (infra)                         |
| Physics / pełne Rules | **Nie rozpoczęte** (stub)                                          |

**Prod:** https://lastfootball.vercel.app  
**Prototyp referencyjny (historyczny):** https://lastfootball.onhercules.app/

## Opis działania (produkt)

1. Gracz prowadzi klub w lidze (4 poziomy, start IV).
2. Rdzeń sesji = mecz (Pre → Live → Report → Hub) — GDD §9.
3. Silnik LFE symuluje mecz headless; UI konsumuje `MatchSession` przez `LiveMatchRuntime`.
4. Dane klubu / auth / persystencja → Supabase (kolejne feature’y).

## Stack

| Technologia             | Rola                                    |
| ----------------------- | --------------------------------------- |
| Next.js 15 (App Router) | Frontend / BFF shell (`apps/web`)       |
| React                   | UI                                      |
| TypeScript              | Cały monorepo                           |
| Canvas 2D               | Live/Replay pitch (`apps/web` gameplay) |
| `@lastfootball/lfe`     | Silnik meczu (headless)                 |
| `@lastfootball/domain`  | DTO manager-facing                      |
| Supabase                | Auth, DB, Storage, Realtime (prep)      |
| Vercel (`fra1`)         | Hosting                                 |
| Vitest                  | Testy LFE (+ wybrane web unit)          |

## Granice (ważne)

- LFE **nie** importuje React / Next / Supabase.
- GDD **nie** zawiera formuł numerycznych silnika.
- Architecture Freeze: zmiany PUBLIC bez AUDIT + Owner GO — zakazane.
- Canvas / Replay = web, poza LFE.

## Najważniejsze decyzje

Zobacz [`DECISIONS.md`](./DECISIONS.md). Skrót: match-centric loop; `createMatch` jedyny entry; GDD > ad-hoc feature design.

## Powiązania

- Status: [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)
- Architektura: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- Agent: [`AI-HANDOFF.md`](./AI-HANDOFF.md)
- Produkt: [`game-design/GAME_DESIGN_DOCUMENT.md`](./game-design/GAME_DESIGN_DOCUMENT.md)
- Silnik: [`lfe/ENGINE_OVERVIEW.md`](./lfe/ENGINE_OVERVIEW.md)

## Last updated

2026-07-23 — LFE-DOCS-SYNC-01
