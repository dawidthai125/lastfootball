# LFE-AUTH-UX-01 — IMPLEMENTATION NOTES

**EPIC:** LFE-AUTH-UX-01  
**Data:** 2026-07-29  
**Zakres:** UX/UI Auth + Landing chrome — bez zmian logiki auth

---

## 1. Co wdrożono

### Header premium

- Lokalna wysokość `--lf-landing-header-h` (nie ruszamy Hub `--lf-shell-topbar`)
- Większe logo (`BrandLogo` size `xl`)
- Więcej paddingu / powietrza
- CTA „Zaloguj się” jako gold outline button

### Login Modal (Landing)

- `LandingChrome` hostuje stan modala
- Header + Hero secondary otwierają modal (Landing zostaje w tle)
- Backdrop blur · animacja · ESC · click outside · focus trap · restore focus
- Reuse `LoginForm` (ta sama akcja `signInWithPassword`)

### `/login` i `/register`

- `AuthStage` — full-bleed Tunnel HERO-002 + panel brandowy
- Szerszy layout · większy branding · mocniejsza hierarchia
- Register CTA copy: „Rozpocznij karierę” (presentation only)
- `/login` nadal działa dla bookmarków / SEO / redirectów

### Formularze

- Style prezentacyjne przez `.lf-auth-form` (większe inputy, focus gold)
- Bez zmian API `FormControls` / actions auth

---

## 2. Pliki kluczowe

| Plik                                   | Rola                                 |
| -------------------------------------- | ------------------------------------ |
| `LandingChrome.tsx`                    | Provider + modal host                |
| `LoginModal.tsx`                       | Dialog a11y                          |
| `LandingHeader.tsx`                    | Premium header                       |
| `LandingHeroCtas.tsx`                  | Hero CTAs + modal                    |
| `AuthStage.tsx`                        | Tunnel + panel                       |
| `landing.css`                          | Header / modal / stage / form polish |
| `(marketing)/layout.tsx`               | LandingChrome                        |
| `login/page.tsx` · `register/page.tsx` | AuthStage                            |

---

## 3. Świadomie poza zakresem

- World Art PNG / Branding SVG / tokeny DS / Visual DNA
- Logika `signInWithPassword` / `signUpWithPassword`
- K2 Shield
- Zmiana Hub TopBar height

---

## Historia

| Wersja | Data       | Opis      |
| ------ | ---------- | --------- |
| 1.0.0  | 2026-07-29 | IMPLEMENT |
