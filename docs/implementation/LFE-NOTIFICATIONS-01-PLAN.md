# LFE-NOTIFICATIONS-01 — PLAN (In-App Invitation Layer)

**EPIC:** LFE-NOTIFICATIONS-01  
**Typ:** Information Thin · Invitation Layer (GDD §22 in-app kod) — **bez** Web Push · **bez** Email  
**Data:** 2026-08-04  
**Wejście:** AUDIT COMPLETE · Owner **GO PLAN**  
**Status PLAN:** **READY FOR OWNER GO IMPLEMENT**  
**Baseline wejścia:** Domain `3c01baa` · HEAD `021b06d` · D1–D124 · GDD-22 CLOSED (docs) · LFE-MESSAGES-01 CLOSED (`800ed0d`)

> **Nazwa EPIC-u** (`LFE-NOTIFICATIONS-01`) pozostaje ID historycznym.  
> **Nazwy kodu / DTO / resolvera:** wyłącznie **Invitation** — **zakaz** `Notifications` / `resolveClubNotifications` / `ClubNotificationsDto`.

---

## 0. Cel

Wdrożyć **in-app Invitation Layer**: maksymalnie **jedno** aktywne zaproszenie (toast/banner) podczas gry, które:

- **wskazuje** istniejącą sprawę / moment decyzji (Transfer Decisions + Matchday),
- **deep-linkuje** do istniejącego modułu,
- **nie** wymusza decyzji (§22.1a),
- **nie** jest jedynym nośnikiem informacji (§22.1b — Hub · Inbox · domena pozostają),
- maksymalnie **REUSE** `resolveClubMessages` + Hub (`resolvePrimaryCta` / session),
- **bez** migracji · Web Push · Email · zmian LFE / PUBLIC API.

**Zasada nadrzędna (Owner freeze)**

> Zaproszenie jest opcjonalnym przyspieszeniem uwagi do decyzji już istniejącej w grze — nigdy SSOT decyzji i nigdy drugim inboxem.

---

## 1. Architecture Freeze (nienaruszalne)

### 1.1 Decyzje Ownera (F1–F11)

| # | Decyzja | Freeze |
| --- | --- | --- |
| F1 | Źródła v1 = **Wariant B** | Transfer Decisions (**Messages** `priority: 'decision'` = E2/E3) **+** Matchday (Hub Primary) |
| F2 | Max REUSE Messages + Hub | Composition only — **zakaz** re-derive ofert / fee / XI / fixtures planner |
| F3 | Migracja | **NIE** |
| F4 | Web Push | **NIE** (OUT · Future osobny EPIC) |
| F5 | Email | **NIE** (OUT) |
| F6 | Aktywne zaproszenia | **≤ 1** |
| F7 | Dismiss | **wyłącznie `sessionStorage`** (plus UI state odzwierciedlający dismiss) |
| F8 | Presentation ≠ Domain | Toast/banner = prezentacja; reguły biznesowe w domenie / Hub / Messages |
| F9 | NO DUPLICATE LOGIC | Jedna reguła sprawczości = istniejące resolvery; Invitation = projekcja |
| F10 | PUBLIC API | **bez zmian** |
| F11 | LFE | **bez zmian** |

### 1.2 Naming Freeze (Invitation Layer)

| Pojęcie | Nazwa kanoniczna | Zakaz |
| --- | --- | --- |
| Resolver | `resolveClubInvitations` | `*Notification*` w nowym kodzie resolver/DTO |
| DTO lista | `ClubInvitationsDto` | `ClubNotificationsDto` |
| DTO item | `ClubInvitationDto` | `ClubNotificationDto` |
| Moduł Web | `apps/web/src/lib/invitations/` | `lib/notifications/` (nowy) |
| UI host | `InvitationToastHost` (lub równoważne Invitation\*) | `NotificationToast*` jako nazwa warstwy §22 |
| Rola produktowa | **Invitation** / zaproszenie (§22) | mylenie z **Messages** / wiadomość (§21) |
| EPIC ID | `LFE-NOTIFICATIONS-01` (docs/ID) | — (ID historyczne OK) |

**Słownik sesji (wiążący)**

| Termin | Znaczenie |
| --- | --- |
| **Invitation** | Soft remind in-app (§22) — zaproszenie do decyzji |
| **Message** | Pozycja skrzynki (§21) — skutek; SSOT UI = `resolveClubMessages` |
| **Overlay Messages** | Peek skrzynki (D43) — **nie** Invitation Layer |
| **Hub Primary** | SSOT „co teraz” (§23) — Invitation **nigdy** nie jest Primary |

### 1.3 Warstwy (SSOT map)

