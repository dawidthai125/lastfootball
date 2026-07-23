# LFE EPIC-3 — Match State Machine

**Mode:** ARCHITECTURE FIRST  
**Date:** 2026-07-22  
**Package:** `@lastfootball/lfe` `0.3.0-epic3`

## Goal

Deterministic match lifecycle SSOT. `MatchState.phase` is driven only by `applyLifecycleEvent` / `transitionMatchState`.

## Location

`packages/lfe/src/match/state-machine/`

## States

`PRE_MATCH → LINEUP → KICKOFF → FIRST_HALF → HALF_TIME → SECOND_HALF → (EXTRA_TIME) → (PENALTIES) → FULL_TIME → FINISHED`

## API

- `applyLifecycleEvent(from, event, ctx)`
- `transitionMatchState(matchState, event, ctx)`
- `STATE_DEFINITIONS` / `TRANSITION_RULES`

## Non-goals

AI · Physics · Movement · Ball play · Canvas · React · Supabase
