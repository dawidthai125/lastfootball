# AI — Current Baseline (Production)

## Cel

Jedyny szybki SSOT: **co jest wdrożone na produkcji teraz**.

## Trzy warstwy baseline

| Pojęcie                     | Znaczenie                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Production Baseline**     | Oficjalny tip produktu po zamknięciu programu **UI P0** (Night Pitch Office) — hash w tabeli poniżej |
| **Domain feature baseline** | Ostatni commit **domenowy** (`feat(transfers                                                         | …)`), bez zmian przez UI presentation |
| **Documentation tip**       | Nowszy `docs:` / `style:` na `main` — **nie** zastępuje Production / Domain baseline                 |

```bash
git log -1 --oneline                    # tip (może być docs)
git log -1 --oneline 54d0724            # Production Baseline UI P0
git log -1 --oneline 9b1c575            # Domain feature baseline TRANSFERS-08
```

---

## Production

| Pole                        | Wartość                                                                       |
| --------------------------- | ----------------------------------------------------------------------------- |
| URL                         | https://lastfootball.vercel.app                                               |
| Alias                       | https://lastfootball.pl                                                       |
| Branch                      | `main`                                                                        |
| **Production Baseline**     | `54d0724` — **LFE-UI-IMPL-06** CLOSED (Live → Post fidelity)                  |
| Baseline message            | `feat(ui): polish Live Match and Post fidelity (LFE-UI-IMPL-06)`              |
| UI P0 status                | **CLOSED** · IMPL-01…06 · 06A · CONTENT-PASS-01 · DOCS-SYNC-01                |
| **Domain feature baseline** | `9b1c57578042d16e962d8026ed01abae587c294d` — **LFE-TRANSFERS-08** (bez zmian) |
| Domain message              | `feat(transfers): add live H2H counter offers Thin (LFE-TRANSFERS-08)`        |
| **Documentation tip**       | `LFE-DOCS-BASELINE-01` — hash = tip `main` po tym CLOSE (patrz `git log -1`)  |

UI P0 (Night Pitch Office) jest na produkcji jako warstwa prezentacji — **bez** zmiany Domain baseline TRANSFERS-08 (DTO / settlement / unlock).

## Stack

- Next.js 15 (App Router) · TypeScript · Turbopack/dev
- Supabase Auth + Postgres (`anoeimngwptucjdugjme`)
- Vercel Production
- LFE `@lastfootball/lfe` · `0.9.1-match-ai01`

## Player path (verified)

```
Landing → Auth → Welcome → Club Wizard · Reveal
  → First Match → Tunnel → VS → Pre → (XI) → Live → Post → Welcome LF
  → Hub (EARLY_CLUB → SEASON) · Night Pitch Office shell
  → Squad · Training · Transfers · Finance · Terminarz
  → Match Path immersive (chrome ukryty na /match/*)
```

## Critical SSOT

| SSOT              | Gdzie                                     |
| ----------------- | ----------------------------------------- |
| Cash              | `cash_balance`                            |
| Transfer envelope | `resolveTransferEnvelope`                 |
| Transfer listing  | `players.transfer_listed_at`              |
| Transfer UI       | `resolveTransferMarket`                   |
| Live listings     | listed `players` (other clubs)            |
| Pending / Counter | `transfer_offers`                         |
| Opening snapshot  | `opening_amount`                          |
| Settle amount     | `current_amount`                          |
| Ask               | `deriveTransferFee`                       |
| Settlement buy    | `completeTransferBuy` (seed \| live)      |
| Settlement sell   | `completeTransferSell` (instant \| live)  |
| UI presentation   | `game-design/UI_DESIGN_GUIDE.md` §16      |
| UI microcopy      | `apps/web/src/lib/ui/copy.ts` (`UI_COPY`) |
| Impl notes UI P0  | `docs/implementation/`                    |

## Not on production

AI clubs · 2+ counters · buyer Counter · Instant Sell nego · custom ask · timeout / AI pending · escrow · `completeLiveTransfer()` · potential · full **22** fixtures · Physics · individual training · skill growth · envelope ratio ≠ 1 · P1+ domains (Board / Sponsors UI full).

## Last updated

2026-07-29 — LFE-DOCS-BASELINE-01 (Production Baseline = UI P0 · `54d0724`; Domain = TRANSFERS-08)
