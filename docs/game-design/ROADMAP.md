# Game Design Roadmap

## Cel dokumentu

Plan etapów GDD (Faza 2+).

## Aktualny stan

GDD-01…15 + **GDD-16…19 · GDD-21 · GDD-22 Thin CLOSED** + **GDD-§26A** + **GDD-§26B**. §3–§22 (Thin) + §20 + §23 + **§26**. **LFE-SCOUTING-01 · LFE-DAILY-01 · LFE-ACHIEVEMENTS-01 · LFE-LEAGUE-04 CLOSED**. Następny = **Transfers hardening READY FOR AUDIT** (Owner GO).

## Completed

| Stage      | Zakres                                                                      |
| ---------- | --------------------------------------------------------------------------- |
| GDD-01     | Struktura dokumentu                                                         |
| GDD-02     | §3 Core loop                                                                |
| GDD-03     | §4–§5 Registration / club                                                   |
| GDD-04     | §9 Match experience                                                         |
| GDD-05     | §10 League                                                                  |
| GDD-06     | §7 Players (+ DCC)                                                          |
| GDD-07     | §8 Training (+ DCC)                                                         |
| GDD-08     | §11 Cups                                                                    |
| GDD-09     | §12 Transfers (+ DCC)                                                       |
| GDD-10     | §14 Finances                                                                |
| GDD-11     | §15 Sponsors                                                                |
| GDD-12     | §13 Stadium                                                                 |
| GDD-13     | §6 Club development                                                         |
| GDD-14     | §23 Hub / main panel                                                        |
| GDD-15     | §20 Daily tasks                                                             |
| GDD-16     | §16 Akademia Thin A (Intake + Promote) · CLOSED                             |
| GDD-17     | §17 Skauting Information Thin B (system informacji) · CLOSED                |
| **GDD-18** | **§18 Ranking Thin** (sezonowy ranking klubów) · **CLOSED** · tip `4dedd71` |
| **GDD-19** | **§19 Osiągnięcia Thin** (kamienie / historia) · **CLOSED** · tip `2c619ca` |
| **GDD-21** | **§21 Wiadomości Thin** · **CLOSED** · tip `c24efef` · content `bf07a44`    |
| **GDD-22** | **§22 Powiadomienia Thin** · **CLOSED** · content `09b85e7` · tip `f871ca8` |
| GDD-§26A   | §26 Economy numbers Thin (docs SSOT) · CLOSED                               |
| GDD-§26B   | §26 Code sync (`ECONOMY_THIN`) · CLOSED                                     |

## In Progress

| Stage | Status                            |
| ----- | --------------------------------- |
| —     | Brak aktywnego etapu bez Owner GO |

## Planned

| Stage           | Zakres                                          |
| --------------- | ----------------------------------------------- |
| LFE-SCOUTING-01 | Kod skautingu — **CLOSED** (`93fd6d5`)          |
| LFE-DAILY-01    | Daily loop — **READY FOR AUDIT** (Owner GO)     |
| GDD-17+ / §24+  | Pozostałe szkielety / kanał push Future (Owner) |

## Future

- Pełne UI specs ekranów (§24)
- Sezon 2+ content
- Esport / multiplayer design (jeśli w ogóle)
- Infrastruktura / rozbudowa stadionu (poza MVP; kotwica §6 / §13)
- Hub: personalizacja / konfigurowalne widgety (poza MVP; kotwica §23)
- Zadania: advanced streaks / Quest Log / social (poza MVP; kotwica §20)
- Ranking: all-time / gracze / global (poza Thin; kotwica §18)
- Osiągnięcia: katalog contentu / UI muzeum / kod (poza Thin; kotwica §19)

## Najważniejsze decyzje

- Jeden etap naraz; STOP po raporcie.
- FINALIZE = QA only; DCC = fix niespójności.
- §6 = metryki klubu · §18 = sezonowy ranking klubów (konsumpcja) · §19 = osiągnięcia (historia) · §21 = wiadomości (skutek) · §22 = powiadomienia (zaproszenie) · §20 = zadania · §23 = Hub · §26 = liczby / balans.
- §26 = SSOT liczb; D18/D20 = SSOT implementacji.

## Powiązania

[README.md](./README.md) · [CURRENT_DESIGN.md](./CURRENT_DESIGN.md) · [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md)

## Last updated

2026-07-30 — LFE-LEAGUE-04 CLOSED · Domain `9027baf` · next Transfers hardening READY FOR AUDIT
