# HANDOFF — Last Football

## Cel

**Krótki start** (1 ekran). Pełne przekazanie: [`MASTER_HANDOFF.md`](./MASTER_HANDOFF.md).  
Agent AI: [`AI/START_HERE.md`](./AI/START_HERE.md) · root [`AGENTS.md`](../AGENTS.md).

## Stan (2026-07-25) — PRODUCTION VERIFIED · GREEN

| Tor                | Stan                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| **Baseline**       | `393a43c` · LFE-TRANSFERS-01 CLOSED · https://lastfootball.vercel.app                     |
| **Platform**       | Landing · Auth · Club Wizard · First Match · Hub SEASON · liga · kasa · kadra · transfery |
| **Hub**            | SEASON · Primary next match · Liga + Finanse · Transfery gdy okno open                    |
| **LFE / Match UI** | EPIC-1…7 + Live Bridge · Canvas · Replay · Post Match · Ratings                           |
| **GDD**            | GDD-01…15 CLOSED                                                                          |
| **CI**             | Format → Typecheck → Lint · Test · Build — zielony                                        |

## Kolejność czytania

1. [`AI/START_HERE.md`](./AI/START_HERE.md) / [`AGENTS.md`](../AGENTS.md)
2. [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)
3. [`MASTER_HANDOFF.md`](./MASTER_HANDOFF.md)
4. [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) · [`ROADMAP.md`](./ROADMAP.md)
5. Task docs: [`platform/`](./platform/) · [`lfe/`](./lfe/) · [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md)

## Najbliższy cel

**Next:** **Training** (GDD §8). Alternatywy: GDD-16+ · GDD §26.  
GDD §26 zastąpi stałe Thin ekonomii / fee (`ECONOMY_THIN` / `TRANSFERS_THIN`).

## Zasady twarde

- Commit / push tylko po **Owner GO**.
- Hub = decyzja (§23), nie dashboard mid-season.
- First Match **przed** Hubem.
- Canvas/Replay nie wołają Engine.
- REUSE FIRST · ZERO DUPLICATE · SSOT FIRST.
- Tabela ligowa = wyłącznie `resolveLeagueTable()` (D17).
- Finanse = wyłącznie `resolveClubFinance()`; saldo = `cash_balance` (D18).
- Kadra = `players`; UI wyłącznie `resolveClubSquad()` (D19); seed ≠ runtime.
- Transfery = wyłącznie `resolveTransferMarket()`; okno = `transfer_window_open` (D20).

## Last updated

2026-07-25 — LFE-TRANSFERS-01 CLOSE
