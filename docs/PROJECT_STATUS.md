# Project Status — Last Football

## Cel

Jedno miejsce: **gdzie jesteśmy**, co zrobione, co dalej.

## Aktualny etap

**Production:** platforma gracza + First Match + Hub EARLY_CLUB.  
Baseline: **`b6b92dc`** (LFE-HUB-01) · https://lastfootball.vercel.app

| Tor            | Etap                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| Engine         | EPIC-1…7 + Gameplay + AI + Engine + Player Match Data · `0.9.1-match-ai01` |
| Web match      | Pre → Live Bridge → Canvas → Replay → Post Match (+ Ratings)               |
| Platform       | Landing · Auth · Club Wizard · First Match tunnel · Hub EARLY_CLUB         |
| Product design | GDD-01…15 CLOSED                                                           |
| Infra          | Vercel + Supabase `anoeimngwptucjdugjme` + CI zielony                      |

## Co jest ukończone

### Platforma (2026-07)

- **LFE-PLATFORM-01** P1–P3 — Landing, Auth, Welcome, Club Wizard, Club DTO
- **LFE-INFRA-01** — rebind Supabase
- **LFE-MATCH-01** — First Match Experience (`first_match_completed_at`)
- **LFE-HUB-01** — EARLY_CLUB decision Hub + shell progressive unlock

### LFE / Match UI

- EPIC-1…7 · Gameplay · Match AI · Match Engine · Player Match Data
- Live Bridge · Canvas · Replay · Post Match · Player Ratings · CI Prettier

### Design

- GDD-01…15 (§3–§15, §20, §23)

## Co jest w trakcie

- Brak otwartego EPIC implementacyjnego.
- LFE-DOCS-01 — konsolidacja dokumentacji (ten cykl).

## Co następne (rekomendacja)

1. League / fixtures SSOT (Hub SEASON + next match CTA).
2. GDD-16+ (Owner wybiera rozdział).
3. Economy / Transfers (po soft-lockach).
4. Zawężenie LFE PUBLIC exports.
5. Physics / Rules — FUTURE.

## Otwarte decyzje

| ID         | Temat                              | Status  |
| ---------- | ---------------------------------- | ------- |
| D-01       | Zawężenie `index.ts` LFE do freeze | Otwarte |
| D-03       | Persist Replay                     | Otwarte |
| D-HUB-NEXT | Next-event bez ligi DB             | Owner   |

## Powiązania

[`ROADMAP.md`](./ROADMAP.md) · [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md) · [`MASTER_HANDOFF.md`](./MASTER_HANDOFF.md)

## Last updated

2026-07-24 — LFE-DOCS-01
