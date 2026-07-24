# Project Overview — Last Football

## Cel dokumentu

Opisuje czym jest Last Football, jaki ma stack i jakie ma granice fazy obecnej.

## Aktualny stan

**Last Football** — przeglądarkowy football manager z własnym silnikiem meczu **LFE**.

| Warstwa               | Stan                                                        |
| --------------------- | ----------------------------------------------------------- |
| Produkt (GDD)         | GDD-01…15 CLOSED (§3–§15, §20, §23)                         |
| Platforma             | Landing · Auth · Club Wizard · First Match · Hub EARLY_CLUB |
| Silnik LFE            | EPIC-1…7 + Gameplay + AI + Engine · `0.9.1-match-ai01`      |
| App web               | Shell + match pipeline + platform flows                     |
| Supabase              | `anoeimngwptucjdugjme` · clubs + `first_match_completed_at` |
| Physics / pełne Rules | **Nie rozpoczęte**                                          |

**Prod:** https://lastfootball.vercel.app · baseline [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)  
**Prototyp referencyjny (historyczny):** https://lastfootball.onhercules.app/

## Opis działania (produkt)

1. Gracz zakłada konto i klub (Wizard).
2. Rozgrywa **First Match** (tunel) — dopiero potem Hub.
3. Hub EARLY_CLUB = ekran decyzji (1 Primary CTA).
4. Silnik LFE symuluje mecz headless; UI konsumuje `MatchSession` przez `LiveMatchRuntime`.
5. Tożsamość klubu / auth → Supabase `clubs`.

## Stack

| Technologia             | Rola                              |
| ----------------------- | --------------------------------- |
| Next.js 15 (App Router) | Frontend / BFF shell (`apps/web`) |
| React                   | UI                                |
| TypeScript              | Cały monorepo                     |
| Canvas 2D               | Live/Replay pitch                 |
| `@lastfootball/lfe`     | Silnik meczu (headless)           |
| `@lastfootball/domain`  | DTO manager-facing                |
| Supabase                | Auth, DB                          |
| Vercel (`fra1`)         | Hosting                           |

## Granice obecnej fazy

**Jest:** onboarding, first match, EARLY_CLUB Hub, match UI pipeline, GDD rdzeń.  
**Nie jest jeszcze:** live liga/terminarz DB, ekonomia, transfery, Physics.

## Powiązania

[`MASTER_HANDOFF.md`](./MASTER_HANDOFF.md) · [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) · [`platform/`](./platform/)

## Last updated

2026-07-24 — LFE-DOCS-01
