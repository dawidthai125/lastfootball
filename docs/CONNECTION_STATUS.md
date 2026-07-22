# Connection status — 2026-07-22

## GitHub — PASS

| Check            | Result                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Remote `origin`  | `https://github.com/dawidthai125/lastfootball.git`                                          |
| Branches         | `main`, `develop` pushed                                                                    |
| Protection       | `main` + `develop` require CI                                                               |
| CI               | success on push / PR                                                                        |
| Release workflow | present (`release.yml`, tag-triggered)                                                      |
| Sample PR        | [#1](https://github.com/dawidthai125/lastfootball/pull/1) merged; Vercel Preview check PASS |

## Vercel — PASS (custom DNS pending)

| Check                            | Result                                                                     |
| -------------------------------- | -------------------------------------------------------------------------- |
| Project linked                   | `dawidthai125s-projects/lastfootball`                                      |
| Git connected                    | yes                                                                        |
| Root Directory                   | `apps/web`                                                                 |
| Framework                        | Next.js · Node 22.x · region functions `fra1`                              |
| Preview Deploy                   | PASS (GitHub check + CLI)                                                  |
| Production Deploy                | PASS                                                                       |
| Build                            | PASS                                                                       |
| Public app URL                   | https://lastfootball.vercel.app — HTTP 200, app HTML verified              |
| Security headers                 | CSP, HSTS, X-Frame-Options verified                                        |
| Env                              | `NEXT_TELEMETRY_DISABLED` (prod/preview/dev), `NEXT_PUBLIC_APP_URL` (prod) |
| Supabase env                     | **not set yet** (blocked on Supabase project)                              |
| Domain `lastfootball.vercel.app` | PASS                                                                       |
| Domain `www.lastfootball.pl`     | Verified in Vercel, **DNS NXDOMAIN** — owner must set DNS                  |

### Owner — DNS for `lastfootball.pl` (registrar)

W panelu DNS domeny (Third Party) dodaj:

| Type      | Name  | Value                  |
| --------- | ----- | ---------------------- |
| **A**     | `@`   | `76.76.21.21`          |
| **CNAME** | `www` | `cname.vercel-dns.com` |

(Albo wartości z: Vercel → Project → Settings → Domains → `www.lastfootball.pl` → pokazane rekordy.)

Po propagacji sprawdź: `https://www.lastfootball.pl/status`

## Supabase — BLOCKED (login required)

CLI: `Access token not provided`.  
Nie można utworzyć/podłączyć projektu bez Twojej autoryzacji.

### Owner — wykonaj dokładnie

1. Otwórz https://supabase.com/dashboard
2. Zaloguj się (to samo konto co zamierzasz używać produkcyjnie)
3. **New project**
   - Name: `lastfootball` (lub `lastfootball-prod`)
   - Region: **West EU (Ireland)** `eu-west-1` lub **Central EU (Frankfurt)** jeśli dostępne — blisko Vercel `fra1`
   - Silne DB password → **zapisz w menedżerze haseł**
4. Po utworzeniu projektu: **Project Settings → API**
   - skopiuj `Project URL`
   - skopiuj `anon` `public` key
   - skopiuj `service_role` key (secret)
5. W terminalu lokalnie (w katalogu repo):

```bash
npx supabase login
```

(otworzy przeglądarkę — zatwierdź)

6. Napisz mi w czacie: **„Supabase gotowe”** + (opcjonalnie) project ref z URL  
   `https://supabase.com/dashboard/project/<PROJECT_REF>`

Potem dokończę: `supabase link`, `db push`, typy TS, env na Vercel, Auth URL config, weryfikację.

## CI/CD — PASS

| Check              | Result               |
| ------------------ | -------------------- |
| GitHub Actions CI  | PASS                 |
| Vercel Git Preview | PASS                 |
| Vercel Production  | PASS                 |
| Release workflow   | armed (tag `v*.*.*`) |
