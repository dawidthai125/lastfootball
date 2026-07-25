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
git log -1 --oneline be95006  # feature baseline TRANSFERS-07 Pending Offers
```

---

## Production

| Pole                 | Wartość                                                                |
| -------------------- | ---------------------------------------------------------------------- |
| URL                  | https://lastfootball.vercel.app                                        |
| Alias                | https://lastfootball.pl                                                |
| Branch               | `main`                                                                 |
| **Feature baseline** | `be9500655178f259ec4e3aebb519aa3c3133d2b6`                             |
| Baseline message     | `feat(transfers): add live H2H pending offers Thin (LFE-TRANSFERS-07)` |
| Docs CLOSE tip       | _(ten commit lub nowszy)_                                              |
| Status               | **LFE-TRANSFERS-07 CLOSED** · 06 · 05 · 04 · 03 · N1 · E1 · GDD-§26A/B |

## Stack

- Next.js 15 (App Router) · TypeScript · Turbopack/dev
- Supabase Auth + Postgres (`anoeimngwptucjdugjme`)
- Vercel Production
- LFE `@lastfootball/lfe` · `0.9.1-match-ai01`

## Player path (verified)

```
Landing → Auth → Welcome → Club Wizard · Reveal
  → First Match → Live → Post → Welcome LF → Hub (EARLY_CLUB → SEASON)
  → /transfers ← resolveTransferMarket() + Live Instant + Pending H2H + listing + buy/seller nego + seed fallback
```

## Critical SSOT

| SSOT              | Gdzie                                    |
| ----------------- | ---------------------------------------- |
| Cash              | `cash_balance`                           |
| Transfer envelope | `resolveTransferEnvelope`                |
| Transfer listing  | `players.transfer_listed_at`             |
| Transfer UI       | `resolveTransferMarket`                  |
| Live listings     | listed `players` (other clubs)           |
| Pending H2H       | `transfer_offers`                        |
| Ask               | `deriveTransferFee`                      |
| Settlement buy    | `completeTransferBuy` (seed \| live)     |
| Settlement sell   | `completeTransferSell` (instant \| live) |

## Not on production

AI clubs · Live counter rounds · Instant Sell nego · custom ask · 2+ counters · timeout / AI pending · escrow · `completeLiveTransfer()` · potential · full **22** fixtures · Physics · individual training · skill growth · envelope ratio ≠ 1.

## Last updated

2026-07-26 — LFE-TRANSFERS-07 CLOSE
