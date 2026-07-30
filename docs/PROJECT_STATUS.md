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

**PRODUCTION VERIFIED · GREEN · LFE-LEAGUE-04 CLOSED** (Domain: League 22 · Presentation: MOTION-01)

|                         |                                                           |
| ----------------------- | --------------------------------------------------------- |
| **Production Baseline** | **`54d0724`** — **LFE-UI-IMPL-06** (Live → Post fidelity) |
| **Domain feature**      | **`9027baf`** — **LFE-LEAGUE-04** (Full 22 · double RR)   |
| **Presentation tip**    | **`9fd14fc`** — LFE-UI-MOTION-01 (Hub/Match motion Thin)  |
| **Documentation tip**   | **`086a2ac`** — LFE-LEAGUE-04 CLOSE (pin)                 |
| **Prod**                | https://lastfootball.vercel.app                           |

| Tor               | Stan                                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform          | Onboarding · First Match · Hub · **League 22** · Finance · Players · Transfers · Training · Academy · Scouting · Daily · Achievements · Ranking |
| UX presentation   | **UI P0 CLOSED** · Landing · Branding · Auth UX · **MOTION-01** · Night Pitch Office · Guide §8/§16                                             |
| Engine / Match UI | LFE 0.9.1 + Live · Canvas · Replay · Post · Match Path immersive · XI Gate                                                                      |
| Design            | GDD-01…**22** Thin · §26 CLOSED · World Art CLOSED · **next: Transfers hardening READY FOR AUDIT**                                              |
| Infra             | Vercel + Supabase · CI GREEN · migracje academy/scouting · LEAGUE-04 bez migracji schematu (top-up MD12–22)                                     |

## W trakcie

Brak otwartego EPIC. **LFE-LEAGUE-04** CLOSED (feat `9027baf`) · **LFE-RANKING-01** CLOSED · **M2.5 PASS**.  
**Nie startować** AUDIT następnego EPIC bez Owner GO.

## Operacyjne

> Migracje Supabase na prod: training · potential · `academy_track` · `scout_shortlist` (zastosowane).  
> **LFE-LEAGUE-04:** brak migracji schematu. `LEAGUE_FIXTURE_COUNT=22` · top-up MD12–22 · D28.

## Co następne

Patrz [`ROADMAP.md`](./ROADMAP.md) · rekomendacja w [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) §10.  
**Rekomendacja:** **Transfers hardening** — **READY FOR AUDIT** (po Owner GO).

## Decyzje

[`DECISIONS.md`](./DECISIONS.md) · D19…D27 · **D28**.

## Last updated

2026-07-30 — LFE-LEAGUE-04 CLOSE
