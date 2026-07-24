# LFE — Architecture Freeze

**Package:** `@lastfootball/lfe`  
**Freeze version:** `1.0.0-arch` (architectural contract)  
**Package version (current):** `0.9.1-match-ai01`  
**Based on:** EPIC-1…7 · AUDIT-01 · AUDIT-02 · AUDIT-03  
**Mode (original freeze):** Architecture only — no gameplay · no Physics · no AI · no new EPICs

> **Post-freeze reality (2026-07-23):** Gameplay Foundation, Match AI, and Match Engine are **implemented** and shipped on `main`. This freeze remains the **base PUBLIC contract** for session/commands/spatial. AI/Engine barrel exports are **extensions** — see [`PUBLIC_API.md`](./PUBLIC_API.md) and [`GAMEPLAY_MATCH_STACK.md`](./GAMEPLAY_MATCH_STACK.md). Updating freeze categories (e.g. un-RESERVING `ai/`) requires AUDIT + Owner GO. Physics / full Rules remain out of scope.

---

## 0. Verification (pre-freeze)

| #   | Question                                              | Verdict                                                                                                                                                          |
| --- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Does PUBLIC API match real app needs?                 | **YES** — status page today; match UX (build → run → command → read state/spatial/events → dispose) for GDD §9. Setup factories are **transitional** (see §3.3). |
| 2   | Is `createMatch()` the only official entry?           | **YES** (contract). `createSimulation` and deep barrels are **not** official app entry.                                                                          |
| 3   | Is `MatchSession` the only public engine façade?      | **YES** (contract). All match control/read goes through the session.                                                                                             |
| 4   | Does INTERNAL leak into PUBLIC?                       | **NO** in this freeze contract. Current `src/index.ts` still over-exports — that is **implementation debt**, not the frozen contract (see §11).                  |
| 5   | Are ADVANCED / TESTING / INTERNAL / RESERVED correct? | **YES**, with Owner adjustments below.                                                                                                                           |
| 6   | Owner remarks                                         | **Applied** — see §1.1.                                                                                                                                          |

### 1.1 Owner remarks (applied)

1. **`getWorld()`** → **ADVANCED** (not part of recommended PUBLIC v1 surface). Prefer `getMatchState()` + `getSpatialState()`.
2. **Domain factories** remain PUBLIC only as a **transitional** solution.
   > **Note:** Docelowo aplikacja buduje `MatchSessionConfig`, a modele domenowe tworzy silnik.
3. New category: **EXPERIMENTAL** — future APIs not yet part of the contract.

---

## 1. Architectural assumptions

1. **LFE** is a headless, deterministic match engine. No React, no Next, no Supabase inside the package.
2. **EPIC-6** defines the product boundary: `createMatch(config) → MatchSession`.
3. **EPIC-2** domain types are the shared language of match data; construction of full aggregates migrates toward the engine over time.
4. **EPIC-3** lifecycle tables and transition helpers are engine-owned; the app reads phase via `MatchState`.
5. **EPIC-4 / EPIC-1** runtime (tick, systems, bus, scheduler, world) stay behind the session.
6. **EPIC-5** commands are the only intentional mutation path (plus session shortcuts that wrap commands).
7. **EPIC-7** exposes a **spatial read model** for Live UI without Physics.
8. Gameplay (Physics, AI, Rules logic, ball movement) is **out of scope** for this freeze.
9. This document freezes the **contract**, not necessarily the current barrel export list in `index.ts`.

---

## 2. Layer definitions

| Layer            | Consumers                           | Stability                                    |
| ---------------- | ----------------------------------- | -------------------------------------------- |
| **PUBLIC**       | `apps/web`, future `features/match` | SemVer-stable; breaking = major              |
| **ADVANCED**     | Debug, replay tooling, deep inspect | Stable intent; may evolve faster than PUBLIC |
| **TESTING**      | Vitest / CI / EPIC harness          | No production imports                        |
| **INTERNAL**     | Code inside `packages/lfe` only     | No guarantee                                 |
| **DEPRECATED**   | Compat only                         | Remove after grace                           |
| **RESERVED**     | Named stubs for future EPICs        | No API promise                               |
| **EXPERIMENTAL** | Prototypes / candidates             | May change or vanish without major           |

---

## 3. Public API v1 (frozen)

### 3.1 Official entry

```ts
createMatch(config: MatchSessionConfig): MatchSession
```

**Rule:** This is the **only official** match entry point for application code.

### 3.2 Status

