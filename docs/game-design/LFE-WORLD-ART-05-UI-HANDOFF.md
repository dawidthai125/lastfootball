# LFE-WORLD-ART-05 — UI HANDOFF

**EPIC:** LFE-WORLD-ART-05  
**Odbiorca:** zespół UI / Design System / Frontend  
**Data:** 2026-07-28  
**Stan programu WORLD ART:** **CLOSED**

> CLOSE: [`LFE-WORLD-ART-05-CLOSE-REPORT.md`](./LFE-WORLD-ART-05-CLOSE-REPORT.md)  
> Rejestr: [`LFE-WORLD-ART-05-ASSET-REGISTRY.md`](./LFE-WORLD-ART-05-ASSET-REGISTRY.md)  
> Style Lock: [`LFE-WORLD-ART-03R-STYLE-LOCK-CERTIFICATE.md`](./LFE-WORLD-ART-03R-STYLE-LOCK-CERTIFICATE.md)  
> Visual DNA: [`LFE-WORLD-ART-03-VISUAL-DNA.md`](./LFE-WORLD-ART-03-VISUAL-DNA.md)  
> Quality: [`LFE-WORLD-ART-04-QUALITY-PROCESS.md`](./LFE-WORLD-ART-04-QUALITY-PROCESS.md)

**Ten dokument nie jest implementacją UI.** Nie zawiera React, CSS ani komponentów.

---

## 0. Cel handoffu

Przekazać **zamkniętą bibliotekę świata** Night Pitch Office do skórowania UI zgodnie z Presentation Guide, **bez zmiany kierunku artystycznego**.

---

## 1. Ścieżki SSOT (obowiązkowe)

| Rola                       | Ścieżka                                                                        |
| -------------------------- | ------------------------------------------------------------------------------ |
| Volume APPROVED            | `docs/verification/lfe-world-art-04/`                                          |
| Foundation Board v02       | `docs/verification/lfe-world-art-03r/` (REF-01…16)                             |
| Rejestr ID                 | [`LFE-WORLD-ART-05-ASSET-REGISTRY.md`](./LFE-WORLD-ART-05-ASSET-REGISTRY.md)   |
| Visual DNA (10 reguł)      | [`LFE-WORLD-ART-03-VISUAL-DNA.md`](./LFE-WORLD-ART-03-VISUAL-DNA.md)           |
| Art Bible                  | [`LFE-CONCEPT-ART-01-ART-BIBLE.md`](./LFE-CONCEPT-ART-01-ART-BIBLE.md)         |
| Asset Library (katalog ID) | [`LFE-CONCEPT-ART-01-ASSET-LIBRARY.md`](./LFE-CONCEPT-ART-01-ASSET-LIBRARY.md) |
| Most do DS/UI              | [`LFE-ART-DIRECTION-01-AUDIT.md`](./LFE-ART-DIRECTION-01-AUDIT.md)             |
| Kontrakt UI                | Presentation Guide §16 (istniejący kontrakt produktu)                          |

---

## 2. Czego wolno używać

- Wszystkich assetów ze statusem **PASS** lub **PASS SOFT** z rejestru (165).
- Foundation refs REF-01…16 jako **wzorzec stylu / temperatury / materiału** (nie jako „dowolny stock”).
- Hero / BG / props / icons / moments zgodnie z lokacją ekranu (np. Gabinet → HERO-001 / BG-002).
- Grain / flood / turf / brass textures z Wave 0 jako warstwy wspólne.
- Ikon Wave 2 + depth (brass outline · void) jako język ikon produktu.
- Soft-lock / empty spots (ILL-_, EMP-_) do stanów bez treści.
- Marketing key art **tylko** w kontekstach marketing / store / season — nie jako panel UI.

---

## 3. Czego nie wolno zmieniać

| Zakaz                                                                                  | Uzasadnienie              |
| -------------------------------------------------------------------------------------- | ------------------------- |
| Kierunek **Night Pitch Office**                                                        | Style Lock ACTIVE         |
| Visual DNA Z1…Z10                                                                      | DNA LOCKED                |
| Foundation Board v02                                                                   | Jedyny board obowiązujący |
| Photoreal / photo stock / 3D viz drift                                                 | Hard FAIL historyczny     |
| Purple / cyan cyber / rainbow SaaS                                                     | DNA Z8                    |
| Twarze rozpoznawalne / real club IP                                                    | Art Bible                 |
| Przepisywanie ikon na Material/Fluent „default”                                        | Spójność W2–W5            |
| Generowanie ad-hoc grafik „pod ekran” bez procedury                                    | Omija gate                |
| Traktowanie PASS SOFT jako FAIL do „przeróbki stylu”                                   | SOFT = zatwierdzone       |
| Mieszanie board `03r` z volume `04` jako jednego katalogu eksportu bez świadomości ról | Board ≠ volume            |

---

## 4. Zasady Style Lock (dla UI)

