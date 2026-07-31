# AI — Current Baseline (Production)

## Cel

Jedyny szybny SSOT: **co jest wdrożone na produkcji teraz**.

## Cztery warstwy baseline

| Pojęcie                     | Znaczenie                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Production Baseline**     | Oficjalny tip **UI P0** (Night Pitch Office game shell) — hash w tabeli poniżej                           |
| **Domain feature baseline** | Ostatni commit **domenowy** (`feat(achievements…)` / `feat(hub…daily…)` / `feat(scouting…)` / …)          |
| **Presentation tip**        | Ostatni feat prezentacji po UI P0 (Landing · Brand · Auth · **Motion**) — **nie** zmienia Domain baseline |
| **Documentation tip**       | Nowszy `docs:` na `main` — **nie** zastępuje Production / Domain / Presentation tip                       |

```bash
git log -1 --oneline                    # tip (może być docs)
git log -1 --oneline 54d0724            # Production Baseline UI P0
git log -1 --oneline 024e827            # Domain feature baseline SEASON-END-01
git log -1 --oneline 46f7caa            # Prior Domain SOFTLOCK-01
git log -1 --oneline 36ba9be            # Prior Domain CLUB-01
git log -1 --oneline 800ed0d            # Prior Domain MESSAGES-01
git log -1 --oneline e6885dc            # Prior Domain TRANSFERS-09
git log -1 --oneline 9027baf            # Prior Domain LEAGUE-04
git log -1 --oneline bf86749            # Prior Domain RANKING-01
git log -1 --oneline 3915be9            # Prior Domain ACHIEVEMENTS-01
git log -1 --oneline 73e1361            # Prior Domain DAILY-01
git log -1 --oneline 93fd6d5            # Prior Domain SCOUTING-01
git log -1 --oneline 9fd14fc            # Presentation tip MOTION-01
```

---

## Production

