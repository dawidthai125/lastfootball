# LFE EPIC-7 — System pozycjonowania meczu

**Mode:** ARCHITECTURE FIRST  
**Date:** 2026-07-23  
**Package:** `@lastfootball/lfe` `0.7.0-epic7`

## Cel

Przestrzenny model boiska i ustawienia — bez ruchu / fizyki.

## Moduł

`packages/lfe/src/match/positioning/`

- `Position` / `PitchCoordinates`
- `HomeSide` / `AwaySide`
- `PitchGrid` / Zones
- `FormationLayout` / `SpawnPoints`
- `DistanceCalculator`
- `MatchSpatialState` (replay-friendly)

## Integracja

`MatchSession.getSpatialState()` — kickoff poses z formacji.

## Non-goals

Physics · Velocity · Collision · Ball movement · AI · Canvas · React
