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

**PRODUCTION VERIFIED · GREEN · GDD-SEASON-END-01 CLOSED** (docs: Season End Thin · Domain tip: SoftLock)

|                         |                                                                  |
| ----------------------- | ---------------------------------------------------------------- |
| **Production Baseline** | **`54d0724`** — **LFE-UI-IMPL-06** (Live → Post fidelity)        |
| **Domain feature**      | **`46f7caa`** — **LFE-SOFTLOCK-01** (route gate · D52 · D63–D67) |
| **Presentation tip**    | **`9fd14fc`** — LFE-UI-MOTION-01 (Hub/Match motion Thin)         |
| **Documentation tip**   | **`046dbb6`** — GDD-SEASON-END-01 CLOSE (pin)                    |
| **Prod**                | https://lastfootball.vercel.app                                  |

| Tor               | Stan                                                                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform          | Onboarding · First Match · Hub · League 22 · Finance · Players · Transfers 09 · Messages · Club · SoftLock · Training · Academy · Scouting · Daily · Achievements · Ranking |
| UX presentation   | **UI P0 CLOSED** · Landing · Branding · Auth UX · **MOTION-01** · Night Pitch Office · Guide §8/§16                                                                         |
| Engine / Match UI | LFE 0.9.1 + Live · Canvas · Replay · Post · Match Path immersive · XI Gate                                                                                                  |
| Design            | GDD-01…**22** Thin · **GDD-SEASON-END-01** CLOSED (D68–D77) · §26 CLOSED · World Art CLOSED · **next: Owner GO**                                                            |
| Infra             | Vercel + Supabase · CI GREEN · SoftLock / Season End GDD = brak migracji                                                                                                    |

## W trakcie

Brak otwartego EPIC. **GDD-SEASON-END-01** CLOSED · **LFE-SOFTLOCK-01** CLOSED · D68–D77 CLOSED · **M2.5 PASS**.  
**Nie startować** AUDIT / IMPLEMENT `LFE-SEASON-END-01` bez Owner GO.

## Operacyjne

> Migracje Supabase na prod: training · potential · `academy_track` · `scout_shortlist` · fee helpers (TRANSFERS-09).  
> **GDD-SEASON-END-01 / LFE-SOFTLOCK-01 / LFE-CLUB-01 / LFE-MESSAGES-01:** brak migracji.

## Co następne

Patrz [`ROADMAP.md`](./ROADMAP.md) · rekomendacja w [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) §10.  
**Rekomendacja:** **czekaj na Owner GO** (kandydaci: `LFE-SEASON-END-01` · Settings/§22 · TD-03 P2 · Promotion).

## Decyzje

[`DECISIONS.md`](./DECISIONS.md) · D19…D28 · D38 · D40–D52 · D63–D67 · **D68–D77**.  
Season End Thin SSOT: [`game-design/GDD-SEASON-END-01.md`](./game-design/GDD-SEASON-END-01.md).

## Last updated

2026-07-30 — GDD-SEASON-END-01 CLOSE
