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

**PRODUCTION VERIFIED · GREEN · LFE-PLAYERS-02 CLOSED**

|                         |                                                                |
| ----------------------- | -------------------------------------------------------------- |
| **Production Baseline** | **`54d0724`** — **LFE-UI-IMPL-06** (Live → Post fidelity)      |
| **Domain feature**      | **`cd222ba`** — **LFE-PLAYERS-02** (Player Development Thin)   |
| **Presentation tip**    | **`9dc834a`** — LFE-AUTH-UX-01                                 |
| **Documentation tip**   | pending Owner COMMIT — LFE-PLAYERS-02 DOCS CLOSE (pin po commit) |
| **Prod**                | https://lastfootball.vercel.app                                |

| Tor               | Stan                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Platform          | Onboarding · First Match · Hub SEASON · League · Finance · **Players Dev (02)** · Transfers (01…08) · Training Depth (02) |
| UX presentation   | **UI P0 CLOSED** · Landing · Branding · Auth UX · Night Pitch Office · Guide §16                                           |
| Engine / Match UI | LFE 0.9.1 + Live · Canvas · Replay · Post · Match Path immersive · XI Gate (hard INJURED/SUSPENDED)                        |
| Design            | GDD-01…15 · §26 CLOSED · World Art CLOSED · next: Owner (GDD-16+ / motion / 22 fixtures)                                   |
| Infra             | Vercel + Supabase `anoeimngwptucjdugjme` · CI GREEN                                                                        |

## W trakcie

Brak otwartego EPIC produktowego. **LFE-PLAYERS-02** COMPLETED (feat `cd222ba` · CI GREEN · Production VERIFIED · DOCS CLOSE w toku / tip pin po COMMIT).

## Operacyjne

> Migracje Supabase: `complete_training_session` **oraz** `players.potential` + `apply_match_development` (`20260729120000_…`) muszą zostać zastosowane na środowisku produkcyjnym.

## Co następne

Patrz [`ROADMAP.md`](./ROADMAP.md) · rekomendacja w [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) §10.  
**Rekomendacja:** GDD-16+ (docs) · LFE-UI-MOTION-01 · full 22 fixtures · transfers hardening.

## Decyzje

[`DECISIONS.md`](./DECISIONS.md) · D19 · D21 · **D22**.

## Last updated

2026-07-29 — LFE-PLAYERS-02
