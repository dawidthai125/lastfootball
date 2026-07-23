# Changelog (docs SSOT index)

## Cel dokumentu

Historia istotnych zmian projektu widziana z perspektywy dokumentacji SSOT.  
Szczegóły Keep-a-Changelog: także root [`CHANGELOG.md`](../CHANGELOG.md).

## Aktualny stan

**LFE-PLAYER-MATCH-DATA-01** na `main` (po tym commicie). Wcześniej: LFE Architecture Freeze + GDD Faza 2 (część).

## Opis działania

Nowy wpis po każdym release / zamknięciu EPIC lub GDD stage.

---

## [2026-07-24] — LFE-PLAYER-MATCH-DATA-01

### LFE

- `MatchState.statistics.players` inicjalizowane dla pełnego rosteru
- Deterministyczna atrybucja `attribute-player.ts` (bez dodatkowego RNG)
- Optional `playerId` na payloadach `GOAL` / `SHOT` / `FOUL`
- Bump `PlayerStatistics`: `goals`, `shots`, `foulsCommitted`
- `TeamStatistics` i drabina RNG bez zmian semantycznych

### Tests

- `packages/lfe/src/match/engine/player-match-data01.test.ts`

---

## [2026-07-23] — LFE Architecture Freeze release + GDD docs

### Added

- LFE EPIC-1…7 (foundation → positioning)
- `docs/lfe/LFE_ARCHITECTURE_FREEZE.md` (PUBLIC API v1)
- `docs/game-design/*` (GDD + UI guide)
- Docs SSOT suite (`PROJECT_*`, `HANDOFF`, LFE/GDD indexes)

### Commits (A–G)

| Commit | Hash (short) | Opis                                       |
| ------ | ------------ | ------------------------------------------ |
| A      | `735a7b2`    | feat(lfe): epic1 + systems                 |
| B      | `7c1960d`    | feat(lfe): epic2 domain                    |
| C      | `a4e6477`    | feat(lfe): epic3 state machine             |
| D      | `a0e2ed2`    | feat(lfe): epic5 commands                  |
| E      | `95501e4`    | feat(lfe): session + positioning + surface |
| F      | `3dd3029`    | docs(lfe): epics + freeze                  |
| G      | `5d37de9`    | docs(gdd): phase 2 SSOT                    |

---

## [2026-07-21] — Foundation / infra

- Monorepo Next.js + LFE stub + domain
- Supabase / Vercel / CI bootstrap

## Najważniejsze decyzje

Changelog docs nie zastępuje freeze ani GDD — tylko chronologia.

## Powiązania

Root [`CHANGELOG.md`](../CHANGELOG.md) · [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)

## Last updated

2026-07-24 — LFE-PLAYER-MATCH-DATA-01
