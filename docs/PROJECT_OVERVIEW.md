# Project Overview — Last Football

## Cel dokumentu

Opisuje czym jest Last Football, jaki ma stack i jakie ma granice fazy obecnej.

## Aktualny stan

**Last Football** — przeglądarkowy football manager (klasa: footballteam.pl) z własnym silnikiem meczu **LFE** (Last Football Engine).

| Warstwa | Stan |
|---------|------|
| Produkt (GDD) | Faza 2 — §3–§5, §7–§15 wypełnione; §6 i inne = szkielet |
| Silnik LFE | EPIC-1…7 wdrożone; Architecture Freeze APPROVED; na `main` |
| App web | Shell Next.js + strona `/status` (engine status) |
| Supabase | Projekt podłączony, migracje/types (infra) |
| Gameplay UI / Physics / AI | **Nie rozpoczęte** |

**Prototyp referencyjny:** https://lastfootball.onhercules.app/

## Opis działania (produkt)

1. Gracz prowadzi klub w lidze (4 poziomy, start IV).  
2. Rdzeń sesji = mecz (Pre → Live → Report → Hub) — GDD §9.  
3. Silnik LFE symuluje mecz headless (deterministycznie); UI React/Canvas będzie konsumować `MatchSession`.  
4. Dane klubu / auth / persystencja → Supabase (przyszłe feature’y).

## Stack

| Technologia | Rola |
|-------------|------|
| Next.js 15 (App Router) | Frontend / BFF shell (`apps/web`) |
| React | UI |
| TypeScript | Cały monorepo |
| `@lastfootball/lfe` | Silnik meczu (headless) |
| `@lastfootball/domain` | DTO manager-facing (nie model meczu LFE) |
| Supabase | Auth, DB, Storage, Realtime (prep) |
| Vercel (`fra1`) | Hosting |
| Vitest | Testy LFE |

## Granice (ważne)

- LFE **nie** importuje React / Next / Supabase.  
- GDD **nie** zawiera formuł numerycznych silnika (liczby → późniejsze rozdziały / §26).  
- Architecture Freeze zabrania dodawania PUBLIC API bez AUDIT + Owner GO.  
- Canvas renderer = przyszłość (poza LFE freeze).

## Najważniejsze decyzje

Zobacz [`DECISIONS.md`](./DECISIONS.md). Skrót: match-centric loop; `createMatch` jedyny entry; GDD > ad-hoc feature design.

## Powiązania

- Status: [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)  
- Architektura: [`ARCHITECTURE.md`](./ARCHITECTURE.md)  
- Produkt: [`game-design/GAME_DESIGN_DOCUMENT.md`](./game-design/GAME_DESIGN_DOCUMENT.md)  
- Silnik: [`lfe/ENGINE_OVERVIEW.md`](./lfe/ENGINE_OVERVIEW.md)

## Last updated

2026-07-23
