# Platform — Invitations (Invitation Layer)

## Cel

In-app **Invitation Layer** (GDD §22 kod Thin) — opcjonalne zaproszenie do decyzji już istniejącej w grze.  
**SSOT danych UI zaproszeń:** wyłącznie `resolveClubInvitations`.

**≠ Messages (§21):** skrzynka = skutek; Invitation = soft remind.  
**≠ Hub Primary (§23):** Invitation nigdy nie jest Primary.

## Kontrakt (LFE-NOTIFICATIONS-01 · D125)

| Fakt        | Reguła                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------- |
| Composition | Pure derive z `ClubMessagesDto` (`priority: 'decision'`) + Hub Primary matchday             |
| Limit       | **≤1** item w `ClubInvitationsDto`                                                          |
| Priorytet   | Transfer decision → Matchday                                                                |
| Persist     | **brak** DB / migracji / mark-as-read                                                       |
| Dismiss     | wyłącznie **`sessionStorage`** (`lf:invitation:dismissed:{id}`) w presentation host         |
| Deep-link   | istniejące `href` (Transfery / match tunnel)                                                |
| Kanały      | **bez** Web Push · **bez** Email                                                            |
| Naming      | `resolveClubInvitations` / `ClubInvitationDto` — **zakaz** `Notification*` w resolverze/DTO |
| LFE/PUBLIC  | **bez zmian**                                                                               |

## Decyzje

**D125** · granice D40–D46 (Messages) · [`../DECISIONS.md`](../DECISIONS.md)  
PLAN: [`../implementation/LFE-NOTIFICATIONS-01-PLAN.md`](../implementation/LFE-NOTIFICATIONS-01-PLAN.md)

## Kod

`apps/web/src/lib/invitations/` · `InvitationToastHost` · `ClubProvider.invitations` · Overlay kind = **`messages`** (D43 peek skrzynki)

## Last updated

2026-08-04 — LFE-NOTIFICATIONS-01 CLOSED · feat `54ae7b3` · D125
