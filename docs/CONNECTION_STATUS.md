# Connection status

## Cel

Szybki health check połączeń (GitHub / Vercel / Supabase).  
**Production Baseline:** wyłącznie [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md) — nie utrzymuj tu osobnego hasha.

## GitHub

| Check               | Result                                                 |
| ------------------- | ------------------------------------------------------ |
| Remote              | `https://github.com/dawidthai125/lastfootball.git`     |
| Branch              | `main`                                                 |
| Tip                 | `git log -1`                                           |
| Production Baseline | [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)   |
| CI                  | Format · Typecheck · Lint · Test · Build · Secret scan |

## Vercel / Supabase

|            |                                                                 |
| ---------- | --------------------------------------------------------------- |
| Live       | https://lastfootball.vercel.app                                 |
| Project    | `anoeimngwptucjdugjme`                                          |
| Migrations | through `20260726040000_transfer_offers_counter` (TRANSFERS-08) |

## Last updated

2026-07-29 — LFE-DOCS-BASELINE-01
