# LFE-CONTENT-PASS-01 — CHANGELOG

**EPIC:** LFE-CONTENT-PASS-01  
**Data:** 2026-07-29  
**Wejście:** IMPL-05 PASS (`47340fe`)

---

## Zakres

Ujednolicenie mikrocopy P0 (Hub · Squad · Match · Transfers · Training · Finance · shell).  
Bez zmian DNA / World Art / DS / IA / flow / logiki biznesowej.

---

## Zmiany

### Słownik SSOT

- Nowy moduł `apps/web/src/lib/ui/copy.ts` (`UI_COPY`) + test `copy.test.ts`
- Obowiązujące: **Kadra ≠ Skład**, exit **„Wróć do Hub”** (nie „Hubu”), soft-lock bez żargonu, bez „Odblokuj”

### Hub / Nav / Soft-lock

- SoftLockModal / SoftLockState / Nav (desktop + mobile): frazy z `UI_COPY`
- Usunięty żargon `resolveNavAccess` / „nie z UI” z reasonów gracza
- EarlyClubHub secondary locked: `· niedostępne` ze słownika
- Primary CTA Hub: `goToMatch` / `viewSquad` / `squadNav` ze słownika

### Match

- Pre-match Primary: **„Zagraj mecz”** (pierwszy mecz: **„Rozpocznij pierwszy mecz”**)
- Soft: **„Ustaw skład”**
- Post / complete fixture: **„Wróć do Hub”** + pending **„Zapisuję…”**
- Match XI: title / save / pending / soft checklist ze słownika
- Empty XI: link **„Wróć do przedmeczu”** (zamiast ang. „Checklist”)

### Transfers / Finance / Onboarding

- Okno zamknięte: `transferWindowClosed` (bez meta „nie z UI”)
- ConfirmSubmit: **„Potwierdź akceptację oferty.”**
- Finance exit: `hubExit`
- Welcome LF: **„Wejdź do Hub”** + lead **kadra** (nie „skład”)

### System states

- LoadingFrame / StateBanner / DomainError: `loading` / `retry` ze słownika

---

## Poza zakresem (świadomie)

- Placeholdery P1+ (Board, Sponsors, …) — bez pełnego polish copy
- Visual DNA, World Art assety, layout, unlock rules

---

## Historia

| Wersja | Data       | Opis                        |
| ------ | ---------- | --------------------------- |
| 1.0.0  | 2026-07-29 | Content Pass P0 — wdrożenie |
