# LFE EPIC-5 — System Komend Meczu

**Mode:** ARCHITECTURE FIRST  
**Date:** 2026-07-23  
**Package:** `@lastfootball/lfe` `0.5.0-epic5`

## Przepływ

```
Źródło (AI / UI / Bot / Replay / MP / Test)
  → Command
  → Walidacja
  → Mutacja (World / Match / Time / Lifecycle queue)
  → Event (EventBus)
  → Replay (ReplaySystem w następnym ticku)
```

## API

- `sim.dispatch(command)` / `sim.commands.execute(command)`
- Fabryki: `createStartMatchCommand`, `createKickoffCommand`, …
- `registerMatchCommands(registry)`

## Uwaga względem EPIC-4

`ClockSystem` nadal awansuje zegar w pipeline (puls symulacji).  
Mutacje **kontroli meczu** (start/pause/end/walkover/…) idą wyłącznie przez CommandBus.

## Non-goals

AI · Physics · Ball · Canvas · React · Networking · async queue
