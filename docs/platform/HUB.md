# Platform — Hub (LFE-HUB-01)

## Cel

Hub = **ekran decyzji** (GDD §23), nie dashboard mid-season.

## State Machine

| Phase | Hub render? | Warunek |
| --- | --- | --- |
| `NEW_CLUB` | **Nie** — First Match tunnel | `!first_match_completed_at` |
| `EARLY_CLUB` | **Tak (MVP)** | first match done; brak live season SSOT |
| `SEASON` | Future | liga/terminarz live |
| `PLAYOFF` | Future | faza playoff |
| `OFFSEASON` | Future | międzysezonie |

**Resolver (jedyny):** `resolveHubPhase(club)` w `apps/web/src/lib/hub/`.

## EARLY_CLUB layout

1. Hero — Club DTO  
2. Last Match Strip — jakościowy (vs Orły Pustyni)  
3. **Exactly 1** Primary CTA — `resolvePrimaryCta` → „Zobacz skład” → `/squad`  
4. ≤5 Secondary (Terminarz soft-locked „wkrótce”)  
5. Lekki status (IV liga, stadion, Day 1)  
6. Jedna wiadomość zarządu  

## Progressive unlock (shell)

Open Day 1: Panel, Klub, Kadra, Wiadomości, Profil, Ustawienia, Osiągnięcia, Status.  
Soft-lock: Liga, Terminarz, Trening, Akademia, Skauting, Transfery, Finanse, Sponsorzy, Zarząd, Stadion.

Implementacja: `resolveNavAccess(itemId, phase)`.

## Zakazane na EARLY_CLUB

Kolejka 12, Top 4, tabela punktowa, recent results fiction, finanse € mid, trening peer-CTA, „okno transferowe”, kontuzje mid-season, `dashboardMock` / `sessionChrome` na ścieżce Hub.

## Powiązania

Kod: `components/hub/EarlyClubHub.tsx` · `lib/hub/*` · shell layout components.  
GDD: §23 (z wyjątkiem Hub-before-match → tunnel).

## Last updated

2026-07-24 — LFE-DOCS-01
