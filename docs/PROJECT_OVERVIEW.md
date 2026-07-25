# Project Overview — Last Football

## Cel

Czym jest Last Football, stack i granice fazy.

## Aktualny stan

**Last Football** — przeglądarkowy football manager z silnikiem **LFE**.

| Warstwa           | Stan                                                                           |
| ----------------- | ------------------------------------------------------------------------------ |
| Produkt           | GDD-01…15 · next: Training §8                                                  |
| Platforma         | Onboarding · First Match · Hub SEASON · League · Finance · Players · Transfers |
| Silnik / Match UI | LFE `0.9.1-match-ai01` · Canvas · Replay · Post Match                          |
| Supabase          | clubs · fixtures · finance · players · transfer_deals                          |

**Prod:** https://lastfootball.vercel.app · feature baseline [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md) · `393a43c`

## Opis działania

1. Konto + klub (Wizard).
2. First Match → Hub.
3. SEASON: liga, finanse, kadra; transfery gdy okno open.
4. Mecze przez `MatchSession` / Live pipeline.
5. Resolvery = kontrakty UI (patrz [`AI/COMMON_PATTERNS.md`](./AI/COMMON_PATTERNS.md)).

## Granice

**Jest:** Transfers Thin i wcześniejsze Thin.  
**Nie jest:** Training, negotiation/envelope, potential, Physics, pełny kalendarz 11.

## Powiązania

[`ROADMAP.md`](./ROADMAP.md) · [`platform/`](./platform/) · [`AI/START_HERE.md`](./AI/START_HERE.md)

## Last updated

2026-07-25 — AI-DOCS-HYGIENE-01
