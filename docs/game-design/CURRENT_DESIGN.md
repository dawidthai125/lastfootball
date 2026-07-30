# Current Design — Last Football (summary)

## Cel dokumentu

Skrót **wypełnionego** designu bez kopiowania całego GDD. Szczegóły i brzmienie SSOT → `GAME_DESIGN_DOCUMENT.md`.

## Aktualny stan

GDD-15 CLOSED · GDD-16…19 Thin CLOSED · **GDD-21 Wiadomości Thin CLOSED** · **GDD-22 Powiadomienia Thin CLOSED**. §3–§22 (Thin; §24+ szkielet), **§20 Zadania**, **§23 Hub**, **§26 liczby Thin (GDD-§26A)** + **sync kodu (GDD-§26B)**. UI Guide + **Presentation Contract (Guide §16 — nie mylić z GDD §16)**. Następny: **LFE-SCOUTING-01 READY FOR AUDIT** (Owner GO). Pozostałe rozdziały = szkielet.

## Opis działania — wypełnione obszary

| Rozdział | Temat               | Stan                                                          |
| -------- | ------------------- | ------------------------------------------------------------- |
| §3       | Core loop           | Wypełniony                                                    |
| §4–§5    | Rejestracja / klub  | Wypełniony                                                    |
| §6       | Rozwój klubu        | Wypełniony (GDD-13)                                           |
| §7       | Rozwój graczy       | Wypełniony (DCC)                                              |
| §8       | Trening             | Wypełniony (DCC)                                              |
| §9       | Doświadczenie meczu | Wypełniony                                                    |
| §10      | Liga                | Wypełniony                                                    |
| §11      | Puchary             | Wypełniony                                                    |
| §12      | Transfery           | Wypełniony (DCC)                                              |
| §13      | Stadion             | Wypełniony                                                    |
| §14      | Finanse             | Wypełniony (kategorie; kwoty → §26)                           |
| §15      | Sponsorzy           | Wypełniony                                                    |
| §16      | Akademia            | Wypełniony Thin A (GDD-16) — Intake + Promote                 |
| §17      | Skauting            | Wypełniony Information Thin B (GDD-17) — system informacji    |
| **§18**  | **Ranking**         | **Wypełniony Thin (GDD-18)** — sezonowy ranking klubów        |
| **§19**  | **Osiągnięcia**     | **Wypełniony Thin (GDD-19)** — kamienie / historia            |
| **§21**  | **Wiadomości**      | **Wypełniony Thin (GDD-21)** — inbox · skutek zdarzenia       |
| **§22**  | **Powiadomienia**   | **Wypełniony Thin (GDD-22)** — polityka alertów · zaproszenie |
| §20      | Zadania dzienne     | **Wypełniony (GDD-15)**                                       |
| §23      | Panel główny (Hub)  | Wypełniony (GDD-14)                                           |
| §24–§25  | UI (w Guide + GDD)  | Guide + **Presentation Contract**; §24 szkielet               |
| §26      | Liczby / balance    | **Wypełniony Thin (GDD-§26A)** · kod sync **§26B CLOSED**     |
| §27+     | Premium / …         | Future / szkielet                                             |

### Sygnały produktowe (nie zastępują GDD)