| Export               | Role                    |
| -------------------- | ----------------------- |
| `LFE_VERSION`        | Engine version string   |
| `LFE_STATUS`         | Coarse status constant  |
| `getEngineStatus()`  | Module readiness report |
| `EngineStatus`       | Type                    |
| `EngineModuleStatus` | Type                    |
| `EngineStatusReport` | Type                    |

### 3.3 Session façade

| Export               | Role                                              |
| -------------------- | ------------------------------------------------- |
| `MatchSession`       | **Only** public engine façade for running a match |
| `MatchSessionConfig` | Session configuration                             |
| `SessionStatus`      | Session lifecycle (`created` … `disposed`)        |
| `MatchInput`         | Base match composition input                      |
| `MatchResult`        | Lightweight end/report snapshot                   |
| `MatchEvent`         | Lightweight event record for UI                   |

**Guaranteed `MatchSession` methods (PUBLIC v1):**

| Method                                            | Semantics                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| `start` / `pause` / `resume` / `stop` / `dispose` | Session control                                                          |
| `dispatch(command)`                               | Command path (EPIC-5)                                                    |
| `step` / `run`                                    | Advance simulation                                                       |
| `getMatchState()`                                 | Primary match read model                                                 |
| `getSpatialState()`                               | Spatial read model (EPIC-7)                                              |
| `getEvents()`                                     | Event log for Report / debug-lite                                        |
| `snapshots()` / `latestSnapshot()`                | Optional replay reads (allowed on façade; heavy use → ADVANCED patterns) |

**Explicitly not PUBLIC (façade methods):**

| Method       | Layer                   |
| ------------ | ----------------------- |
| `getWorld()` | **ADVANCED**            |
| `context()`  | **ADVANCED**            |
| `runToEnd()` | **DEPRECATED** (compat) |

### 3.4 Domain types (PUBLIC)

Read/write language for match setup and UI:

`Match` (exported as `MatchModel`), `MatchState`, `MatchPhase`, `MatchClock`, `MatchPeriod`, `MatchSettings`, `Team` (`MatchTeam`), `Player` (`MatchPlayer`), `PlayerAttributes` (`MatchPlayerAttributes`), `PlayerSkills`, `PlayerCondition`, `Formation`, `FormationSlot`, `FormationCode`, `Lineup`, `LineupSlot`, `Bench`, `Ball`, `Pitch`, `Goal`, `Referee`, `Weather`, `Stadium`, `Score`, `Substitution`, `Card`, `Injury`, `Statistics`, `TeamStatistics`, `PlayerStatistics`, `PitchSide`, `PitchRole`, `PitchPoint`

### 3.5 Domain factories (PUBLIC — transitional)

| Export                                                                           | Role                            |
| -------------------------------------------------------------------------------- | ------------------------------- |
| `createPlayer`                                                                   | Build roster entries for config |
| `createTeam`                                                                     | Team stub for config            |
| `createLineup` / `createBench`                                                   | XI + bench for config           |
| `createMatchSettings`                                                            | Settings overrides              |
| `formationByCode`, `FORMATION_442`, `FORMATION_433`                              | Formation presets               |
| `DEFAULT_MATCH_SETTINGS`, `DEFAULT_PITCH`                                        | Defaults                        |
| `DEFAULT_PLAYER_ATTRIBUTES`, `DEFAULT_PLAYER_SKILLS`, `DEFAULT_PLAYER_CONDITION` | Defaults                        |

> **Transitional note (Owner):**  
> Domain factories remain PUBLIC only as a transitional solution.  
> **Docelowo aplikacja buduje `MatchSessionConfig`, a modele domenowe tworzy silnik.**

Future direction: thinner app input (IDs, formation codes, shirt numbers) → engine builds `Match` / `MatchState` internally.

### 3.6 Commands (thin PUBLIC)

| Export                                                                                                                                                                                         | Role                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `Command`, `CommandResult`, `CommandSource`                                                                                                                                                    | Minimal dispatch contract |
| `MatchCommand`, `MatchCommandType`                                                                                                                                                             | Match command union       |
| `StartMatchCommand`, `KickoffCommand`, `PauseMatchCommand`, `ResumeMatchCommand`, `EndMatchCommand`, `AbandonMatchCommand`, `DeclareWalkoverCommand`                                           | Typed commands            |
| `createStartMatchCommand`, `createKickoffCommand`, `createPauseMatchCommand`, `createResumeMatchCommand`, `createEndMatchCommand`, `createAbandonMatchCommand`, `createDeclareWalkoverCommand` | Factories for UI/AI/tests |

