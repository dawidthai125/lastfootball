# LFE-UI-WIREFRAMES-01 — LOW-FIDELITY WIREFRAMES

**EPIC:** LFE-UI-WIREFRAMES-01  
**Data:** 2026-07-29  
**Wierność:** **LOW** — bloki · etykiety · hierarchia · **bez** koloru · **bez** typografii finalnej · **bez** assetów renderowanych

> IA: [`LFE-UI-WIREFRAMES-01-IA.md`](./LFE-UI-WIREFRAMES-01-IA.md)  
> Flows: [`LFE-UI-WIREFRAMES-01-FLOWS.md`](./LFE-UI-WIREFRAMES-01-FLOWS.md)

**Legenda bloków:**

```
[==== HERO / WA ====]   LocationHero (slot World Art)
[ DECISION ]            DecisionBlock
[◆ PRIMARY ]            Primary CTA
[○ SEC ]                Secondary
[~ soft ~]              Soft-link
[ context row ]         Context / lista
```

---

## 1. Shell — Desktop

**ID:** WF-SHELL-D · **P0**

```
┌─────────────────────────────────────────────────────────────┐
│ TOPBAR: [Crest]  [Faza/Dzień]  [Kasa: n]  [Live?]            │
├──────────┬──────────────────────────────────────────────────┤
│ NAV      │  MAIN                                            │
│ [ICO]Hub │  (treść ekranu: Hero → Decision → Context)       │
│ [ICO]Trn │                                                  │
│ [ICO]Sqd │                                                  │
│ [ICO]Xfr │                                                  │
│ [ICO]More│                                                  │
│          │                                                  │
├──────────┴──────────────────────────────────────────────────┤
│ STATUS (opcjonalnie): hint sesji / soft-lock — nie KPI wall │
└─────────────────────────────────────────────────────────────┘
```

| Pole           | Wartość                                 |
| -------------- | --------------------------------------- |
| **Cel**        | Orientacja + dostęp do P0               |
| **Akcje**      | Nav lokacji · (TopBar bez dominant CTA) |
| **Komponenty** | AppShell · TopBar · NavItem · Status    |
| **World Art**  | `BG-001` · `TEX-001` · `ICO-*` · crest  |
| **Powiązania** | Wszystkie SCR P0                        |

**Breadcrumbs (desktop, głębokość ≥2):**

```
Kadra  >  Gracz
Transfery  >  Oferta
```

Hub: **brak** breadcrumb.

---

## 2. Shell — Mobile (Variant A)

**ID:** WF-SHELL-M · **P0**

```
┌──────────────────────┐
│ TOPBAR thin          │
│ [Crest] [Kasa]       │
├──────────────────────┤
│                      │
│ MAIN (stack)         │
│ Hero → Decision →    │
│ Context (scroll)     │
│                      │
├──────────────────────┤
│ BOTTOM NAV           │
│ Hub Trn Sqd Xfr More │
└──────────────────────┘
```

Primary CTA: **full-width**, touch ≥44px.

---

## 3. Hub — dzień meczowy

**ID ekranu:** SCR-HUB-01 · **WF-HUB-01** · **P0**

```
┌────────────────────────────────────────┐
│ [= HERO Gabinet WA HERO-001 / BG-002 =]│
│   (atmosfera ≤10% — miejsce na treść)  │
├────────────────────────────────────────┤
│ DECISION                               │
│ Sprawa: najbliższy mecz / VS / meta×1  │
│ [◆ IDŹ DO MECZU          PRIMARY]      │
│ [○ Trening] [○ Kadra] [○ Transfery]    │
│ [○ Finanse] [○ Terminarz]              │
├────────────────────────────────────────┤
│ CONTEXT (opcjonalnie pod foldem)       │
│ ~ jedna linia: Okno · Kasa ~           │
└────────────────────────────────────────┘
```

| Pole                | Wartość                                                       |
| ------------------- | ------------------------------------------------------------- |
| **Cel użytkownika** | Wybrać jedną ścieżkę dnia                                     |
| **Główne akcje**    | ◆ Match · ○ pętla ≤5                                          |
| **Komponenty**      | LocationHero · DecisionBlock · Primary · Secondary · SoftLink |
| **World Art**       | `HERO-001` · `BG-002` · `OFF-*` · `ICO-001`                   |
| **Powiązania**      | → Match Path · Training · Squad · Transfers · Finance         |

