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

**PRODUCTION VERIFIED · GREEN · LFE-MESSAGES-01 CLOSED** (Domain: Messages Thin · Presentation: MOTION-01)

|                         |                                                               |
| ----------------------- | ------------------------------------------------------------- |
| **Production Baseline** | **`54d0724`** — **LFE-UI-IMPL-06** (Live → Post fidelity)     |
| **Domain feature**      | **`800ed0d`** — **LFE-MESSAGES-01** (derived inbox · D40–D46) |
| **Presentation tip**    | **`9fd14fc`** — LFE-UI-MOTION-01 (Hub/Match motion Thin)      |
| **Documentation tip**   | **`9bbbba6`** — LFE-MESSAGES-01 CLOSE (pin)
| **Prod**                | https://lastfootball.vercel.app                               |

| Tor               | Stan                                                                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform          | Onboarding · First Match · Hub · League 22 · Finance · Players · Transfers 09 · **Messages 01** · Training · Academy · Scouting · Daily · Achievements · Ranking |
| UX presentation   | **UI P0 CLOSED** · Landing · Branding · Auth UX · **MOTION-01** · Night Pitch Office · Guide §8/§16                                                              |
| Engine / Match UI | LFE 0.9.1 + Live · Canvas · Replay · Post · Match Path immersive · XI Gate                                                                                       |
| Design            | GDD-01…**22** Thin · §26 CLOSED · World Art CLOSED · **next: Owner GO**                                                                                          |
| Infra             | Vercel + Supabase · CI GREEN · Messages = derive only (brak migracji)                                                                                            |

## W trakcie

Brak otwartego EPIC. **LFE-MESSAGES-01** CLOSED (feat `800ed0d`) · D40–D46 CLOSED · **LFE-TRANSFERS-09** CLOSED · **M2.5 PASS**.  
**Nie startować** AUDIT następnego EPIC bez Owner GO.

## Operacyjne

> Migracje Supabase na prod: training · potential · `academy_track` · `scout_shortlist` · fee helpers (TRANSFERS-09).  
> **LFE-MESSAGES-01:** brak migracji (derive only).

## Co następne

Patrz [`ROADMAP.md`](./ROADMAP.md) · rekomendacja w [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) §10.  
**Rekomendacja:** **czekaj na Owner GO** (kandydaci: Settings/§22 · Club Thin · Season End · TD-03 P2).

## Decyzje

[`DECISIONS.md`](./DECISIONS.md) · D19…D28 · D38 · **D40–D46**.

## Last updated

2026-07-30 — LFE-MESSAGES-01 CLOSE
