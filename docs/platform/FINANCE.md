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
- Kategorie m.in. `starter`, `match_reward`, `transfer_buy`, `transfer_sell`, `sponsor_base`, `sponsor_bonus`.
- **§26 = SSOT liczb**; **D18 = SSOT implementacji**.
- Envelope Thin (E1): `ENVELOPE_RATIO = 1` → envelope === cash; jedyny wzór w `resolveTransferEnvelope`.
- Sponsors Thin (LFE-SPONSORS-01): payout/bonus wyłącznie przez ten ledger (D97); kontrakt = `club_sponsor_contracts`.

## Decyzje

D18 — [`../DECISIONS.md`](../DECISIONS.md). GDD §26 — [`../game-design/GAME_DESIGN_DOCUMENT.md`](../game-design/GAME_DESIGN_DOCUMENT.md).  
Envelope: LFE-TRANSFERS-02-E1 / D20.  
Sponsors: D95–D101 · [`../game-design/GDD-SPONSORS-01.md`](../game-design/GDD-SPONSORS-01.md).

## Poza Thin

Pensje, bilety, ratio ≠ 1, negotiation, suwak alokacji, marketplace sponsorów.

## UI (presentation)

Ekran `/finance` = decision-first (question-day); Primary deep-link do `/transfers` — bez budżetowania w UI.  
Szczegóły: [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16.

## Kod

`lib/finance/*` · `/finance` · sponsors IO w `lib/sponsors/*`

## Last updated

2026-07-31 — LFE-SPONSORS-01
