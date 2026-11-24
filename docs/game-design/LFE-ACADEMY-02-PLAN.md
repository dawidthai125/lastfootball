# LFE-ACADEMY-02 — PLAN (propozycja liczb)

**Status:** PROPOZYCJA · czeka na Owner GO · bez kodu
**Data:** 2026-11-24
**Punkt wyjścia:** D133 (nabór co 7 dni, 3 miejsca, komputer płaci 10% za juniora), GDD §16.13–16.14.

Zasady bez zmian: zero automatycznego wzrostu, zero osobnego OVR akademii, potencjał tylko jako pasmo, rozwój główny = mecze po promocji.

## 1. Poziomy akademii

| Poziom | Budowa  | Utrzymanie / mecz | Miejsca | Nabór co | Kandydaci | Start (skill) |
| ------ | ------- | ----------------- | ------- | -------- | --------- | ------------- |
| 0      | —       | 0                 | 3       | 7 dni    | 1         | 40–52         |
| 1      | 30 000  | 500               | 4       | 6 dni    | 1 z 2     | 42–53         |
| 2      | 60 000  | 1 000             | 5       | 5 dni    | 1 z 2     | 44–54         |
| 3      | 110 000 | 1 500             | 6       | 4 dni    | 1 z 3     | 46–56         |

„1 z 2” = menedżer wybiera jednego z pokazanych kandydatów. Poziom daje lepszą decyzję, nie darmowy wzrost.

## 2. Trening juniora

- Jeden junior dziennie, 1 000 EUR, +1 do jednej grupy atrybutów, najwyżej +6 na sezon na juniora i nigdy ponad potencjał.
- Tylko do 19 lat. Po 19. urodzinach junior musi zostać wypromowany albo odchodzi na koniec sezonu (ostrzeżenie w Wiadomościach).

## 3. Sprzedaż wychowanka

| Mecze w seniorach | Cena od komputera |
| ----------------- | ----------------- |
| 0–9               | 10%               |
| 10–21             | 25%               |
| 22 i więcej       | 50%               |

Handel między menedżerami bez zmian.

## 4. Bilans (IV liga, środek tabeli, sezon 22 mecze)

| Poziom | Utrzymanie | Naborów | Sprzedaż wszystkich po 10% | Wynik sezonu |
| ------ | ---------- | ------- | -------------------------- | ------------ |
| 0      | 0          | 3       | ok. 33 000                 | +33 000      |
| 1      | 11 000     | 3–4     | ok. 39 000                 | +28 000      |
| 2      | 22 000     | 4–5     | ok. 51 000                 | +29 000      |
| 3      | 33 000     | 5–6     | ok. 65 000                 | +32 000      |

Rozbudowa nie zarabia na hurtowej sprzedaży. Opłaca się, gdy junior gra: 22 mecze podnoszą cenę do 50% (ok. 55 000+) albo daje zawodnika do składu.

## 5. Zakres techniczny

- `clubs.academy_level` (0–3) pod `lf_guard_clubs`, koszt przez `writeClubCash`, kategorie `academy_build`, `academy_upkeep`, `academy_training`.
- Utrzymanie w `settle_fixture` razem z pensjami; liczba meczów wychowanka z nowej kolumny `senior_matches` (przyrost w `apply_match_development`).
- Kandydaci deterministyczni z klubu, sezonu i numeru naboru (bez losowania przez odświeżenie).
- UI akademii: poziom, rozbudowa, wybór kandydata, trening dnia, odliczanie do naboru.
- Wielkość: 2 PR (silnik i migracja, potem UI), bez zmian w LFE.

## 6. Do decyzji

1. Koszty budowy 30 / 60 / 110 tys. EUR.
2. Utrzymanie 500 / 1 000 / 1 500 EUR za mecz.
3. Trening juniora 1 000 EUR dziennie, +6 na sezon.
4. Cena wychowanka 10% / 25% / 50%.
5. Wiek graniczny 19 lat.
