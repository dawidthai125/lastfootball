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
git log -1 --oneline          # tip (może być docs/style)
git log -1 --oneline 10de062  # feature baseline Training
```

Po FULLY CLOSED LFE-TRAINING-01 tip docs może być nowszy niż `10de062` — to **nie** jest nowy feature baseline.

---

## Production

| Pole                 | Wartość                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------ |
| URL                  | https://lastfootball.vercel.app                                                            |
| Alias                | https://lastfootball.pl                                                                    |
| Branch               | `main`                                                                                     |
| **Feature baseline** | `10de062b3e7aa431621d3727d6b277dc2141aa1a`                                                 |
| Baseline message     | `feat(training): implement Thin Slice team training (LFE-TRAINING-01)`                     |
| Docs CLOSE tip       | verify with `git log -1` after docs CLOSE commit                                           |
| Status               | **PRODUCTION VERIFIED · GREEN** · LFE-TRAINING-01 **FULLY CLOSED** · GDD-§26A/B **CLOSED** |

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
```

## Critical SSOT

| SSOT            | Gdzie                                               |
| --------------- | --------------------------------------------------- |
| Club            | `clubs` → `ClubDto`                                 |
| Hub unlock      | `first_match_completed_at`                          |
| Hub phase / CTA | `resolveHubPhase` / `resolvePrimaryCta`             |
| Fixtures        | `fixtures`                                          |
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

Pełna lista zamkniętych EPIC: [`../ROADMAP.md`](../ROADMAP.md) (nie duplikuj tutaj przy każdym CLOSE — aktualizuj ROADMAP + ten feature hash).

## Not on production

Negotiation/envelope · potential · full 11 fixtures · Physics · individual training · skill growth from training.

**GDD §26:** SSOT liczb + sync kodu **CLOSED** (GDD-§26A/B). Feature baseline **`10de062`** bez zmiany.

## Last updated

2026-07-25 — GDD-§26B CLOSE
