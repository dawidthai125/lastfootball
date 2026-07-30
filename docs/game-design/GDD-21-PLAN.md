# GDD-21 — PLAN (Wiadomości Thin)

**EPIC:** GDD-21  
**Typ:** docs-only Thin  
**Data:** 2026-07-30  
**Wejście:** AUDIT PASS (model hybrydowy · Tor A)  
**Status PLAN:** **CLOSED** · OWNER VERIFY PASS · content `bf07a44` · tip `c24efef`

---

## 0. Cel

Wypełnić `GAME_DESIGN_DOCUMENT.md` **§21 Wiadomości** kontraktem produktowym Thin:

- in-app inbox narracyjny / systemowy,
- wiadomości **prowadzą** do istniejących ekranów (deep-link produktowy),
- **Transfery** pozostają jedynym SSOT procesu ofert,
- bez push, email, AI, DB, kodu i liczb §26.

---

## 1. Zakres Thin (IN)

| #   | Element                                                        |
| --- | -------------------------------------------------------------- |
| 1   | Filozofia inboxu (limit · nie spam · hub-first)                |
| 2   | Słownik (wiadomość · skrzynka · CTA wiadomości · skrót oferty) |
| 3   | Typy jakościowe nadawców (bez katalogu ID contentu)            |
| 4   | Priorytet / limit / rotacja (jakościowo, bez cron-spec)        |
| 5   | CTA: wyłącznie deep-link do **istniejących** lokalizacji       |
| 6   | Relacja §20 (wskazanie celu; nie redefinicja zadań)            |
| 7   | Relacja §22 (granica: wiadomość ≠ powiadomienie push)          |
| 8   | Relacja §23 (warstwa 5 / Secondary; nigdy Primary dnia meczu)  |
| 9   | Relacja §12: **skrót oferty** w inboxie ≠ proces nego/settle   |
| 10  | Placeholder `/messages` + `MessagesPreview` = **nie-SSOT**     |
| 11  | Thin vs Future (tabela)                                        |
| 12  | Kontrakty produktowe + checklista §21                          |
| 13  | Sync docs statusowych po CLOSE (ROADMAP · STATUS · HANDOFF …)  |

---

## 2. Zakres OUT (twarde)

- Push · email · SMS · quiet hours techniczne
- Schemat DB · tabele `messages` · migracje · RPC
- Kod · React · resolver · serwer actions
- Generatory AI / LLM copy runtime
- Drugi inbox ofert (zakaz dublowania Transferów)
- Archiwum pełne / wyszukiwarka / wątki chatów agentów
- Liczby §26 · XP · progi · algorytmy
- Implementacja GDD-22 (osobny EPIC docs)
- LFE-ACADEMY-01 / jakikolwiek kod domeny

---

## 3. Struktura rozdziału §21 (do IMPLEMENT docs)

Wzorzec jak GDD-16…19 Thin (filozofia → kontrakt → granice → Future → checklista).

| Sekcja          | Treść Thin                                                        |
| --------------- | ----------------------------------------------------------------- |
| Nagłówek        | Status GDD-21 · cel · zasady nadrzędne Owner                      |
| Szybki kontrakt | Tabela SSOT Thin                                                  |
| 21.1            | Filozofia inboxu                                                  |
| 21.2            | Słownik                                                           |
| 21.3            | Typy jakościowe (Zarząd · System · Media · Agent/flavor — bez ID) |
| 21.4            | Priorytet · limit · rotacja (jakościowo)                          |
| 21.5            | CTA i deep-link do istniejących ekranów                           |
| 21.6            | Relacja do Transferów (§12) — skrót vs SSOT procesu               |
| 21.7            | Relacja do §20 · §22 · §23 · §3 (powitalna)                       |
| 21.8            | Placeholder UI — nie-SSOT                                         |
| 21.9            | Thin vs Future                                                    |
| 21.10           | Decyzje gracza                                                    |
| 21.11           | ZERO DUPLICATE / zależności                                       |
| 21.12           | Kontrakty produktowe                                              |
| 21.13           | Status checklisty                                                 |

**Zakaz w tekście GDD:** fragmenty kodu, nazwy tabel, SQL, hashe commitów jako reguły produktu.

---

## 4. Decyzje produktowe (freeze na PLAN)

### 4.1 Kanał

Thin = **wyłącznie in-app inbox** (ekran skrzynki + ewentualny skrót na Hubie jako warstwa 5).

### 4.2 CTA

Każda wiadomość Thin może mieć **co najwyżej jeden** CTA prowadzący do istniejącej trasy produktowej, np.:

| Typ jakościowy     | Dozwolony cel CTA (przykłady)  |
| ------------------ | ------------------------------ |
| Powitalna / zarząd | Hub · Kadra · First Match path |
| System             | Terminarz · Finanse · Trening  |
| Flavor media       | Hub / brak CTA                 |
| Skrót oferty       | **`/transfers` tylko**         |

Zakaz: CTA do nieistniejących modułów jako „fałszywy SSOT”; zakaz CTA uruchamiającego settle/nego poza Transferami.

