# AI â€” Current Baseline (Production)

## Cel

Jedyny szybki SSOT: **co jest wdroĹĽone na produkcji teraz**.

## Feature baseline vs documentation tip

| PojÄ™cie              | Znaczenie                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| **Feature baseline**  | Ostatni commit **produktowy** zamkniÄ™tego EPIC (`feat(â€¦)`) â€” hash w tabeli poniĹĽej        |
| **Documentation tip** | Nowszy commit na `main` typu `docs:` / `style:` po feature â€” **nie zmienia** feature baseline |
| **Style commit**      | WyĹ‚Ä…cznie Prettier; bez logiki                                                                |

```bash
git log -1 --oneline          # tip
git log -1 --oneline 8824793  # feature baseline TRANSFERS-06 Live H2H
```

---

## Production

| Pole                 | WartoĹ›Ä‡                                                                |
| -------------------- | ------------------------------------------------------------------------ |
| URL                  | https://lastfootball.vercel.app                                          |
| Alias                | https://lastfootball.pl                                                  |
| Branch               | `main`                                                                   |
| **Feature baseline** | `8824793727ae889e2c57b5b50747e28d94c3efd5`                               |
| Baseline message     | `feat(transfers): add live H2H Instant Buy Thin (LFE-TRANSFERS-06)`      |
| Docs CLOSE tip       | _(ten commit lub nowszy)_                                                |
| Status               | **LFE-TRANSFERS-06 CLOSED** Â· 05 Â· 04 Â· 03 Â· N1 Â· E1 Â· GDD-Â§26A/B |

## Stack

- Next.js 15 (App Router) Â· TypeScript Â· Turbopack/dev
- Supabase Auth + Postgres (`anoeimngwptucjdugjme`)
- Vercel Production
- LFE `@lastfootball/lfe` Â· `0.9.1-match-ai01`

## Player path (verified)

```
Landing â†’ Auth â†’ Welcome â†’ Club Wizard Â· Reveal
  â†’ First Match â†’ Live â†’ Post â†’ Welcome LF â†’ Hub (EARLY_CLUB â†’ SEASON)
  â†’ /transfers â† resolveTransferMarket() + Live H2H + listing + buy/seller nego + seed fallback
```

## Critical SSOT

| SSOT              | Gdzie                                       |
| ----------------- | ------------------------------------------- |
| Cash              | `cash_balance`                              |
| Transfer envelope | `resolveTransferEnvelope`                   |
| Transfer listing  | `players.transfer_listed_at`                |
| Transfer UI       | `resolveTransferMarket`                     |
| Live listings     | listed `players` (other clubs)              |
| Ask               | `deriveTransferFee` (one snapshot per Live) |
| Settlement buy    | `completeTransferBuy` (seed \| live)        |
| Settlement sell   | `completeTransferSell` (instant \| live)    |

## Not on production

AI clubs Â· Live nego Â· Instant Sell nego Â· custom ask Â· 2+ counters Â· pending/timeout/inbox Â· potential Â· full **22** fixtures Â· Physics Â· individual training Â· skill growth Â· envelope ratio â‰  1.

## Last updated

2026-07-26 â€” LFE-TRANSFERS-06 CLOSE