```
Domain facts (Transfers · Fixtures · Club · Training unlock)
        │
        ├─► resolveClubMessages      → ClubMessagesDto     (§21 · Overlay D43)
        └─► resolvePrimaryCta        → HubCta (+ HubSession) (§23)
                │
                ▼
     resolveClubInvitations(input)   ← Thin composition (Web only)
                │  pure · ≤1 item · REUSE id/href/subject z Messages / Primary
                │  NIE woła resolveIncomingOffers / fee / settlement / LFE
                ▼
     ClubInvitationsDto
                │
                ▼
     InvitationToastHost (AppShell · game chrome)
                │  dismiss → sessionStorage key per invitation.id
                └─ click → istniejący href (moduł domeny / match path)
```

| Warstwa | Owner | Invitation |
| --- | --- | --- |
| Transfery / Messages | `resolveClubMessages` (D40–D46) | Wejście: tylko `priority: 'decision'` |
| Hub Primary | `resolvePrimaryCta` | Wejście: matchday Primary (`play-next-match`) |
| Invitation Layer | `resolveClubInvitations` | Projekcja ≤1 zaproszenia |
| Presentation | `InvitationToastHost` | Toast/banner · Guide §16 |
| Dismiss | `sessionStorage` | Per `invitation.id` · sesja przeglądarki |
| LFE / PUBLIC | freeze D119–D121 | **out of scope** |

### 1.4 Priorytet wyboru (≤1)

Gdy oba sygnały istnieją, **jedna** reguła sort/pick w resolverze (UI nie filtruje):

1. **Transfer decision** (Messages E2/E3) — sprawa wymagająca akcji na rynku  
2. **Matchday** — Primary `play-next-match` z `nextFixture`

**Suppress (nie emituj invitation):**

- brak sygnałów Wariantu B,
- Matchday invitation gdy użytkownik jest już na ścieżce decyzji meczu / Hubie z tym samym celem (pathname gate w **presentation** lub input `suppressMatchday: boolean` z layoutu — preferowane: flag w input resolvera, wyliczona w layout/host z pathname; **bez** logiki domeny w UI poza pathname),
- `invitation.id` obecne w dismiss set (`sessionStorage`) — host nie pokazuje; resolver może dostać `dismissedIds` **albo** host filtruje po resolve (preferowane: **host filtruje** po `sessionStorage`, resolver zawsze pure z faktów — ZERO side effects w resolve).

**Freeze dismiss path:** `resolveClubInvitations` = **pure** (bez `sessionStorage`). Dismiss = wyłącznie presentation host.

### 1.5 Kontrakt DTO (Thin)

```ts
type ClubInvitationKind = 'transfer_decision' | 'matchday';

type ClubInvitationDto = {
  readonly id: string; // stable · reuse msg id lub `inv:matchday:${fixtureId}`
  readonly kind: ClubInvitationKind;
  readonly subject: string; // 1 linia · REUSE Messages.subject lub UI_COPY matchday
  readonly href: string; // istniejąca trasa
  readonly source: 'messages' | 'hub';
};

type ClubInvitationsDto = {
  readonly items: readonly ClubInvitationDto[]; // length 0 | 1
};
```

**Zakaz w DTO:** reward · xp · unreadCount · pushPayload · email · dueAt · markAsRead · autoAction · score.

**Input (szkic — IMPLEMENT bez driftu sensu):**

```ts
type ResolveClubInvitationsInput = {
  readonly messages: ClubMessagesDto; // REUSE pełnego DTO; pick decision w resolverze
  readonly hubSession: HubSession;
  readonly primary: HubCta;
  readonly nextFixtureId: string | null;
  /** true = nie emituj matchday (już na Hub/match path) */
  readonly suppressMatchday?: boolean;
};
```

---

## 2. Naming change — Overlay / chrome (IN PLAN)

Cel: odciąć produktowy drift „notifications = §22”.

| Element dziś | Po IMPLEMENT (Thin) | Uwagi |
| --- | --- | --- |
| `OverlayKind = 'notifications'` | `'messages'` | rename symboli + call sites |
| `openNotifications` / `toggleNotifications` | `openMessages` / `toggleMessages` | TopBar · OverlayProvider |
| UI copy dzwonka / overlay | spójne z Messages („Sprawy” / skrzynka) | nie „Powiadomienia push” |
| Nowy toast | Invitation copy (`UI_COPY.invitation*`) | osobny od Messages |

**OUT rename:** nie zmieniać ID EPIC docs historycznych · nie kasować GDD §22 słowa „powiadomienie” (polityka produktu) — w kodzie Web = Invitation.

---

## 3. Zakres Thin (IN)