### 4.3 Transfery = jedyny SSOT ofert

1. Lista · nego · Accept/Reject/Counter · settle = **wyłącznie** §12 / D20 / UI Transferów.
2. §21 może opisać **skrót narracyjny** („masz sprawę transferową”) z deep-linkiem do `/transfers`.
3. §21 **nie** definiuje stanów oferty, kwot, timeoutów ani drugiego inboxu decyzyjnego.

### 4.4 Hub

- Dzień meczowy: Primary = mecz / przygotowanie (§23) — wiadomość **nie** przejmuje Primary.
- Skrót wiadomości = warstwa 5 lub Secondary kontekstowe (idle / nowy klub).
- Wiadomość powitalna (§3/§5): typ jakościowy; **nie blokuje** Primary CTA.

### 4.5 §20

Wiadomość może **wskazywać** cel dnia; nie tworzy drugiego systemu zadań i nie konkuruje z „dokładnie 1 cel na Hubie”.

### 4.6 §22

GDD-21 nazywa granicę („wiadomość w skrzynce ≠ alert push”). Szczegóły kanałów push/email = **GDD-22** (poza tym EPICem).

### 4.7 Placeholder

`/messages`, `MessagesPreview`, mocki Overlay = **nie-SSOT**; zakaz traktowania ich jako specyfikacji przy przyszłym kodzie.

---

## 5. Acceptance Criteria (IMPLEMENT docs)

- [x] §21 wypełniony strukturą z §3 tego PLAN-u (Thin, bez liczb/kodu/DB).
- [x] Jawny kontrakt: Transfery = SSOT ofert; §21 = skrót + deep-link.
- [x] Jawny kontrakt: CTA tylko do istniejących ekranów.
- [x] Jawne OUT: push · email · AI · DB · kod.
- [x] Placeholder `/messages` oznaczony nie-SSOT.
- [x] ZERO DUPLICATE vs §20 · §12 · §22 · §23 · §19.
- [x] Checklista §21 + TOC / status rozdziału zaktualizowane.
- [x] Po Owner VERIFY: DOCS CLOSE sync (STATUS · ROADMAP · BASELINE tip · HANDOFF · EPIC_INDEX · CHANGELOG · game-design README) — **bez** zmian w `apps/` / `supabase/`.
- [x] Prettier docs przed commit.

---

## 6. Pliki (IMPLEMENT docs)

| Plik                                                        | Rola                 |
| ----------------------------------------------------------- | -------------------- |
| `docs/game-design/GAME_DESIGN_DOCUMENT.md`                  | SSOT §21             |
| `docs/game-design/README.md`                                | Status Fazy 2        |
| `docs/PROJECT_STATUS.md`                                    | Tor Design           |
| `docs/ROADMAP.md`                                           | GDD-21 CLOSED · next |
| `docs/AI/CURRENT_BASELINE.md`                               | Documentation tip    |
| `docs/AI/PROJECT_HANDOFF.md`                                | Handoff              |
| `docs/AI/EPIC_INDEX.md` / `AI_QUICK_START.md`               | Indeks               |
| `docs/CHANGELOG.md` (+ game-design changelog jeśli używany) | Wpisy                |

**Nie ruszać:** `apps/**`, `packages/**`, `supabase/**`.

---

## 7. Ryzyka (docs)

| Ryzyko                     | Mitigacja                          |
| -------------------------- | ---------------------------------- |
| Drift „inbox ofert w §21”  | Sekcja 21.6 + AC §5                |
| Kolizja z GDD-22           | Tylko granica; brak kanałów push   |
| Ożywianie mocków w tekście | Sekcja Placeholder nie-SSOT        |
| Merge z Tor B (Academy)    | Commit docs-only; bez feat Academy |

---

## 8. Workflow po OWNER GO

```
OWNER GO → IMPLEMENT docs (§21) → OWNER VERIFICATION
→ COMMIT → PUSH → (docs tip; brak PRODUCTION feature)
→ DOCS CLOSE sync → DOCS COMMIT → DOCS PUSH → FINAL DOCS VERIFY
```

**Uwaga operacyjna:** Przy równoległym Tor B — **jeden IMPLEMENT naraz**. Priorytet kodu = Academy; GDD-21 IMPLEMENT docs startuje gdy Owner zwolni slot (po GO) albo gdy Academy stoi na PLAN/HOLD.

---

## 9. Decyzje wymagające OWNER GO (checklist)

- [ ] Zatwierdzenie zakresu Thin / OUT (§1–§2)
- [ ] Freeze: Transfery = jedyny SSOT ofert (§4.3)
- [ ] Freeze: tylko in-app + CTA do istniejących ekranów
- [ ] Zgoda na start IMPLEMENT **docs** dopiero gdy Owner wskaże slot (priorytet: Academy)

---

## Historia

| Wersja | Data       | Opis                         |
| ------ | ---------- | ---------------------------- |
| 1.0.0  | 2026-07-30 | PLAN COMPLETE — Owner Review |
