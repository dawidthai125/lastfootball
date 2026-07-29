# AI — Current Baseline (Production)

## Cel

Jedyny szybki SSOT: **co jest wdrożone na produkcji teraz**.

## Cztery warstwy baseline

| Pojęcie                     | Znaczenie                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------- |
| **Production Baseline**     | Oficjalny tip **UI P0** (Night Pitch Office game shell) — hash w tabeli poniżej                    |
| **Domain feature baseline** | Ostatni commit **domenowy** (`feat(training…)` / `feat(transfers…)`)                               |
| **Presentation tip**        | Ostatni feat prezentacji po UI P0 (Landing · Branding · Auth UX) — **nie** zmienia Domain baseline |
| **Documentation tip**       | Nowszy `docs:` na `main` — **nie** zastępuje Production / Domain / Presentation tip                |

```bash
git log -1 --oneline                    # tip (może być docs)
git log -1 --oneline 54d0724            # Production Baseline UI P0
git log -1 --oneline 5e6c2ad            # Domain feature baseline TRAINING-02
git log -1 --oneline 9dc834a            # Presentation tip AUTH-UX-01
```

---

## Production

| Pole                        | Wartość                                                                |
| --------------------------- | ---------------------------------------------------------------------- |
| URL                         | https://lastfootball.vercel.app                                        |
| Alias                       | https://lastfootball.pl                                                |
| Branch                      | `main`                                                                 |
| **Production Baseline**     | `54d0724` — **LFE-UI-IMPL-06** CLOSED (Live → Post fidelity)           |
| Baseline message            | `feat(ui): polish Live Match and Post fidelity (LFE-UI-IMPL-06)`       |
| UI P0 status                | **CLOSED** · IMPL-01…06 · 06A · CONTENT-PASS-01 · DOCS-SYNC-01         |
| **Domain feature baseline** | `5e6c2ad` — **LFE-TRAINING-02** (Training Depth · skill + XI Gate)     |
| Domain message              | `feat(training): implement LFE-TRAINING-02 training depth`             |
| **Presentation tip**        | `9dc834a` — **LFE-AUTH-UX-01** (Landing + Branding + Auth UX na prod)  |
| Presentation message        | `feat(auth-ux): redesign login/register experience with Landing modal` |
| **Documentation tip**       | `ea8f2d5` — **LFE-TRAINING-02** DOCS CLOSE                             |
| Status                      | **PRODUCTION VERIFIED · GREEN**                                        |

Prior domain TRANSFERS-08 (`9b1c575`) pozostaje w historii; tip domenowy = TRAINING-02.

Master handoff: [`PROJECT_HANDOFF.md`](./PROJECT_HANDOFF.md).

## Stack

- Next.js 15 (App Router) · TypeScript · Turbopack/dev
- Supabase Auth + Postgres (`anoeimngwptucjdugjme`)
- Vercel Production
- LFE `@lastfootball/lfe` · `0.9.1-match-ai01`

## Player path (verified)

```
Landing → Auth (modal lub /login|/register) → Welcome → Club Wizard · Reveal
  → First Match → Tunnel → VS → Pre → (XI) → Live → Post → Welcome LF
  → Hub (EARLY_CLUB → SEASON) · Night Pitch Office shell
  → Squad · Training (Depth: skill + XI Gate) · Transfers · Finance · Terminarz
  → Match Path immersive (chrome ukryty na /match/*)
```

## Critical SSOT

| SSOT              | Gdzie                                        |
| ----------------- | -------------------------------------------- |
| Cash              | `cash_balance`                               |
| Transfer envelope | `resolveTransferEnvelope`                    |
| Transfer listing  | `players.transfer_listed_at`                 |
| Transfer UI       | `resolveTransferMarket`                      |
| Live listings     | listed `players` (other clubs)               |
| Pending / Counter | `transfer_offers`                            |
| Opening snapshot  | `opening_amount`                             |
| Settle amount     | `current_amount`                             |
| Ask               | `deriveTransferFee`                          |
| Settlement buy    | `completeTransferBuy` (seed \| live)         |
| Settlement sell   | `completeTransferSell` (instant \| live)     |
| Training UI       | `resolveClubTraining`                        |
| Training persist  | RPC `complete_training_session`              |
| Training effects  | `applyTrainingSessionEffects` (status+skill) |
| XI Gate           | `validateStartingXi` / `resolveStartingXi`   |
| UI presentation   | `game-design/UI_DESIGN_GUIDE.md` §16         |
| UI microcopy      | `apps/web/src/lib/ui/copy.ts` (`UI_COPY`)    |
| Branding          | K1+K3 · `BrandLogo` · `apps/web/public/`     |
| Impl notes UI     | `docs/implementation/`                       |
| Master handoff    | `docs/AI/PROJECT_HANDOFF.md`                 |

## Operacyjne

> Migracja Supabase RPC `complete_training_session` musi zostać zastosowana na środowisku produkcyjnym.

## Not on production

AI clubs · 2+ counters · buyer Counter · Instant Sell nego · custom ask · timeout / AI pending · escrow · `completeLiveTransfer()` · potential · full **22** fixtures · Physics · individual training · XP / attribute DB · envelope ratio ≠ 1 · P1+ domains (Board / Sponsors UI full).

## Last updated

2026-07-29 — LFE-TRAINING-02 (Domain `5e6c2ad` · UI P0 `54d0724` · Presentation AUTH-UX `9dc834a`)