Session shortcuts (`start` / `pause` / `resume`) wrap the same command path.

### 3.7 Spatial read (PUBLIC)

| Export                                              | Role                                           |
| --------------------------------------------------- | ---------------------------------------------- |
| `Position`                                          | 2D point on pitch                              |
| `MatchSpatialState`, `SpatialPlayer`, `SpatialBall` | Spatial read model                             |
| `createMatchSpatialState`                           | Helper; **prefer** `session.getSpatialState()` |
| `findSpatialPlayer`                                 | Lookup convenience                             |

### 3.8 Config (PUBLIC)

| Export                     | Role                                             |
| -------------------------- | ------------------------------------------------ |
| `LfeConfig`, `DeepPartial` | Engine overrides via `MatchSessionConfig.engine` |
| `DEFAULT_LFE_CONFIG`       | Documented defaults (e.g. 20 ticks/s)            |
| `LogLevel`                 | Logging verbosity in config                      |

---

## 4. Advanced API

For debug, tooling, replay UIs, and deep inspection — **not required** for MVP match screens.

| Area                                | Symbols / surface                                                                                                                                                                                                                                                           |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session deep inspect                | `MatchSession.context()`, `MatchSessionContext`, `MatchSession.getWorld()`                                                                                                                                                                                                  |
| World                               | `WorldState`, `MatchMeta`, `WorldSettings`                                                                                                                                                                                                                                  |
| Replay types                        | `ReplaySnapshot` (when imported directly)                                                                                                                                                                                                                                   |
| Runtime types (no factories)        | `GameClock`, `TimeController`, `EventBus`, `EngineEvent`, `EngineEventType`, `Scheduler`, `ScheduledJob`, `ScheduledJobId`, `Rng`, `RngState`, `Logger`, `LogRecord`                                                                                                        |
| Lifecycle **read** types            | `MatchLifecycleState`, `MatchLifecycleEventType`                                                                                                                                                                                                                            |
| Phase helpers                       | `isTerminalPhase`, `isPlayPhase`, `MATCH_PHASES`, `isTerminalLifecycleState`, `isPlayLifecycleState`                                                                                                                                                                        |
| Positioning (tactics editors / viz) | `pitchCoordinates`, `PitchCoordinates`, `HomeSide`, `AwaySide`, `sideOrientation`, `centreSpotPosition`, `buildFormationLayout`, `occupyFormationLayout`, `FormationLayout`, `FormationLayoutSlot`, `OccupiedSlot`, `createKickoffSpawnPoints`, `SpawnPoint`, `SpawnPoints` |
| Math                                | `Vec2`, `vec2`                                                                                                                                                                                                                                                              |

**Rule:** Advanced may be published later as `@lastfootball/lfe/advanced`. Until then, treat as non-app contract even if currently re-exported from `index.ts`.

---

## 5. Testing API

For Vitest / CI / EPIC harness only. **No production app imports.**

| Area                  | Symbols                                                                                                                                                                                                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Simulation harness    | `createSimulation`, `Simulation`, `SimulationOptions`                                                                                                                                                                                                                                                                                                              |
| Systems               | `createSystemRegistry`, `SystemRegistry`, `SystemFn`, `SimulationSystem`, `SystemContext`, `LifecycleFacts`, `SystemPriority`, `compareSystemPriority`, priority types, `createSimulationPipeline`, `SimulationPipeline`, `createBuiltinSystems`, `createClockSystem`, `createSchedulerSystem`, `createLifecycleSystem`, `createEventSystem`, `createReplaySystem` |
| Commands (wiring)     | `createCommandBus`, `createCommandRegistry`, `CommandBus`, `CommandRegistry`, `CommandHandler`, `CommandValidator`, `CommandContext`, `ValidationError`, `nextCommandId`, `resetCommandIdSeq`, `registerMatchCommands`, `MATCH_COMMAND_HANDLERS`                                                                                                                   |
| State machine         | `applyLifecycleEvent`, `canApplyLifecycleEvent`, `nextLifecycleState`, `getAllowedEvents`, `getStateDefinition`, `transitionMatchState`, `defaultLifecycleContext`, `STATE_DEFINITIONS`, `TRANSITION_RULES`, `MATCH_LIFECYCLE_STATES`, `MATCH_LIFECYCLE_EVENTS`, lifecycle result/definition types                                                                 |
| Core factories        | `createGameClock`, `createTimeController`, `createTickEngine`, `createLogger`, `createEventBus`, `createScheduler`, `createRng`, `createInitialWorldState`, `TickEngine`, `TickPhases`, `ClockSnapshot`                                                                                                                                                            |
| Replay helpers        | `captureSnapshot`, `cloneWorld`, `createSnapshotBuffer`, `SnapshotBuffer`                                                                                                                                                                                                                                                                                          |
| Config helpers        | `resolveConfig`, `tickDurationMs`                                                                                                                                                                                                                                                                                                                                  |
| Positioning unit math | `createPitchGrid`, `cellAt`, `cellCenter`, `sameCell`, `PitchGrid`, `GridCell`, `createZones`, `pointInZone`, `zonesContaining`, `longitudinalThird`, `PitchZone`, `PitchZoneId`, `distanceCalculator`, `DistanceCalculator`, `position`                                                                                                                           |
| Domain heavy builders | `createMatchModel`, `withMatchState`, `createMatchState`, `createBall`, `createPitch`, `createGoals`, `createScore`, `createMatchClock`, `createReferee`, `createWeather`, `createStadium`, `emptyStatistics`, `ZERO_SCORE`                                                                                                                                        |
| Session internals     | `SESSION_TRANSITIONS`, `createSessionLifecycle`, `isSessionActive`, `buildMatchFromConfig`                                                                                                                                                                                                                                                                         |

