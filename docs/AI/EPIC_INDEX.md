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

| Warstwa                 | Hash / EPIC                                               |
| ----------------------- | --------------------------------------------------------- |
| **Production Baseline** | **`54d0724`** — LFE-UI-IMPL-06 · UI P0 CLOSED             |
| **Domain baseline**     | **`cd222ba`** — LFE-PLAYERS-02 CLOSED                     |
| **Presentation tip**    | **`9fd14fc`** — LFE-UI-MOTION-01 CLOSED                   |
| **Documentation tip**   | **`4dedd71`** — GDD-18 Ranking Thin CLOSED                |

Szczegóły: [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md) · handoff: [`PROJECT_HANDOFF.md`](./PROJECT_HANDOFF.md)

## Platform DONE (skrót)

| ID                                             | Temat                                                 |
| ---------------------------------------------- | ----------------------------------------------------- |
| LFE-PLATFORM-01 · INFRA-01 · MATCH-01 · HUB-01 | Auth / klub / First Match / Hub                       |
| LFE-LEAGUE-01…03                               | Fixtures · tabela · 11 meczów                         |
| LFE-ECONOMY-01                                 | Cash Thin (D18)                                       |
| LFE-PLAYERS-01 · **02**                        | Kadra `players` + Development Thin (D19/D22)          |
| LFE-TRANSFERS-01 · E1 · N1 · 03…08             | Rynek → Live Instant → Pending → **1× Counter** (D20) |
| LFE-TRAINING-01 · 02                           | Trening Thin + Depth (skill · XI Gate) (D21)          |
| GDD-§26A / §26B                                | SSOT liczb + sync kodu                                |

## Engine / Match UI DONE

LFE EPIC-1…7 · Architecture Freeze · Gameplay · Match AI · Match Engine · Live Bridge · Canvas · Replay · Post Match · Ratings · **Match Path immersive (IMPL-02/06)**

## Design DONE

GDD-01…18 · §20 · §23 · §26 (liczby Thin) · World Art · Hi-Fi · Proto · Playtest

## UI / Docs UX DONE

| ID                        | Temat                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| LFE-UI-EVOLUTION-01 (A–H) | Decision-first Hub · Shell · Transfers · Kick-Off · Training · Squad · Finance                                |
| LFE-UI-EVOLUTION-02       | Daily manager loop · Kadra SSOT · Mobile Variant A                                                            |
| LFE-UX-POSTMORTEM-01      | Historia (**REFERENCE**) — [`../game-design/LFE-UX-POSTMORTEM-01.md`](../game-design/LFE-UX-POSTMORTEM-01.md) |
| LFE-DOCS-UX-03            | Presentation Contract w Guide §16 · Patterns · HUB sync                                                       |
| LFE-DOCS-SYNC-01          | Design SSOT + world-art verification w repo                                                                   |
| **LFE-UI-IMPL-01…06**     | **Night Pitch Office UI P0** · Shell→Hub→Match→Domains→XI→Content→Hub UX→Live/Post                            |
| LFE-UI-IMPL-06A           | Desktop Hub layout · nav tooltips                                                                             |
| LFE-CONTENT-PASS-01       | `UI_COPY` microcopy                                                                                           |
| LFE-DOCS-BASELINE-01      | Project baseline sync po UI P0                                                                                |
| **LFE-LANDING-01**        | Marketing Landing · Tunnel hero                                                                               |
| **LFE-BRANDING-01B**      | Logo K1+K3 · favicons · OG                                                                                    |
| **LFE-AUTH-UX-01**        | Login Modal · AuthStage login/register                                                                        |
| **LFE-TRAINING-02**       | Training Depth · skill + XI Gate · RPC · `5e6c2ad`                                                            |
| **LFE-PLAYERS-02**        | Player Development Thin · potential + match growth · D22 · `cd222ba`                                          |
| **GDD-16**                | Akademia Thin A (Intake + Promote) · docs `4805f7e`                                                           |
| **GDD-17**                | Skauting Information Thin B · docs `2595cc9`                                                                  |
| **GDD-18**                | Ranking Thin (sezonowy ranking klubów) · tip `4dedd71`                                                        |
| **LFE-UI-MOTION-01**      | Presentation motion Thin · Hub/Match · Guide §8 · `9fd14fc`                                                   |
| **LFE-HANDOFF-01**        | Master handoff AI · docs sync                                                                                 |

**SSOT reguł prezentacji:** [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16.  
Impl notes: [`../implementation/`](../implementation/).  
Przy rozbieżności z postmortemem **wygrywa Guide**.

## PLANNED (Owner wybiera)

Pełna lista: [`../ROADMAP.md`](../ROADMAP.md) — **rekomendacja:** **GDD-19** (§19) **READY FOR AUDIT** · full 22 fixtures.

**Kandydat hardening (nie w ROADMAP jako EPIC):** transfers SQL↔TS fee parity / single live RPC invoke — patrz [`../platform/TRANSFER_ARCHITECTURE.md`](../platform/TRANSFER_ARCHITECTURE.md).

## Naming

- Product: `LFE-*-01`, `LFE-TRANSFERS-0N`
- Docs: `AI-DOCS-*`, `GDD-§26A`, `LFE-DOCS-UX-*`, `LFE-DOCS-BASELINE-*`, `LFE-HANDOFF-*`, `LFE-UI-EVOLUTION-*`, `GDD-16`, `GDD-17`, `GDD-18`
- UI / marketing: `LFE-UI-IMPL-0N`, `LFE-CONTENT-PASS-*`, `LFE-LANDING-*`, `LFE-BRANDING-*`, `LFE-AUTH-UX-*`, `LFE-UI-MOTION-*`
- Engine: EPIC-1…7

## Status

**ACTIVE** · 2026-07-30 — GDD-18
