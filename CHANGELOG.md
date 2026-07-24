# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

> **Uwaga dla Agentów:** bieżąca chronologia match pipeline / docs jest w [`docs/CHANGELOG.md`](./docs/CHANGELOG.md).  
> Ten plik (root) dokumentuje głównie release UI **0.1.0** i nie jest pełnym SSOT stanu `main` po Canvas/Replay/Post Match.

## [0.1.0] - 2026-07-23

### Added

- Public UI baseline (LFE-UI-IMPL-01…05): App Shell, Design Tokens, Panel, Kadra, Zawodnik, Terminarz, Pre Match, Live Match foundation
- IA navigation map and stub routes for remaining club modules
- Verification captures under `docs/verification/`

### Notes (0.1.0 baseline)

- W momencie tagu 0.1.0: brak pełnego Canvas/post-match w tym wpisie Keep-a-Changelog.
- **Aktualnie na `main`:** Canvas · Replay · Post Match · Live Bridge · Player Match Data — patrz `docs/CHANGELOG.md` / `docs/AI-HANDOFF.md`.

## [0.0.1] - 2026-07-21

### Added

- Foundation monorepo: Next.js 15 app, `@lastfootball/lfe`, `@lastfootball/domain`
- Engine status page (`/status`)
- Baseline CI (format, typecheck, lint, build)
- Vercel region `fra1` config
- Supabase client stubs
