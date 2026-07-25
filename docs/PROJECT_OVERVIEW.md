# Project Overview — Last Football

## Cel

Czym jest Last Football, stack i granice fazy.

## Aktualny stan

**Last Football** — przeglądarkowy football manager z silnikiem **LFE**.

| Warstwa           | Stan                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------- |
| Produkt           | GDD-01…15 · next: Owner (GDD-16+ / §26 / …)                                               |
| Platforma         | Onboarding · First Match · Hub SEASON · League · Finance · Players · Transfers · Training |
| Silnik / Match UI | LFE `0.9.1-match-ai01` · Canvas · Replay · Post Match                                     |
| Supabase          | clubs · fixtures · finance · players · transfer_deals · last_training_on                  |

**Prod:** https://lastfootball.vercel.app · feature baseline [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md) · `10de062`

## Opis działania

1. Konto + klub (Wizard).
2. First Match → Hub.
3. SEASON: liga, finanse, kadra; transfery gdy okno open; trening gdy played ≥ 2.
4. Mecze przez `MatchSession` / Live pipeline.
5. Resolvery = kontrakty UI (patrz [`AI/COMMON_PATTERNS.md`](./AI/COMMON_PATTERNS.md)).

## Granice

**Jest:** Training Thin i wcześniejsze Thin (Transfers, Players, Finance, League…).  
**Nie jest:** negotiation/envelope, potential, Physics, pełny kalendarz 11, skill growth z treningu.

## Powiązania

[`ROADMAP.md`](./ROADMAP.md) · [`platform/`](./platform/) · [`AI/START_HERE.md`](./AI/START_HERE.md)

## Last updated

2026-07-25 — LFE-TRAINING-01 CLOSE
