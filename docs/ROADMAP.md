# Roadmap — Last Football

## Cel

Mapa postępu: **DONE / IN PROGRESS / PLANNED / FUTURE**.

## Aktualny stan

Production baseline **`b6b92dc`** (LFE-HUB-01): First Match + EARLY_CLUB Hub. CI zielony.

---

## DONE ✅

| Item | Notatka |
| --- | --- |
| Monorepo + infra | Next, Supabase, Vercel, CI |
| LFE EPIC-1…7 | Foundation → Positioning |
| LFE Architecture Freeze | PUBLIC API v1 |
| Gameplay · Match AI · Match Engine · Player Match Data | silnik gameplay |
| Asset Pack · UI Shell | chrome |
| Live Bridge · Canvas · Replay · Post Match · Ratings | match UI pipeline |
| CI Prettier | format gate |
| GDD-01…15 | §3–§15 + §20 + §23 |
| **LFE-PLATFORM-01** P1–P3 | Landing · Auth · Club Wizard · Club DTO |
| **LFE-INFRA-01** | Supabase `anoeimngwptucjdugjme` |
| **LFE-MATCH-01** | First Match tunnel · `first_match_completed_at` |
| **LFE-HUB-01** | EARLY_CLUB · `resolveHubPhase` / `resolvePrimaryCta` |

## IN PROGRESS 🔄

| Item | Notatka |
| --- | --- |
| LFE-DOCS-01 | Konsolidacja dokumentacji (docs-only; bez commit do momentu Owner GO) |

## PLANNED ⬜

| Item | Zależność |
| --- | --- |
| League / fixtures SSOT | Hub SEASON + next Primary |
| GDD-16+ | Owner GO (docs) |
| Zawężenie LFE PUBLIC exports | chore |
| Transfer Market | GDD §12 |
| Economy | GDD §14 |
| Ratings v2 | bogatsze Player Match Data |

## FUTURE

| Item | Notatka |
| --- | --- |
| LFE Physics / full Rules | RESERVED / częściowe eventy |
| ECS storage | RESERVED |
| Replay persist / video export | poza MVP |
| Mobile native | poza scope |

---

## Decyzje roadmapy

- Design (GDD) prowadzi produkt; implementacja może mieć udokumentowane wyjątki (First Match przed Hubem).
- Hub = decyzja (§23), nie dashboard.
- UI/Canvas nie omija `MatchSession` / CommandBus.
- Replay nigdy nie odpala Engine.

## Powiązania

[`PROJECT_STATUS.md`](./PROJECT_STATUS.md) · [`AI/PROJECT_STATE.md`](./AI/PROJECT_STATE.md)

## Last updated

2026-07-24 — LFE-DOCS-01
