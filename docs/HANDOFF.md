# HANDOFF — Last Football

## Cel dokumentu

**Przekazanie kontekstu** nowemu ChatGPT / Cursor bez historii starego czatu.

Przeczytaj ten plik pierwszy.

## Stan projektu

| Tor                      | Stan                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------- |
| **LFE**                  | EPIC-1…7 DONE · Architecture Freeze APPROVED · na `main` · wersja pakietu `0.7.0-epic7` |
| **GDD**                  | GDD-01…12 CLOSED · §3–5, §7–15 filled · **§6 skeleton**                                 |
| **App**                  | Next shell + `/status` · brak Live match UI                                             |
| **Release**              | Commity A–G spushowane na `origin/main`                                                 |
| **Working mode default** | Czekaj na **Owner GO** przed GDD-13 / Physics / nowym EPIC                              |

## Najważniejsze dokumenty

| Priorytet | Dokument                                                                       |
| --------- | ------------------------------------------------------------------------------ |
| 1         | Ten plik (`HANDOFF.md`)                                                        |
| 2         | [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)                                     |
| 3         | [`DECISIONS.md`](./DECISIONS.md)                                               |
| 4         | [`lfe/LFE_ARCHITECTURE_FREEZE.md`](./lfe/LFE_ARCHITECTURE_FREEZE.md)           |
| 5         | [`game-design/GAME_DESIGN_DOCUMENT.md`](./game-design/GAME_DESIGN_DOCUMENT.md) |
| 6         | [`ARCHITECTURE.md`](./ARCHITECTURE.md)                                         |
| 7         | [`WORKFLOW.md`](./WORKFLOW.md)                                                 |

Indeks: [`README.md`](./README.md)

## Kolejność czytania (nowy agent)

1. `HANDOFF.md` (tu)
2. `PROJECT_STATUS.md` + `ROADMAP.md`
3. `DECISIONS.md`
4. Jeśli zadanie = **silnik** → `lfe/README.md` → freeze → `PUBLIC_API.md` → `CURRENT_STATUS.md`
5. Jeśli zadanie = **produkt/GDD** → `game-design/README.md` → `CURRENT_DESIGN.md` → GDD
6. Jeśli zadanie = **app/UI** → `ARCHITECTURE.md` + UI Guide + freeze (jak konsumować sesję)
7. Przed commitem → `RELEASE_PROCESS.md`

## Najbliższy cel (rekomendacja)

**GDD-13 — §6 Rozwój klubu** (docs-only), po Owner GO.

Alternatywy (tylko z GO): zawężenie LFE PUBLIC exports · Match UI · LFE Physics.

## Otwarte EPIC / etapy

| ID          | Opis                        | Status             |
| ----------- | --------------------------- | ------------------ |
| GDD-13      | §6 Rozwój klubu             | Planned — czeka GO |
| LFE Physics | Ball / movement             | Future — RESERVED  |
| LFE AI      | Tactics                     | Future             |
| LFE Rules   | Fouls/restarts              | Future             |
| Packaging   | `index.ts` → freeze surface | Planned chore      |
| Match UI    | Pre/Live/Report             | Planned            |

## Ryzyka

| Ryzyko                                             | Mitigacja                                         |
| -------------------------------------------------- | ------------------------------------------------- |
| Agent używa over-exportów `index.ts` jako „PUBLIC” | Trzymaj się freeze / `PUBLIC_API.md`              |
| Start Physics bez designu                          | Owner GO + GDD §9 alignment                       |
| Łamanie granic lfe↔web↔supabase                    | `DEPENDENCIES.md` + DECISIONS                     |
| Kontynuacja „z pamięci czatu” zamiast docs         | Ten HANDOFF + SSOT                                |
| Push na `main` omijający PR/CI                     | Świadomy Owner; preferuj PR gdy protection wymaga |

## Następny krok

1. Owner wybiera tor (GDD-13 / chore API / UI / Physics).
2. Agent robi AUDIT lub DESIGN plan.
3. STOP — czekaj na GO przed implementacją.
4. Aktualizuj `PROJECT_STATUS.md` po zakończeniu etapu.

## Zasady twarde

- Nie implementuj gameplay bez GO.
- Nie łam Architecture Freeze bez AUDIT.
- Nie commituj / nie pushuj bez prośby Ownera.
- GDD docs-only w trybie design.

## Last updated

2026-07-23
