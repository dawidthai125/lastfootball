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
git log -1 --oneline 617d3c2  # feature baseline League-03
```

---

## Production

| Pole                 | Wartość                                                                             |
| -------------------- | ----------------------------------------------------------------------------------- |
| URL                  | https://lastfootball.vercel.app                                                     |
| Alias                | https://lastfootball.pl                                                             |
| Branch               | `main`                                                                              |
| **Feature baseline** | LFE-LEAGUE-03 — `feat(league): expand Thin calendar to 11 fixtures (LFE-LEAGUE-03)` |
| Baseline hash        | verify `git log -1 --grep=LFE-LEAGUE-03 --format=%H` after push                     |
| Status               | LFE-LEAGUE-03 **CLOSED** · GDD-§26A/B **CLOSED** · CI verify after push             |

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
  → /transfers ← resolveTransferMarket() gdy transfer_window_open
  → /training ← resolveClubTraining() gdy played ≥ 2
  → fixtures Thin: LEAGUE_FIXTURE_COUNT=11 (+ top-up dla klubów z 3)
```

## Critical SSOT

| SSOT            | Gdzie                                               |
| --------------- | --------------------------------------------------- |
| Club            | `clubs` → `ClubDto`                                 |
| Hub unlock      | `first_match_completed_at`                          |
| Hub phase / CTA | `resolveHubPhase` / `resolvePrimaryCta`             |
| Fixtures        | `fixtures` + `planClubFixtures` / top-up (11)       |
| League table    | `resolveLeagueTable` → `LeagueTableDto`             |
| Cash            | `cash_balance` + `resolveClubFinance` (D18)         |
| Economy numbers | GDD **§26** · kod `ECONOMY_THIN` (+ `TRANSFER_FEE`) |
| Roster          | `players` + `resolveClubSquad`                      |
| Transfer window | `transfer_window_open`                              |
| Transfer UI     | `resolveTransferMarket`                             |
| Transfer deals  | `transfer_deals`                                    |
| Training day    | `clubs.last_training_on`                            |
| Training UI     | `resolveClubTraining` → `TrainingDto`               |
| Played unlock   | `hasPlayedUnlock` + fixture played count            |
| Match entry     | `createMatch()` → `MatchSession`                    |

Pełna lista zamkniętych EPIC: [`../ROADMAP.md`](../ROADMAP.md).

## Not on production

Negotiation/envelope · potential · full **22** fixtures (GDD §10) · Physics · individual training · skill growth from training.

## Last updated

2026-07-25 — LFE-LEAGUE-03 CLOSE
