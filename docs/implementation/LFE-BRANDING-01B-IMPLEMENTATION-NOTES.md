# LFE-BRANDING-01B — IMPLEMENTATION NOTES

**EPIC:** LFE-BRANDING-01B  
**Etap:** BRAND IMPLEMENTATION  
**Data:** 2026-07-29

---

## 1. Zakres wdrożenia

Wdrożono zaakceptowany kierunek Ownera:

- **K1** — geometryczny monogram LF (bezszeryfowy, minimalistyczny, czytelny)
- **K3** — wordmark `LASTFOOTBALL` (bez spacji)

Bez wdrażania K2 (Shield) i bez zmian Visual DNA / World Art / tokenów.

---

## 2. Pakiet assetów

Dodane/uzupełnione w `apps/web/public`:

- `logo.svg`
- `logo-dark.svg`
- `logo-light.svg`
- `monogram.svg`
- `favicon.svg`
- `favicon.ico`
- `apple-touch-icon.png`
- `icon-192.png`
- `icon-512.png`
- `social-preview.png`

---

## 3. Integracja w aplikacji

### Komponent brandowy

- Dodano `BrandLogo` (`apps/web/src/components/assets/BrandLogo.tsx`) jako jedyny punkt użycia logo.
- Eksport przez `apps/web/src/components/assets/index.ts`.

### Miejsca podmiany brandingu

- `LandingHeader` — usunięty stary CSS mark (złoty kwadrat), wstawiony lockup K1+K3.
- `LandingPage` — hero brand i footer brand podmienione na nowy system logo.
- `TopBar` (Hub/Dashboard) — stary tekst „LastFootball · …” zastąpiony monogramem + fazą.
- `LeftNavigation` (Navbar) — dodany branding produktu (wordmark/monogram) w nagłówku nav.
- `layout.tsx` metadata — ikony, OpenGraph i Twitter image ustawione na nowy pakiet.
- Dodano `app/manifest.ts` z ikonami 192/512 i ustawieniami PWA.

---

## 4. Co celowo pozostało bez zmian

- World Art (assety lokacji i ich użycie)
- Design System i tokeny kolorów/spacing/typo
- Nazwa produktu (`LastFootball`)
- K2 Shield jako element przyszłego EPICu Prestige

---

## 5. Uwagi techniczne

- Monogram został zaprojektowany pod czytelność przy małych rozmiarach (16/32/64).
- Wordmark pozostaje uppercase `LASTFOOTBALL` zgodnie z decyzją Ownera.
- Meta obraz (`social-preview.png`) używa nowego lockupu i spójnej palety Night Pitch Office.
