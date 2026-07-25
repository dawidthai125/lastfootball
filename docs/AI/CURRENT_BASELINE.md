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
git log -1 --oneline de23db6  # feature baseline TRANSFERS-04 listing
```

---

## Production

| Pole                 | Wartość                                                                |
| -------------------- | ---------------------------------------------------------------------- |
| URL                  | https://lastfootball.vercel.app                                        |
| Alias                | https://lastfootball.pl                                                |
| Branch               | `main`                                                                 |
| **Feature baseline** | `de23db6e6535237757743e222e1bc0b43eac3964`                             |
| Baseline message     | `feat(transfers): add player transfer listing Thin (LFE-TRANSFERS-04)` |
| Docs CLOSE tip       | _(ten commit lub nowszy)_                                              |
| Status               | **LFE-TRANSFERS-04 CLOSED** · 03 · N1 · E1 · LEAGUE-03 · GDD-§26A/B    |

## Stack

- Next.js 15 (App Router) · TypeScript · Turbopack/dev
- Supabase Auth + Postgres (`anoeimngwptucjdugjme`)
- Vercel Production
- LFE `@lastfootball/lfe` · `0.9.1-match-ai01`

## Player path (verified)

```
Landing → Auth → Welcome → Club Wizard · Reveal
  → First Match → Live → Post → Welcome LF → Hub (EARLY_CLUB → SEASON)
  → /transfers ← resolveTransferMarket() + listing + buy nego + incoming (listed only)
```

## Critical SSOT

| SSOT              | Gdzie                                 |
| ----------------- | ------------------------------------- |
| Cash              | `cash_balance`                        |
| Transfer envelope | `resolveTransferEnvelope`             |
| Transfer listing  | `players.transfer_listed_at`          |
| Transfer UI       | `resolveTransferMarket`               |
| Sell eligibility  | `isTransferSellEligible`              |
| Incoming offers   | `resolveIncomingOffers` (listed only) |
| Settlement sell   | `completeTransferSell`                |

## Not on production

Sell negotiation · custom ask · 2+ counters · pending/timeout/inbox · potential · full **22** fixtures · Physics · individual training · skill growth · envelope ratio ≠ 1.

## Last updated

2026-07-26 — LFE-TRANSFERS-04 CLOSE
