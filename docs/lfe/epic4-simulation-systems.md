# LFE EPIC-4 — Simulation Systems

**Mode:** ARCHITECTURE FIRST  
**Date:** 2026-07-23  
**Package:** `@lastfootball/lfe` `0.4.0-epic4`

## Goal

Prioritized, single-responsibility systems executed every tick. No physics/AI/ball logic.

## Pipeline

```
ClockSystem → SchedulerSystem → LifecycleSystem → [GAMEPLAY] → EventSystem → ReplaySystem
                                                                                    ↓
                                                                               Snapshot
```

Order comes from `SystemPriority` constants — never from import/register order.

## Interface

```ts
interface SimulationSystem {
  readonly id: string;
  readonly priority: number;
  execute(ctx: SystemContext): void;
}
```

## Location

`packages/lfe/src/simulation/` — `priority.ts`, `system.ts`, `registry.ts`, `pipeline.ts`, `systems/*`

## Non-goals

PhysicsSystem · AISystem · BallSystem · PlayerMovement · Rendering · React · Canvas · Supabase
