# LFE-CONTENT-PASS-01 — PLAN

**EPIC:** LFE-CONTENT-PASS-01  
**Data:** 2026-07-29  
**Wejście:** IMPL-05 PASS (`47340fe`)

---

## 0. Cel

Jednolita terminologia i mikrocopy P0 bez zmiany DNA / IA / flow / logiki.

SSOT: `UI_DESIGN_GUIDE` §12 · §16.6 (Kadra ≠ Skład).

---

## 1. Słownik (obowiązujący)

| Termin    | Użycie                         | Zakaz                        |
| --------- | ------------------------------ | ---------------------------- |
| **Kadra** | `/squad`, Nav, „Zobacz kadrę”  | „Zobacz skład” → `/squad`    |
| **Skład** | XI / pre-match „Ustaw skład”   | synonim Kadry                |
| **Hub**   | exit „Wróć do Hub”             | „Hubu” w CTA                 |
| Soft-lock | „niedostępne” · „wkrótce”      | „Odblokuj” · żargon resolver |
| Mecz CTA  | „Zagraj mecz” / „Idź do meczu” | mieszanka „Start meczu”      |
| Błędy     | co + jak naprawić, PL          | Thin/Seed/DTO/resolve*       |
| Loading   | „Ładowanie {domena}…”          | angielskie Loading           |

---

## 2. Zakres zmian

1. Hub exit / enter (Hub vs Hubu)
2. Soft-lock copy (Nav · Transfers · Training) — bez żargonu
3. Pre-match Primary „Zagraj mecz”
4. Confirm / pending / empty residual
5. Moduł `lib/ui/copy.ts` jako SSOT fraz wspólnych

---

## 3. DoD

- [x] Słownik stosowany w P0
- [x] Brak żargonu inżynierskiego w UI
- [x] Kadra ≠ Skład
- [x] CI GREEN

---

## Historia

| Wersja | Data       | Opis                      |
| ------ | ---------- | ------------------------- |
| 0.1.0  | 2026-07-29 | Plan Content Pass         |
| 1.0.0  | 2026-07-29 | Wdrożenie + DoD zamknięte |
