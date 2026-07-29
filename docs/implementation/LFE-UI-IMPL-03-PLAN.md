# LFE-UI-IMPL-03 — PLAN

**EPIC:** LFE-UI-IMPL-03  
**Etap:** CORE DOMAINS P0  
**Data:** 2026-07-29  
**Wejście:** DOCS-SYNC PASS · IMPL-02 `769ce4a`

---

## 0. Cel

Hi-Fi dla Squad · Training · Transfers · Finance + wspólne stany (loading / empty / error / soft-lock), Desktop ↔ Mobile, bez zmiany DNA / Style Lock / IA / reguł domenowych.

---

## 1. Mapowanie SSOT → kod

| Ekran        | Route           | Komponent                       | WA                           |
| ------------ | --------------- | ------------------------------- | ---------------------------- |
| HF-SQD-01    | `/squad`        | `SquadView` + LocationHero      | HERO-004 · EMP-002           |
| HF-SQD-03    | `/players/[id]` | `PlayerDetail` (PTI-01)         | SHT-* (soft)                 |
| HF-TRN-01/02 | `/training`     | `TrainingView` / SoftLockState  | HERO-006 · ILL-002           |
| HF-XFR-01/03 | `/transfers`    | `TransfersView` / SoftLockState | HERO-005 · ILL-003           |
| HF-FIN-01    | `/finance`      | `FinanceView`                   | HERO-007 · EMP-003 · LOD-007 |

Źródło reguł: istniejące resolvery (`resolveClubSquad` · `resolveClubTraining` · `resolveTransferMarket` · `resolveClubFinance` · `resolveNavAccess`).

---

## 2. Wspólne prymitywy

| Komponent       | Rola                      |
| --------------- | ------------------------- |
| `LocationHero`  | Hero WA (D+M)             |
| `SoftLockState` | ILL-* · ICO-020 · ○ Hub   |
| `EmptyState`    | EMP-* · soft CTA          |
| `LoadingFrame`  | LOD / skeleton            |
| `StateBanner`   | error inline / toast-like |

Route: `loading.tsx` · `error.tsx` dla Squad / Training / Transfers / Finance.

---

## 3. DoD

- [ ] 4 domeny z LocationHero WA
- [ ] Soft-lock TRN-02 + XFR-03
- [ ] Empty SQD + FIN
- [ ] Loading + error routes
- [ ] D↔M parity · PTI-01 bez regresji
- [ ] typecheck · test · CI GREEN

---

## Historia

| Wersja | Data       | Opis                 |
| ------ | ---------- | -------------------- |
| 0.1.0  | 2026-07-29 | Plan Core Domains P0 |
