# Platform — Training

## Cel

Trening zespołowy Thin (GDD §8 wycinek) — przygotowanie kadry między meczami przez mutację **statusów** na `players`.

## SSOT

| Fakt           | Źródło                                                                       |
| -------------- | ---------------------------------------------------------------------------- |
| UI             | **wyłącznie** `resolveClubTraining(...)` → `TrainingDto`                     |
| Skutki kadry   | `players.status` (bez `skill`, bez insert/delete)                            |
| Ostatnia sesja | `clubs.last_training_on` (`date`, dzień UTC `YYYY-MM-DD`)                    |
| Unlock         | played fixtures ≥ `TRAINING_THIN.UNLOCK_AFTER_PLAYED=2` (derive)             |
| Shared unlock  | `hasPlayedUnlock` / `countPlayedInList` / `countClubPlayedFixtures`          |
| Slot dnia      | 1 sesja / dzień kalendarzowy UTC (Thin vs GDD „timezone gracza”)             |
| Efekty         | pure `applyTrainingSessionEffects` (Regeneracja / Lekka / Normalna / Wysoka) |

## Unlock Nav

Trening open gdy `SEASON` **i** `trainingUnlocked` (played ≥ 2).

## Zachowanie Thin

- Fokus zespołowy + intensywność; Regeneracja: `TIRED` → `READY`.
- Bez wzrostu `skill`; bez kosztu cash; bez zmian LFE / Match Engine.
- Idempotencja: druga sesja tego samego dnia UTC → `already_trained_today`.

## Decyzje

D21 — [`../DECISIONS.md`](../DECISIONS.md).

## Poza Thin

Trening indywidualny, plany tygodnia, buff taktyczny 1 mecz, morale/kondycja jako osobne SSOT liczbowe, koszt §26, timezone gracza, filtr XI po statusie, pay-to-train.

## Kod

`lib/training/*` · `lib/fixtures/played-unlock.ts` · `/training`

## Last updated

2026-07-25 — LFE-TRAINING-01 CLOSE
