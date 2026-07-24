# AI — Architecture Rules

## Cel

Twarde reguły architektoniczne dla implementacji. Nie łamać bez AUDIT + Owner GO.

## Warstwy

```
apps/web (Next.js UI + routing + Supabase clients)
    ↓ consumes
packages/lfe (headless Match Engine — no React/DOM/Supabase)
packages/domain (shared manager DTOs)
supabase/ (Auth + Postgres migrations)
```

## Match SSOT (LFE)

1. **`createMatch()` → `MatchSession`** — jedyny oficjalny entry meczu.
2. **`MatchState` + `EventBus`** — SSOT stanu i zdarzeń.
3. Mutacje tylko przez **CommandBus** / oficjalne API sesji.
4. **Canvas / Replay** czytają `MatchCanvasReadModel` — **nigdy** nie wołają Engine i nie mutują stanu.
5. **Live Bridge** (`LiveMatchRuntime`) spina LIVE pulse → buffer → Canvas; REPLAY odtwarza buffer.
6. First Match używa `createSessionFromFirstMatch(club)` → ten sam `createMatch` (bez zmiany kontraktów silnika).

## Product SSOT (platform)

| Fakt              | SSOT                                                |
| ----------------- | --------------------------------------------------- |
| Tożsamość klubu   | tabela `clubs` → `ClubDto`                          |
| Odblokowanie Hub  | `clubs.first_match_completed_at`                    |
| Faza Hub          | `resolveHubPhase(club)` wyłącznie                   |
| Primary CTA Hub   | `resolvePrimaryCta(phase, session)` wyłącznie       |
| Routing post-auth | `getPostAuthPath` + middleware (club + first match) |

## Hub rules (LFE-HUB-01)

- Hub dostępny **dopiero** po First Match.
- Hub = **ekran decyzji**, nie dashboard analytics.
- Dokładnie **1 Primary CTA**.
- Progressive disclosure — głębokie moduły soft-lock („wkrótce”).
- EARLY_CLUB: zero mid-season mock (`dashboardMock` / kolejka 12 / Top 4).

## REUSE FIRST / ZERO DUPLICATE

- Najpierw znajdź istniejący moduł / helper / API.
- Nie kopiuj logiki Engine/AI/statystyk do `apps/web`.
- Nie twórz drugiego SSOT dla tego samego faktu.

## GDD vs implementacja

- **GDD** = SSOT intencji produktu ([`GAME_DESIGN_DOCUMENT.md`](../game-design/GAME_DESIGN_DOCUMENT.md)).
- Świadomy wyjątek onboardingu: GDD §5.10 sugeruje Hub „nowy klub” przed meczem; **produkt live** używa First Match tunnel przed Hubem (LFE-MATCH-01). Dokumentuj wyjątek, nie „naprawiaj” GDD w kodzie bez Owner GO.

Pełna lista decyzji: [`../DECISIONS.md`](../DECISIONS.md) · [`DECISIONS.md`](./DECISIONS.md).

## Last updated

2026-07-24 — LFE-DOCS-01
