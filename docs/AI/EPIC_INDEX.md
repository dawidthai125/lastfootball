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

| Warstwa                 | Hash / EPIC                                   |
| ----------------------- | --------------------------------------------- |
| **Production Baseline** | **`54d0724`** — LFE-UI-IMPL-06 · UI P0 CLOSED |
| **Domain baseline**     | **`75c190d`** — LFE-BOARD-01 CLOSED           |
| **Presentation tip**    | **`9fd14fc`** — LFE-UI-MOTION-01 CLOSED       |
| **Documentation tip**   | **`b8519bf`** — LFE-BOARD-01 DOCS CLOSE (pin) |

Szczegóły: [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md) · handoff: [`PROJECT_HANDOFF.md`](./PROJECT_HANDOFF.md)

## Platform DONE (skrót)

| ID                                             | Temat                                                            |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| LFE-PLATFORM-01 · INFRA-01 · MATCH-01 · HUB-01 | Auth / klub / First Match / Hub                                  |
| LFE-LEAGUE-01…03                               | Fixtures · tabela · Thin 11 (pre-04)                             |
| **LFE-LEAGUE-04**                              | Full 22 · double RR · `9027baf` · D28                            |
| LFE-ECONOMY-01                                 | Cash Thin (D18)                                                  |
| LFE-PLAYERS-01 · **02**                        | Kadra `players` + Development Thin (D19/D22)                     |
| **LFE-ACADEMY-01**                             | Academy Thin A · Intake + Promote · D23 · `9c6fe86`              |
| **LFE-SCOUTING-01**                            | Scouting Information Thin · shortlist refs · `93fd6d5`           |
| **LFE-DAILY-01**                               | Daily Goal Thin · resolveClubDailyGoal derive · `73e1361`        |
| **LFE-ACHIEVEMENTS-01**                        | Achievements Information Thin · `3915be9` · D26                  |
| LFE-TRANSFERS-01 · E1 · N1 · 03…08             | Rynek → Live Instant → Pending → **1× Counter** (D20)            |
| **LFE-TRANSFERS-09**                           | Hardening TD-01/TD-02 · D38 · `e6885dc`                          |
| **LFE-MESSAGES-01**                            | Messages Thin · `resolveClubMessages` · D40–D46 · `800ed0d`      |
| **LFE-CLUB-01**                                | Club identity Thin · `resolveClubProfile` · D47–D51 · `36ba9be`  |
| **LFE-SOFTLOCK-01**                            | Route soft-lock gate · SoftLockState · D52 · D63–D67 · `46f7caa` |
| **GDD-SEASON-END-01**                          | Season End Thin kontrakt · D68–D77 · docs only                   |
| **LFE-SEASON-END-01**                          | Season End Thin lifecycle · D78–D87 · `024e827`                  |
| **GDD-PROMOTION-01**                           | Promotion Thin kontrakt · D88–D94 · docs                         |
| **LFE-PROMOTION-01**                           | Promotion Thin · `league_tier` · D88–D94 · `fa06c53`             |
| **GDD-SPONSORS-01**                            | Sponsors Thin kontrakt · D95–D101 · docs                         |
| **LFE-SPONSORS-01**                            | Sponsors Thin · ledger · H-SPONSORS · D95–D101 · `17eb8ba`       |
| **GDD-BOARD-01**                               | Board Thin kontrakt · D102–D108 · docs                           |
| **LFE-BOARD-01**                               | Board Information Thin · H-BOARD · D102–D108 · `75c190d`         |
| LFE-TRAINING-01 · 02                           | Trening Thin + Depth (skill · XI Gate) (D21)                     |
| GDD-§26A / §26B                                | SSOT liczb + sync kodu                                           |

## Engine / Match UI DONE

LFE EPIC-1…7 · Architecture Freeze · Gameplay · Match AI · Match Engine · Live Bridge · Canvas · Replay · Post Match · Ratings · **Match Path immersive (IMPL-02/06)**

## Design DONE

GDD-01…22 · §20 · §23 · §26 (liczby Thin) · World Art · Hi-Fi · Proto · Playtest

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
| **LFE-ACADEMY-01**        | Academy Thin A · Intake + Promote · D23 · `9c6fe86`                                                           |
| **LFE-SCOUTING-01**       | Scouting Information Thin · shortlist refs · `93fd6d5`                                                        |
| **GDD-16**                | Akademia Thin A (Intake + Promote) · docs `4805f7e`                                                           |
| **GDD-17**                | Skauting Information Thin B · docs `2595cc9`                                                                  |
| **GDD-18**                | Ranking Thin (sezonowy ranking klubów) · tip `4dedd71`                                                        |
| **GDD-19**                | Osiągnięcia Thin (kamienie / historia) · tip `2c619ca`                                                        |
| **GDD-21**                | Wiadomości Thin · content `bf07a44` · tip `c24efef`                                                           |
| **GDD-22**                | Powiadomienia Thin · content `09b85e7` · tip `f871ca8`                                                        |
| **M2.5**                  | First Domain Implementation Review · **PASS**                                                                 |
| **LFE-UI-MOTION-01**      | Presentation motion Thin · Hub/Match · Guide §8 · `9fd14fc`                                                   |
| **LFE-HANDOFF-01**        | Master handoff AI · docs sync                                                                                 |

**SSOT reguł prezentacji:** [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16.  
Impl notes: [`../implementation/`](../implementation/).  
Przy rozbieżności z postmortemem **wygrywa Guide**.

## PLANNED (Owner wybiera)

Pełna lista: [`../ROADMAP.md`](../ROADMAP.md) — **kolejka:** STADIUM (po Owner GO).

**TD-03+ (P2):** transfers actions / displayPos — [`../platform/TRANSFER_ARCHITECTURE.md`](../platform/TRANSFER_ARCHITECTURE.md).

## Naming

- Product: `LFE-*-01`, `LFE-TRANSFERS-0N`, `LFE-ACADEMY-*`, `LFE-SCOUTING-*`
- Docs: `AI-DOCS-*`, `GDD-§26A`, `LFE-DOCS-UX-*`, `LFE-DOCS-BASELINE-*`, `LFE-HANDOFF-*`, `LFE-UI-EVOLUTION-*`, `GDD-16`, `GDD-17`, `GDD-18`, `GDD-19`, `GDD-21`, `GDD-22`
- UI / marketing: `LFE-UI-IMPL-0N`, `LFE-CONTENT-PASS-*`, `LFE-LANDING-*`, `LFE-BRANDING-*`, `LFE-AUTH-UX-*`, `LFE-UI-MOTION-*`
- Engine: EPIC-1…7

## Status

**ACTIVE** · 2026-07-31 — LFE-BOARD-01 CLOSED · next Owner GO → LFE-STADIUM-01
