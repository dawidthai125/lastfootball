# Platform — Club Profile

## Cel

Karta tożsamości klubu (GDD §5 identity · §6 sygnał jakościowy **bez silnika**).  
**SSOT danych UI `/club`:** wyłącznie `resolveClubProfile`.

## Kontrakt (LFE-CLUB-01)

| Fakt       | Reguła                                                                                |
| ---------- | ------------------------------------------------------------------------------------- |
| Derive     | Composition z `ClubDto` · `STARTER_PACKAGE` · cash · `resolveLeagueTable`             |
| Persist    | **brak** DB / tabel / migracji / silnika §6                                           |
| Metryki    | tylko etykiety jakościowe (np. „Klub startowy”) — nie liczby Poziom/Reputacja/Prestiż |
| View       | `ClubProfileView` = presentation only (D50)                                           |
| Personel   | **ukryty** (D49)                                                                      |
| `/stadium` | poza zakresem                                                                         |
| Mocki      | zakaz PlaceholderPage / „Podgląd UI” / „wkrótce” na `/club` (D40/D41)                 |

## Decyzje

D47–D51 · [`../DECISIONS.md`](../DECISIONS.md)

## Kod

`apps/web/src/lib/club/resolve-club-profile.ts` · `ClubProfileView` · `(game)/club/page.tsx`

## Last updated

2026-07-30 — LFE-CLUB-01 CLOSED · Domain `36ba9be`