| # | Element |
| --- | --- |
| 1 | `resolveClubInvitations` + `ClubInvitationsDto` / `ClubInvitationDto` |
| 2 | Wariant B: Messages decision + Hub matchday Primary |
| 3 | `InvitationToastHost` w game `AppShell` — max 1 widoczne po filtrze dismiss |
| 4 | Click → `href`; dismiss → `sessionStorage` key `lf:invitation:dismissed:${id}` (lub równoważny prefix) |
| 5 | Rename Overlay `notifications` → `messages` (chrome) |
| 6 | `UI_COPY` invitation + ewentualny cleanup copy overlay |
| 7 | Testy pure resolver (priority transfer > matchday; empty; suppressMatchday; length ≤1) |
| 8 | Gate: brak mock list · brak LFE import · brak migracji |
| 9 | DOCS CLOSE po PRODUCTION VERIFY (MESSAGES · HUB · MODULE_MAP · DECISIONS D125 · ROADMAP/STATUS/BASELINE/HANDOFF · CHANGELOG) |

---

## 4. Zakres OUT (twarde)

- Web Push · Email · SMS · SDK · quiet hours · cron  
- Migracje / tabele preferencji / mark-as-read / RPC  
- Re-derive ofert, fee, settlement, XI, LFE MatchSession  
- Drugi inbox · Accept/Reject w toascie · mutacje domeny z invitation  
- Emisja E1 Messages `info` (okno transferowe) jako invitation v1  
- Daily Goal / Achievements / Ranking jako źródła v1  
- Zmiana semantyki D40–D46 (Messages SSOT) poza rename Overlay  
- `@lastfootball/lfe` / PUBLIC allowlist / `/testing` / `/advanced`  
- Opcje ustawień opt-in pełne (Future) — Thin = dismiss sesji tylko  

---

## 5. Acceptance Criteria

- [ ] Istnieje `resolveClubInvitations` → `ClubInvitationsDto` z **0 albo 1** itemem (przed filtrem dismiss).
- [ ] Źródła wyłącznie Wariant B (Messages `decision` + Hub matchday Primary).
- [ ] Brak nazw `Notification*` w nowym resolverze/DTO/module path.
- [ ] Toast/banner: klik prowadzi do istniejącego modułu (`href`); dismiss nie mutuje domeny.
- [ ] Dismiss persystuje tylko w **`sessionStorage`** (odświeżenie sesji respektuje dismiss; nowa sesja przeglądarki może znów pokazać).
- [ ] Invitation **nie** jest Hub Primary i nie konkuruje wizualnie jako drugi Primary.
- [ ] `/messages` + Overlay nadal ta sama `ClubMessagesDto` (D43); Overlay kind = **messages**.
- [ ] Zero migracji · zero Web Push · zero Email.
- [ ] Zero zmian LFE / PUBLIC API.
- [ ] NO RUNTIME MOCKS · Presentation ≠ Domain · NO DUPLICATE LOGIC (composition only).
- [ ] Testy pure GREEN; format · typecheck · lint · test · build PASS (VALIDATION).

---

## 6. File Map (IMPLEMENT)

| Plik | Rola |
| --- | --- |
| `apps/web/src/lib/invitations/resolve-club-invitations.ts` | Resolver + typy DTO |
| `apps/web/src/lib/invitations/index.ts` | Barrel PUBLIC Web |
| `apps/web/src/lib/invitations/invitations-01.test.ts` | Pure tests |
| `apps/web/src/components/invitations/InvitationToastHost.tsx` | Presentation host + sessionStorage dismiss |
| `apps/web/src/components/layout/AppShell.tsx` | Mount host |
| `apps/web/src/app/(game)/layout.tsx` i/lub Hub/shell wire | Podaj input (messages już jest; primary/session/suppress) |
| `apps/web/src/components/club/ClubProvider.tsx` | Opcjonalnie: przekaż `invitations` **albo** host liczy client-side z msgs+hub ctx — preferowane: **server resolve w layout** + prop (jak Messages) |
| `apps/web/src/components/overlay/OverlayProvider.tsx` | Rename kind/API → messages |
| `apps/web/src/components/overlay/OverlayRoot.tsx` | `active === 'messages'` |
| `apps/web/src/components/layout/TopBar.tsx` | `toggleMessages` |
| `apps/web/src/lib/ui/copy.ts` | `invitation*` (+ overlay copy jeśli potrzeba) |
| `apps/web/src/styles/*` | Minimal toast styles — REUSE tokens (`--lf-z-toast`) · Guide §16 |
| **Docs CLOSE (później)** | `platform/MESSAGES.md` · `platform/HUB.md` · `AI/MODULE_MAP.md` · `DECISIONS.md` (D125) · `ARCHITECTURAL_DECISIONS.md` · ROADMAP/STATUS/BASELINE/HANDOFF · CHANGELOG · ten PLAN status |

**Nie ruszać:** `packages/lfe/**` · `supabase/**` · transfer settle · Match Engine.