1. **Certificate ACTIVE** — każda decyzja wizualna musi być zgodna z board v02 + DNA.
2. **Brak nowego kierunku „po cichu”** — zmiana kierunku = nowy EPIC + Owner GO (nie ticket UI).
3. **Consistency Gate** — nowy ekran / skórka porównywany z Contact Sheet Wave 0–5 i peerami lokacji.
4. **Zero Photoreal Drift** — tła i ilustracje pozostają semi-flat sport editorial.
5. **Paleta:** void/navy · brass gold · pitch emerald · warm flood + cool night · scarlet **tylko** jako rare (Live).
6. **Atmosfera BG ≤ ~10% uwagi** — miejsce na treść UI (DNA Z1 / Z7).
7. **Clubtint ≤ 1** na kompozycję (DNA Z8/Z9).

Pełna treść: certificate + Visual DNA.

---

## 5. Foundation Reference Board — obowiązek

Przed skórowaniem lokacji UI:

1. Otwórz wskazany REF z rejestru / Asset Library (np. Office → REF-02).
2. Porównaj temperaturę światła, materiał, crop, semi-flat.
3. Nie zastępuj REF losowym assetem z innej lokacji „bo ładniejszy”.
4. Board v02 jest **nadrzędny** wobec gustu implementacji.

| Lokacja UI (przykład) | Kotwice volume                   | REF board            |
| --------------------- | -------------------------------- | -------------------- |
| Hub / Gabinet         | HERO-001 · BG-002 · OFF-*        | REF-02               |
| Match / Pitch         | HERO-003 · BG-003/004 · MOM-*    | REF-13 · 05          |
| Tunel / Kick-off      | HERO-002 · LOD-002 · MOM-003/004 | REF-06               |
| Kadra                 | HERO-004 · SHT-*                 | REF-16               |
| Transfery             | HERO-005 · TRN-*                 | REF-02 dialect       |
| Trening               | HERO-006 · TRG-*                 | REF-05·13            |
| Stadion               | HERO-008 · STAD-*                | REF-03               |
| Finanse               | HERO-007 · FIN-*                 | REF-02               |
| Zarząd                | HERO-009 · BG-012                | — (office dialect)   |
| Medyczne              | HERO-013 · MED-*                 | cool clinical DNA    |
| Akademia              | HERO-012                         | day-for-club wyjątek |
| Kibice / gol          | SUP-* · MOM-002 · SCF-*          | REF-03·16            |

---

## 6. Procedura zgłaszania nowych assetów

**WORLD ART jest CLOSED.** Nowe assety ≠ „dokładka do 04”.

```
1. Potrzeba UI (brak ID w rejestrze / deferred)
2. Ticket z: ID docelowe (Asset Library) · lokacja · REF · DNA · priorytet · mock ekranu
3. Owner GO na nowy EPIC artystyczny (nie silent generate)
4. Produkcja wg LFE-WORLD-ART-04-QUALITY-PROCESS
5. Gate vs Style Lock + Board v02 + DNA
6. Dopiero APPROVED → dopisanie do rejestru (nowa wersja rejestru / EPIC)
7. UI konsumuje dopiero po APPROVED
```

**Zakaz:** generowanie obrazów w branchu UI „żeby domknąć ekran”.

**Deferred już znane** (nie są luką CLOSE): BRD-004/005, ICO-008/011, CRS-005, flavor HERO-016…018, MOM-005/006 — lista w rejestrze §8.

---

## 7. Mapowanie ról assetów w UI

| Typ               | Użycie UI                         | Nie używać jako     |
| ----------------- | --------------------------------- | ------------------- |
| Hero 16:9         | Cover lokacji / loading immersive | Ikona nav           |
| Hero 9:16         | Mobile cover                      | Desktop panel pełny |
| Background        | Warstwa ≤10% pod treścią          | Jedyny komunikat    |
| Prop / Spot       | Empty / soft-lock / ornament      | Tekst UI            |
| Icon              | Nav / badge / form                | Hero tło            |
| Moment            | Match feedback / transition       | Hub idle default    |
| Marketing         | Store / season / promo            | Formularz / tabela  |
| Texture / Pattern | Overlay / tile                    | Samodzielny ekran   |

---

## 8. Checklist startu skórki UI

- [ ] Przeczytany Style Lock Certificate (ACTIVE)
- [ ] Przeczytane Visual DNA (10 reguł)
- [ ] Otworzony board v02 (`03r/`)
- [ ] Skopiowany / podpięty volume `04/` wg rejestru
- [ ] Presentation Guide §16 respektowany
- [ ] Brak nowych assetów bez procedury §6
- [ ] Brak purple / photoreal w mockach

---

## 9. Kontakt / eskalacja

| Temat                      | Eskalacja                              |
| -------------------------- | -------------------------------------- |
| Konflikt UI vs DNA         | Art Director / Owner — nie „fix w CSS” |
| Brak assetu                | Procedura §6                           |
| Podejrzenie regresji stylu | Gate vs Contact Sheet 04A…04F          |

---

## Historia

| Wersja | Data       | Opis                          |
| ------ | ---------- | ----------------------------- |
| 1.0.0  | 2026-07-28 | UI Handoff · WORLD ART CLOSED |
