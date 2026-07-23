# LFE EPIC-2 — Match Domain Model

**Mode:** DESIGN FIRST  
**Date:** 2026-07-22  
**Package:** `@lastfootball/lfe` `0.2.0-epic2`

## Goal

Full serializable match domain model. No AI, physics, movement, or UI.

## Location

`packages/lfe/src/match/domain/`

## Aggregate

```
Match
  settings: MatchSettings
  state: MatchState
    teams, lineups, benches, players
    ball, pitch, goals
    clock, score, phase
    referee, weather, stadium
    substitutions, cards, injuries, statistics
```

## Boundaries

- EPIC-1 core untouched (`simulation/`, `rng/`, `world/` placeholders remain)
- `@lastfootball/domain` keeps club/manager DTOs + shared IDs
- `createMatch()` still throws (no simulation)

## Non-goals

AI · Physics · Passing · Shooting · Collisions · Canvas · React · Supabase