**Wariant idle (SCR-HUB-02):** ten sam szkielet; treść Decision z resolvera (nie Matchday).  
**EARLY (SCR-HUB-04):** bez dodatkowych kart KPI.

---

## 4. Match — Tunnel / First

**ID:** SCR-MCH-01 · **WF-MCH-01** · **P0**

```
┌────────────────────────────────────────┐
│ [======== HERO Tunnel HERO-002 ========]│
│                                        │
│ DECISION (nisko / overlay bottom)      │
│ [◆ WEJDŹ / DALEJ              ]        │
└────────────────────────────────────────┘
```

Chrome nav: **ukryty lub minimal** (immersive entry).

---

## 5. Match — Kick-Off / VS

**ID:** SCR-MCH-02 · **WF-MCH-02** · **P0**

```
┌────────────────────────────────────────┐
│ [==== HERO Pitch / MOM-001 slot ====]  │
├────────────────────────────────────────┤
│ DECISION                               │
│ [Klub A]  VS  [Klub B]                 │
│ meta: data · rozgrywki (1 linia)       │
│ [◆ ROZPOCZNIJ / DALEJ         ]        │
│ [~ Ustaw skład ~]                      │
└────────────────────────────────────────┘
```

| **World Art** | `HERO-003` · `MOM-001` · `BDG-001` |
| **Powiązania** | → MCH-03 · SQD-04 · Live |

---

## 6. Match — Pre-match checklist

**ID:** SCR-MCH-03 · **WF-MCH-03** · **P0**

```
┌────────────────────────────────────────┐
│ HERO thin / dialect tunnel-pitch       │
├────────────────────────────────────────┤
│ DECISION — checklist                   │
│ [ ] Skład gotowy                       │
│ [ ] (inne istniejące punkty)           │
│ [◆ START MECZU                ]        │
│ [~ Edytuj skład ~]                     │
└────────────────────────────────────────┘
```

---

## 7. Match — Skład XI (w path)

**ID:** SCR-SQD-04 · **WF-SQD-04** · **P0**

```
┌────────────────────────────────────────┐
│ DECISION: Ustaw skład (XI)             │
│ [◆ ZAPISZ I DALEJ             ]        │
├────────────────────────────────────────┤
│ CONTEXT: lista / pitch slots (lo-fi)   │
│ [ player row ]                         │
│ [ player row ]                         │
│ ...                                    │
│ [~ Wróć do checklist ~]                │
└────────────────────────────────────────┘
```

Copy: **Skład**, nie „Kadra”.

---

## 8. Match — Live

**ID:** SCR-MCH-04 · **WF-MCH-04** · **P0**

```
┌────────────────────────────────────────┐
│ STATUS: [LIVE]  wynik  minuta          │
│ [= WA strip SUP/BG opcjonalnie =]      │
├────────────────────────────────────────┤
│ CONTEXT: feed zdarzeń (scroll)         │
│ [ event ]                              │
│ [ event ]                              │
│ (brak drugiego Primary gold)           │
└────────────────────────────────────────┘
```

| **World Art** | `ICO-016` · `SUP-001` · `FLD-*` · `BG-003` |

---

## 9. Match — Goal overlay

**ID:** SCR-MCH-05 · **WF-MCH-05** · **P0**

```
┌────────────────────────────────────────┐
│         [ MOM-002 overlay ]            │
│         GOL / wynik chwilowy           │
│         (tap / auto dismiss)           │
└────────────────────────────────────────┘
```

Nie dokładać floating badge poza momentem.

---

## 10. Match — Final + Post

**ID:** SCR-MCH-07 · **WF-MCH-07** · **P0**

```
│ [ MOM-003 Final whistle ]              │
│ [◆ DALEJ DO PODSUMOWANIA    ]          │
```

**ID:** SCR-MCH-08 · **WF-MCH-08** · **P0**

```
┌────────────────────────────────────────┐
│ HERO thin / crowd dialect              │
├────────────────────────────────────────┤
│ DECISION: wynik + 1 wniosek            │
│ [◆ WRÓĆ DO HUBU               ]        │
├────────────────────────────────────────┤
│ CONTEXT: skrót zdarzeń / oceny         │
└────────────────────────────────────────┘
```

---

## 11. Squad — lista Kadra

