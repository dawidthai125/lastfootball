# Platform — Training

## Cel

Trening zespołowy Thin + **Training Depth** (GDD §8 wycinek) — przygotowanie kadry między meczami: mutacja **statusów** oraz mikro-impuls **`players.skill`**.

## SSOT

| Fakt           | Źródło                                                                           |
| -------------- | -------------------------------------------------------------------------------- |
| UI             | **wyłącznie** `resolveClubTraining(...)` → `TrainingDto`                         |
| Skutki kadry   | `players.status` + `players.skill` (bez insert/delete; bez XP / OVR; **skill ≤ potential**) |
| Persist sesji  | RPC `complete_training_session` — atomowo status + skill + `last_training_on`                |
| Efekty (pure)  | `applyTrainingSessionEffects` (regen / light / normal / high + skill Thin vs potential)      |
| Ostatnia sesja | `clubs.last_training_on` (`date`, dzień UTC `YYYY-MM-DD`)                        |
| Unlock         | played fixtures ≥ `TRAINING_THIN.UNLOCK_AFTER_PLAYED=2` (derive)                 |
| Shared unlock  | `hasPlayedUnlock` / `countPlayedInList` / `countClubPlayedFixtures`              |
| Slot dnia      | 1 sesja / dzień kalendarzowy UTC (Thin vs GDD „timezone gracza”)                 |
| XI Gate        | INJURED / SUSPENDED = hard block; TIRED = OK + warning (≥4); kick-off hard fail  |

## Unlock Nav

Trening open gdy `SEASON` **i** `trainingUnlocked` (played ≥ 2).

## Zachowanie Thin (TRAINING-01 + TRAINING-02)

- Fokus zespołowy + intensywność; Regeneracja: `TIRED` → `READY` (bez +skill).
- **Skill progression:** max +1 skill / zawodnik / sesja; K=3; soft ceiling `skill ≥ 85` tylko przy intensywności `high`; light/regen = 0 skill; **nigdy `skill > potential`** (PLAYERS-02).
- Mecz pozostaje głównym źródłem rozwoju — trening = impuls wspierający (anti-farm).
- Atrybuty UI nadal **derive(skill)** — brak kolumn atrybutów / XP / morale; **potential** = osobne pole SSOT (pasma w UI).
- Bez kosztu cash; **bez zmian LFE / Match Engine** (skill/status nie idą do silnika).
- Idempotencja: druga sesja tego samego dnia UTC → `already_trained_today`.
- Feedback UI po sesji: trenowało · zmęczeni · zregenerowani · +skill (bez dashboardów).

## XI Gate (LFE-TRAINING-02)

| Status    | XI                                          |
| --------- | ------------------------------------------- |
| READY     | dozwolony                                   |
| TIRED     | dozwolony + warning gdy ≥4 w XI             |
| INJURED   | **hard block** (validate / save / kick-off) |
| SUSPENDED | **hard block**                              |
| DEPARTED  | wykluczony (bez zmian)                      |

Kick-off: hard fail bez auto-swap (`resolveStartingXi`).

## Operacyjne

> Migracja Supabase RPC `complete_training_session` musi zostać zastosowana na środowisku produkcyjnym.  
> Ceiling `players.potential` (PLAYERS-02 / D22) — migracja `20260729120000_…` również wymagana na prod.

## Decyzje

D21 · D22 (potential ceiling) — [`../DECISIONS.md`](../DECISIONS.md).

## Poza Thin

Trening indywidualny, plany tygodnia, buff taktyczny 1 mecz, morale/kondycja jako osobne SSOT liczbowe, koszt §26, timezone gracza, kontuzje treningowe, XP / attribute DB, pay-to-train, mapowanie skill→LFE.

## UI (presentation)

Ekran `/training` = decision-first (question-day); secondary / soft-link **Kadra** → `/squad`.  
Szczegóły: [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16.

## Kod

`lib/training/*` · `lib/fixtures/played-unlock.ts` · `lib/squad/validate-starting-xi.ts` · `/training`  
Migracja: `supabase/migrations/20260729100000_training_depth_session.sql`

## Last updated

2026-07-29 — LFE-PLAYERS-02 (potential ceiling)
