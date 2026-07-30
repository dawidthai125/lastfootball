# GDD-22 — PLAN (Powiadomienia Thin)

**EPIC:** GDD-22  
**Typ:** docs-only Thin  
**Data:** 2026-07-30  
**Wejście:** AUDIT PASS (Owner GO AUDIT → Owner GO PLAN)  
**Status PLAN:** IMPLEMENT COMPLETE · oczekuje **OWNER VERIFICATION** → potem COMMIT / DOCS CLOSE  
**Baseline wejścia:** GDD-21 CLOSED (`bf07a44` / tip `c24efef`) · Domain `9c6fe86` · Presentation `9fd14fc` · HEAD tip docs `c93db5f`

---

## 0. Cel

Wypełnić `GAME_DESIGN_DOCUMENT.md` **§22 Powiadomienia** kontraktem produktowym Thin:

- **polityka alertów produktowych** (filozofia · słownik · kategorie · soft FOMO · opt-in · dedup),
- jawna granica względem **§21** (wiadomość w skrzynce ≠ powiadomienie),
- spójność z **§20** (soft FOMO / cel dnia) i **§23** (Hub Primary),
- **bez** push engineering, email, SDK, DB, quiet hours, kodu i liczb §26.

**Zasada nadrzędna (Owner / PLAN freeze)**

> **Powiadomienie jest zaproszeniem do podjęcia decyzji, nigdy wymuszeniem decyzji.**

---

## 1. Zakres Thin (IN)

| #   | Element                                                                     |
| --- | --------------------------------------------------------------------------- |
| 1   | Filozofia powiadomień (soft remind · sprawczość · anty–dark-pattern)        |
| 2   | Zasada nadrzędna „zaproszenie ≠ wymuszenie” + konsekwencje architektoniczne |
| 3   | Słownik (powiadomienie · alert · opt-in · dedup · ≠ wiadomość §21)          |
| 4   | Kategorie jakościowe (bez katalogu ID / cron-spec / payloadów)              |
| 5   | Soft FOMO — spójnie z §20.7 / §3.10 (brak kary za nieobecność / opt-out)    |
| 6   | Opt-in na poziomie produktu (kontrola gracza; bez SDK / preferencji DB)     |
| 7   | Deduplikacja jakościowa (jeden sens na sprawę; anty-spam vs §21)            |
| 8   | Relacja **§21** — skrzynka ≠ alert; reuse zasady skutku (nie przyczyna)     |
| 9   | Relacja **§20** — remind o celu ≠ drugi system zadań                        |
| 10  | Relacja **§23** — alert nie przejmuje Primary dnia meczowego                |
| 11  | Granice odpowiedzialności (co §22 definiuje / czego nie)                    |
| 12  | Placeholder / Overlay `notifications` = **nie-SSOT**                        |
| 13  | Thin vs Future (tabela: push · email · SDK · DB · quiet hours · kod)        |
| 14  | Kontrakty produktowe + checklista §22                                       |
| 15  | Sync docs statusowych po CLOSE (ROADMAP · STATUS · HANDOFF …)               |

---

## 2. Zakres OUT (twarde)

- **Push notifications** (kanał · payload · FCM / APNs · harmonogramy dostawy)
- **E-mail / SMS**
- **SDK** dostawców / analytics push
- **Quiet hours** jako specyfikacja godzin / stref / cron
- Schemat DB · tabele preferencji · migracje · RPC
- Kod aplikacji · React · Overlay „ożywianie” · serwer actions
- Generatory AI / LLM copy runtime
- Drugi inbox / drugi system decyzji równoległy do Hubu / Transferów / §21
- Redefinicja §12 (oferty) · §20 (questy) · §23 (Primary / warstwy Hub)
- Liczby §26 · XP · progi · algorytmy priorytetów
- IMPLEMENT LFE-SCOUTING-01 / jakikolwiek kod domeny
- Pełny engineering „powiadomień §22 full” (Future / osobny EPIC po Owner GO)

---

## 3. Struktura rozdziału §22 (do IMPLEMENT docs)

Wzorzec jak GDD-16…21 Thin (filozofia → zasada nadrzędna → kontrakt → granice → Future → checklista).