---

## 7. D125 proposal (do zapisu przy DOCS CLOSE)

> Status przy PLAN: **PROPOSED**. Wpis do `docs/DECISIONS.md` dopiero po Owner VERIFY / DOCS CLOSE (jak D122–D124).

### D125 — In-App Invitation Layer (Composition Thin) · PROPOSED

**Dlaczego:** GDD §22 wymaga soft remind in-app bez push/email; Overlay „notifications” myli się ze skrzynką §21 (D43).  
**Zasada:** Jedyny SSOT zaproszeń in-app UI = `resolveClubInvitations` → `ClubInvitationsDto` (≤1); pure composition z `ClubMessagesDto` (decision) + Hub Primary matchday; **nie** drugi inbox i **nie** SSOT decyzji; dismiss wyłącznie `sessionStorage`; zero migracji / push / email; LFE/PUBLIC nienaruszone; nazewnictwo kodu = Invitation (nie Notification).  
**OUT:** Web Push · Email · preferencje DB · E1 info-as-invite · mutacje z toastu · zmiana D40–D46 poza rename Overlay → messages.  
**Relacja:** §22 polityka · §21 Messages (D40–D46) · §23 Hub Primary nadrzędny.

**Źródło (po CLOSE):** LFE-NOTIFICATIONS-01 · feat `TBD` · PLAN [`implementation/LFE-NOTIFICATIONS-01-PLAN.md`](./LFE-NOTIFICATIONS-01-PLAN.md).

---

## 8. IMPLEMENT checklist (po OWNER GO IMPLEMENT)

```
[ ] 0. Potwierdź freeze F1–F11 + naming Invitation (ten PLAN)
[ ] 1. Dodać lib/invitations — typy + resolveClubInvitations (pure)
[ ] 2. Testy: empty · transfer only · matchday only · both→transfer wins · suppressMatchday · length≤1
[ ] 3. Wire input w game layout (REUSE messages; dociągnij primary/session/nextFixture/suppress)
[ ] 4. InvitationToastHost — render ≤1 · Link href · dismiss→sessionStorage
[ ] 5. Mount w AppShell (game chrome only)
[ ] 6. Rename Overlay notifications → messages (Provider · Root · TopBar · typy)
[ ] 7. UI_COPY invitation*
[ ] 8. Styles minimal (z-index toast token)
[ ] 9. VALIDATION: format · typecheck · lint · test · build
[ ] 10. Raport VALIDATION → czekaj OWNER GO COMMIT
[ ] 11. (po GO) COMMIT → PUSH → CI GREEN
[ ] 12. PRODUCTION VERIFY
[ ] 13. DOCS CLOSE (D125 CLOSED + sync SSOT) → DOCS COMMIT/PUSH → FINAL VERIFY
```

**Zakazy do GO IMPLEMENT:** kod poza tym checklistem · commit · push · migracje · LFE.

---

## 9. Ryzyka (PLAN)

| Ryzyko | Mitigacja |
| --- | --- |
| Drift nazwy Notification w PR | Freeze §1.2 + AC + review grep |
| Duplikacja logiki transfer | Input = gotowe `ClubMessagesDto` |
| Toast vs Primary na Hubie | `suppressMatchday` + hierarchia §23 |
| Overlay rename regresja | Test/smoke TopBar + Overlay + D43 |
| sessionStorage SSR | Host client-only; brak storage w resolverze |
| Scope creep push | OUT §4 |

---

## 10. Kryteria zakończenia EPIC-u

EPIC **FULLY CLOSED** dopiero gdy:

1. OWNER GO IMPLEMENT → kod Thin + VALIDATION PASS  
2. OWNER GO COMMIT → PUSH → CI GREEN  
3. PRODUCTION VERIFY PASS  
4. DOCS CLOSE (D125 CLOSED + sync) → DOCS COMMIT/PUSH → FINAL DOCS VERIFY  
5. Raport **EPIC FULLY CLOSED**

Do **OWNER GO IMPLEMENT** status = **PLAN READY**.

---

## 11. Decyzje wymagające OWNER GO IMPLEMENT

- [x] Wariant B  
- [x] REUSE Messages + Hub  
- [x] Brak migracji / push / email  
- [x] ≤1 invitation · sessionStorage dismiss  
- [x] Presentation ≠ Domain · NO DUPLICATE · LFE/PUBLIC freeze  
- [x] Naming = Invitation Layer (`resolveClubInvitations`)  
- [ ] **GO IMPLEMENT** (osobne)

---

## Historia

| Wersja | Data | Opis |
| --- | --- | --- |
| 1.0.0 | 2026-08-04 | PLAN COMPLETE — Owner GO PLAN · Wariant B · Invitation naming · D125 proposed |
