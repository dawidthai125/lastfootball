# LFE EPIC-6 — Sesja Meczu

**Mode:** ARCHITECTURE FIRST  
**Date:** 2026-07-23  
**Package:** `@lastfootball/lfe` `0.6.0-epic6`

## Cel

Jedyny publiczny punkt wejścia do meczu: `createMatch(config) → MatchSession`.

## API

```ts
const session = createMatch(config);
session.start();
session.pause();
session.resume();
session.dispatch(command);
session.step() / session.run(n);
session.stop();
session.dispose();
```

## Ownership

Session owns: World · Simulation Pipeline · CommandBus · Match State Machine binding · Scheduler · Replay.

`createSimulation` pozostaje do testów silnika (@internal).

## Non-goals

AI · Physics · Ball · Canvas · React · Supabase · Networking
