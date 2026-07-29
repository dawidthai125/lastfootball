# Project Overview — Last Football

**Status:** REFERENCE — wysokopoziomowy opis produktu.  
**Nie** kopiuj stąd hashy ani listy EPIC.

| Potrzebujesz                | Czytaj                                                                         |
| --------------------------- | ------------------------------------------------------------------------------ |
| **Gdzie jesteśmy (status)** | [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) — **SSOT statusu**                  |
| Feature baseline / docs tip | [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)                           |
| Lista EPIC DONE/PLANNED     | [`ROADMAP.md`](./ROADMAP.md)                                                   |
| Onboarding AI               | [`AGENTS.md`](../AGENTS.md) → [`AI/AI_QUICK_START.md`](./AI/AI_QUICK_START.md) |

## Cel

Czym jest Last Football, stack i granice fazy (orientacja).

## Skrót produktu

**Last Football** — przeglądarkowy football manager z silnikiem **LFE**.

| Warstwa           | Stan (orientacja)                                                                  |
| ----------------- | ---------------------------------------------------------------------------------- |
| Produkt           | GDD-01…15 · §26 CLOSED · next: Owner (GDD-16+)                                     |
| Platforma         | Onboarding · First Match · Hub · League · Finance · Players · Transfers · Training |
| UX                | **UI P0 CLOSED** · Night Pitch Office · Guide §16 · IMPL-01…06                     |
| Silnik / Match UI | LFE `0.9.1-match-ai01` · Canvas · Replay · Post · Match Path                       |
| Prod              | https://lastfootball.vercel.app · Baseline `54d0724`                               |

## Opis działania (orientacja)

1. Konto + klub (Wizard) → First Match → Hub.
2. SEASON: liga, finanse, kadra; transfery gdy okno open; trening gdy played ≥ 2.
3. Mecze przez `MatchSession` / Live pipeline.
4. UI domenowe przez resolvery (`resolve*`).

## Granice Thin (orientacja)

**Jest:** Transfers Thin (Instant + Pending + 1× Counter + listing + nego) · Training Thin · Players/Finance/League Thin.  
**Nie jest (przykłady):** escrow / 2+ counters · Physics · pełne 22 fixtures · skill growth z treningu · envelope ratio ≠ 1.

Szczegóły „Not on production”: [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md).

## Powiązania

[`PROJECT_STATUS.md`](./PROJECT_STATUS.md) · [`ROADMAP.md`](./ROADMAP.md) · [`AI/START_HERE.md`](./AI/START_HERE.md) · [`platform/`](./platform/)

## Last updated

2026-07-29 — LFE-DOCS-BASELINE-01 (REFERENCE; bez hashy poza pointerami do CURRENT_BASELINE)
