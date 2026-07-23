# Architecture — Last Football

## Cel dokumentu

Opis architektury systemu: frontend, backend/BFF, Supabase, LFE, przepływ danych meczu.

## Aktualny stan

Monorepo z wyraźnymi granicami pakietów. LFE = headless engine. Web = cienki shell. Brak Canvas gameplay.

## Opis działania — komponenty

### Frontend (`apps/web`)

- Next.js 15 App Router + React.  
- Strony: home, `/status` (wywołuje `getEngineStatus()` z LFE).  
- `transpilePackages`: `@lastfootball/lfe`, `@lastfootball/domain`.  
- **Nie** uruchamia jeszcze Live match UI.

### Backend / BFF

- Na razie logika serwerowa = Next.js route handlers / przyszłe Server Actions.  
- Brak osobnego API serwisu meczu — symulacja ma być wywoływalna z klienta lub workera później (decyzja otwarta).

### Supabase

- Auth, Postgres, Storage, Realtime, Edge Functions (prep).  
- Typy generowane; migracje w `supabase/`.  
- **Nie** jest zależnością pakietu LFE.

### Canvas

- **Planowane** jako warstwa renderu meczu (2D).  
- **Nie** jest częścią `@lastfootball/lfe`.  
- Ma czytać `MatchSession.getMatchState()` / `getSpatialState()` / eventy — nie mutować silnika poza komendami.

### React

- UI managera + przyszły match shell.  
- Zakaz: import React wewnątrz `packages/lfe`.

### LFE Engine (`packages/lfe`)

Headless, deterministyczny silnik meczu. Warstwy: config, core, rng, events, scheduler, world, simulation systems, domain, state machine, commands, session, positioning. Stuby: physics, ai, rules, ecs.

### Match Session

- Oficjalna fasada: `createMatch(config) → MatchSession`.  
- Orkiestruje simulation + commands + lifecycle + spatial snapshot.

### Replay

- Bufor snapshotów per tick (`ReplaySnapshot`).  
- Dostęp: `session.snapshots()` / `latestSnapshot()`; heavy inspect = ADVANCED.

### Commands

- Jedyna intencjonalna ścieżka mutacji (poza internal systems).  
- UI/AI: factories komend → `session.dispatch` lub shortcuty `start`/`pause`/`resume`.

### State Machine

- SSOT faz meczu (`MatchLifecycleState` / `MatchState.phase`).  
- Tabele przejść = INTERNAL; app czyta fazę ze stanu.

### Simulation

- Tick loop (domyślnie 20 ticks/s).  
- Pipeline: update → systems (Clock → Scheduler → Lifecycle → Event → Replay) → events → snapshot.

### Public API

- Kontrakt: [`lfe/LFE_ARCHITECTURE_FREEZE.md`](./lfe/LFE_ARCHITECTURE_FREEZE.md) · skrót [`lfe/PUBLIC_API.md`](./lfe/PUBLIC_API.md).  
- Uwaga: obecny `index.ts` eksportuje więcej niż kontrakt (dług).

## Przepływ danych (mecz)

```
App (React)
  │  buduje MatchSessionConfig (transitional: domain factories)
  ▼
createMatch(config)
  ▼
MatchSession
  ├─ start/pause/resume/dispatch  → CommandBus → handlers → MatchState / lifecycle
  ├─ step/run                     → Simulation tick pipeline
  ├─ getMatchState / getSpatialState / getEvents  → UI / Canvas (read)
  └─ snapshots                    → Replay / debug
```

Persystencja klubu (przyszłość): App ↔ Supabase; LFE pozostaje bez I/O.

## Najważniejsze decyzje

1. LFE bez frameworków UI/DB.  
2. Session = jedyna fasada meczu.  
3. Domain manager (`packages/domain`) ≠ domain meczu (`lfe/match/domain`).  
4. Canvas poza silnikiem.

## Powiązania

[`architecture/SYSTEM_OVERVIEW.md`](./architecture/SYSTEM_OVERVIEW.md) · [`architecture/DEPENDENCIES.md`](./architecture/DEPENDENCIES.md) · [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) · [`DECISIONS.md`](./DECISIONS.md)

## Last updated

2026-07-23
