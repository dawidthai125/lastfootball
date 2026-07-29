# LFE-BRANDING-01B — TEST PLAN

**EPIC:** LFE-BRANDING-01B  
**Etap:** BRAND IMPLEMENTATION  
**Data:** 2026-07-29

---

## 1. Brand smoke checks

- [ ] `logo.svg`, `logo-dark.svg`, `logo-light.svg`, `monogram.svg` dostępne z `public/`
- [ ] `favicon.svg` i `favicon.ico` dostępne
- [ ] `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` dostępne
- [ ] `social-preview.png` dostępny

## 2. UI checks — Desktop

- [ ] Landing header używa nowego lockupu (brak starego złotego kwadratu)
- [ ] Landing hero używa wordmarku systemowego
- [ ] Landing footer używa wordmarku systemowego
- [ ] Login/Auth header używa nowego lockupu
- [ ] Hub/TopBar pokazuje nowy monogram produktu
- [ ] Left Navbar zawiera nowy element brandingu produktu

## 3. UI checks — Mobile/Responsive

- [ ] Logo poprawnie skaluje się na mobile (header + hero)
- [ ] Brak overflow/layout break na 360–430 px
- [ ] Retina: logo i monogram bez rozmycia

## 4. Rozmiary krytyczne monogramu

- [ ] 16×16 (favicon)
- [ ] 32×32
- [ ] 64×64
- [ ] 128×128 (wizualna kontrola z `icon-192`)

## 5. Metadata / PWA

- [ ] `metadata.icons` wskazuje nowe pliki
- [ ] `openGraph` i `twitter` wskazują `social-preview.png`
- [ ] `manifest.ts` zwraca ikony 192/512

## 6. Automaty

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] CI GitHub Actions GREEN

## 7. Quality Gate

- [ ] Logo wdrożone we wszystkich lokalizacjach
- [ ] Monogram czytelny w małych rozmiarach
- [ ] Wordmark `LASTFOOTBALL` spójny z Night Pitch Office
- [ ] Landing wygląda profesjonalnie (bez MVP square mark)
- [ ] Brak zmian w World Art i DS tokenach
- [ ] CI GREEN