| Sekcja          | Treść Thin                                                              |
| --------------- | ----------------------------------------------------------------------- |
| Nagłówek        | Status GDD-22 · cel · zasady nadrzędne (w tym zasada zaproszenia)       |
| Szybki kontrakt | Tabela SSOT Thin                                                        |
| 22.1            | Filozofia powiadomień                                                   |
| 22.1a           | Zasada „zaproszenie ≠ wymuszenie” — konsekwencje architektoniczne       |
| 22.2            | Słownik                                                                 |
| 22.3            | Kategorie jakościowe (meczowy · sprawa dnia · transfer soft · sezonowy) |
| 22.4            | Soft FOMO                                                               |
| 22.5            | Opt-in produktowy                                                       |
| 22.6            | Deduplikacja jakościowa                                                 |
| 22.7            | Relacja do §20 · §21 · §23 · §3.10                                      |
| 22.8            | Granice odpowiedzialności                                               |
| 22.9            | Placeholder UI — nie-SSOT                                               |
| 22.10           | Thin vs Future                                                          |
| 22.11           | Decyzje gracza                                                          |
| 22.12           | ZERO DUPLICATE / zależności                                             |
| 22.13           | Kontrakty produktowe                                                    |
| 22.14           | Status checklisty                                                       |

**Zakaz w tekście GDD:** fragmenty kodu, nazwy tabel, SQL, SDK vendorów, hashe commitów jako reguły produktu.

---

## 4. Decyzje produktowe (freeze na PLAN)

### 4.1 Czym jest powiadomienie w Thin

Thin = **polityka alertów produktowych**:

- co wolno przypominać jakościowo,
- jak zachować soft FOMO i opt-in,
- jak deduplikować względem spraw i §21,
- jak **nie** wymuszać decyzji.

Thin **nie** jest specyfikacją kanału dostawy (push/email) ani engineeringiem.

### 4.2 Zasada nadrzędna — konsekwencje dla architektury produktu

**Zasada (SSOT produktowy)**  
**Powiadomienie jest zaproszeniem do podjęcia decyzji, nigdy wymuszeniem decyzji.**

**Znaczenie**

1. Alert **wskazuje** sprawę / moment (mecz · cel dnia · soft transfer · sezon), ale **nie** zamyka ścieżki gracza.
2. Gracz może zignorować, odroczyć, wyłączyć (opt-out) — **bez kary** sezonowej / reputacyjnej / składu.
3. Alert **nie** tworzy obowiązku logowania i **nie** blokuje postępu, gdy gracz wraca organicznie.

**Konsekwencje architektoniczne (produkt → przyszły kod)**

| Zasada projektu              | Konsekwencja dla §22 / przyszłej implementacji                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **SSOT FIRST**               | SSOT decyzji pozostaje w module domeny + Hub (§23) / Transfery (§12) / Zadania (§20) / Inbox (§21). Alert ≠ SSOT decyzji.                     |
| **REUSE FIRST**              | Deep-link / CTA alertu **reuse’uje** istniejące lokalizacje (Hub, Terminarz, Transfery…). Zakaz osobnego „silnika decyzji tylko dla alertów”. |
| **ZERO DUPLICATE LOGIC**     | Zakaz drugiego inboxu, drugiego Primary CTA, drugiego procesu ofert / questów „tylko z powiadomienia”.                                        |
| **Presentation ≠ Domain**    | Kanał / dzwonek / badge / Overlay = prezentacja zaproszenia. Reguły biznesowe **nie** żyją w warstwie alertu.                                 |
| **Zaproszenie ≠ wymuszenie** | Zakaz: hard gate „musisz kliknąć alert”; zakaz: kara za pominięcie; zakaz: auto-akcje domeny z samego alertu.                                 |

**Zakazy wynikające z zasady**

1. Alert jako jedyny / obligatoryjny nośnik decyzji, której nie ma na Hubie / w module domeny.
2. Akcja w alercie, która mutuje domenę z pominięciem oficjalnej ścieżki (np. Accept oferty poza Transferami).
3. „Soft remind”, który w praktyce jest hard FOMO (kara, utrata meczu wyłącznie za brak kliknięcia alertu — poza osobnymi regułami kalendarza domeny, jeśli Owner kiedyś je zatwierdzi **poza** §22 Thin).
4. Domyślny opt-in agresywny / spam kategorii bez kontroli gracza.

### 4.3 Relacja §21 (GDD-21)

1. **Wiadomość** = pozycja w skrzynce in-app (skutek zdarzenia domenowego — §21.1a).
2. **Powiadomienie** = zaproszenie / soft remind (polityka §22) — **≠** wiadomość.
3. Alert może **wskazywać** sprawę, która ma (lub nie) wpis w inboxie — bez dublowania treści skrzynki jako drugiego SSOT.
4. GDD-21 „push = GDD-22” interpretacja Thin: GDD-22 definiuje **politykę**; **kanał push** = Future (OUT Thin).

### 4.4 Relacja §20 (zadania — GDD-15)

