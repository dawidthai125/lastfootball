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

**PRODUCTION VERIFIED · GREEN · GDD-21 CLOSED** (Domain: Academy · Presentation: MOTION-01 · Docs: §21 Wiadomości Thin)

|                         |                                                             |
| ----------------------- | ----------------------------------------------------------- |
| **Production Baseline** | **`54d0724`** — **LFE-UI-IMPL-06** (Live → Post fidelity)   |
| **Domain feature**      | **`9c6fe86`** — **LFE-ACADEMY-01** (Intake + Promote · D23) |
| **Presentation tip**    | **`9fd14fc`** — LFE-UI-MOTION-01 (Hub/Match motion Thin)    |
| **Documentation tip**   | `c24efef` — **GDD-21** Wiadomości Thin (content `bf07a44`)  |
| **Prod**                | https://lastfootball.vercel.app                             |

| Tor               | Stan                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Platform          | Onboarding · First Match · Hub SEASON · League · Finance · Players Dev · Transfers · Training · **Academy (01)** |
| UX presentation   | **UI P0 CLOSED** · Landing · Branding · Auth UX · **MOTION-01** · Night Pitch Office · Guide §8/§16              |
| Engine / Match UI | LFE 0.9.1 + Live · Canvas · Replay · Post · Match Path immersive · XI Gate (hard INJURED/SUSPENDED)              |
| Design            | GDD-01…**21** (Thin; §22 szkielet) · §26 CLOSED · World Art CLOSED · **next: GDD-22 READY FOR AUDIT**            |
| Infra             | Vercel + Supabase `anoeimngwptucjdugjme` · CI GREEN · migracja `academy_track` na prod                           |

## W trakcie

Brak otwartego EPIC. **GDD-21** CLOSED (content `bf07a44`) · **M2.5 PASS** · **LFE-ACADEMY-01** CLOSED.  
**Nie startować** AUDIT GDD-22 bez Owner GO.

## Operacyjne

> Migracje Supabase na prod: training RPC · potential / match development · **`20260730120000_academy_track.sql`** (zastosowane).

## Co następne

Patrz [`ROADMAP.md`](./ROADMAP.md) · rekomendacja w [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) §10.  
**Rekomendacja:** **GDD-22** (§22 Powiadomienia) — **READY FOR AUDIT** (po Owner GO).  
Po GDD-21+22: AUDIT LFE-SCOUTING-01.

## Decyzje

[`DECISIONS.md`](./DECISIONS.md) · D19 · D20 · D21 · D22 · **D23**.

## Last updated

2026-07-30 — GDD-21 CLOSE
