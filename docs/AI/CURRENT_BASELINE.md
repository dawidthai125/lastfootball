# AI — Current Baseline (Production)

## Cel

Jedyny szybki SSOT: **co jest wdrożone na produkcji teraz**.

## Cztery warstwy baseline

| Pojęcie                     | Znaczenie                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Production Baseline**     | Oficjalny tip **UI P0** (Night Pitch Office game shell) — hash w tabeli poniżej                            |
| **Domain feature baseline** | Ostatni commit **domenowy** (`feat(academy…)` / `feat(players…)` / `feat(training…)` / `feat(transfers…)`) |
| **Presentation tip**        | Ostatni feat prezentacji po UI P0 (Landing · Brand · Auth · **Motion**) — **nie** zmienia Domain baseline  |
| **Documentation tip**       | Nowszy `docs:` na `main` — **nie** zastępuje Production / Domain / Presentation tip                        |

```bash
git log -1 --oneline                    # tip (może być docs)
git log -1 --oneline 54d0724            # Production Baseline UI P0
git log -1 --oneline bf07a44            # GDD-21 content (messages thin)
git log -1 --oneline 9c6fe86            # Domain feature baseline ACADEMY-01
git log -1 --oneline 9fd14fc            # Presentation tip MOTION-01
git log -1 --oneline 57a5875            # Prior docs tip ACADEMY-01 CLOSE
git log -1 --oneline 1d78648            # Prior pin ACADEMY-01 tip
```

---

## Production

| Pole                        | Wartość                                                               |
| --------------------------- | --------------------------------------------------------------------- |
| URL                         | https://lastfootball.vercel.app                                       |
| Alias                       | https://lastfootball.pl                                               |
| Branch                      | `main`                                                                |
| **Production Baseline**     | `54d0724` — **LFE-UI-IMPL-06** CLOSED (Live → Post fidelity)          |
| Baseline message            | `feat(ui): polish Live Match and Post fidelity (LFE-UI-IMPL-06)`      |
| UI P0 status                | **CLOSED** · IMPL-01…06 · 06A · CONTENT-PASS-01 · DOCS-SYNC-01        |
| **Domain feature baseline** | `9c6fe86` — **LFE-ACADEMY-01** (Academy Thin A · Intake + Promote)    |
| Domain message              | `feat(academy): implement LFE-ACADEMY-01 Thin A intake and promote`   |
| **Presentation tip**        | `9fd14fc` — **LFE-UI-MOTION-01** (Hub/Match presentation motion Thin) |
| Presentation message        | `feat(ui): implement LFE-UI-MOTION-01 presentation motion thin`       |
| **Documentation tip**       | _(CLOSE)_ — **GDD-21** Wiadomości Thin (content `bf07a44`)            |
| Status                      | **PRODUCTION VERIFIED · GREEN** · GDD-21 CLOSED · ACADEMY-01 CLOSED   |

Prior docs tip ACADEMY-01 CLOSE = `57a5875` (pin `1d78648`). GDD-21 content = `bf07a44`. Domain tip bez zmian (docs-only).

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
  → Academy (SEASON) · Intake + Promote · academy_track on players
  → Match Path immersive (chrome ukryty na /match/*)
  → Match development (PRIMARY skill growth · pasma potencjału)
  → Hub/Match presentation motion Thin (enter · press · Goal/Final overlay)
```

## Critical SSOT

| SSOT              | Gdzie                                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| Cash              | `cash_balance`                                                         |
| Transfer envelope | `resolveTransferEnvelope`                                              |
| Transfer listing  | `players.transfer_listed_at`                                           |
| Transfer UI       | `resolveTransferMarket`                                                |
| Live listings     | listed `players` (other clubs)                                         |
| Pending / Counter | `transfer_offers`                                                      |
| Opening snapshot  | `opening_amount`                                                       |
| Settle amount     | `current_amount`                                                       |
| Ask               | `deriveTransferFee` (skill+age only)                                   |
| Settlement buy    | `completeTransferBuy` (seed \| live)                                   |
| Settlement sell   | `completeTransferSell` (instant \| live)                               |
| Training UI       | `resolveClubTraining`                                                  |
| Training persist  | RPC `complete_training_session`                                        |
| Training effects  | `applyTrainingSessionEffects` (status+skill≤P)                         |
| Potential         | `players.potential` · `resolvePlayerPotential`                         |
| Match development | RPC `apply_match_development` · K_MATCH=5                              |
| XI Gate           | `validateStartingXi` / `resolveStartingXi`                             |
| Academy UI        | `resolveClubAcademy` · `players.academy_track` / `promoted_at`         |
| Ranking (produkt) | GDD §18 Thin (docs) — sezonowy ranking klubów; placeholder ≠ SSOT      |
| Osiągnięcia       | GDD §19 Thin (docs) — kamienie / historia; placeholder ≠ SSOT          |
| Wiadomości        | GDD §21 Thin (docs) — in-app inbox · skutek zdarzenia; placeholder ≠ SSOT |
| UI presentation   | `game-design/UI_DESIGN_GUIDE.md` §16 · Motion §8 · `styles/motion.css` |
| UI microcopy      | `apps/web/src/lib/ui/copy.ts` (`UI_COPY`)                              |
| Branding          | K1+K3 · `BrandLogo` · `apps/web/public/`                               |
| Impl notes UI     | `docs/implementation/`                                                 |
| Master handoff    | `docs/AI/PROJECT_HANDOFF.md`                                           |

## Operacyjne

> Migracje Supabase na prod (zastosowane): `complete_training_session` · `players.potential` + `apply_match_development` · **`academy_track` / `promoted_at`** (`20260730120000_academy_track.sql`).

## Not on production

AI clubs · 2+ counters · buyer Counter · Instant Sell nego · custom ask · timeout / AI pending · escrow · `completeLiveTransfer()` · full **22** fixtures · Physics · individual training · XP / attribute DB · **kod Skautingu** · **kod Rankingu** · **kod Osiągnięć** · **kod Wiadomości** · auto season-end `age++` · numeric potential in UI · envelope ratio ≠ 1 · P1+ domains (Board / Sponsors UI full) · academy levels / cash-gate / youth OVR.

## Last updated

2026-07-30 — GDD-21 CLOSED (Domain `9c6fe86` · Presentation `9fd14fc` · content `bf07a44` · UI P0 `54d0724`)
