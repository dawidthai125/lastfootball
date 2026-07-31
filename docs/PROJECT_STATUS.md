# Project Status — Last Football

## Cel

**SSOT statusu projektu** („gdzie jesteśmy”).  
Inne handoff / state docs **odsyłają tutaj** — nie kopiuj pełnego statusu.

| Potrzebujesz                | Dokument                                                                       |
| --------------------------- | ------------------------------------------------------------------------------ |
| Feature baseline / docs tip | [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)                           |
| Master handoff AI           | [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md)                             |
| Lista EPIC DONE/PLANNED     | [`ROADMAP.md`](./ROADMAP.md)                                                   |
| Indeks EPIC (skrót AI)      | [`AI/EPIC_INDEX.md`](./AI/EPIC_INDEX.md)                                       |
| UI / Auth presentation      | [`implementation/`](./implementation/)                                         |
| Onboarding AI               | [`AGENTS.md`](../AGENTS.md) → [`AI/AI_QUICK_START.md`](./AI/AI_QUICK_START.md) |

## Aktualny etap

**PRODUCTION VERIFIED · GREEN · LFE-TRANSFERS-10 CLOSED** (TD-03+ · Domain tip `9424dd8`)

|                         |                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------- |
| **Production Baseline** | **`54d0724`** — **LFE-UI-IMPL-06** (Live → Post fidelity)                              |
| **Domain feature**      | **`9424dd8`** — **LFE-TRANSFERS-10** (TD-03+ · actions split · displayPos · D116–D118) |
| **Presentation tip**    | **`9fd14fc`** — LFE-UI-MOTION-01 (Hub/Match motion Thin)                               |
| **Documentation tip**   | CLOSE sync — tip pin follows                                                           |
| **Prod**                | https://lastfootball.vercel.app                                                        |

| Tor               | Stan                                                                                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform          | Onboarding · First Match · Hub · League 22 · Season End · Promotion · Sponsors · Board · Stadium · Finance · Players · Transfers **10** · Messages · Club · SoftLock · Training · Academy · Scouting · Daily · Achievements · Ranking |
| UX presentation   | **UI P0 CLOSED** · Landing · Branding · Auth UX · **MOTION-01** · Night Pitch Office · Guide §8/§16                                                                                                                                   |
| Engine / Match UI | LFE 0.9.1 + Live · Canvas · Replay · Post · Match Path immersive · XI Gate                                                                                                                                                            |
| Design            | GDD-01…**22** Thin · Season End · Promotion · Sponsors · Board · Stadium · Transfers-10 / TD-03+ CLOSED (D116–D118) · §26 CLOSED · World Art CLOSED · **next: Owner GO → Zawężenie LFE PUBLIC exports**                               |
| Infra             | Vercel + Supabase · CI GREEN · TRANSFERS-10 = org refactor only (brak migracji)                                                                                                                                                       |

## W trakcie

Brak otwartego EPIC. **LFE-TRANSFERS-10** CLOSED · D116–D118 · Domain tip `9424dd8` · **M2.5 PASS**.  
**Nie startować** kolejnego EPIC bez Owner GO.

## Operacyjne

> Migracje Supabase na prod: training · potential · `academy_track` · `scout_shortlist` · fee helpers · `season_number` / `season_phase` · `league_tier` · **`club_sponsor_contracts`** (SPONSORS-01).  
> SoftLock / Club / Messages / Board / Stadium / TRANSFERS-10: brak migracji.

## Co następne

Patrz [`ROADMAP.md`](./ROADMAP.md) · rekomendacja w [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) §10.  
**Rekomendacja:** **czekaj na Owner GO** — **Zawężenie LFE PUBLIC exports**. Alternatywy: Ratings v2 · §22 push.

## Decyzje

[`DECISIONS.md`](./DECISIONS.md) · D19…D28 · D38 · D40–D52 · D63–D67 · D68–D87 · D88–D94 · D95–D101 · D102–D108 · D109–D115 · **D116–D118**.  
Transfers-10 PLAN: [`implementation/LFE-TRANSFERS-10-PLAN.md`](./implementation/LFE-TRANSFERS-10-PLAN.md) · architektura: [`platform/TRANSFER_ARCHITECTURE.md`](./platform/TRANSFER_ARCHITECTURE.md).

## Last updated

2026-07-31 — LFE-TRANSFERS-10 CLOSED · Domain `9424dd8`
