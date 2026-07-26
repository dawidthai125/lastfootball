# AI — EPIC Index

## Cel

Szybki indeks zamkniętych i planowanych EPIC-ów bez kopiowania pełnego ROADMAP.

## Kiedy czytać

Gdy potrzebujesz „co już zamknięto” / „jakie ID EPIC istnieją” — przed AUDIT nowego EPIC-u.

## Powiązane

| Dokument                                       | Rola                                   |
| ---------------------------------------------- | -------------------------------------- |
| [`../ROADMAP.md`](../ROADMAP.md)               | **SSOT** listy DONE / PLANNED / FUTURE |
| [`../CHANGELOG.md`](../CHANGELOG.md)           | historia CLOSE                         |
| [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md) | hash feature baseline                  |

## Feature baseline

**`9b1c575`** — LFE-TRANSFERS-08 CLOSED · szczegóły: [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md)

## Platform DONE (skrót)

| ID                                             | Temat                                                 |
| ---------------------------------------------- | ----------------------------------------------------- |
| LFE-PLATFORM-01 · INFRA-01 · MATCH-01 · HUB-01 | Auth / klub / First Match / Hub                       |
| LFE-LEAGUE-01…03                               | Fixtures · tabela · 11 meczów                         |
| LFE-ECONOMY-01                                 | Cash Thin (D18)                                       |
| LFE-PLAYERS-01                                 | Kadra `players` (D19)                                 |
| LFE-TRANSFERS-01 · E1 · N1 · 03…08             | Rynek → Live Instant → Pending → **1× Counter** (D20) |
| LFE-TRAINING-01                                | Trening Thin (D21)                                    |
| GDD-§26A / §26B                                | SSOT liczb + sync kodu                                |

## Engine / Match UI DONE

LFE EPIC-1…7 · Architecture Freeze · Gameplay · Match AI · Match Engine · Live Bridge · Canvas · Replay · Post Match · Ratings

## Design DONE

GDD-01…15 · §20 · §23 · §26 (liczby Thin)

## UI / Docs UX DONE

| ID | Temat |
| -- | ----- |
| LFE-UI-EVOLUTION-01 (A–H) | Decision-first Hub · Shell · Transfers · Kick-Off · Training · Squad · Finance |
| LFE-UI-EVOLUTION-02 | Daily manager loop · Kadra SSOT · Mobile Variant A |
| LFE-UX-POSTMORTEM-01 | Historia (**REFERENCE**) — [`../game-design/LFE-UX-POSTMORTEM-01.md`](../game-design/LFE-UX-POSTMORTEM-01.md) |
| LFE-DOCS-UX-03 | Presentation Contract w Guide §16 · Patterns · HUB sync |

**SSOT reguł prezentacji:** [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16.  
Przy rozbieżności z postmortemem **wygrywa Guide**.

## PLANNED (Owner wybiera)

Pełna lista: [`../ROADMAP.md`](../ROADMAP.md) — m.in. GDD-16+, Training depth, full 22 fixtures, LFE PUBLIC trim.

**Kandydat hardening (nie w ROADMAP jako EPIC):** transfers SQL↔TS fee parity / single live RPC invoke — patrz [`../platform/TRANSFER_ARCHITECTURE.md`](../platform/TRANSFER_ARCHITECTURE.md).

## Naming

- Product: `LFE-*-01`, `LFE-TRANSFERS-0N`
- Docs: `AI-DOCS-*`, `GDD-§26A`, `LFE-DOCS-UX-*`, `LFE-UI-EVOLUTION-*`
- Engine: EPIC-1…7

## Status

**ACTIVE** · 2026-07-26 — LFE-DOCS-UX-03
