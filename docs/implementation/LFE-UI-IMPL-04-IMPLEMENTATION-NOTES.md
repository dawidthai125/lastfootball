# LFE-UI-IMPL-04 — IMPLEMENTATION NOTES

**EPIC:** LFE-UI-IMPL-04  
**Data:** 2026-07-29  
**Wejście:** IMPL-03 `d850f0e`

---

## 0. Raport

| Obszar             | Zmiana                                                     |
| ------------------ | ---------------------------------------------------------- |
| Typografia PTI-03  | Archivo (`--font-ui`) + Source Sans 3 (`--font-body`)      |
| Nav rail           | Default **icon rail 80px** · expanded **160px** (było 184) |
| Mobile HF-SHELL-02 | Bottom nav + safe-area · active gold-soft                  |
| More               | Ikona + touch ≥44px · soft-lock → modal                    |
| Soft-lock PTI-06   | Exit outline (nie gold Primary) · `SoftLockModal` SYS-04   |
| TopBar             | 1× kasa muted · touch targets ≥44                          |
| Nav active         | prestige tick 2px + gold-soft                              |

**Nie zmieniono:** DNA · Style Lock · IA · flow · resolvery.

---

## 1. P2 zamknięte

| ID                    | Status                                            |
| --------------------- | ------------------------------------------------- |
| PTI-03 fonty          | ✓                                                 |
| PTI-04 ikony nav      | ✓ (stroke pack + większe ICO; WA ICO-020 w modal) |
| PTI-05 hero fills     | ✓ (domknięte w IMPL-02/03)                        |
| PTI-06 soft-lock exit | ✓                                                 |
| PTI-02 Gol demo       | ✓ (IMPL-02 overlay)                               |
| PTI-01 M parity       | ✓ (IMPL-01)                                       |

---

## 2. DoD

| Gate                     | Status |
| ------------------------ | ------ |
| Spójność Shell D↔M       | ✓      |
| P2 uzasadnione           | ✓      |
| Brak regresji IMPL-01…03 | ✓      |
| typecheck · test · CI    | ✓      |

---

## 3. Rekomendacja

# **GO — LFE-UI-IMPL-05** (SCR-SQD-04 XI / Match composition)

lub **LFE-CONTENT-PASS-01** (copy / fidelity residual) jeśli Owner woli content przed XI.

---

## Historia

| Wersja | Data       | Opis               |
| ------ | ---------- | ------------------ |
| 0.1.0  | 2026-07-29 | Notes Shell polish |
