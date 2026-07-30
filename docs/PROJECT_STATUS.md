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

**PRODUCTION VERIFIED · GREEN · LFE-SCOUTING-01 CLOSED** (Domain: Scouting · Presentation: MOTION-01)

|                         |                                                                    |
| ----------------------- | ------------------------------------------------------------------ |
| **Production Baseline** | **`54d0724`** — **LFE-UI-IMPL-06** (Live → Post fidelity)          |
| **Domain feature**      | **`93fd6d5`** — **LFE-SCOUTING-01** (Information Thin · shortlist) |
| **Presentation tip**    | **`9fd14fc`** — LFE-UI-MOTION-01 (Hub/Match motion Thin)           |
| **Documentation tip**   | `cae2323` — **LFE-SCOUTING-01** CLOSE sync (pin)                   |
| **Prod**                | https://lastfootball.vercel.app                                    |

| Tor               | Stan                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Platform          | Onboarding · First Match · Hub SEASON · League · Finance · Players Dev · Transfers · Training · Academy · **Scouting (01)** |
| UX presentation   | **UI P0 CLOSED** · Landing · Branding · Auth UX · **MOTION-01** · Night Pitch Office · Guide §8/§16                         |
| Engine / Match UI | LFE 0.9.1 + Live · Canvas · Replay · Post · Match Path immersive · XI Gate (hard INJURED/SUSPENDED)                         |
| Design            | GDD-01…**22** Thin · §26 CLOSED · World Art CLOSED · **next: LFE-DAILY-01 READY FOR AUDIT**                                 |
| Infra             | Vercel + Supabase `anoeimngwptucjdugjme` · CI GREEN · migracje `academy_track` + **`scout_shortlist`** na prod              |

## W trakcie

Brak otwartego EPIC. **LFE-SCOUTING-01** CLOSED (feat `93fd6d5`) · **LFE-ACADEMY-01** CLOSED · **GDD-22** CLOSED · **M2.5 PASS**.  
**Nie startować** AUDIT LFE-DAILY-01 bez Owner GO.

## Operacyjne

> Migracje Supabase na prod: training RPC · potential / match development · `20260730120000_academy_track.sql` · **`20260730140000_scout_shortlist.sql`** (zastosowane).  
> `scout_shortlist` = wyłącznie `(club_id, player_id)` → `players.id` — nie drugi model zawodnika; shortlista nie wpływa na AI / rynek / transfery / potencjał / symulację.

## Co następne

Patrz [`ROADMAP.md`](./ROADMAP.md) · rekomendacja w [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) §10.  
**Rekomendacja:** **LFE-DAILY-01** — **READY FOR AUDIT** (po Owner GO).

## Decyzje

[`DECISIONS.md`](./DECISIONS.md) · D19 · D20 · D21 · D22 · D23 · **D24**.

## Last updated

2026-07-30 — LFE-SCOUTING-01 CLOSE
