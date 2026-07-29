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

**PRODUCTION VERIFIED · GREEN · GDD-19 CLOSED** (Domain: LFE-PLAYERS-02 · Presentation: LFE-UI-MOTION-01)

|                         |                                                               |
| ----------------------- | ------------------------------------------------------------- |
| **Production Baseline** | **`54d0724`** — **LFE-UI-IMPL-06** (Live → Post fidelity)     |
| **Domain feature**      | **`cd222ba`** — **LFE-PLAYERS-02** (Player Development Thin)  |
| **Presentation tip**    | **`9fd14fc`** — LFE-UI-MOTION-01 (Hub/Match motion Thin)      |
| **Documentation tip**   | **`2c619ca`** — GDD-19 Osiągnięcia Thin (kamienie / historia) |
| **Prod**                | https://lastfootball.vercel.app                               |

| Tor               | Stan                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Platform          | Onboarding · First Match · Hub SEASON · League · Finance · **Players Dev (02)** · Transfers (01…08) · Training Depth (02) |
| UX presentation   | **UI P0 CLOSED** · Landing · Branding · Auth UX · **MOTION-01** · Night Pitch Office · Guide §8/§16                       |
| Engine / Match UI | LFE 0.9.1 + Live · Canvas · Replay · Post · Match Path immersive · XI Gate (hard INJURED/SUSPENDED)                       |
| Design            | GDD-01…**19** (Thin) · §26 CLOSED · World Art CLOSED · next: **GDD-21** READY FOR AUDIT                                   |
| Infra             | Vercel + Supabase `anoeimngwptucjdugjme` · CI GREEN                                                                       |

## W trakcie

Brak otwartego EPIC. **GDD-19** CLOSED (content `fcbbe3c` · tip CLOSE `2c619ca`) · **GDD-18** CLOSED · **LFE-UI-MOTION-01** CLOSED · **LFE-PLAYERS-02** Domain FULLY CLOSED (`cd222ba`).

## Operacyjne

> Migracje Supabase: `complete_training_session` **oraz** `players.potential` + `apply_match_development` (`20260729120000_…`) muszą zostać zastosowane na środowisku produkcyjnym.

## Co następne

Patrz [`ROADMAP.md`](./ROADMAP.md) · rekomendacja w [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) §10.  
**Rekomendacja:** **GDD-21** (§21 Wiadomości) — **READY FOR AUDIT** · full 22 fixtures · transfers hardening · LFE-ACADEMY-01 / LFE-SCOUTING-01 / LFE-RANKING-01 / LFE-ACHIEVEMENTS-01 (kod).

## Decyzje

[`DECISIONS.md`](./DECISIONS.md) · D19 · D20 · D21 · **D22**.

## Last updated

2026-07-30 — GDD-19 CLOSE
