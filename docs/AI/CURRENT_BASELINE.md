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
git log -1 --oneline 9b1c575  # feature baseline TRANSFERS-08 Counter Offers
```

---

## Production

| Pole                 | Wartość                                                                     |
| -------------------- | --------------------------------------------------------------------------- |
| URL                  | https://lastfootball.vercel.app                                             |
| Alias                | https://lastfootball.pl                                                     |
| Branch               | `main`                                                                      |
| **Feature baseline** | `9b1c57578042d16e962d8026ed01abae587c294d`                                  |
| Baseline message     | `feat(transfers): add live H2H counter offers Thin (LFE-TRANSFERS-08)`      |
| Docs CLOSE tip       | tip docs może być nowszy (np. AI-DOCS-CONSOLIDATION-02)                     |
| Status               | **LFE-TRANSFERS-08 CLOSED** · 07 · 06 · 05 · 04 · 03 · N1 · E1 · GDD-§26A/B |

## Stack

- Next.js 15 (App Router) · TypeScript · Turbopack/dev
- Supabase Auth + Postgres (`anoeimngwptucjdugjme`)
- Vercel Production
- LFE `@lastfootball/lfe` · `0.9.1-match-ai01`

## Player path (verified)

```
Landing → Auth → Welcome → Club Wizard · Reveal
  → First Match → Live → Post → Welcome LF → Hub (EARLY_CLUB → SEASON)
  → /transfers ← resolveTransferMarket() + Live Instant + Pending + 1× Counter + listing + buy/seller nego + seed fallback
```

## Critical SSOT

| SSOT              | Gdzie                                    |
| ----------------- | ---------------------------------------- |
| Cash              | `cash_balance`                           |
| Transfer envelope | `resolveTransferEnvelope`                |
| Transfer listing  | `players.transfer_listed_at`             |
| Transfer UI       | `resolveTransferMarket`                  |
| Live listings     | listed `players` (other clubs)           |
| Pending / Counter | `transfer_offers`                        |
| Opening snapshot  | `opening_amount`                         |
| Settle amount     | `current_amount`                         |
| Ask               | `deriveTransferFee`                      |
| Settlement buy    | `completeTransferBuy` (seed \| live)     |
| Settlement sell   | `completeTransferSell` (instant \| live) |

## Not on production

AI clubs · 2+ counters · buyer Counter · Instant Sell nego · custom ask · timeout / AI pending · escrow · `completeLiveTransfer()` · potential · full **22** fixtures · Physics · individual training · skill growth · envelope ratio ≠ 1.

## Last updated

2026-07-26 — AI-DOCS-CONSOLIDATION-02 (feature baseline = LFE-TRANSFERS-08)
