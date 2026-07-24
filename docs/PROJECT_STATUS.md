# Project Status — Last Football

## Cel dokumentu

Jedno miejsce: **gdzie jesteśmy**, co zrobione, co dalej.

## Aktualny etap

**Etap:** Match pipeline na `main` — LFE (AI+Engine+Player Match Data) + Web (Live Bridge · Canvas · Replay · Post Match · **Player Ratings**). CI Prettier zielony.

| Tor            | Etap                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| Engine         | EPIC-1…7 + **Gameplay + AI + Engine** + **Player Match Data** · `0.9.1-match-ai01` |
| Web match      | Pre → Live → Canvas → Replay → Post Match (+ **Ratings**)                          |
| Product design | GDD-01…14 CLOSED · §3–§15 + §23 Hub · pozostałe = szkielet                         |
| Infra          | Vercel + Supabase + CI (format gate PASS)                                          |

**HEAD (orientacyjnie):** `33618e9` Live Bridge — zawsze sprawdzaj `git log -1`.

## Co jest ukończone

### LFE

- EPIC-1…7 (Foundation → Positioning)
- **Gameplay Foundation** (tactics, event vocab, tactical commands)
- **Match AI-01**
- **Match Engine-01** (+ `MatchEngineSystem`)
- **Player Match Data-01** (`statistics.players`; `playerId` na GOAL/SHOT/FOUL)
- Architecture Freeze (kontrakt v1; `index.ts` nadal over-export)

### Web

- Asset Pack 01 + Shell polish
- Live broadcast chrome + **`LiveMatchRuntime`** (Live Bridge)
- **Canvas Renderer 2D** (LIVE/REPLAY)
- **Replay** buffer + controller
- **Post Match** summary + seek do Replay
- **Player Ratings** — pure derive XI + MVP (1.0–10.0) w Post Match

### Infra

- Monorepo, `/status` → `getEngineStatus()`, Vercel prod
- **LFE-CI-PRETTIER-01** — pełny format repo; CI Format→Build zielony

## Co jest w trakcie

- Brak otwartego EPIC implementacyjnego (GDD-14 docs lokalnie — COMMIT po Owner GO).
- Dług: zawężenie PUBLIC LFE exports; drobne stale hash/status w handoff (Ratings/GDD już na `main`).

## Co następne (rekomendacja)

1. GDD-15+ (kolejny szkielet — Owner wybiera rozdział).
2. Transfer / Economy / League / Multiplayer — implementacja później.
3. Physics / Rules — FUTURE.
4. Ratings v2 (assists / minutes) — FUTURE.

## Otwarte decyzje

| ID   | Temat                           | Status   |
| ---- | ------------------------------- | -------- |
| D-01 | Zawężenie `index.ts` do freeze  | Otwarte  |
| D-02 | Kolejny rozdział GDD vs Physics | Owner GO |
| D-03 | Persist Replay                  | Otwarte  |
| D-04 | Tick-synced spatial             | Otwarte  |

## Powiązania

[`ROADMAP.md`](./ROADMAP.md) · [`AI-HANDOFF.md`](./AI-HANDOFF.md) · [`lfe/CURRENT_STATUS.md`](./lfe/CURRENT_STATUS.md) · [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md)

## Last updated

2026-07-24 — GDD-14
