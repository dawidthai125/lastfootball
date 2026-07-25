# AI — Architecture Principles

## Cel

Filozofia projektu — **dlaczego** budujemy tak, a nie inaczej.  
Wzorcę operacyjne: [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md). Reguły warstw: [`ARCHITECTURE_RULES.md`](./ARCHITECTURE_RULES.md).

---

## SSOT FIRST

**Opis:** Jeden fakt ma jedno źródło prawdy (DB lub dokument).  
**Uzasadnienie:** Drift między mockiem, seedem i tabelą psuje produkt i agentów.  
**Przykład:** Saldo tylko w `clubs.cash_balance`; UI przez `resolveClubFinance`, nie lokalny licznik.

---

## REUSE FIRST

**Opis:** Zanim dodasz moduł, znajdź istniejący resolver / helper / API.  
**Uzasadnienie:** ZERO DUPLICATE i krótsze EPICi.  
**Przykład:** Liga i First Match używają tego samego `createMatch` / Live pipeline — nie drugiego silnika w web.

---

## ZERO DUPLICATE LOGIC

**Opis:** Jedna implementacja reguły domeny; reszta konsumuje.  
**Uzasadnienie:** Podwójna fee/tabela/XI rozjeżdża się w tydzień.  
**Przykład:** Fee transferu tylko `deriveTransferFee` + listing z katalogu — nie drugi wzór w komponencie.

---

## PURE BEFORE IO

**Opis:** Najpierw pure `resolve*` (testowalne), potem cienkie IO.  
**Uzasadnienie:** UI i Hub muszą dać się przetestować bez Supabase.  
**Przykład:** `resolveTransferMarket({ clubId, cash, window, players })` — page tylko ładuje wiersze.

---

## RESOLVER FIRST

**Opis:** Kontrakt UI = output resolvera; page nie „składa” domeny.  
**Uzasadnienie:** Jedna ścieżka dla Hub chipów i pełnych ekranów.  
**Przykład:** `/league` i chip pozycji z tego samego `resolveLeagueTable`.

---

## THIN SLICE

**Opis:** Mały, prawdziwy przepływ na SSOT > pełny GDD od razu.  
**Uzasadnienie:** Szybka walidacja produktu; wyjątki świadome i udokumentowane.  
**Przykład:** Transfers Thin: buy/sell + okno + cash; bez negotiation/envelope.

---

## NO RUNTIME MOCKS

**Opis:** Ścieżka gracza na produkcji nie używa mock list / fałszywych sald / fikcyjnego rynku.  
**Uzasadnienie:** Mock w runtime = fałszywy SSOT.  
**Przykład:** Zakaz `dashboardMock` na Hub; `/transfers` tylko z `resolveTransferMarket`.

---

## SEED != RUNTIME

**Opis:** Seed tworzy stan początkowy / AI / testy — nie ratuje pustego runtime UI.  
**Uzasadnienie:** Mutacje (transfer, trening) wymagają trwałej tabeli.  
**Przykład:** Starter `s-{tag}-…` przy create; runtime czyta `players` lub error.

---

## EVOLUTION NOT REVOLUTION

**Opis:** Rozszerzaj istniejący SSOT; nie stawiaj równoległego modelu „v2”.  
**Uzasadnienie:** Rewolucje niszczą handoff i baseline.  
**Przykład:** Training powinien mutować `players` / statusy — nie nową tabelę „training_squad” bez Owner GO.

---

## OWNER GO FOR MUTATIONS OF RECORD

**Opis:** Commit, push i decyzje produktowe tylko po jawnym Owner GO.  
**Uzasadnienie:** Historia `main` = produkcja.  
**Przykład:** Pipeline kończy się CLOSE dopiero po GREEN CI i akceptacji Ownera.

## Last updated

2026-07-25 — AI-DOCS-HYGIENE-01
