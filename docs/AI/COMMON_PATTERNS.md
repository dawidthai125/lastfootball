# AI — Common Patterns

## Cel

Wzorcę architektoniczne projektu. **Zasady, nie implementacja.**  
Szczegóły kodu: [`ENGINEERING_GUIDE.md`](./ENGINEERING_GUIDE.md) · filozofia: [`ARCHITECTURE_PRINCIPLES.md`](./ARCHITECTURE_PRINCIPLES.md).

---

## Resolver Pattern

**Zasada:** UI i Hub nigdy nie składają domeny ad hoc z wierszy DB. Jedna funkcja pure (lub thin wrapper) zwraca DTO kontraktu.

**Kontrakty (przykłady):**

| Domen           | Resolver                                | DTO                 |
| --------------- | --------------------------------------- | ------------------- |
| Liga            | `resolveLeagueTable`                    | `LeagueTableDto`    |
| Finanse         | `resolveClubFinance`                    | `ClubFinanceDto`    |
| Kadra           | `resolveClubSquad`                      | `SquadDto`          |
| Transfery       | `resolveTransferMarket`                 | `TransferMarketDto` |
| Trening         | `resolveClubTraining`                   | `TrainingDto`       |
| Hub phase / CTA | `resolveHubPhase` / `resolvePrimaryCta` | —                   |

**Zakaz:** drugi „resolver” w komponencie, mock listy, bezpośrednie mapowanie tabeli w page bez shared resolve.

---

## Thin Slice

**Zasada:** EPIC dostarcza **minimalny** produktowy przepływ end-to-end na prawdziwym SSOT — bez pełnego GDD.

**Cechy:**

- działa na produkcji (DB + UI + unlock),
- stałe tymczasowe (`*_THIN`) do czasu GDD §26 / pełnych reguł,
- wyjątki vs GDD **udokumentowane** (np. First Match przed Hubem; unlock transferów/treningu po 2 played; dzień treningu UTC),
- poza zakresem wypisane i nietknięte (negotiation, envelope, potential, …).

**Ewolucja:** kolejny EPIC rozszerza ten sam SSOT — nie zastępuje go drugim modelem.

---

## SSOT

**Zasada:** jeden fakt = jedno źródło prawdy (kolumna/tabela **lub** jeden dokument).

| Fakt             | SSOT                         |
| ---------------- | ---------------------------- |
| Saldo            | `clubs.cash_balance`         |
| Kadra            | `players`                    |
| Okno transferów  | `clubs.transfer_window_open` |
| Dzień treningu   | `clubs.last_training_on`     |
| Faza Hub         | `resolveHubPhase`            |
| Prod „co działa” | `AI/CURRENT_BASELINE.md`     |

Aktualizuj SSOT; nie kopiuj faktów do nowych plików „na wszelki wypadek”.

---

## Pure vs IO

| Warstwa  | Rola                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| **Pure** | `resolve*` — wejście: DTO/wiersze już w pamięci; wyjście: DTO UI; bez Supabase/Next |
| **IO**   | `list*` / `get*` / server actions — auth, select/insert/update                      |

**Zasada:** logika domeny w pure; IO tylko ładuje i zapisuje. Testy jednostkowe celują w pure.

---

## Seed Pattern

| Kontekst                       | Dozwolone                                |
| ------------------------------ | ---------------------------------------- |
| Create club / backfill / testy | seed starter (`s-{tag}-…`)               |
| AI przeciwnik / katalog rynku  | `seedBotSquad` / `seedTransferCatalogue` |
| **Runtime UI klubu gracza**    | **zakaz** seed fallback                  |

Pusta baza kadry → błąd domenowy (`SquadUnavailableError`), nie ciche odtworzenie seeda.

---

## Feature Evolution

1. Thin Slice na SSOT.
2. Kolejny EPIC mutuje ten sam SSOT (np. Training na `players`).
3. Stałe Thin → GDD §26 gdy Owner zamknie liczby.
4. Bez „big bang rewrite” równoległego modelu.

---

## Idempotency

Mutacje z efektem ubocznym (complete fixture, transfer deal, ensure fixtures/window) używają **klucza idempotencji** lub warunku „tylko gdy stan X”, żeby retry nie dublował skutków (`transfer_deals.idempotency_key`, ensure\* idempotent).

---

## Domain Ownership

| Domen     | Owner docs                 | Owner kod (orientacja)       |
| --------- | -------------------------- | ---------------------------- |
| Hub       | `platform/HUB.md`          | `lib/hub`                    |
| League    | `platform/LEAGUE.md`       | `lib/fixtures`, `lib/league` |
| Finance   | `platform/FINANCE.md`      | `lib/finance`                |
| Players   | `platform/PLAYERS.md`      | `lib/squad`                  |
| Transfers | `platform/TRANSFERS.md`    | `lib/transfers`              |
| Training  | `platform/TRAINING.md`     | `lib/training`               |
| Match UI  | `web/MATCH_UI_PIPELINE.md` | gameplay / live              |
| LFE       | `lfe/*`                    | `packages/lfe`               |

Nie mieszaj ownership: Canvas nie mutuje Engine; page nie definiuje fee transferu lokalnie.

---

## Repository conventions

- Monorepo: `apps/web` · `packages/lfe` · `packages/domain` · `supabase/` · `docs/`.
- Docs SSOT w `docs/`; agent start: root `AGENTS.md` → `docs/AI/START_HERE.md`.
- Conventional Commits; commit/push tylko po **Owner GO**.
- CI: Format → Typecheck → Lint → Test → Build → Secret scan.

## Last updated

2026-07-25 — LFE-TRAINING-01 CLOSE
