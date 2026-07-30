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

**PRODUCTION VERIFIED · GREEN · LFE-TRANSFERS-09 CLOSED** (Domain: Transfers hardening · Presentation: MOTION-01)

|                         |                                                                        |
| ----------------------- | ---------------------------------------------------------------------- |
| **Production Baseline** | **`54d0724`** — **LFE-UI-IMPL-06** (Live → Post fidelity)              |
| **Domain feature**      | **`e6885dc`** — **LFE-TRANSFERS-09** (fee parity · single live settle) |
| **Presentation tip**    | **`9fd14fc`** — LFE-UI-MOTION-01 (Hub/Match motion Thin)               |
| **Documentation tip**   | **`4b8ab48`** — LFE-TRANSFERS-09 CLOSE (pin)                           |
| **Prod**                | https://lastfootball.vercel.app                                        |

| Tor               | Stan                                                                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform          | Onboarding · First Match · Hub · League 22 · Finance · Players · **Transfers 09** · Training · Academy · Scouting · Daily · Achievements · Ranking |
| UX presentation   | **UI P0 CLOSED** · Landing · Branding · Auth UX · **MOTION-01** · Night Pitch Office · Guide §8/§16                                                |
| Engine / Match UI | LFE 0.9.1 + Live · Canvas · Replay · Post · Match Path immersive · XI Gate                                                                         |
| Design            | GDD-01…**22** Thin · §26 CLOSED · World Art CLOSED · **next: Owner GO**                                                                            |
| Infra             | Vercel + Supabase · CI GREEN · migracja fee helpers (TRANSFERS-09)                                                                                 |

## W trakcie

Brak otwartego EPIC. **LFE-TRANSFERS-09** CLOSED (feat `e6885dc`) · TD-01/TD-02 CLOSED · **LFE-LEAGUE-04** CLOSED · **M2.5 PASS**.  
**Nie startować** AUDIT następnego EPIC bez Owner GO.

## Operacyjne

> Migracje Supabase na prod: training · potential · `academy_track` · `scout_shortlist` · **`derive_transfer_fee_thin` / allow-list** (TRANSFERS-09).  
> **LFE-LEAGUE-04:** brak migracji schematu. `LEAGUE_FIXTURE_COUNT=22` · top-up MD12–22 · D28.

## Co następne

Patrz [`ROADMAP.md`](./ROADMAP.md) · rekomendacja w [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) §10.  
**Rekomendacja:** **czekaj na Owner GO** (kandydaci: Season End Thin · TD-03 P2 — nie startować bez GO).

## Decyzje

[`DECISIONS.md`](./DECISIONS.md) · D19…D28 · **D38**.

## Last updated

2026-07-30 — LFE-TRANSFERS-09 CLOSE
