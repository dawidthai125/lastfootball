# Platform — Onboarding Flow

## Cel

Ścieżka nowego gracza od Landing do Hub (stan po LFE-PLATFORM-01 + LFE-MATCH-01 + LFE-HUB-01).

## Flow (produkcja)

```
/ (Landing)
  → /register | /login
  → /welcome                    (authenticated, no club)
  → /onboarding/club            (Club Wizard 4 steps)
  → /onboarding/first-match     (First Match Intro)     ⟵ NIE /hub
  → /match/first                (Prematch)
  → /match/first/live           (Live)
  → Post Match → completeFirstMatch
  → /onboarding/welcome-lf      (Welcome to LastFootball)
  → /hub                        (EARLY_CLUB)
```

## Gates (middleware + session)

| Warunek | Destynacja |
| --- | --- |
| Brak sesji + protected route | `/login?next=…` |
| Sesja, brak wiersza `clubs` | `/welcome` / onboarding |
| `hasClub && !first_match_completed_at` | tylko First Match tunnel |
| `first_match_completed_at` set | `/hub` (i blokada powrotu do intro/wizard) |

Post-auth helper: `getPostAuthPath(userId)` → `/welcome` \| `/onboarding/first-match` \| `/hub`.

## Club Wizard

- 4 kroki: nazwa/skrót → barwy → herb → reveal
- Persist: tabela `clubs` (RLS owner)
- Redirect po create: **`/onboarding/first-match`** (nie Hub)

## Club DTO

Pola (skrót): `id`, `ownerId`, `name`, `shortName`, colors, `crestTemplateId`, `createdAt`, **`firstMatchCompletedAt`**.

Starter package (UI): `STARTER_PACKAGE` — IV liga, stadion label, coach copy.

## Supabase

- Project: `anoeimngwptucjdugjme`
- Auth email/password
- Migrations w `supabase/migrations/` (m.in. clubs identity, `first_match_completed_at`)

## Powiązania

[`FIRST_MATCH.md`](./FIRST_MATCH.md) · [`HUB.md`](./HUB.md) · [`../CONNECTION_STATUS.md`](../CONNECTION_STATUS.md)

## Last updated

2026-07-24 — LFE-DOCS-01
