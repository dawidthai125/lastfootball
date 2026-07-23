# Last Football — UI Design Guide

**Produkt:** Last Football  
**Dokument:** UI_DESIGN_GUIDE  
**Faza:** 2 — Game Design Foundation  
**Etap:** GDD-01  
**Status:** Zasady bazowe (do rozwinięcia o tokeny i ekrany)

> Ten przewodnik jest SSOT dla **wyglądu i zachowania UI**.  
> Mechaniki gry → [GAME_DESIGN_DOCUMENT.md](./GAME_DESIGN_DOCUMENT.md).  
> Implementacja React/Next — dopiero po doprecyzowaniu ekranów w GDD.

---

## 1. Misja interfejsu

Last Football ma wyglądać i działać jak **profesjonalna gra menedżerska**, nie jak generyczny dashboard SaaS ani „AI admin panel”.

Gracz ma w kilka sekund wiedzieć:

1. gdzie jest,
2. co jest najważniejsze teraz,
3. jaką jedną decyzję może podjąć.

---

## 2. Zasady nadrzędne

### 2.1 Profesjonalny menedżer, nie dashboard AI

- Unikamy wyglądu „karta + fioletowe gradienty + glow + pill badges”.
- Unikamy przypadkowych statystyk w hero i przeładowanych widgetów.
- Preferujemy klarowną hierarchię: klub / rozgrywki / decyzja.

### 2.2 Nowoczesność, elegancja, ponadczasowość

- Typografia z charakterem (nie domyślny Inter/Roboto/Arial jako tożsamość marki).
- Spójna siatka, rytm odstępów, ograniczona paleta.
- Detal przez typografię i kompozycję, nie przez efekty świetlne.

### 2.3 Czytelność i szybkość

- Pierwszeństwo: skanowanie oczu (F-pattern / jasny CTA).
- Gęstość informacji kontrolowana — listy i tabele czytelne, nie „wall of cards”.
- Akcje krytyczne (skład, mecz, transfer) zawsze w zasięgu 1–2 kliknięć z hubu.

### 2.4 Jeden cel na ekran

- Każdy widok ma **jedną** główną intencję.
- Sekcje poboczne nie konkurują z celem ekranu.
- Modale tylko dla decyzji domykających (potwierdzenie transferu, zmiana taktyki).

### 2.5 Spójność całej gry

- Te same komponenty nawigacji, list zawodników, wyników meczów.
- Stałe znaczenie kolorów (np. sukces / ostrzeżenie / błąd) w całej aplikacji.
- Ten sam język mikrocopy (krótki, rzeczowy, po polsku w produkcie PL).

### 2.6 Oszczędność efektów

- **Bez** nadmiaru gradientów, glow, neonów, glassmorphism „dla ozdoby”.
- **Bez** przypadkowych animacji; ruch tylko gdy wzmacnia hierarchię lub feedback.
- Tła: subtelna atmosfera boiska/klubu, nie dekoracyjny chaos.

---

## 3. Hierarchia wizualna

1. **Tożsamość klubu** (nazwa / herb) — silny sygnał marki gracza na hubie i w meczu.
2. **Kontekst rozgrywek** (kolejka, wynik, termin).
3. **Decyzja / CTA**.
4. **Dane wspierające** (tabele, atrybuty).
5. **Metadane** (timestampy, ID — zawsze najniżej).

Na landingach / promo: brand first. W grze zalogowanej: **klub gracza** jest bohaterem, nie logo produktu.

---

## 4. Nawigacja

### 4.1 Struktura (do doprecyzowania w GDD §23–24)

Szkielet oczekiwany:

- Hub (panel główny)
- Drużyna (skład, taktyka, trening)
- Rozgrywki (liga, puchar, mecz)
- Transfery / skauting
- Klub (stadion, finanse, sponsorzy, akademia)
- Wiadomości / zadania

### 4.2 Zasady

- Stały chrome nawigacji (desktop + adaptacja mobile).
- Aktywna sekcja zawsze widoczna.
- Breadcrumbs tylko gdy głębokość > 2.

