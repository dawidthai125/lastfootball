# AI — Current Baseline (Production)

## Cel

Jedyny szybki SSOT: **co jest wdrożone na produkcji teraz**.

## Feature baseline vs documentation tip

| Pojęcie               | Znaczenie                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------- |
| **Feature baseline**  | Ostatni commit **produktowy** zamkniętego EPIC (`feat(…)`) — hash w tabeli poniżej            |
| **Documentation tip** | Nowszy commit na `main` typu `docs:` / `style:` po feature — **nie zmienia** feature baseline |
| **Style commit**      | Wyłącznie Prettier; bez logiki                                                                |

```bash
git log -1 --oneline          # tip
git log -1 --oneline          # feature baseline N1 — hash w tabeli
```

---

## Production

| Pole                 | Wartość                                                                     |
| -------------------- | --------------------------------------------------------------------------- |
| URL                  | https://lastfootball.vercel.app                                             |
| Alias                | https://lastfootball.pl                                                     |
| Branch               | `main`                                                                      |
| **Feature baseline** | _(wypełniane po commit N1 — patrz CLOSE tip)_                               |
| Baseline message     | `feat(transfers): add stateless buy negotiation Thin (LFE-TRANSFERS-02-N1)` |
| Docs CLOSE tip       | _(po feacie)_                                                               |
| Status               | **LFE-TRANSFERS-02-N1 CLOSED** · E1 · LEAGUE-03 · GDD-§26A/B                |

## Stack

- Next.js 15 (App Router) · TypeScript · Turbopack/dev
- Supabase Auth + Postgres (`anoeimngwptucjdugjme`)
- Vercel Production
- LFE `@lastfootball/lfe` · `0.9.1-match-ai01`

## Player path (verified)

```
Landing → Auth → Welcome → Club Wizard · Reveal
  → First Match → Live → Post → Welcome LF → Hub (EARLY_CLUB → SEASON)
  → /league ← resolveLeagueTable()
  → /finance ← resolveClubFinance()
  → /squad ← resolveClubSquad(players)
  → /transfers ← resolveTransferMarket() + buy negotiation (N1) gdy transfer_window_open
  → /training ← resolveClubTraining() gdy played ≥ 2
  → fixtures Thin: LEAGUE_FIXTURE_COUNT=11 (+ top-up dla klubów z 3)
```

## Critical SSOT

| SSOT              | Gdzie                                               |
| ----------------- | --------------------------------------------------- |
| Club              | `clubs` → `ClubDto`                                 |
| Hub unlock        | `first_match_completed_at`                          |
| Hub phase / CTA   | `resolveHubPhase` / `resolvePrimaryCta`             |
| Fixtures          | `fixtures` + `planClubFixtures` / top-up (11)       |
| League table      | `resolveLeagueTable` → `LeagueTableDto`             |
| Cash              | `cash_balance` + `resolveClubFinance` (D18)         |
| Transfer envelope | `resolveTransferEnvelope` (derive, ratio 1)         |
| Economy numbers   | GDD **§26** · kod `ECONOMY_THIN` (+ `TRANSFER_FEE`) |
| Roster            | `players` + `resolveClubSquad`                      |
| Transfer window   | `transfer_window_open`                              |
| Transfer UI       | `resolveTransferMarket`                             |
| Transfer nego     | `resolveNegotiationStep` (pure, stateless)          |
| Transfer deals    | `transfer_deals`                                    |
| Training day      | `clubs.last_training_on`                            |
| Training UI       | `resolveClubTraining` → `TrainingDto`               |
| Played unlock     | `hasPlayedUnlock` + fixture played count            |
| Match entry       | `createMatch()` → `MatchSession`                    |

Pełna lista zamkniętych EPIC: [`../ROADMAP.md`](../ROADMAP.md).

## Not on production

Sell negotiation · 2+ counters · potential · full **22** fixtures (GDD §10) · Physics · individual training · skill growth from training · envelope ratio ≠ 1 / stored envelope.

## Last updated

2026-07-25 — LFE-TRANSFERS-02-N1 CLOSE
