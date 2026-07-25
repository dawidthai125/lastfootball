# Platform — Finance

## Cel

Kasa klubu i historia ruchów (Finance Thin).

## SSOT

| Fakt     | Źródło                                                      |
| -------- | ----------------------------------------------------------- |
| Saldo    | `clubs.cash_balance`                                        |
| Historia | `finance_movements`                                         |
| UI       | **wyłącznie** `resolveClubFinance(...)` → `ClubFinanceDto`  |
| Envelope | **derive** `resolveTransferEnvelope(cash)` — nie kolumna DB |
| Unlock   | Nav / Secondary Finanse na `SEASON`                         |
| Chip Hub | jedna linia kasy (SEASON); bez trendu                       |
| Stałe    | `ECONOMY_THIN` (= GDD §26 + `ENVELOPE_RATIO` Thin)          |

## Zachowanie Thin

- Seed `STARTER_CASH` przy create club.
- Nagroda W/D/L tylko przy pierwszym `fixture` → `played`.
- Kategorie m.in. `starter`, `match_reward`, `transfer_buy`, `transfer_sell`.
- **§26 = SSOT liczb**; **D18 = SSOT implementacji**.
- Envelope Thin (E1): `ENVELOPE_RATIO = 1` → envelope === cash; jedyny wzór w `resolveTransferEnvelope`.

## Decyzje

D18 — [`../DECISIONS.md`](../DECISIONS.md). GDD §26 — [`../game-design/GAME_DESIGN_DOCUMENT.md`](../game-design/GAME_DESIGN_DOCUMENT.md).  
Envelope: LFE-TRANSFERS-02-E1 / D20.

## Poza Thin

Pensje, bilety, sponsorzy, ratio ≠ 1, negotiation, suwak alokacji.

## Kod

`lib/finance/*` · `/finance`

## Last updated

2026-07-25 — LFE-TRANSFERS-02-E1 CLOSE
