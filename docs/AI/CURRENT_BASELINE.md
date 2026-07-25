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
git log -1 --oneline 393a43c  # feature baseline Transfers
```

Po FULLY CLOSED LFE-TRANSFERS-01 tip docs/style może być np. `3161903` — to **nie** jest nowy feature baseline.

---

## Production

| Pole                   | Wartość                                                                    |
| ---------------------- | -------------------------------------------------------------------------- |
| URL                    | https://lastfootball.vercel.app                                            |
| Alias                  | https://lastfootball.pl                                                    |
| Branch                 | `main`                                                                     |
| **Feature baseline**   | `393a43c3ce884fbfa123891802841f4b7d60ffbc`                                 |
| Baseline message       | `feat(transfers): implement Thin Slice transfer market (LFE-TRANSFERS-01)` |
| Related style (code)   | `7c0ce7f`                                                                  |
| Docs CLOSE + style tip | `21813ea` · `3161903` (tip — verify with `git log -1`)                     |
| Status                 | **PRODUCTION VERIFIED · GREEN** · LFE-TRANSFERS-01 **FULLY CLOSED**        |

## Stack

- Next.js 15 (App Router) · TypeScript · Turbopack/dev
- Supabase Auth + Postgres (`anoeimngwptucjdugjme`)
- Vercel Production
- LFE `@lastfootball/lfe` · `0.9.1-match-ai01`

## Player path (verified)

```
Landing → Auth → Welcome → Club Wizard → Reveal
  → First Match → Live → Post → Welcome LF → Hub (EARLY_CLUB → SEASON)
  → /league ← resolveLeagueTable()
  → /finance ← resolveClubFinance()
  → /squad ← resolveClubSquad(players)
  → /transfers ← resolveTransferMarket() gdy transfer_window_open
```

## Critical SSOT

| SSOT            | Gdzie                                   |
| --------------- | --------------------------------------- |
| Club            | `clubs` → `ClubDto`                     |
| Hub unlock      | `first_match_completed_at`              |
| Hub phase / CTA | `resolveHubPhase` / `resolvePrimaryCta` |
| Fixtures        | `fixtures`                              |
| League table    | `resolveLeagueTable` → `LeagueTableDto` |
| Cash            | `cash_balance` + `resolveClubFinance`   |
| Roster          | `players` + `resolveClubSquad`          |
| Transfer window | `transfer_window_open`                  |
| Transfer UI     | `resolveTransferMarket`                 |
| Transfer deals  | `transfer_deals`                        |
| Match entry     | `createMatch()` → `MatchSession`        |

Pełna lista zamkniętych EPIC: [`../ROADMAP.md`](../ROADMAP.md) (nie duplikuj tutaj przy każdym CLOSE — aktualizuj ROADMAP + ten feature hash).

## Not on production

Training · negotiation/envelope · potential · full 11 fixtures · Physics · GDD §26 numbers (Thin constants temporary).

## Last updated

2026-07-25 — AI-DOCS-HYGIENE-01
