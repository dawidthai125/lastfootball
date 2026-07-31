# GDD-SPONSORS-01 — Sponsors Thin (kontrakt produktowy)

**Produkt:** Last Football  
**EPIC:** GDD-SPONSORS-01 / LFE-SPONSORS-01  
**Status:** CLOSED — kontrakt Thin · D95–D101  
**SSOT Thin:** ten plik  
**Pointer w GDD:** [`GAME_DESIGN_DOCUMENT.md`](./GAME_DESIGN_DOCUMENT.md) §14.8 · §15 · §15.11  
**Lifecycle:** [`GDD-SEASON-END-01.md`](./GDD-SEASON-END-01.md) · H-SPONSORS

> **Cel:** Jeden bazowy kontrakt sponsorski + cashflow przez istniejący ledger finansowy + odnowienie Offseason bez blokady Confirm N+1.  
> Bez marketplace, negocjacji, Quest Engine, Board, Stadium, osobnego walleta.

---

## 1. Owner LOCK (kod)

1. `club_sponsor_contracts` = jedyny SSOT kontraktu.
2. Base payout **dokładnie raz** w `confirmStartNextSeason()`, po manualnym lub auto odnowieniu.
3. `resolveClubSponsors()` = jedyne źródło danych UI.
4. Sponsor → wyłącznie istniejący finance ledger (`cash_balance` + `finance_movements`).
5. Confirm Next Season = Primary CTA.
6. Renewal = secondary; nie blokuje lifecycle.
7. Claim bonus **idempotentny** (w tym po re-entry).
8. Auto-renew zachowuje ten sam kontrakt Thin (brand + kwoty bez zmian).

---

## 2. Decyzje D95–D101

| ID       | Nazwa                           | Sedno                                                      |
| -------- | ------------------------------- | ---------------------------------------------------------- |
| **D95**  | One Base Sponsor Contract       | 1 aktywny kontrakt / klub                                  |
| **D96**  | Sponsors UI Sole Resolver       | UI tylko `resolveClubSponsors`                             |
| **D97**  | Sponsor Cash Via Finance Ledger | Brak drugiego walleta                                      |
| **D98**  | H-SPONSORS Non-Blocking         | Renewal nie blokuje Confirm                                |
| **D99**  | Soft Unlock Sponsors Only       | `/sponsors` open SEASON+OFFSEASON; Board/Stadium locked    |
| **D100** | No Marketplace No Quest         | Brak marketplace / nego / Quest Engine / mid-season change |
| **D101** | Flat Renewal Band Thin          | Auto-renew = te same wartości; zero §6                     |

---

## 3. IN / OUT

### IN

- Persist `club_sponsor_contracts` (1:1 klub).
- Seed przy create club (sezon 1 · active · bez base payout przy create).
- `resolveClubSponsors` · `/sponsors` View.
- Unlock nav `sponsors` na SEASON + OFFSEASON.
- Cel sezonowy Thin: **top half** (pozycja ≤ 6 w lidze 12) — derive z tabeli.
- Bonus claim → `sponsor_bonus` movement + cash (idempotent `bonus_claimed_at`).
- Offseason: Accept renewal (secondary).
- Confirm: auto-renew jeśli brak Accept → base payout raz na nowy sezon (`sponsor_base`).

### OUT

- Marketplace · negocjacje · multi-sponsor · mid-season change
- Board · Stadium · age++ · prestige §6
- Quest Engine · daily-login
- Osobny wallet / envelope sponsora
- Blokada Confirm przez renewal

---

## 4. Liczby Thin (`ECONOMY_THIN`)

| Stała           | Wartość                             |
| --------------- | ----------------------------------- |
| `SPONSOR_BASE`  | 15_000                              |
| `SPONSOR_BONUS` | 10_000                              |
| Brand Thin      | `local-partner` · „Partner Lokalny” |

---

## 5. Pipeline

| Moment      | Zachowanie                                                                      |
| ----------- | ------------------------------------------------------------------------------- |
| Create club | Insert kontrakt sezon 1                                                         |
| SEASON      | Karta · postęp celu · claim gdy complete                                        |
| OFFSEASON   | Renewal Accept (secondary) · Confirm Primary                                    |
| Confirm N+1 | Renew (manual lub auto, te same kwoty) → **base payout raz** → reszta lifecycle |

---

## 6. Acceptance Criteria

| ID   | Kryterium                                                |
| ---- | -------------------------------------------------------- |
| AC-1 | Kontrakt Thin + D95–D101 jawne                           |
| AC-2 | SSOT = `club_sponsor_contracts`                          |
| AC-3 | UI = tylko `resolveClubSponsors`                         |
| AC-4 | Ledger only · kategorie `sponsor_base` / `sponsor_bonus` |
| AC-5 | Base payout tylko w Confirm · raz / sezon                |
| AC-6 | Confirm Primary · renewal non-blocking                   |
| AC-7 | Claim idempotent                                         |
| AC-8 | Auto-renew = flat same values                            |
| AC-9 | Board/Stadium soft-lock nietykalny                       |

---

## Last updated

2026-07-31 — GDD-SPONSORS-01 CLOSED · D95–D101 · LFE-SPONSORS-01
