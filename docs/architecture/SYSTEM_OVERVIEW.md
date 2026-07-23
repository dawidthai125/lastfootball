# System Overview

## Cel dokumentu

Wysokopoziomowy widok systemu Last Football (ludzie + agenci).

## Aktualny stan

Trzy główne płaszczyzny: **Product (GDD)**, **Engine (LFE)**, **Platform (Web + Supabase + Vercel)**.

## Opis działania

```
┌─────────────────────────────────────────────────────────┐
│                     apps/web (React/Next)               │
│  Hub / future Match UI /status ──┐                      │
└──────────────────────────────────┼──────────────────────┘
                                   │ PUBLIC API
                                   ▼
┌─────────────────────────────────────────────────────────┐
│                 packages/lfe (headless)                 │
│  createMatch → MatchSession → sim/commands/SM/spatial   │
└─────────────────────────────────────────────────────────┘
                                   ▲
                                   │ DTOs (nie model meczu)
┌─────────────────────────────────────────────────────────┐
│                   packages/domain                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  supabase/     auth · db · storage · realtime (prep)    │
│  vercel        host fra1                                │
│  docs/         SSOT (ten folder)                        │
└─────────────────────────────────────────────────────────┘
```

## Najważniejsze decyzje

- Silnik nie zna platformy.
- Design nie jest kodem.
- Platforma nie definiuje reguł meczu — LFE + GDD.

## Powiązania

[`../ARCHITECTURE.md`](../ARCHITECTURE.md) · [DEPENDENCIES.md](./DEPENDENCIES.md) · [foundation.md](./foundation.md)

## Last updated

2026-07-23