---

## 5. Wzorce ekranów

| Wzorzec | Kiedy | Unikać |
|---------|--------|--------|
| Hub | Start sesji, CTA dnia | Mini-dashboard z 12 kartami |
| Lista + detal | Zawodnicy, oferty | Karty zamiast tabeli bez potrzeby |
| Formularz decyzji | Transfer, trening | Wielostronicowe wizardy bez sensu |
| Match view | Przed / w trakcie / po | Overlaye zasłaniające boisko |
| Raport | Post-match, finanse | Infografiki bez akcji |

**Karty:** tylko gdy niosą interakcję lub czytelność. Domyślnie — lista / sekcja bez „card for card’s sake”.

---

## 6. Typografia (kierunek)

- Display / nagłówki: wyrazisty krój (sportowy, ale nie „esport neon”).
- Body: wysoka czytelność przy gęstych tabelach.
- Unikać: Inter / Roboto / Arial jako jedynej tożsamości marki.
- Skala typograficzna stała w design tokens (do zdefiniowania w GDD-02+).

---

## 7. Kolor i atmosfera

- Jedna, świadoma paleta klubu produktu + tokeny semantyki (success / danger / warning).
- Tła z lekką głębią (gradient/tekstura subtelna), nie płaski „#fff only” ani dark-purple default.
- Kolory klubu gracza jako akcent personalizacji — nie łamią systemu.

**Unikać biasów AI-UI:** fioletowo-indygo glow, cream+terracotta „editorial default”, gazetowy broadsheet dense layout — chyba że świadomie w GDD.

---

## 8. Motion

- 2–3 celowe wzorce globalne (np. przejście hub→detal, feedback CTA, wejście wyniku meczu).
- Czas trwania krótki; preferuj `ease-out`.
- Szacunek dla `prefers-reduced-motion`.

---

## 9. Feedback i stany

Każdy interaktywny element obsługuje:

- default / hover / active / disabled / loading / error / empty

Empty states: konkretna wskazówka „co zrobić dalej”, nie pusty ilustracyjny void.

---

## 10. Responsive

- Desktop: priorytet gęstości menedżerskiej (tabele, składy).
- Mobile: priorytet CTA i skróconych list; pełne tabele → progressive disclosure.
- Touch targets wystarczające; bez hover-only krytycznych akcji.

---

## 11. Dostępność (cele)

- Kontrast AA dla tekstu kluczowego.
- Fokus klawiatury widoczny.
- Semantyka nagłówków i etykiet formularzy.
- Nie polegać wyłącznie na kolorze w wynikach/formie.

---

## 12. Copy UI

- Krótko, po polsku (produkt PL), bez żargonu inżynierskiego.
- Czasowniki w CTA: „Ustaw skład”, „Zagraj mecz”, „Złóż ofertę”.
- Błędy: co poszło nie tak + jak naprawić.

---

## 13. Czego nie robimy (hard no)

- Losowe badge’e, chipy i promo stickery na hero / boisku.
- Glow, neon, multi-layer shadow stacks.
- Emoji jako substytut ikon systemu.
- Kilka CTA równorzędnych na jednym viewportcie.
- Przebudowa całego UI „pod chwilowy trend”.

---

## 14. Proces projektowy

1. Rozdział GDD definiuje **cel ekranu**.
2. Ten guide definiuje **jak** to wygląda i zachowuje się.
3. Dopiero potem implementacja w `apps/web`.
4. Zmiany wizualne globalne → aktualizacja tego dokumentu.

---

## 15. Do opracowania (GDD-02+)

- [ ] Design tokens (kolor, typo, spacing, radius)
- [ ] Biblioteka komponentów (nazwy + stany)
- [ ] Wireframes: Hub, Skład, Mecz, Transfery
- [ ] Icon set policy
- [ ] Match view layout (Canvas LFE = dumb renderer)

---

## Historia

| Wersja | Data | Zmiana |
|--------|------|--------|
| 0.1.0-gdd01 | 2026-07-23 | Zasady bazowe UI (GDD-01) |
