# AI — Engineering Guide

## Cel

Praktyczny przewodnik implementacji EPIC-ów (Cursor / ChatGPT).  
Filozofia: [`ARCHITECTURE_PRINCIPLES.md`](./ARCHITECTURE_PRINCIPLES.md) · wzorce: [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md).

---

## Owner GO

Bez **Owner GO** nie wolno:

- commitować,
- pushować,
- zaczynać IMPLEMENT poza zatwierdzonym PLAN.

Każdy etap kończy raportem; Owner wydaje kolejne GO (IMPLEMENT / COMMIT / PUSH / CLOSE).

---

## Pipeline (jedyny)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI → CLOSE
```

Szczegóły: [`EPIC_WORKFLOW.md`](./EPIC_WORKFLOW.md) · [`../WORKFLOW.md`](../WORKFLOW.md) · [`../RELEASE_PROCESS.md`](../RELEASE_PROCESS.md).

---

## Validation (lokalnie przed COMMIT)

Dla EPIC kodowego (web):

```bash
npm run format:check
npm run typecheck -w @lastfootball/web
npm run lint -w @lastfootball/web
npm run test -w @lastfootball/web
npm run build -w @lastfootball/web
```

Docs-only: minimum `npm run format:check` (Prettier obejmuje `docs/`).

Root: `npm run validate` ≈ pełna lokalna bramka.

---

## Prettier / Format

- CI pada na `prettier --check .` **przed** typecheck.
- Po IMPLEMENCIE zawsze `format:check`; przy RED: `prettier --write` **tylko** wskazanych plików, osobny commit `style: …`.
- Nie mieszaj formatu z feature w jednym commicie, jeśli CI już padło na Format.

---

## Commit policy

- Conventional Commits (`feat`, `fix`, `docs`, `style`, …).
- Jeden cel = jeden commit (feature **lub** docs **lub** style).
- Stage tylko pliki EPIC (`git add` ścieżek) — bez `apps/` w docs EPIC i odwrotnie.
- Nigdy sekrety / `.env`.

## Push policy

- Tylko po Owner GO.
- Po push: `gh run watch` do GREEN; HEAD == `origin/main`; working tree clean.
- Format RED → style fix → ponowny COMMIT/PUSH (osobne GO).

---

## Feature baseline vs Documentation tip

| Pojęcie               | Znaczenie                                                                       |
| --------------------- | ------------------------------------------------------------------------------- |
| **Feature baseline**  | Ostatni commit **produktowy** EPIC (`feat(…)`) — to zapisuje `CURRENT_BASELINE` |
| **Documentation tip** | Nowszy `docs:` / `style:` na `main` — tip może być nowszy niż feature baseline  |
| **Style commit**      | Wyłącznie Prettier; bez logiki                                                  |

Zawsze: `git log -1 --oneline` lokalnie. Patrz [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md).

---

## Resolver implementation (checklist)

1. Pure `resolveX(input) → Dto` w `lib/<domain>/`.
2. IO `list*` / `get*` osobno (nie w barrelze client jeśli server-only).
3. Page: load IO → `resolveX` → View(props = DTO).
4. Testy vitest na pure (okno, limity, derive).
5. Zero mock list na ścieżce gracza.

## Seed implementation (checklist)

1. Seed tylko create / backfill / test / AI.
2. Runtime: brak fallbacku do seeda.
3. Id konwencje: starter `s-{tag}-…`, buy `t-{tag}-…`, market `m-{tag}-…`.

---

## Common mistakes

| Błąd                                          | Skutek                |
| --------------------------------------------- | --------------------- |
| Mock rynku/kasy/tabeli w page                 | Fałszywy SSOT         |
| Seed w runtime squad                          | Mutacje „znikają”     |
| Drugi wzór fee/tabeli w UI                    | Drift                 |
| Commit bez `format:check`                     | CI RED na Format      |
| Mieszanie docs + feat w jednym commicie CLOSE | Trudniejszy review    |
| Traktowanie tip docs jako feature baseline    | Złe hashe w raportach |
| Canvas/Replay → Engine                        | Łamie Freeze          |

---

## Definition of Done (kod)

- AC z PLAN spełnione
- format · typecheck · lint · test · build PASS
- brak mocków na ścieżce gracza
- SSOT nietknięty poza scope
- po CLOSE: baseline / ROADMAP / DECISIONS zsynchronizowane (docs EPIC)

## Release process

Patrz [`../RELEASE_PROCESS.md`](../RELEASE_PROCESS.md): push → CI GREEN → Vercel → smoke → CLOSE.

## Last updated

2026-07-25 — AI-DOCS-HYGIENE-01