- Mecz w centrum; 1 klub/account MVP.
- Hub = ekran decyzji: 1 Primary CTA, max 5 Secondary; stany sesyjne: dzień meczowy / po meczu / idle (GDD §23).
- **Implementacja live (LFE-MATCH-01):** First Match tunnel **przed** Hubem; Hub unlock = `first_match_completed_at`. Wariant GDD „nowy klub na Hubie przed meczem” jest pokryty tunelem, nie `/hub`.
- **Hub EARLY_CLUB (LFE-HUB-01):** decision layout; bez mid-season dashboard mock.
- **UI Evolution 01–02:** decision-first (Hero → Decision → Context); Hub Secondary = daily loop (Trening · Kadra · Transfery · Finanse · Terminarz); **Kadra** = `/squad` („Skład” = XI); Mobile Variant A. Szczegóły → [`UI_DESIGN_GUIDE.md`](./UI_DESIGN_GUIDE.md) §16; historia → [`LFE-UX-POSTMORTEM-01.md`](./LFE-UX-POSTMORTEM-01.md) (REFERENCE).
- Zadania (§20): opcjonalne; 1 cel dnia na Hubie; w dniu meczowym mecz > zadanie; soft FOMO; nagrody = kategorie.
- Liga: 12 klubów, 22 kolejki, awans/spadek bez playoffów MVP (design; live fixtures SSOT = planned).
- Trening: odblokowanie po 2 zagranych meczach; 1 sesja/dzień (soft-lock na Day 1).
- Transfery: Accept/Reject + max 1 kontroferta; skład 18–22 (soft-lock Day 1).
- Finanse: 1 kasa; live cash-only (D20); envelope = Future (§14 / poza Thin).
- §26A: SSOT liczb Thin (starter 100 000 · W/D/L 5k/2.5k/1k · EUR · fee derive); D18/D20 = SSOT implementacji.
- Stadion: preset statyczny MVP.
- Rozwój klubu (§6): Poziom · Reputacja · Prestiż — Hub tylko konsumuje.
- Rozwój zawodników: potential pasma · Match PRIMARY · Training SUPPORTING (D22 / PLAYERS-02).
- **Akademia (GDD §16 Thin A):** opcjonalna; Intake + Promote; brak poziomów; brak academy OVR; po promocji ten sam rozwój co senior; placeholder `/academy` ≠ SSOT; kod akademii = Future EPIC.
- **Skauting (GDD §17 Information Thin B):** wyłącznie system informacji; shortlista prywatna (zero wpływu na rynek/transfer/zawodnika); raport pomaga, nie decyduje; brak fog/regionów/misji/kosztów w Thin; D19/D22/D20 bez zmian; placeholder `/scouting` ≠ SSOT; kod skautingu = Future EPIC.
- **Ranking (GDD §18 Thin):** sezonowy ranking **klubów** only; konsumuje sygnały §6 — nie redefiniuje Poziomu/Reputacji/Prestiżu; **≠** tabela ligowa (§10); **≠** shortlista (§17); **≠** osiągnięcia (§19); brak liczb/ELO/algorytmów; placeholder `/rankings` ≠ SSOT; kod rankingu = Future EPIC.
- **Osiągnięcia (GDD §19 Thin):** wyrażają kamienie / historię; **≠** §6 metryki; **≠** ranking §18; §20 może hookować, nie jest katalogiem; kategorie only — bez XP/progów/ID; placeholder `/achievements` ≠ SSOT; kod achievementów = Future EPIC.
- **Wiadomości (GDD §21 Thin):** in-app inbox; wiadomość = skutek zdarzenia domenowego (nigdy przyczyna); Transfery = SSOT ofert; CTA → istniejące ekrany; **≠** powiadomienie §22; placeholder `/messages` ≠ SSOT; kod inboxu = Future EPIC.
- **Powiadomienia (GDD §22 Thin):** polityka soft remindów; **zaproszenie ≠ wymuszenie**; opt-out ≠ utrata informacji (Hub / Inbox / domena); Soft FOMO · opt-in · dedup; **≠** wiadomość §21; push/email/SDK/quiet hours/kod = Future; Overlay notifications ≠ SSOT.

## Najważniejsze decyzje

Przy konflikcie agent ↔ pamięć czatu → **wygrywa GDD**.  
§6 = metryki klubu · §18 = ranking klubów · §19 = osiągnięcia (historia) · §21 = wiadomości (skutek) · §22 = powiadomienia (zaproszenie) · §20 = zadania · §23 = Hub · **§26 = liczby / balans**.

## Powiązania

[GAME_DESIGN_DOCUMENT.md](./GAME_DESIGN_DOCUMENT.md) · [ROADMAP.md](./ROADMAP.md) · [UI_DESIGN_GUIDE.md](./UI_DESIGN_GUIDE.md) (Guide Presentation Contract) · [LFE-UX-POSTMORTEM-01.md](./LFE-UX-POSTMORTEM-01.md) · [`../platform/HUB.md`](../platform/HUB.md)

## Last updated

2026-07-30 — GDD-22 Powiadomienia Thin CLOSED · content `09b85e7` · tip _(CLOSE)_
