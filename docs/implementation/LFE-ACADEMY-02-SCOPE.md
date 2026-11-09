# LFE-ACADEMY-02 — SCOPE LOCK

**Data:** 2026-11-09  
**Owner GO:** tak, na zapis zakresu. Kod akademii **nie** wchodzi w tym EPIC-u.  
**SSOT:** GDD §16.14 · §16.17 · D23.

## Werdykt

Thin A jest zamknięte: Intake + Promote. LFE-ACADEMY-02 **nie dostaje implementacji**, dopóki GDD nie zmieni §16 i §26 nie poda liczb.

## W zakresie

Nic nowego w domenie, bazie ani UI akademii.

## Poza zakresem

| Element                                  | Dlaczego                                             |
| ---------------------------------------- | ---------------------------------------------------- |
| Poziomy, gwiazdki, rating ośrodka        | GDD §16.14 = Future                                  |
| Cash-gate, koszty, paywall               | §16.11 = filozofia bez liczb; liczby tylko przez §26 |
| Trening akademii, mecze młodzieżowe      | §16.7 zakaz w Thin A                                 |
| Auto-promote                             | §16.14 Future                                        |
| Youth / academy OVR                      | zakaz także w Future (§16.14)                        |
| Retirement, Career Prime, push/email §22 | osobny kontrakt, nie ten plik                        |

## Warunek odblokowania

Osobna zmiana GDD §16 plus liczby w §26. Bez tego nie ma kodu akademii.

## Następny kod

**LFE-SPATIAL-EVENTS-01** — `4377677`. Boisko już czyta `getSpatialState()`. Piłka idzie na wznowienie po GOAL, CORNER, PENALTY i FREE_KICK (40 ticków, 20 ticków/s), potem wraca do otwartej gry. To nie jest Physics i nie jest druga piłka w UI.
