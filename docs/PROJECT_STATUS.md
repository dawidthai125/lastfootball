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

**PRODUCTION VERIFIED · GREEN · LFE-BOARD-01 CLOSED** (Board Information Thin · Domain tip `75c190d`)

|                         |                                                                       |
| ----------------------- | --------------------------------------------------------------------- |
| **Production Baseline** | **`54d0724`** — **LFE-UI-IMPL-06** (Live → Post fidelity)             |
| **Domain feature**      | **`75c190d`** — **LFE-BOARD-01** (Board Information Thin · D102–D108) |
| **Presentation tip**    | **`9fd14fc`** — LFE-UI-MOTION-01 (Hub/Match motion Thin)              |
| **Documentation tip**   | **`b8519bf`** — LFE-BOARD-01 DOCS CLOSE (pin)                         |
| **Prod**                | https://lastfootball.vercel.app                                       |

| Tor               | Stan                                                                                                                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform          | Onboarding · First Match · Hub · League 22 · Season End · Promotion · Sponsors · **Board** · Finance · Players · Transfers 09 · Messages · Club · SoftLock · Training · Academy · Scouting · Daily · Achievements · Ranking |
| UX presentation   | **UI P0 CLOSED** · Landing · Branding · Auth UX · **MOTION-01** · Night Pitch Office · Guide §8/§16                                                                                                                         |
| Engine / Match UI | LFE 0.9.1 + Live · Canvas · Replay · Post · Match Path immersive · XI Gate                                                                                                                                                  |
| Design            | GDD-01…**22** Thin · GDD-SEASON-END-01 · GDD-PROMOTION-01 · GDD-SPONSORS-01 · **GDD-BOARD-01** + LFE-BOARD-01 CLOSED (D102–D108) · §26 CLOSED · World Art CLOSED · **next: Owner GO → STADIUM-01**                          |
| Infra             | Vercel + Supabase · CI GREEN · Board = derive only (brak migracji)                                                                                                                                                          |

## W trakcie

Brak otwartego EPIC. **LFE-BOARD-01** CLOSED · D102–D108 · Domain tip `75c190d` · **M2.5 PASS**.  
**Nie startować** kolejnego EPIC bez Owner GO.

## Operacyjne

> Migracje Supabase na prod: training · potential · `academy_track` · `scout_shortlist` · fee helpers · `season_number` / `season_phase` · `league_tier` · **`club_sponsor_contracts`** (SPONSORS-01).  
> SoftLock / Club / Messages / Board: brak migracji.

## Co następne

Patrz [`ROADMAP.md`](./ROADMAP.md) · rekomendacja w [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) §10.  
**Rekomendacja:** **czekaj na Owner GO** — kolejka: **LFE-STADIUM-01**.

## Decyzje

[`DECISIONS.md`](./DECISIONS.md) · D19…D28 · D38 · D40–D52 · D63–D67 · D68–D87 · D88–D94 · D95–D101 · **D102–D108**.  
Board Thin SSOT: [`game-design/GDD-BOARD-01.md`](./game-design/GDD-BOARD-01.md) · kod `LFE-BOARD-01`.

## Last updated

2026-07-31 — LFE-BOARD-01 CLOSED · Domain `75c190d`
