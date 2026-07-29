# LFE-UI-IMPL-04 — PLAN

**EPIC:** LFE-UI-IMPL-04  
**Etap:** SHELL POLISH & UI FIDELITY  
**Data:** 2026-07-29  
**Wejście:** IMPL-03 PASS (`d850f0e`)

---

## 0. Cel

Podnieść spójność Shell / Nav / More / typografii / soft-lock bez zmiany IA, flow ani reguł domenowych.

---

## 1. Backlog P2 → fix

| ID            | Problem            | Fix                                     |
| ------------- | ------------------ | --------------------------------------- |
| PTI-03        | Inter/Barlow vs DS | Archivo + Source Sans 3                 |
| IMPL-01 debt  | Nav rail 184px     | Default icon rail 80px · expanded 160px |
| HF-SHELL-02   | MobileNav u góry   | Bottom nav Variant A                    |
| PTI-06        | Soft-lock Hub gold | Secondary outline exit                  |
| Soft-lock nav | martwy disabled    | tap → SoftLockModal (SYS-04)            |
| More          | brak ikony · touch | ICO + min 44px                          |
| TopBar        | brak kasy muted    | 1× `type.kpi` cash                      |
| Nav active    | prestige tick      | gold-soft + 2px tick (wzmocnienie)      |

**Poza scope:** nowe ekrany · nowe reguły · zmiana DNA/WA Style Lock · XI editor.

---

## 2. DoD

- [ ] Fonty DS
- [ ] Icon rail default D
- [ ] Bottom nav M
- [ ] Soft-lock exit + modal
- [ ] Regresja IMPL-01…03
- [ ] CI GREEN

---

## Historia

| Wersja | Data       | Opis              |
| ------ | ---------- | ----------------- |
| 0.1.0  | 2026-07-29 | Plan Shell polish |
