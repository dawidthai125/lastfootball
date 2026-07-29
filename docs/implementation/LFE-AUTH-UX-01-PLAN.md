# LFE-AUTH-UX-01 — PLAN

**EPIC:** LFE-AUTH-UX-01  
**Etap:** AUTH EXPERIENCE REDESIGN (IMPLEMENT)  
**Data:** 2026-07-29  
**Wejście:** Owner GO · UX Review po Landing + Branding  
**Zakres:** prezentacja Auth / Landing chrome — **bez** zmian logiki auth

---

## 0. Cel

Spójne doświadczenie: Landing ↔ Login Modal ↔ `/login` ↔ `/register` w estetyce Night Pitch Office / UI P0.

---

## 1. Decyzje Ownera (lock)

| #   | Decyzja          | Wartość                                                   |
| --- | ---------------- | --------------------------------------------------------- |
| 1   | Header „Zaloguj” | Otwiera **modal** (Landing w tle)                         |
| 2   | `/login`         | Pozostaje (linki / SEO / logout) · wizualnie jak Landing  |
| 3   | `/register`      | Osobny ekran · premium career-start                       |
| 4   | Header           | Wyższy · więcej powietrza · większe logo · mocniejsze CTA |
| 5   | Logika auth      | **Bez zmian** (`signIn` / `signUp` / actions)             |

**Bez zmian:** World Art pliki · Branding SVG · tokeny DS · Visual DNA · kolorystyka.

---

## 2. Architektura presentation

| Element          | Implementacja                                                                 |
| ---------------- | ----------------------------------------------------------------------------- |
| Marketing chrome | Client `LandingChrome` — header + Login Modal state                           |
| Login Modal      | Dialog · blur backdrop · ESC · outside click · focus trap · reuse `LoginForm` |
| Auth stage       | Full-bleed Tunnel HERO-002 + panel (login/register pages)                     |
| Header height    | **Lokalny** CSS marketing (nie zmieniać `--lf-shell-topbar` Hub)              |
| Form fields      | Style przez `.lf-auth-form` — bez przebudowy globalnego `FormControls` API    |

---

## 3. Pliki (plan)

| Plik                                   | Akcja                                     |
| -------------------------------------- | ----------------------------------------- |
| `LandingChrome.tsx`                    | Nowy — provider + modal host              |
| `LoginModal.tsx`                       | Nowy — a11y dialog                        |
| `LandingHeader.tsx`                    | Premium header · onLogin click            |
| `AuthStage.tsx`                        | Nowy — Tunnel + panel shell               |
| `(marketing)/layout.tsx`               | Używa LandingChrome                       |
| `(auth)/layout.tsx`                    | Auth stage–friendly                       |
| `login/page.tsx` · `register/page.tsx` | AuthStage wrap                            |
| `landing.css`                          | Header · modal · auth stage · form polish |
| `LandingPage.tsx`                      | Hero secondary → open modal (context)     |
| Docs PLAN / NOTES / TEST-PLAN          | Ten EPIC                                  |

---

## 4. Quality Gate

- [x] Landing + Auth = jedno doświadczenie
- [x] Header premium · logo eksponowane
- [x] Login Modal: blur · anim · ESC · outside · focus trap
- [x] `/login` · `/register` jak część gry
- [x] Brak regresji auth logic
- [ ] typecheck · lint · test · build · **CI GREEN**

---

## Historia

| Wersja | Data       | Opis                       |
| ------ | ---------- | -------------------------- |
| 1.0.0  | 2026-07-29 | Plan IMPLEMENT po Owner GO |
| 1.1.0  | 2026-07-29 | Implementacja lokalna      |
