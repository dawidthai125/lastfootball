# AI — Current Baseline (Production)

## Cel

Jedyny szybki SSOT: **co jest wdrożone na produkcji teraz**.

## Cztery warstwy baseline

| Pojęcie                     | Znaczenie                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------- |
| **Production Baseline**     | Oficjalny tip **UI P0** (Night Pitch Office game shell) — hash w tabeli poniżej                    |
| **Domain feature baseline** | Ostatni commit **domenowy** (`feat(players…)` / `feat(training…)` / `feat(transfers…)`)            |
| **Presentation tip**        | Ostatni feat prezentacji po UI P0 (Landing · Branding · Auth UX) — **nie** zmienia Domain baseline |
| **Documentation tip**       | Nowszy `docs:` na `main` — **nie** zastępuje Production / Domain / Presentation tip                |

```bash
git log -1 --oneline                    # tip (może być docs)
git log -1 --oneline 54d0724            # Production Baseline UI P0
git log -1 --oneline cd222ba            # Domain feature baseline PLAYERS-02
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
| **Domain feature baseline** | `cd222ba` — **LFE-PLAYERS-02** (Player Development Thin)               |
| Domain message              | `feat(players): implement LFE-PLAYERS-02 player development`           |
| **Presentation tip**        | `9dc834a` — **LFE-AUTH-UX-01** (Landing + Branding + Auth UX na prod)  |
| Presentation message        | `feat(auth-ux): redesign login/register experience with Landing modal` |
| **Documentation tip**       | `2595cc9` — **GDD-17** Skauting Information Thin B (docs)              |
| Status                      | **PRODUCTION VERIFIED · GREEN**                                        |

Prior domain TRAINING-02 (`5e6c2ad`) pozostaje w historii; tip domenowy = PLAYERS-02.  
Documentation tip = GDD-17 (`2595cc9`).

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
  → Squad · Training (Depth + potential ceiling) · Transfers · Finance · Terminarz
  → Match Path immersive (chrome ukryty na /match/*)
  → Match development (PRIMARY skill growth · pasma potencjału)
```

## Critical SSOT

| SSOT              | Gdzie                                          |
| ----------------- | ---------------------------------------------- |
| Cash              | `cash_balance`                                 |
| Transfer envelope | `resolveTransferEnvelope`                      |
| Transfer listing  | `players.transfer_listed_at`                   |
| Transfer UI       | `resolveTransferMarket`                        |
| Live listings     | listed `players` (other clubs)                 |
| Pending / Counter | `transfer_offers`                              |
| Opening snapshot  | `opening_amount`                               |
| Settle amount     | `current_amount`                               |
| Ask               | `deriveTransferFee` (skill+age only)           |
| Settlement buy    | `completeTransferBuy` (seed \| live)           |
| Settlement sell   | `completeTransferSell` (instant \| live)       |
| Training UI       | `resolveClubTraining`                          |
| Training persist  | RPC `complete_training_session`                |
| Training effects  | `applyTrainingSessionEffects` (status+skill≤P) |
| Potential         | `players.potential` · `resolvePlayerPotential` |
| Match development | RPC `apply_match_development` · K_MATCH=5      |
| XI Gate           | `validateStartingXi` / `resolveStartingXi`     |
| UI presentation   | `game-design/UI_DESIGN_GUIDE.md` §16           |
| UI microcopy      | `apps/web/src/lib/ui/copy.ts` (`UI_COPY`)      |
| Branding          | K1+K3 · `BrandLogo` · `apps/web/public/`       |
| Impl notes UI     | `docs/implementation/`                         |
| Master handoff    | `docs/AI/PROJECT_HANDOFF.md`                   |

## Operacyjne

> Migracje Supabase: RPC `complete_training_session` **oraz** `players.potential` + RPC `apply_match_development` (`20260729120000_player_potential_development.sql`) muszą zostać zastosowane na środowisku produkcyjnym.

## Not on production

AI clubs · 2+ counters · buyer Counter · Instant Sell nego · custom ask · timeout / AI pending · escrow · `completeLiveTransfer()` · full **22** fixtures · Physics · individual training · XP / attribute DB · **kod Akademii** · **kod Skautingu** · auto season-end `age++` · numeric potential in UI · envelope ratio ≠ 1 · P1+ domains (Board / Sponsors UI full).

## Last updated

2026-07-29 — GDD-17 (Domain `cd222ba` · Docs tip `2595cc9` · UI P0 `54d0724` · Presentation AUTH-UX `9dc834a`)