**ID:** SCR-SQD-01 · **WF-SQD-01** · **P0**

```
┌────────────────────────────────────────┐
│ [= HERO Szatnia HERO-004 =]            │
├────────────────────────────────────────┤
│ DECISION: pytanie dnia                 │
│ [◆ AKCJA DNIA (jeśli jest)    ]        │
│ [~ Trening ~]                          │
├────────────────────────────────────────┤
│ CONTEXT: PlayerRow list                │
│ [ koszulka | nazwisko | status ]       │
│ [ ... ]                                │
└────────────────────────────────────────┘
```

Breadcrumb: brak (root lokacji).

---

## 12. Squad — detal gracza

**ID:** SCR-SQD-03 · **WF-SQD-03** · **P0**

```
┌────────────────────────────────────────┐
│ BC: Kadra > Gracz                      │
│ HERO thin / prop SHT                   │
├────────────────────────────────────────┤
│ DECISION / nagłówek gracza             │
│ [~ Trening ~]  [ wstecz ]              │
├────────────────────────────────────────┤
│ CONTEXT: atrybuty / status             │
└────────────────────────────────────────┘
```

---

## 13. Training

**ID:** SCR-TRN-01 · **WF-TRN-01** · **P0**

```
┌────────────────────────────────────────┐
│ [= HERO Trening HERO-006 =]            │
├────────────────────────────────────────┤
│ DECISION: pytanie dnia                 │
│ [◆ PRZEPROWADŹ SESJĘ          ]        │
│ [~ Hub ~] [~ Kadra ~]                  │
└────────────────────────────────────────┘
```

**ID:** SCR-TRN-02 · **WF-TRN-02** soft-lock

```
│ [ ILL-002 SoftLockState ]              │
│ Wyjaśnienie unlock                     │
│ [○ Wróć do Hubu]                       │
```

---

## 14. Transfers — inbox + detal

**ID:** SCR-XFR-01 · **WF-XFR-01** · **P0**

```
┌────────────────────────────────────────┐
│ [= HERO Transfer HERO-005 =]           │
├────────────────────────────────────────┤
│ DECISION: najbliższa sprawa / oferta   │
│ [◆ OTWÓRZ OFERTĘ / AKCJA      ]        │
├────────────────────────────────────────┤
│ CONTEXT: lista ofert                   │
│ [ oferta row ]                         │
└────────────────────────────────────────┘
```

**ID:** SCR-XFR-02 · **WF-XFR-02**

```
│ BC: Transfery > Oferta                 │
│ DECISION: Accept / Reject              │
│ [◆ ACCEPT]  [○ REJECT]                 │
│ [~ Finanse ~] [~ Kadra ~]              │
│ CONTEXT: warunki (browse)              │
```

**ID:** SCR-XFR-03 okno zamknięte — SoftLock `ILL-003`.

---

## 15. Finance

**ID:** SCR-FIN-01 · **WF-FIN-01** · **P0**

```
┌────────────────────────────────────────┐
│ [= HERO Finanse HERO-007 =]            │
├────────────────────────────────────────┤
│ DECISION: pytanie + saldo (1 liczba)   │
│ [◆ AKCJA DNIA (jeśli resolver) ]       │
│ [~ Transfery ~]                        │
├────────────────────────────────────────┤
│ CONTEXT: kategorie / ruchy             │
│ [ row ]                                │
└────────────────────────────────────────┘
```

---

## 16. Overlay — Soft-lock global

**ID:** SCR-SYS-04 · **WF-SYS-04**

```
┌────────────────────────────────────────┐
│          [ MODAL SoftLock ]            │
│          ICO-020 + copy                │
│          [○ Wróć]                      │
└────────────────────────────────────────┘
```

---

## 17. Zasady lo-fi (DoD wireframe)

- [x] Brak kolorów / Hi-Fi / mock pixel-perfect
- [x] Jedno Primary na ekran decyzji
- [x] Hub Secondary ≤5
- [x] Hero nie zasłania Decision
- [x] Mobile stack + bottom nav opisane
- [x] Breadcrumbs tylko głębokość ≥2

---

## Historia

| Wersja | Data       | Opis                              |
| ------ | ---------- | --------------------------------- |
| 0.1.0  | 2026-07-29 | Lo-fi wireframes P0 · ASCII bloki |
