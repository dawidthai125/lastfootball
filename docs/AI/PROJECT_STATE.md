# AI — Project State

## Cel

Stan projektu dla Agenta: **gdzie jesteśmy**, bez historii czatu.

## Aktualny etap

**Product platform + First Match + EARLY_CLUB Hub** na produkcji.  
Silnik LFE i match UI pipeline są dojrzałe; kolejny EPIC = Owner GO (liga / ekonomia / GDD / polish).

## Ukończone (skrót)

### Platforma gracza

| EPIC | Outcome |
| --- | --- |
| LFE-PLATFORM-01 | Landing, Auth, Welcome, Club Wizard, Club DTO, routing by `clubs` |
| LFE-INFRA-01 | Supabase project `anoeimngwptucjdugjme` |
| LFE-MATCH-01 | First Match tunnel; `first_match_completed_at`; synthetic fixture `first` |
| LFE-HUB-01 | Hub State Machine; EARLY_CLUB decision layout; shell soft-locks |

### Silnik / mecz UI

LFE EPIC-1…7 · Gameplay · AI · Engine · Player Match Data · Live Bridge · Canvas · Replay · Post Match · Ratings.

### Design

GDD-01…15 CLOSED (§3–§15, §20, §23). GDD pozostaje SSOT produktu; implementacja może mieć świadome wyjątki (np. First Match **przed** Hubem — patrz platform docs).

## W trakcie

Brak otwartego EPIC implementacyjnego (stan po LFE-HUB-01 CLOSE readiness).

## Następne (rekomendacje — Owner wybiera)

1. League / fixtures SSOT (odblokuje Hub SEASON + next match CTA).
2. GDD-16+ (kolejny rozdział designu).
3. Economy / transfers (po soft-lockach Hub).
4. Zawężenie PUBLIC exports LFE (chore).
5. Physics / Rules — FUTURE.

## Otwarte decyzje techniczne

| ID | Temat | Status |
| --- | --- | --- |
| D-01 | Zawężenie `packages/lfe` `index.ts` do freeze | Otwarte |
| D-03 | Persist Replay | Otwarte |
| D-HUB-NEXT | Soft next-event vs liga DB (M4 Hub) | Owner |

## Powiązania

[`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md) · [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) · [`../ROADMAP.md`](../ROADMAP.md)

## Last updated

2026-07-24 — LFE-DOCS-01
