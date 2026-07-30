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

**PRODUCTION VERIFIED · GREEN · LFE-ACHIEVEMENTS-01 CLOSED** (Domain: Achievements · Presentation: MOTION-01)

|                         |                                                                      |
| ----------------------- | -------------------------------------------------------------------- |
| **Production Baseline** | **`54d0724`** — **LFE-UI-IMPL-06** (Live → Post fidelity)            |
| **Domain feature**      | **`3915be9`** — **LFE-ACHIEVEMENTS-01** (Information Thin · history) |
| **Presentation tip**    | **`9fd14fc`** — LFE-UI-MOTION-01 (Hub/Match motion Thin)             |
| **Documentation tip**   | CLOSE sync LFE-ACHIEVEMENTS-01 (pin follows)                         |
| **Prod**                | https://lastfootball.vercel.app                                      |

| Tor               | Stan                                                                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform          | Onboarding · First Match · Hub · League · Finance · Players · Transfers · Training · Academy · Scouting · Daily Goal · **Achievements (01)** |
| UX presentation   | **UI P0 CLOSED** · Landing · Branding · Auth UX · **MOTION-01** · Night Pitch Office · Guide §8/§16                                          |
| Engine / Match UI | LFE 0.9.1 + Live · Canvas · Replay · Post · Match Path immersive · XI Gate                                                                   |
| Design            | GDD-01…**22** Thin · §26 CLOSED · World Art CLOSED · **next: LFE-RANKING-01 READY FOR AUDIT**                                                |
| Infra             | Vercel + Supabase · CI GREEN · migracje academy/scouting na prod · DAILY/ACHIEVEMENTS bez migracji                                           |

## W trakcie

Brak otwartego EPIC. **LFE-ACHIEVEMENTS-01** CLOSED (feat `3915be9`) · **LFE-DAILY-01** CLOSED · **LFE-SCOUTING-01** CLOSED · **M2.5 PASS**.  
**Nie startować** AUDIT LFE-RANKING-01 bez Owner GO.

## Operacyjne

> Migracje Supabase na prod: training · potential · `academy_track` · `scout_shortlist` (zastosowane).  
> **LFE-ACHIEVEMENTS-01:** brak migracji (derive only). `resolveClubAchievements` · immutable history · D26.

## Co następne

Patrz [`ROADMAP.md`](./ROADMAP.md) · rekomendacja w [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) §10.  
**Rekomendacja:** **LFE-RANKING-01** — **READY FOR AUDIT** (po Owner GO).

## Decyzje

[`DECISIONS.md`](./DECISIONS.md) · D19 · D20 · D21 · D22 · D23 · D24 · D25 · **D26**.

## Last updated

2026-07-30 — LFE-ACHIEVEMENTS-01 CLOSE
