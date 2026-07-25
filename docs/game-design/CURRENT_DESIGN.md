# Current Design — Last Football (summary)

## Cel dokumentu

Skrót **wypełnionego** designu bez kopiowania całego GDD. Szczegóły i brzmienie SSOT → `GAME_DESIGN_DOCUMENT.md`.

## Aktualny stan

GDD-15 CLOSED. §3–§15, **§20 Zadania**, **§23 Hub**, **§26 liczby Thin (GDD-§26A)** wypełnione. UI Guide istnieje. Pozostałe rozdziały = szkielet. Sync kodu ze §26 = **GDD-§26B** (PLANNED).

## Opis działania — wypełnione obszary

| Rozdział | Temat               | Stan                                              |
| -------- | ------------------- | ------------------------------------------------- |
| §3       | Core loop           | Wypełniony                                        |
| §4–§5    | Rejestracja / klub  | Wypełniony                                        |
| §6       | Rozwój klubu        | Wypełniony (GDD-13)                               |
| §7       | Rozwój graczy       | Wypełniony (DCC)                                  |
| §8       | Trening             | Wypełniony (DCC)                                  |
| §9       | Doświadczenie meczu | Wypełniony                                        |
| §10      | Liga                | Wypełniony                                        |
| §11      | Puchary             | Wypełniony                                        |
| §12      | Transfery           | Wypełniony (DCC)                                  |
| §13      | Stadion             | Wypełniony                                        |
| §14      | Finanse             | Wypełniony (kategorie; kwoty → §26)               |
| §15      | Sponsorzy           | Wypełniony                                        |
| §20      | Zadania dzienne     | **Wypełniony (GDD-15)**                           |
| §23      | Panel główny (Hub)  | Wypełniony (GDD-14)                               |
| §24–§25  | UI (w Guide + GDD)  | Guide gotowy; §24 szkielet                        |
| §26      | Liczby / balance    | **Wypełniony Thin (GDD-§26A)** · sync kodu → §26B |
| §27+     | Premium / …         | Future / szkielet                                 |

### Sygnały produktowe (nie zastępują GDD)

- Mecz w centrum; 1 klub/account MVP.
- Hub = ekran decyzji: 1 Primary CTA, max 5 Secondary; stany sesyjne: dzień meczowy / po meczu / idle (GDD §23).
- **Implementacja live (LFE-MATCH-01):** First Match tunnel **przed** Hubem; Hub unlock = `first_match_completed_at`. Wariant GDD „nowy klub na Hubie przed meczem” jest pokryty tunelem, nie `/hub`.
- **Hub EARLY_CLUB (LFE-HUB-01):** decision layout; bez mid-season dashboard mock.
- Zadania (§20): opcjonalne; 1 cel dnia na Hubie; w dniu meczowym mecz > zadanie; soft FOMO; nagrody = kategorie.
- Liga: 12 klubów, 22 kolejki, awans/spadek bez playoffów MVP (design; live fixtures SSOT = planned).
- Trening: odblokowanie po 2 zagranych meczach; 1 sesja/dzień (soft-lock na Day 1).
- Transfery: Accept/Reject + max 1 kontroferta; skład 18–22 (soft-lock Day 1).
- Finanse: 1 kasa; live cash-only (D20); envelope = Future (§14 / poza Thin).
- §26A: SSOT liczb Thin (starter 100 000 · W/D/L 5k/2.5k/1k · EUR · fee derive); D18/D20 = SSOT implementacji.
- Stadion: preset statyczny MVP.
- Rozwój klubu (§6): Poziom · Reputacja · Prestiż — Hub tylko konsumuje.

## Najważniejsze decyzje

Przy konflikcie agent ↔ pamięć czatu → **wygrywa GDD**.  
§6 = metryki klubu · §20 = zadania · §23 = Hub · **§26 = liczby / balans**.

## Powiązania

[GAME_DESIGN_DOCUMENT.md](./GAME_DESIGN_DOCUMENT.md) · [ROADMAP.md](./ROADMAP.md) · [UI_DESIGN_GUIDE.md](./UI_DESIGN_GUIDE.md) · [`../platform/HUB.md`](../platform/HUB.md)

## Last updated

2026-07-25 — GDD-§26A CLOSE
