# AI — Current Baseline (Production)

## Cel

Jedyny szybki SSOT: **co jest wdrożone na produkcji teraz**.

## Cztery warstwy baseline

| Pojęcie                     | Znaczenie                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Production Baseline**     | Oficjalny tip **UI P0** (Night Pitch Office game shell) — hash w tabeli poniżej                           |
| **Domain feature baseline** | Ostatni commit **domenowy** (`feat(scouting…)` / `feat(academy…)` / `feat(players…)` / `feat(training…)`) |
| **Presentation tip**        | Ostatni feat prezentacji po UI P0 (Landing · Brand · Auth · **Motion**) — **nie** zmienia Domain baseline |
| **Documentation tip**       | Nowszy `docs:` na `main` — **nie** zastępuje Production / Domain / Presentation tip                       |

```bash
git log -1 --oneline                    # tip (może być docs)
git log -1 --oneline 54d0724            # Production Baseline UI P0
git log -1 --oneline 8bb3643     # Documentation tip LFE-SCOUTING-01 CLOSE (pin)
git log -1 --oneline 93fd6d5            # Domain feature baseline SCOUTING-01
git log -1 --oneline a29812d            # Build fix (client barrel)
git log -1 --oneline 9c6fe86            # Prior Domain ACADEMY-01
git log -1 --oneline 9fd14fc            # Presentation tip MOTION-01
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
| **Domain feature baseline** | `93fd6d5` — **LFE-SCOUTING-01** (Information Thin · shortlist)        |
| Domain message              | `feat(scouting): implement LFE-SCOUTING-01 Information Thin`          |
| **Presentation tip**        | `9fd14fc` — **LFE-UI-MOTION-01** (Hub/Match presentation motion Thin) |
| Presentation message        | `feat(ui): implement LFE-UI-MOTION-01 presentation motion thin`       |
| **Documentation tip**       | `8bb3643` — **LFE-SCOUTING-01** CLOSE sync (pin)                      |
| Status                      | **PRODUCTION VERIFIED · GREEN** · SCOUTING-01 CLOSED · ACADEMY-01     |

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
  → Scouting (SEASON) · resolveClubScouting · private shortlist (refs only)
  → Match Path immersive (chrome ukryty na /match/*)
  → Match development (PRIMARY skill growth · pasma potencjału)
  → Hub/Match presentation motion Thin (enter · press · Goal/Final overlay)
```

## Critical SSOT

| SSOT              | Gdzie                                                                            |
| ----------------- | -------------------------------------------------------------------------------- |
| Cash              | `cash_balance`                                                                   |
| Transfer envelope | `resolveTransferEnvelope`                                                        |
| Transfer listing  | `players.transfer_listed_at`                                                     |
| Transfer UI       | `resolveTransferMarket`                                                          |
| Live listings     | listed `players` (other clubs)                                                   |
| Pending / Counter | `transfer_offers`                                                                |
| Opening snapshot  | `opening_amount`                                                                 |
| Settle amount     | `current_amount`                                                                 |
| Ask               | `deriveTransferFee` (skill+age only)                                             |
| Settlement buy    | `completeTransferBuy` (seed \| live)                                             |
| Settlement sell   | `completeTransferSell` (instant \| live)                                         |
| Training UI       | `resolveClubTraining`                                                            |
| Training persist  | RPC `complete_training_session`                                                  |
| Training effects  | `applyTrainingSessionEffects` (status+skill≤P)                                   |
| Potential         | `players.potential` · `resolvePlayerPotential`                                   |
| Match development | RPC `apply_match_development` · K_MATCH=5                                        |
| XI Gate           | `validateStartingXi` / `resolveStartingXi`                                       |
| Academy UI        | `resolveClubAcademy` · `players.academy_track` / `promoted_at`                   |
| Scouting UI       | `resolveClubScouting` (REUSE market + potential)                                 |
| Shortlist         | `scout_shortlist` = **tylko** `(club_id, player_id)` → `players.id`              |
| Ranking (produkt) | GDD §18 Thin (docs) — sezonowy ranking klubów; placeholder ≠ SSOT                |
| Osiągnięcia       | GDD §19 Thin (docs) — kamienie / historia; placeholder ≠ SSOT                    |
| Wiadomości        | GDD §21 Thin (docs) — in-app inbox · skutek zdarzenia; placeholder ≠ SSOT        |
| Powiadomienia     | GDD §22 Thin (docs) — polityka alertów · zaproszenie ≠ wymuszenie; push = Future |
| UI presentation   | `game-design/UI_DESIGN_GUIDE.md` §16 · Motion §8 · `styles/motion.css`           |
| UI microcopy      | `apps/web/src/lib/ui/copy.ts` (`UI_COPY`)                                        |
| Branding          | K1+K3 · `BrandLogo` · `apps/web/public/`                                         |
| Impl notes        | `docs/implementation/`                                                           |
| Master handoff    | `docs/AI/PROJECT_HANDOFF.md`                                                     |

### Shortlista (kontrakt Thin)

- `scout_shortlist` jest **wyłącznie relacją preferencji** `(club_id, player_id)` referencjonującą `players.id`.
- **Nie** jest drugim modelem zawodnika — brak kolumn skill / potential / score / oceny.
- Shortlista **nie wpływa** na AI, rynek, transfery, potencjał ani symulację — wyłącznie organizacja pracy menedżera.

## Operacyjne

> Migracje Supabase na prod (zastosowane): `complete_training_session` · `players.potential` + `apply_match_development` · **`academy_track` / `promoted_at`** (`20260730120000_academy_track.sql`) · **`scout_shortlist`** (`20260730140000_scout_shortlist.sql`).

## Not on production

AI clubs · 2+ counters · buyer Counter · Instant Sell nego · custom ask · timeout / AI pending · escrow · `completeLiveTransfer()` · full **22** fixtures · Physics · individual training · XP / attribute DB · **kod Rankingu** · **kod Osiągnięć** · **kod Wiadomości** · **kanał push / email powiadomień** · auto season-end `age++` · numeric potential in UI · envelope ratio ≠ 1 · P1+ domains (Board / Sponsors UI full) · academy levels / cash-gate / youth OVR · scout fog / regiony / misje / koszty / personel / `scout_score`.

## Last updated

2026-07-30 — LFE-SCOUTING-01 CLOSED · Domain `93fd6d5` · Presentation `9fd14fc` · Docs tip `8bb3643` (pin)
