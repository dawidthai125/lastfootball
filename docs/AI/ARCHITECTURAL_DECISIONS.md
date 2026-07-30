# AI — Architectural Decisions (skrót cold start)

## Cel

**Krótki przewodnik** dla nowej sesji ChatGPT / Cursor: trwałe decyzje architektoniczne **bez** kopiowania pełnych opisów.

**Pełny rejestr D\*:** [`../DECISIONS.md`](../DECISIONS.md)  
**Zasady filozofii:** [`ARCHITECTURE_PRINCIPLES.md`](./ARCHITECTURE_PRINCIPLES.md)  
**Reguły warstw / SSOT map:** [`ARCHITECTURE_RULES.md`](./ARCHITECTURE_RULES.md)

---

## Jak czytać tipy (nie mylić)

| Warstwa                 | SSOT               | Znaczenie                                     |
| ----------------------- | ------------------ | --------------------------------------------- |
| Production Baseline     | `CURRENT_BASELINE` | UI P0 tip (`54d0724`)                         |
| Domain feature baseline | `CURRENT_BASELINE` | Ostatni feat domenowy (np. Ranking `bf86749`) |
| Presentation tip        | `CURRENT_BASELINE` | Ostatni feat UI po P0 (np. MOTION)            |
| Documentation tip       | `CURRENT_BASELINE` | Ostatni `docs:` CLOSE sync                    |
| `git HEAD` / tip `main` | `git log -1`       | Może być nowszy pin/fix niż Documentation tip |

---

## Zasady nienumerowane (obowiązkowe)

| Zasada                     | Jedno zdanie                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| **SSOT FIRST**             | Jeden fakt → jedno źródło.                                                                |
| **REUSE FIRST**            | Najpierw istniejący resolver / helper.                                                    |
| **ZERO DUPLICATE LOGIC**   | Jedna implementacja reguły domeny.                                                        |
| **RESOLVER FIRST**         | UI domeny tylko przez `resolve*`.                                                         |
| **Presentation ≠ Domain**  | UI/motion/copy **nie** zmienia DTO / unlock / settlement; domain **nie** omija Guide §16. |
| **Information Thin**       | Warstwa informacji **porządkuje** fakty; **nie** ocenia i **nie** decyduje za gracza.     |
| **SEED ≠ RUNTIME**         | Seed ≠ ratunek pustego UI.                                                                |
| **NO RUNTIME MOCKS**       | Produkcja bez fałszywego rynku/sali/Hub FOMO.                                             |
| **Single Settlement Path** | Transfer settle tylko `completeTransferBuy` / `completeTransferSell`.                     |

---

## D19–D28 · D38 (skrót)

| ID      | Temat                     | Sedno (1 linia)                                                                   |
| ------- | ------------------------- | --------------------------------------------------------------------------------- |
| **D19** | Players SSOT              | Jedyna tabela kadry = `players`; UI = `resolveClubSquad`; seed ≠ runtime.         |
| **D20** | Transfers Thin            | Rynek = `resolveTransferMarket`; settle tylko buy/sell; fee = derive.             |
| **D21** | Training Thin + Depth     | `resolveClubTraining`; status + skill ≤ potential; RPC sesji; XI Gate.            |
| **D22** | Potential / match growth  | `players.potential`; UI = pasma only; match PRIMARY; trening SUPPORTING.          |
| **D23** | Academy Thin A            | `academy_track` / `promoted_at` na `players`; max 3; `resolveClubAcademy`.        |
| **D24** | Scouting Information Thin | `resolveClubScouting`; `scout_shortlist` = `(club_id, player_id)` → `players.id`. |
| **D25** | Daily Goal Thin           | `resolveClubDailyGoal` derive only; Primary > Daily; ≠ Secondary daily loop.      |
| **D26** | Achievements Thin         | `resolveClubAchievements` derive; immutable history; ≠ XP/score/§6/Ranking.       |
| **D27** | Ranking Thin              | `resolveClubRanking` z table input; własny DTO; ≠ league columns/ELO/§6.          |
| **D28** | League calendar 22        | `LEAGUE_FIXTURE_COUNT=22` double RR; MD1–11 identity; AI↔AI double RR.            |
| **D38** | Transfer public API       | Buy/Sell only · fee SQL helpers · 1× live settle · TRANSFERS-09.                  |

### D24 — kontrakt shortlisty (must-know)

- Preferencje menedżera **tylko** jako referencje do `players.id`.
- **Nie** drugi model zawodnika (brak skill / potential / scout_score w tabeli preferencji).
- Shortlista **nie** wpływa na AI, rynek, transfery, potencjał, symulację.
- Skauting **porządkuje** informacje — **nie** podejmuje decyzji za gracza.

### D25 — kontrakt Daily Goal (must-know)

- Pure derive · **brak** persist / Quest Engine / cron / nagród.
- **Primary CTA zawsze nadrzędny**; Daily Goal = sugestia Information Thin.
- ≠ `resolveSecondaryCtas` (daily loop nawigacji).
- Deep-link tylko do istniejących tras; wynik deterministyczny dla tego samego stanu.

### D26 — kontrakt Achievements (must-know)

- Pure derive z faktów domeny · **brak** persist / XP / Achievement Score / ekonomii.
- Historia **immutable** względem trwałych faktów.
- ≠ Ranking · ≠ Daily Goal · ≠ §6 metryki.

---

## Gdzie szukać kodu

[`MODULE_MAP.md`](./MODULE_MAP.md) — Hub · Daily · Achievements · Academy · Scouting · Training · Transfers · …

---

## Status

### D27 — kontrakt Ranking (must-know)

- Input = `resolveLeagueTable` → `resolveClubRanking` (mapowanie only).
- DTO bez points/WDL/goals/ELO; pasma = enum; copy UI = `UI_COPY` (D29).
- Nav open EARLY_CLUB; bieżący sezon; derive only.

**ACTIVE** · 2026-07-30 — LFE-TRANSFERS-09 · D38