**Target entry:** `@lastfootball/lfe/testing` (future packaging; not required to exist before gameplay EPICs start).

---

## 6. Internal API

Owned exclusively by `packages/lfe`. Application code must not import these paths.

- Implementations under `core/`, `rng/`, `events/`, `scheduler/`, `world/`, `simulation/`, `replay/`, `commands/` (bus/registry/handlers impl)
- `match/state-machine/` implementation
- `match/session/` internals (`create-match`, `build-match`, `lifecycle` impl)
- Barrel-only domain details: branded IDs (`MatchId`, `PlayerId`, `TeamId`, `Rating`), `Create*Input`, `BallPhase`, `CardType`, `InjurySeverity`, `TeamColors`, `WeatherType`, `SubstitutionReason`, `emptyTeamStatistics`, …
- Deps bags: `CommandBusDeps`, `SimulationPipelineDeps`, `LogSink`, `TickPhaseContext`, `TimeControllerStatus`
- Legacy stub: `PitchDimensions` on world barrel

---

## 7. Deprecated

| Item                                     | Replacement                             |
| ---------------------------------------- | --------------------------------------- |
| `MatchHandle`                            | `MatchSession`                          |
| `packages/lfe/src/match/session.ts` shim | Root `createMatch` / `match/session/`   |
| `Seed`, `ClockState` (`core/compat`)     | `GameClock`                             |
| `MatchSession.runToEnd()`                | `run` + `stop` + `MatchResult` / events |

**Grace:** Keep until an explicit cleanup pass after the first gameplay EPIC lands; do not use in new application code.

---

## 8. Reserved

Named placeholders for future work. **No contract.**

| Module               | Intent                                     |
| -------------------- | ------------------------------------------ |
| `ecs/`               | Future entity storage (today: World State) |
| `ai/`                | Tactics / decision AI                      |
| `rules/`             | Fouls, restarts, law enforcement           |
| `physics/`           | Ball, collisions, movement                 |
| `input/` stub barrel | Superseded by `MatchInput` on PUBLIC       |
| `utils/`             | Internal helpers (`clamp`, `assertNever`)  |

---

## 9. Experimental

APIs that may appear during exploration **before** they join PUBLIC / ADVANCED.

| Rule                                | Detail                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Marking                             | Prefix docs/`@experimental` / folder or export tag                                                                                               |
| Stability                           | **None** — may break or disappear without a major bump                                                                                           |
| Promotion                           | Requires Owner GO + update of this freeze doc + tests                                                                                            |
| Examples (candidates, not promised) | Alternate match input DTOs, subscription helpers on `EventBus` for UI, richer Report DTO, tactics-editor-only layout APIs promoted from ADVANCED |

Experimental must **not** be required by production match screens.

---

## 10. Post-freeze evolution rules