| Pole                        | Wartość                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| URL                         | https://lastfootball.vercel.app                                                                      |
| Alias                       | https://lastfootball.pl                                                                              |
| Branch                      | `main`                                                                                               |
| **Production Baseline**     | `54d0724` — **LFE-UI-IMPL-06** CLOSED (Live → Post fidelity)                                         |
| Baseline message            | `feat(ui): polish Live Match and Post fidelity (LFE-UI-IMPL-06)`                                     |
| UI P0 status                | **CLOSED** · IMPL-01…06 · 06A · CONTENT-PASS-01 · DOCS-SYNC-01                                       |
| **Domain feature baseline** | `024e827` — **LFE-SEASON-END-01** (Season End Thin · D78–D87)                                          |
| Domain message              | `feat(season): implement LFE-SEASON-END-01 Season End Thin lifecycle`                                |
| Prior Domain                | `46f7caa` — LFE-SOFTLOCK-01                                                                          |
| **Presentation tip**        | `9fd14fc` — **LFE-UI-MOTION-01** (Hub/Match presentation motion Thin)                                |
| Presentation message        | `feat(ui): implement LFE-UI-MOTION-01 presentation motion thin`                                      |
| **Documentation tip**       | CLOSE sync LFE-SEASON-END-01 (pin follows)                                                           |
| Status                      | **PRODUCTION VERIFIED · GREEN** · LFE-SEASON-END-01 CLOSED · D78–D87 · Domain tip `024e827`           |

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
  → Daily Goal Thin (resolveClubDailyGoal · suggestion under Primary)
  → Achievements Thin (resolveClubAchievements · immutable history)
  → Messages Thin (resolveClubMessages · /messages + Overlay · ta sama DTO)
  → Club identity Thin (resolveClubProfile · /club · D47–D51)
  → Soft-lock route gate (SoftLockRouteGate · SoftLockState · D52 · D63–D67)
  → Season End Thin GDD CLOSED (GDD-SEASON-END-01 · D68–D77 · kod Future)
  → Squad · Training (Depth + potential ceiling) · Transfers · Finance · Terminarz
  → Academy (SEASON) · Intake + Promote · academy_track on players
  → Scouting (SEASON) · resolveClubScouting · private shortlist (refs only)
  → Match Path immersive (chrome ukryty na /match/*)
  → Match development (PRIMARY skill growth · pasma potencjału)
  → Hub/Match presentation motion Thin (enter · press · Goal/Final overlay)
```

## Critical SSOT

| SSOT              | Gdzie                                                                                |
| ----------------- | ------------------------------------------------------------------------------------ |
| Cash              | `cash_balance`                                                                       |
| Transfer envelope | `resolveTransferEnvelope`                                                            |
| Transfer listing  | `players.transfer_listed_at`                                                         |
| Transfer UI       | `resolveTransferMarket`                                                              |
| Live listings     | listed `players` (other clubs)                                                       |
| Pending / Counter | `transfer_offers`                                                                    |
| Opening snapshot  | `opening_amount`                                                                     |
| Settle amount     | `current_amount`                                                                     |
| Ask               | `deriveTransferFee` (skill+age only)                                                 |
| Settlement buy    | `completeTransferBuy` (seed \| live)                                                 |
| Settlement sell   | `completeTransferSell` (instant \| live)                                             |
| Training UI       | `resolveClubTraining`                                                                |
| Training persist  | RPC `complete_training_session`                                                      |
| Training effects  | `applyTrainingSessionEffects` (status+skill≤P)                                       |
| Potential         | `players.potential` · `resolvePlayerPotential`                                       |
| Match development | RPC `apply_match_development` · K_MATCH=5                                            |
| XI Gate           | `validateStartingXi` / `resolveStartingXi`                                           |
| Academy UI        | `resolveClubAcademy` · `players.academy_track` / `promoted_at`                       |
| Scouting UI       | `resolveClubScouting` (REUSE market + potential)                                     |
| Shortlist         | `scout_shortlist` = **tylko** `(club_id, player_id)` → `players.id`                  |
| Daily Goal        | `resolveClubDailyGoal` — derive only · ≤1 suggestion · Primary CTA nadrzędny         |
| Achievements      | `resolveClubAchievements` — Information Thin · derive · immutable history · D26      |
| Ranking           | `resolveClubRanking` — Information Thin · table input · D27 · bez ELO                |
| Osiągnięcia       | patrz **Achievements** (kod Thin) — GDD §19 produkt                                  |
| Klub (profil)     | `resolveClubProfile` — identity Thin · D47–D51 · `/club` sole DTO                    |
| Wiadomości        | `resolveClubMessages` — derive E1–E3 · D40–D46 · `/messages` + Overlay = ta sama DTO |
| Powiadomienia     | GDD §22 Thin (docs) — polityka alertów · zaproszenie ≠ wymuszenie; push = Future     |
| UI presentation   | `game-design/UI_DESIGN_GUIDE.md` §16 · Motion §8 · `styles/motion.css`               |
| UI microcopy      | `apps/web/src/lib/ui/copy.ts` (`UI_COPY`)                                            |
| Branding          | K1+K3 · `BrandLogo` · `apps/web/public/`                                             |
| Impl notes        | `docs/implementation/`                                                               |
| Master handoff    | `docs/AI/PROJECT_HANDOFF.md`                                                         |

### Messages (kontrakt Thin)

- `resolveClubMessages` = **jedyny** SSOT danych UI wiadomości (D45) — pure derive E1–E3.
- `/messages` + Overlay = **ta sama** `ClubMessagesDto` (D43); UI **nie** sortuje / nie filtruje (D44).
- **Nie** DB · migracje · mark-as-read · Accept/Reject · drugi proces ofert (D46); Transfery = SSOT ofert.
- **NO RUNTIME MOCKS** (D40/D41) — brak MessagesPreview / MOCK_NOTIFICATIONS / stałego badge.

### Club Profile (kontrakt Thin)

- `resolveClubProfile` = **jedyny** SSOT UI `/club` (D51) — pure Composition (D48).
- Identity ≠ progression (D47); brak silnika §6 · brak personelu (D49).
- `ClubProfileView` = presentation only (D50); brak PlaceholderPage / mocków.

### Achievements (kontrakt Thin)

- `resolveClubAchievements` = **pure derive** z `ClubDto` + `fixtures` (First Match · played · training).
- **Nie** persist · XP · Achievement Score · ekonomia · Quest Engine.
- Historia **immutable** względem trwałych faktów domeny; ≠ Ranking · ≠ Daily Goal · ≠ §6.
- Placeholder `/achievements` zastąpiony — nie jest SSOT.

### Daily Goal (kontrakt Thin)

- `resolveClubDailyGoal` = **pure derive** z Hub session / Primary / fixtures / training unlock / `last_training_on` + UTC.
- **Nie** Quest Engine · **nie** persist · **nie** mutacje domeny · **nie** ekonomia / cron.
- Primary CTA zawsze nadrzędny; Daily Goal = Information Thin (sugestia).
- ≠ Secondary CTA daily **loop** (`resolveSecondaryCtas`).

### Shortlista (kontrakt Thin)

- `scout_shortlist` jest **wyłącznie relacją preferencji** `(club_id, player_id)` referencjonującą `players.id`.
- **Nie** jest drugim modelem zawodnika — brak kolumn skill / potential / score / oceny.
- Shortlista **nie wpływa** na AI, rynek, transfery, potencjał ani symulację — wyłącznie organizacja pracy menedżera.

## Operacyjne

> Migracje Supabase na prod (zastosowane): `complete_training_session` · `players.potential` + `apply_match_development` · **`academy_track` / `promoted_at`** (`20260730120000_academy_track.sql`) · **`scout_shortlist`** (`20260730140000_scout_shortlist.sql`) · **`derive_transfer_fee_thin` / `is_allowed_transfer_amount_thin`** (`20260730150000_transfer_fee_parity_helpers.sql` · LFE-TRANSFERS-09).  
> **LFE-DAILY-01 / LFE-ACHIEVEMENTS-01 / LFE-RANKING-01 / LFE-LEAGUE-04 / LFE-MESSAGES-01 / LFE-CLUB-01 / LFE-SOFTLOCK-01:** brak nowych migracji schematu tabel (MESSAGES = derive only; LEAGUE-04 = top-up fixtures; SOFTLOCK = presentation gate only).

## Not on production

AI clubs · 2+ counters · buyer Counter · Instant Sell nego · custom ask · timeout / AI pending · escrow · `completeLiveTransfer()` · Physics · individual training · XP / attribute DB · Messages DB / mark-as-read / Accept w skrzynce · §6 numeric engine / club staff UI · **kanał push / email powiadomień** · auto season-end `age++` · numeric potential in UI · envelope ratio ≠ 1 · P1+ domains (Board / Sponsors UI full) · Promotion / relegation · academy levels / cash-gate / youth OVR · scout fog / regiony / misje / koszty / personel / `scout_score` · Quest Engine / daily persist / nagrody zadań · achievement XP/score/persist.

2026-07-31 — LFE-SEASON-END-01 CLOSED · Domain tip `024e827`
