# Platform — Messages

## Cel

Wiadomości Thin (GDD §21) — in-app skrót **skutków** zdarzeń domenowych.  
**SSOT danych UI:** wyłącznie `resolveClubMessages`.

## Kontrakt (LFE-MESSAGES-01)

| Fakt      | Reguła                                                                |
| --------- | --------------------------------------------------------------------- |
| Derive    | E1 okno transferowe · E2 Incoming AI · E3 H2H wymagające akcji        |
| Persist   | **brak** DB / tabel / migracji / mark-as-read                         |
| Oferty    | **§12 / Transfery** = SSOT procesu; wiadomość = skrót + `/transfers`  |
| Widoki    | `/messages` + Overlay = **ta sama** `ClubMessagesDto` (D43)           |
| Kolejność | wyłącznie `resolveClubMessages` — UI nie sortuje / nie filtruje (D44) |
| Mocki     | zakaz (D40/D41)                                                       |

## Decyzje

D40–D46 · [`../DECISIONS.md`](../DECISIONS.md)

## Kod

`apps/web/src/lib/messages/` · `MessagesView` · `OverlayRoot` · `ClubProvider.messages`

## Last updated

2026-07-30 — LFE-MESSAGES-01 CLOSED · Domain `800ed0d`
