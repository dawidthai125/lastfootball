# LFE EPIC-1 — Core Foundation

**Mode:** ARCHITECTURE FIRST  
**Date:** 2026-07-22  
**Package:** `@lastfootball/lfe` `0.1.0-epic1`

## Goal

Ownable, headless, deterministic simulation kernel. React/Canvas stay outside.

## Tick pipeline

```
update() → systems() → events() → snapshot() → next tick
```

Default: `ticksPerSecond = 20` (`dt = 50ms`).

## World State (SSOT)

Single `WorldState` owns: `players`, `teams`, `ball`, `clock`, `events`, `physics`, `rng`, `match`, `settings`.

Entity slots are empty placeholders in EPIC-1 — no Player/Team/Ball types yet.

## Determinism

`seed → createRng (Mulberry32) → createSimulation → identical snapshots`.

## Explicit non-goals (this epic)

- Ball / physics / AI / rules logic
- Canvas / React components
- Supabase queries
- Full match session (`createMatch` remains stub)
