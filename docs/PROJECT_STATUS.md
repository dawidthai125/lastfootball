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

**PRODUCTION VERIFIED · GREEN · LFE-CAREER-DECLINE-01 CLOSED** (Domain `3c01baa` · D1–D124)

|                         |                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| **Production Baseline** | **`54d0724`** — **LFE-UI-IMPL-06** (Live → Post fidelity)                                     |
| **Domain feature**      | **`3c01baa`** — **LFE-CAREER-DECLINE-01** (Career Phase · Growth Gate · D124)                 |
| **Prior Domain**        | **`843bcfd`** — LFE-LEAGUE-WORLD-02 (League Strength Profile · D123)                          |
| **Presentation tip**    | **`9fd14fc`** — LFE-UI-MOTION-01 (Hub/Match presentation motion Thin)                         |
| **Documentation tip**   | **`8483d05`** — LFE-CAREER-DECLINE-01 DOCS CLOSE                                             |
| **tip `main`**          | **`8483d05`** — pin tip (Documentation tip = `8483d05`)                                     |
| **Prod**                | https://lastfootball.vercel.app · **VERIFIED**                                                |
| **CI**                  | **GREEN**                                                                                     |
| **Decisions**           | **D1–D124** (D124 Career Phase · D123 Strength · D122 H-AGE)                                  |

| Tor               | Stan                                                                                                                                                                                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform          | Onboarding · First Match · Hub · League 22 · League World · Season End · Age++ · **Career Decline** · Promotion · Sponsors · Board · Stadium · Finance · Players · Transfers **10** · Messages · Club · SoftLock · Training · Academy · Scouting · Daily · Achievements · Ranking |
| UX presentation   | **UI P0 CLOSED** · Landing · Branding · Auth UX · **MOTION-01** · Night Pitch Office · Guide §8/§16                                                                                                                                                                           |
| Engine / Match UI | LFE 0.9.1 + Live · Canvas · Replay · Post · **Ratings v2** · Match Path immersive · XI Gate · **PUBLIC surface** (D119–D121)                                                                                                                                                  |
| Design            | GDD-01…**22** Thin · Season End · Promotion · Sponsors · Board · Stadium · Transfers-10 · PUBLIC-API-01 · RATINGS-V2 · AGE-01 · LEAGUE-WORLD-02 · **CAREER-DECLINE-01** CLOSED · §26 CLOSED · World Art CLOSED · **next: Owner GO → §22 / Youth Depth / Retirement / Prime** |
| Infra             | Vercel + Supabase · CI GREEN · CAREER-DECLINE-01 = Web-only (brak migracji)                                                                                                                                                                                                   |

## W trakcie

Brak otwartego EPIC. **LFE-CAREER-DECLINE-01 CLOSED**.  
**Nie startować** kolejnego EPIC bez Owner GO. Master: [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) §10–§11.

## Operacyjne

> Migracje Supabase na prod: training · potential · `academy_track` · `scout_shortlist` · fee helpers · `season_number` / `season_phase` · `league_tier` · **`club_sponsor_contracts`** (SPONSORS-01).  
> SoftLock / Club / Messages / Board / Stadium / TRANSFERS-10 / PUBLIC-API-01 / RATINGS-V2 / AGE-01 / LEAGUE-WORLD-02 / **CAREER-DECLINE-01**: brak migracji.

## Co następne

Patrz [`ROADMAP.md`](./ROADMAP.md) · [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) §11.  
**NEXT EPIC:** **§22** / **Youth Depth** / **Retirement** / **Prime** — **nie startować** bez Owner GO (AUDIT first).

## Decyzje

[`DECISIONS.md`](./DECISIONS.md) · D19…D28 · D38 · D40–D52 · D63–D67 · D68–D87 · D88–D94 · D95–D101 · D102–D108 · D109–D115 · D116–D118 · D119–D121 · D122 · D123 · **D124**.  
PLAN: [`implementation/LFE-CAREER-DECLINE-01-PLAN.md`](./implementation/LFE-CAREER-DECLINE-01-PLAN.md) · Freeze: [`lfe/LFE_ARCHITECTURE_FREEZE.md`](./lfe/LFE_ARCHITECTURE_FREEZE.md).

## Last updated

2026-08-03 — LFE-CAREER-DECLINE-01 DOCS CLOSE · Domain `3c01baa`
