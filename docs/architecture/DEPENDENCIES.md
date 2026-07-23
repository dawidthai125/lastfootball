# Dependencies — Last Football

## Cel dokumentu

Zależności między pakietami i zewnętrznymi usługami.

## Aktualny stan

npm workspaces; LFE zależy od domain; web zależy od LFE + domain; LFE **nie** zależy od web/supabase.

## Opis działania

### Graf pakietów

```
apps/web
  ├── @lastfootball/lfe
  └── @lastfootball/domain

@lastfootball/lfe
  └── @lastfootball/domain   (TeamId itd. — cienkie ID)

@lastfootball/domain
  └── (brak zależności na lfe/web)
```

### Zakazy importu

| From → To | Dozwolone? |
|-----------|------------|
| lfe → web | **NIE** |
| lfe → supabase client | **NIE** |
| domain → lfe | **NIE** |
| web → lfe deep paths | **NIE** (tylko package export) |
| web → domain | TAK |
| docs → runtime | n/a |

### Zewnętrzne

| Usługa | Użycie |
|--------|--------|
| Vercel | Hosting `apps/web` |
| Supabase | Auth/DB (app), nie LFE |
| GitHub Actions | CI validate |
| Vitest / TypeScript | Dev |

## Najważniejsze decyzje

Granice importów = część Architecture Freeze / foundation.

## Powiązania

[`../ARCHITECTURE.md`](../ARCHITECTURE.md) · [`../PROJECT_STRUCTURE.md`](../PROJECT_STRUCTURE.md) · [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)

## Last updated

2026-07-23
