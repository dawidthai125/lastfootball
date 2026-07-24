# Release Process — Last Football

## Cel dokumentu

Jak wykonywać release: commity, push, CI, rollback. Wzorzec = LFE release + match pipeline (Canvas…Docs).

## Aktualny stan

Proces sprawdzony: lokalne VALIDATION → COMMIT (Owner GO) → PUSH (Owner GO) → CI Format→Build PASS.

## Opis działania

### 1. Przygotowanie

1. Working tree zrozumiany (`git status`).
2. PLAN zatwierdzony (zakres plików, kolejność).
3. Preflight: `npm run typecheck` + `npm test` (+ web vitest gdy dotyczy) + `npm run build` gdy EPIC web.
4. `npm run format:check` — wymagane przez CI.

### 2. Commity

- Conventional Commits, PowerShell:
  ```powershell
  git commit -m @"
  feat(web): short summary

  Longer why.
  "@
  ```
- Stage **tylko** pliki danego commita (`git add` ścieżek).
- Nie używaj `git add -i` / rebase -i.
- Po każdym commicie kodowym: VALIDATION na tree (WIP może zostać niezacommitowany).
- Docs-only: `format:check` + przegląd diff; bez wymogu full build (zalecane typecheck gdy linki/API).

### 3. WIP

- Dziel na niezależne grupy (Canvas / Replay / Post Match / Bridge / Docs).
- Nie stage’uj `undefined/`, sekretów, lokalnych dumpów.
- Przed globalnym `prettier --write .`: `git stash push -u` (wzór LFE-CI-PRETTIER-01).

### 4. Push

```powershell
git push origin HEAD
```

- Push **dopiero na Owner GO**.
- Preferuj feature branch + PR gdy branch protection wymaga PR.
- Direct push na `main` możliwy tylko jeśli Owner świadomie akceptuje (historia projektu tak robiła; remote może ostrzegać).

### 5. Weryfikacja po push

```powershell
git fetch origin
git rev-parse HEAD
git rev-parse origin/main   # muszą być równe
gh run list --branch main --limit 1
gh run watch <id> --exit-status
```

CI musi PASS: Format · Typecheck · Lint · Test · Build.

### 6. Docs po feature

Minimum (w tym samym EPIC lub osobnym docs commit na GO):

- `docs/PROJECT_STATUS.md` / `docs/ROADMAP.md`
- `docs/AI-HANDOFF.md` (gdy zmienia się stan / zakazy / pipeline)
- `docs/CHANGELOG.md`

### 7. Pull Request (opcjonalnie)

- Twórz PR tylko na wyraźne GO (`gh pr create`).
- Nie twórz PR „przy okazji” po push na `main` jeśli zmiany już wylądowały.

**Relacja do CONTRIBUTING:** root `CONTRIBUTING.md` opisuje develop→PR. Dla Agentów wiążące jest **Owner GO** + ten dokument; nie zakładaj PR bez GO.

## Rollback

| Sytuacja                         | Akcja                                                               |
| -------------------------------- | ------------------------------------------------------------------- |
| Przed pushem, zły ostatni commit | `git reset --soft HEAD~1` → popraw → nowy commit                    |
| Przed pushem, cofnij serię       | `git reset --soft <hash-przed-serią>` (unikaj `--hard` bez backupu) |
| Po pushu na feature branch       | revert lub fixing commit; force tylko na wyraźne GO                 |
| Po pushu / merge na `main`       | **revert** przez commit/PR — nie rewrite historii `main`            |

## Najważniejsze decyzje

- Nie pushuj połowy łańcucha, jeśli PLAN wymaga atomowej serii.
- Nie mieszaj GDD i featu LFE w jednym commicie.
- Testuj na pełnym working tree (untracked zostają na dysku między commitami).

## Powiązania

[`WORKFLOW.md`](./WORKFLOW.md) · [`AI-HANDOFF.md`](./AI-HANDOFF.md) · [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) · [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)

## Last updated

2026-07-24 — AI-DOCS-CONSOLIDATION-01
