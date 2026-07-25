# Project Status — Last Football

## Cel

Jedno miejsce: **gdzie jesteśmy**, co zrobione, co dalej.

## Aktualny etap

**PRODUCTION VERIFIED · GREEN** — platforma + First Match + Hub SEASON + liga + finanse + kadra + **Transfers Thin**.  
Baseline: **`393a43c`** (LFE-TRANSFERS-01) · tip prettier `7c0ce7f` · https://lastfootball.vercel.app

| Tor            | Etap                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| Engine         | EPIC-1…7 + Gameplay + AI + Engine + Player Match Data · `0.9.1-match-ai01`          |
| Web match      | Pre → Live Bridge → Canvas → Replay → Post Match (+ Ratings)                        |
| Platform       | Landing · Auth · Club Wizard · First Match · Hub · liga · finanse · kadra · transfery |
| Product design | GDD-01…15 CLOSED                                                                    |
| Infra          | Vercel + Supabase · fixtures · cash · players · **transfer_deals / window**         |

## Co jest ukończone

### Platforma (2026-07)

- **LFE-PLATFORM-01** P1–P3 — Landing, Auth, Welcome, Club Wizard, Club DTO
- **LFE-INFRA-01** — rebind Supabase
- **LFE-MATCH-01** — First Match Experience (`first_match_completed_at`)
- **LFE-HUB-01** — EARLY_CLUB decision Hub + shell progressive unlock
- **LFE-DOCS-01** — AI docs / handoff consolidation
- **LFE-LEAGUE-01** Thin A — **CLOSED** · `fixtures` SSOT · Primary next match · Squad seed (superseded)
- **LFE-LEAGUE-02** — **CLOSED** · `resolveLeagueTable` · Hub `SEASON` (S1) · `/league` · chip
- **LFE-ECONOMY-01** — **CLOSED** · `cash_balance` + `finance_movements` · `resolveClubFinance` · `/finance`
- **LFE-PLAYERS-01** — **CLOSED** · tabela `players` · `resolveClubSquad(rows)` · D19
- **LFE-TRANSFERS-01** — **CLOSED** · `resolveTransferMarket` · window · deals · D20 · prod `393a43c`

### LFE / Match UI

- EPIC-1…7 · Gameplay · Match AI · Match Engine · Player Match Data
- Live Bridge · Canvas · Replay · Post Match · Player Ratings · CI Prettier

### Design

- GDD-01…15 (§3–§15, §20, §23)

## Co jest w trakcie

- Brak otwartego EPIC implementacyjnego.

## Co następne (rekomendacja)

1. **Training** (GDD §8) — na bazie `players`.
2. GDD-16+ (Owner wybiera rozdział).
3. GDD §26 (liczby ekonomiczne / fee — zastąpią Thin constants).
4. Pełny kalendarz 11 fixtures (opcjonalny follow-up).
5. Zawężenie LFE PUBLIC exports · Physics / Rules — FUTURE.

## Otwarte decyzje

| ID   | Temat                              | Status                |
| ---- | ---------------------------------- | --------------------- |
| D-01 | Zawężenie `index.ts` LFE do freeze | Otwarte               |
| D-03 | Persist Replay                     | Otwarte               |
| D15  | Fixtures SSOT Thin A               | **Zamknięte**         |
| D16  | Squad seed SSOT                    | **Superseded by D19** |
| D17  | League table derive + SEASON S1    | **Zamknięte**         |
| D18  | Club cash + finance resolve Thin   | **Zamknięte**         |
| D19  | Players table + resolveClubSquad   | **Zamknięte**         |
| D20  | Transfer market Thin                | **Zamknięte**         |

## Powiązania

[`ROADMAP.md`](./ROADMAP.md) · [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md) · [`MASTER_HANDOFF.md`](./MASTER_HANDOFF.md)

## Last updated

2026-07-25 — LFE-TRANSFERS-01 CLOSE