1. **No new PUBLIC export** without: consumer story (GDD screen) + contract test + update of this document + Owner GO.
2. Gameplay EPICs (Physics / AI / Rules / ball) may add **INTERNAL** freely; PUBLIC only if the app must call it.
3. Prefer extending **`MatchSession` methods** over exporting new subsystems.
4. Prefer engine-built domain models over growing PUBLIC factories (see transitional note §3.5).
5. Do not start packing `@lastfootball/lfe/advanced` or `/testing` as a blocker for gameplay — document first, split entries when convenient.
6. GDD remains product SSOT; LFE freeze is **engine** SSOT. Numbers/economy/league rules stay out of LFE until a dedicated EPIC maps them.

---

## 11. Rules for adding exports

| Proposed export            | Allowed if…                           | Default layer                                    |
| -------------------------- | ------------------------------------- | ------------------------------------------------ |
| New `MatchSession` method  | UI cannot use existing reads/commands | PUBLIC (preferred)                               |
| New command factory        | New player/AI intent                  | PUBLIC                                           |
| New domain type field      | Serialization / UI need               | PUBLIC type; construction INTERNAL when possible |
| New system / pipeline hook | Engine-only or tests                  | INTERNAL / TESTING                               |
| Debug inspect              | Tooling only                          | ADVANCED                                         |
| Unproven idea              | Spike                                 | EXPERIMENTAL                                     |
| Stub for later EPIC        | Name reservation only                 | RESERVED                                         |

**Forbidden without Owner GO:** promoting TESTING or INTERNAL symbols into PUBLIC “for convenience.”

---

## 12. Breaking Changes Policy

A **breaking change** to PUBLIC API v1 includes any of:

- Removing or renaming a PUBLIC export
- Changing required fields of `MatchSessionConfig` / `MatchInput` without backward-compatible defaults
- Changing `MatchSession` method signatures or guaranteed semantics in §3.3
- Changing command payload shapes in a non-compatible way
- Changing meaning of `SessionStatus` or published domain enums used by the app

**Not breaking (examples):**

- INTERNAL / TESTING changes
- ADVANCED changes (document in changelog; no major required unless advertised as stable support)
- EXPERIMENTAL any change
- Adding optional fields with defaults
- Soft-deprecating with aliases remaining through grace

**Process:**

1. Propose change + migration note
2. Owner GO
3. Major version (see SemVer) for PUBLIC breaks
4. Update this document in the same change set

---

## 13. SemVer Policy

| Version channel                        | Meaning                                                                                                    |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `0.x` (historical, e.g. `0.7.0-epic7`) | Pre-façade-hardening / EPIC milestone tags — historical                                                    |
| `0.9.1-match-ai01`                     | Gameplay + Match AI + Match Engine (post-freeze package)                                                   |
| **Architecture freeze**                | This document = contract `PUBLIC API v1` regardless of npm patch until packaging aligned                   |
| `1.0.0` (target package)               | First release that **implements** export surface matching this freeze (narrowed `index` / subpath exports) |
| `1.x` minors                           | Additive PUBLIC / documented ADVANCED                                                                      |
| `1.x` majors                           | PUBLIC breaking changes only                                                                               |
| Pre-release tags                       | `1.1.0-experimental.*` for EXPERIMENTAL bundles if ever published                                          |

Until `1.0.0` packaging lands, treat **this markdown** as the source of truth for what application code is **allowed** to depend on.

---

## 14. Target package entry layout (future — not implemented here)

```
@lastfootball/lfe            → Public API v1
@lastfootball/lfe/advanced   → Advanced API
@lastfootball/lfe/testing    → Testing API
```

Internal modules remain non-exported path imports inside the package only.

---

## 15. Freeze checklist

| Item                               | Status                               |
| ---------------------------------- | ------------------------------------ |
| EPIC-1…7 complete                  | ✅                                   |
| AUDIT-01…03 complete               | ✅                                   |
| `createMatch` sole official entry  | ✅ (contract)                        |
| `MatchSession` sole public façade  | ✅ (contract)                        |
| `getWorld` → ADVANCED              | ✅                                   |
| Domain factories transitional note | ✅                                   |
| EXPERIMENTAL category              | ✅                                   |
| Gameplay / Physics / AI excluded   | ✅                                   |
| Code narrowed to match freeze      | ❌ deferred (docs-only finalization) |

---

## 16. Architecture ready?

**YES** — for **architectural freeze** (contract).

Implementation alignment of `src/index.ts` with this document is a **follow-up packaging task**, not a blocker to declare the freeze document final.

**Recommendation:** **FREEZE** (documentation contract).  
Optional later: `REQUIRES CHANGES` only if Owner rejects transitional factories or wants `getWorld` removed from the façade type entirely before freeze.

---

_End of LFE Architecture Freeze document._
)