1. Soft FOMO §20.7 pozostaje kotwicą retencji zadań.
2. §22 może opisać **opt-in remind** o celu dnia — nie tworzy Quest Boardu i nie konkuruje z „dokładnie 1 cel na Hubie”.
3. W dniu meczowym mecz > zadanie — alert nie odwraca hierarchii.

### 4.5 Relacja §23 (Hub — GDD-14)

1. Dzień meczowy: Primary = mecz / przygotowanie — **powiadomienie nigdy nie jest Primary**.
2. Wejście z alertu idealnie ląduje w Hubie lub w istniejącej lokalizacji decyzji — bez omijania hierarchii sprawczości.
3. Progressive disclosure: alert nie konkuruje wizualnie z Primary po wejściu do gry.

### 4.6 Soft FOMO

1. Brak kar za nieobecność / niewłączenie / zignorowanie alertu.
2. Brak obowiązkowego logowania wymuszanego przez §22.
3. Zachęta = zaproszenie do sprawczości (kalendarz meczów = najsilniejszy hak §3.10).
4. Spójność z §20.7 i §3.10; szczegóły quiet hours = **Future** (nie Thin).

### 4.7 Opt-in (produkt)

1. Gracz **kontroluje**, czy chce soft remindy (kategorie jakościowe).
2. Thin opisuje **zasadę produktu** (opt-in / minimalny default / łatwy opt-out) — **bez** UI settings wireframe, SDK i DB.
3. Brak opt-in ≠ utrata postępu sezonu.

### 4.8 Deduplikacja jakościowa

1. Jeden sensowny alert na jedną sprawę w oknie jakościowym (anty-spam).
2. Zakaz cascade: mecz + zadanie + inbox + transfer = nie cztery równorzędne alerty o tym samym momencie.
3. Preferencja: kalendarz / Hub Primary > alert; alert wspiera, nie dubluje.
4. Relacja do §21: nie dublować tej samej treści jako „powiadomienie + wiadomość” bez różnicy roli (zaproszenie vs skutek w skrzynce).

### 4.9 Placeholder ≠ SSOT

1. Overlay `notifications`, atrapy w `OverlayRoot`, mock `notifications: 3`, powiązania z `/messages` = **nie-SSOT**.
2. Zakaz traktowania mocków jako specyfikacji kategorii, opt-in, FOMO ani kanałów.
3. Przyszły EPIC kodu / UI wynika z **§22 Thin** + Guide — nie z ożywiania atrap.

### 4.10 Thin vs Future (skrót)

| Element                        | Thin | Future / osobny EPIC     |
| ------------------------------ | ---- | ------------------------ |
| Filozofia · słownik · zasada   | TAK  | —                        |
| Kategorie jakościowe           | TAK  | katalog ID / szablony    |
| Soft FOMO · opt-in produktowy  | TAK  | UI settings pełne        |
| Dedup jakościowy               | TAK  | reguły techniczne / cron |
| Granice §20 / §21 / §23        | TAK  | —                        |
| Push / email / SMS             | NIE  | TAK (po Owner GO)        |
| Quiet hours                    | NIE  | TAK                      |
| SDK · DB · preferencje persist | NIE  | TAK                      |
| Kod / Overlay implementacja    | NIE* | osobny EPIC              |

\*Ten EPIC docs nie implementuje UI/DB; kod = osobny Owner GO później.

---

## 5. Acceptance Criteria (IMPLEMENT docs)

- [x] §22 wypełniony strukturą z §3 tego PLAN-u (Thin, bez liczb/kodu/DB/SDK).
- [x] Zasada nadrzędna „zaproszenie ≠ wymuszenie” + konsekwencje architektoniczne (§22.1a).
- [x] Zasada „opt-out ≠ utrata informacji” (§22.1b) — Hub / Inbox / ekran domenowy.
- [x] Jawny słownik: powiadomienie ≠ wiadomość (§21).
- [x] Soft FOMO spójne z §20 / §3.10; brak kary za nieobecność / opt-out.
- [x] Opt-in opisany produktowo (bez SDK / DB).
- [x] Deduplikacja jakościowa (anty-spam vs kategorie / §21).
- [x] Granice §20 · §21 · §23 egzekwowane w tekście (ZERO DUPLICATE).
- [x] Thin vs Future: push · email · SDK · DB · quiet hours · kod = OUT.
- [x] Placeholder / Overlay notifications oznaczony nie-SSOT.
- [x] Checklista §22 + TOC / status rozdziału zaktualizowane.
- [ ] Po Owner VERIFY: DOCS CLOSE sync (STATUS · ROADMAP · BASELINE tip · HANDOFF · EPIC_INDEX · CHANGELOG · game-design README / CURRENT_DESIGN / game-design ROADMAP) — **bez** zmian w `apps/` / `supabase/`.
- [x] Prettier docs przed commit.

