# LFE-AUTH-UX-01 — TEST PLAN

**EPIC:** LFE-AUTH-UX-01  
**Data:** 2026-07-29

---

## 1. Landing + Modal

- [ ] Header wyższy · logo większe · „Zaloguj się” jako CTA
- [ ] Klik Header „Zaloguj” → modal (bez nawigacji `/login`)
- [ ] Landing widoczny w tle · backdrop blur
- [ ] ESC zamyka · klik poza zamyka · focus trap
- [ ] Hero secondary „Zaloguj się” też otwiera modal
- [ ] Submit w modalu loguje (ta sama logika)

## 2. `/login`

- [ ] Tunnel hero + panel brandowy
- [ ] Formularz działa (email/hasło/`next`)
- [ ] Link „Załóż klub” → `/register`
- [ ] Desktop / tablet / mobile

## 3. `/register`

- [ ] Tunnel hero · career framing
- [ ] CTA „Rozpocznij karierę”
- [ ] Terms checkbox + submit bez zmian logiki
- [ ] Desktop / tablet / mobile

## 4. Accessibility

- [ ] Dialog `aria-modal` · labelledby
- [ ] Focus wraca do triggera po zamknięciu
- [ ] `prefers-reduced-motion` — bez animacji modal/stage

## 5. Regresja

- [ ] Hub TopBar height bez zmian (`--lf-shell-topbar`)
- [ ] Onboarding gate pages nadal czytelne
- [ ] Branding assets niezmienione

## 6. Automaty

- [ ] `typecheck`
- [ ] `lint`
- [ ] `test` (w tym `auth-ux-01.test.ts`)
- [ ] `build`
- [ ] CI GREEN

## 7. Quality Gate

- [ ] Spójne doświadczenie Landing ↔ Auth
- [ ] Header premium · logo eksponowane
- [ ] Login Modal OK
- [ ] `/login` · `/register` jak część gry
- [ ] Brak regresji
- [ ] CI GREEN
