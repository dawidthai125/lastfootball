# Current Design — Last Football (summary)

## Cel dokumentu

Skrót **wypełnionego** designu bez kopiowania całego GDD. Szczegóły i brzmienie SSOT → `GAME_DESIGN_DOCUMENT.md`.

## Aktualny stan

GDD-14 CLOSED. §3–§15 oraz **§23 Hub** wypełnione. UI Guide istnieje. Pozostałe rozdziały = szkielet.

## Opis działania — wypełnione obszary

| Rozdział | Temat               | Stan                       |
| -------- | ------------------- | -------------------------- |
| §3       | Core loop           | Wypełniony                 |
| §4–§5    | Rejestracja / klub  | Wypełniony                 |
| §6       | Rozwój klubu        | Wypełniony (GDD-13)        |
| §7       | Rozwój graczy       | Wypełniony (DCC)           |
| §8       | Trening             | Wypełniony (DCC)           |
| §9       | Doświadczenie meczu | Wypełniony                 |
| §10      | Liga                | Wypełniony                 |
| §11      | Puchary             | Wypełniony                 |
| §12      | Transfery           | Wypełniony (DCC)           |
| §13      | Stadion             | Wypełniony                 |
| §14      | Finanse             | Wypełniony                 |
| §15      | Sponsorzy           | Wypełniony                 |
| §23      | Panel główny (Hub)  | **Wypełniony (GDD-14)**    |
| §24–§25  | UI (w Guide + GDD)  | Guide gotowy; §24 szkielet |
| §26+     | Liczby / balance    | Future                     |

### Sygnały produktowe (nie zastępują GDD)

- Mecz w centrum; 1 klub/account MVP.
- Hub-first: dokładnie 1 Primary CTA, max 5 Secondary; stany nowy klub / dzień meczowy / po meczu / idle.
- Liga: 12 klubów, 22 kolejki, awans/spadek bez playoffów MVP.
- Trening: odblokowanie po 2 zagranych meczach; 1 sesja/dzień.
- Transfery: Accept/Reject + max 1 kontroferta; skład 18–22.
- Finanse: 1 kasa + transfer envelope.
- Stadion: preset statyczny MVP.
- Rozwój klubu (§6): Poziom · Reputacja · Prestiż — Hub tylko konsumuje.

## Najważniejsze decyzje

Przy konflikcie agent ↔ pamięć czatu → **wygrywa GDD**.  
Metryki rozwoju klubu: **tylko §6**. Hub = **§23** (decyzja, nie dashboard).

## Powiązania

[GAME_DESIGN_DOCUMENT.md](./GAME_DESIGN_DOCUMENT.md) · [ROADMAP.md](./ROADMAP.md) · [UI_DESIGN_GUIDE.md](./UI_DESIGN_GUIDE.md)

## Last updated

2026-07-24 — GDD-14