---

## 6. Pliki (IMPLEMENT docs)

| Plik                                                      | Rola                 |
| --------------------------------------------------------- | -------------------- |
| `docs/game-design/GAME_DESIGN_DOCUMENT.md`                | SSOT §22             |
| `docs/game-design/README.md`                              | Status Fazy 2        |
| `docs/game-design/CURRENT_DESIGN.md`                      | Skrót designu        |
| `docs/game-design/ROADMAP.md`                             | Etapy GDD            |
| `docs/PROJECT_STATUS.md`                                  | Tor Design           |
| `docs/ROADMAP.md`                                         | GDD-22 CLOSED · next |
| `docs/AI/CURRENT_BASELINE.md`                             | Documentation tip    |
| `docs/AI/PROJECT_HANDOFF.md`                              | Handoff              |
| `docs/AI/EPIC_INDEX.md` / `AI_QUICK_START.md`             | Indeks               |
| `docs/CHANGELOG.md` (+ root `CHANGELOG.md` jeśli używany) | Wpisy                |

**Nie ruszać:** `apps/**`, `packages/**`, `supabase/**`.  
**Nie startować:** LFE-SCOUTING-01.

---

## 7. Ryzyka (docs)

| Ryzyko                                    | Mitigacja                                    |
| ----------------------------------------- | -------------------------------------------- |
| Drift push/email/quiet hours w Thin       | §2 OUT + Thin vs Future + AC                 |
| Pomieszanie Overlay notifications z §21   | Słownik + Placeholder ≠ SSOT                 |
| GDD-21 „push = GDD-22” vs Thin bez push   | Polityka w Thin; kanał = Future              |
| Alert jako wymuszenie / hard FOMO         | Zasada 22.1a + Soft FOMO                     |
| Alert jako przyczyna zdarzenia domenowego | REUSE §21.1a + SSOT FIRST                    |
| Scope creep do kodu / Scouting            | Docs-only; zakaz LFE-SCOUTING-01 w tym EPICu |

---

## 8. Kryteria zakończenia EPIC-u (FULLY CLOSED)

EPIC GDD-22 uznaje się za **FULLY CLOSED** dopiero gdy:

1. **IMPLEMENT docs** §22 Thin zatwierdzony Owner VERIFY.
2. **COMMIT + PUSH** contentu docs na `main`.
3. **DOCS CLOSE** sync SSOT (STATUS · ROADMAP · BASELINE · HANDOFF · indeksy · CHANGELOG · game-design).
4. **DOCS COMMIT + DOCS PUSH**.
5. **FINAL DOCS VERIFY** — tip CI GREEN (jeśli uruchamiane) · dokumentacja spójna · brak zmian `apps/` / `supabase/`.
6. Raport FINAL z hashami · listą docs · potwierdzeniem **EPIC FULLY CLOSED**.

Do tego momentu status = PLAN / IMPLEMENT / CLOSE w toku — **nie** CLOSED.

---

## 9. Workflow po OWNER GO IMPLEMENT

```
OWNER GO IMPLEMENT (docs)
→ IMPLEMENT §22 Thin w GAME_DESIGN_DOCUMENT.md (+ sync lokalne statusy przy CLOSE)
→ OWNER VERIFICATION
→ COMMIT → PUSH
→ DOCS CLOSE sync → DOCS COMMIT → DOCS PUSH → FINAL DOCS VERIFY
```

**Zakazy teraz:** IMPLEMENT bez Owner GO · kod · DB · AUDIT/PLAN/IMPLEMENT LFE-SCOUTING-01.

---

## 10. Decyzje wymagające OWNER GO (checklist)

- [x] Zatwierdzenie zakresu Thin / OUT (§1–§2)
- [x] Freeze zasady nadrzędnej „zaproszenie ≠ wymuszenie” (§4.2)
- [x] Freeze: Thin = polityka; push/email/SDK/quiet hours/DB/kod = Future
- [x] Freeze granic §20 / §21 / §23
- [x] Zgoda na start **IMPLEMENT docs** (osobny GO)

---

## Historia

| Wersja | Data       | Opis                                    |
| ------ | ---------- | --------------------------------------- |
| 1.0.0  | 2026-07-30 | PLAN COMPLETE — Owner Review            |
| 1.1.0  | 2026-07-30 | IMPLEMENT COMPLETE — Owner Verification |
