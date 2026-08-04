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

**PRODUCTION VERIFIED · GREEN · LFE-NOTIFICATIONS-01 CLOSED** (Presentation `54ae7b3` · D125 · Domain `3c01baa` · D1–D125)

|                         |                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------ |
| **Production Baseline** | **`54d0724`** — **LFE-UI-IMPL-06** (Live → Post fidelity)                            |
| **Domain feature**      | **`3c01baa`** — **LFE-CAREER-DECLINE-01** (Career Phase · Growth Gate · D124)        |
| **Prior Domain**        | **`843bcfd`** — LFE-LEAGUE-WORLD-02 (League Strength Profile · D123)                 |
| **Presentation tip**    | **`54ae7b3`** — **LFE-NOTIFICATIONS-01** (Invitation Layer Thin · D125)              |
| **Prior Presentation**  | **`9fd14fc`** — LFE-UI-MOTION-01                                                     |
| **Documentation tip**   | **`c75577c`** — LFE-NOTIFICATIONS-01 DOCS CLOSE                                      |
| **tip `main`**          | **`c75577c`** — pin tip (Documentation tip = `c75577c`)                              |
| **Prod**                | https://lastfootball.vercel.app · **VERIFIED**                                       |
| **CI**                  | **GREEN**                                                                            |
| **Decisions**           | **D1–D125** (D125 Invitation Layer · D124 Career Phase · D123 Strength · D122 H-AGE) |

| Tor               | Stan                                                                                                                                                                                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform          | Onboarding · First Match · Hub · League 22 · League World · Season End · Age++ · Career Decline · Promotion · Sponsors · Board · Stadium · Finance · Players · Transfers **10** · Messages · **Invitations** · Club · SoftLock · Training · Academy · Scouting · Daily · Achievements · Ranking |
| UX presentation   | **UI P0 CLOSED** · Landing · Branding · Auth UX · MOTION-01 · **Invitation Layer** · Night Pitch Office · Guide §8/§16                                                                                                                                                                          |
| Engine / Match UI | LFE 0.9.1 + Live · Canvas · Replay · Post · **Ratings v2** · Match Path immersive · XI Gate · **PUBLIC surface** (D119–D121) · Spatial Motion Thin (`021b06d`)                                                                                                                                  |
| Design            | GDD-01…**22** Thin · **LFE-NOTIFICATIONS-01** CLOSED (in-app §22) · CAREER-DECLINE-01 · §26 · World Art · **next: Owner GO → Canvas REUSE / ACADEMY-02 / Retirement / §22 push-email / Prime**                                                                                                  |
| Infra             | Vercel + Supabase · CI GREEN · NOTIFICATIONS-01 = Web-only (brak migracji)                                                                                                                                                                                                                      |

## W trakcie

Brak otwartego EPIC. **LFE-NOTIFICATIONS-01 CLOSED**.  
**Nie startować** kolejnego EPIC bez Owner GO. Master: [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) §10–§11.

## Operacyjne

> Migracje Supabase na prod: training · potential · `academy_track` · `scout_shortlist` · fee helpers · `season_number` / `season_phase` · `league_tier` · **`club_sponsor_contracts`** (SPONSORS-01).  
> SoftLock / Club / Messages / Board / Stadium / TRANSFERS-10 / PUBLIC-API-01 / RATINGS-V2 / AGE-01 / LEAGUE-WORLD-02 / CAREER-DECLINE-01 / **NOTIFICATIONS-01**: brak migracji.

## Co następne

Patrz [`ROADMAP.md`](./ROADMAP.md) · [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) §11.  
**NEXT EPIC:** **Canvas REUSE (`getSpatialState`)** / **LFE-ACADEMY-02** / **Retirement** / **§22 push/email** / **Prime** — **nie startować** bez Owner GO (AUDIT first).

## Decyzje

[`DECISIONS.md`](./DECISIONS.md) · D19…D28 · D38 · D40–D52 · D63–D67 · D68–D87 · D88–D94 · D95–D101 · D102–D108 · D109–D115 · D116–D118 · D119–D121 · D122 · D123 · D124 · **D125**.  
PLAN: [`implementation/LFE-NOTIFICATIONS-01-PLAN.md`](./implementation/LFE-NOTIFICATIONS-01-PLAN.md) · Freeze: [`lfe/LFE_ARCHITECTURE_FREEZE.md`](./lfe/LFE_ARCHITECTURE_FREEZE.md).

## Last updated

2026-08-04 — LFE-NOTIFICATIONS-01 DOCS CLOSE · Presentation `54ae7b3` · D125
