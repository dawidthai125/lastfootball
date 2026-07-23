# Release Process — Last Football

## Cel dokumentu

Jak wykonywać release: commity, push, rollback. Wzorzec = LFE release A–G.

## Aktualny stan

Proces sprawdzony: 7 commitów lokalnych → testy na pełnym tree → push `main` po GO.

## Opis działania

### 1. Przygotowanie

1. Working tree zrozumiany (`git status`).
2. Plan commitów zatwierdzony (zakres plików, kolejność).
3. Preflight: `npm run test --workspace=@lastfootball/lfe` (lub pełne `npm run validate`).

### 2. Commity

- Conventional Commits, PowerShell:
  ```powershell
  git commit -m @"
  feat(lfe): short summary

  Longer why.
  "@
  ```
- Stage **tylko** pliki danego commita (`git add` ścieżek).
- Nie używaj `git add -i` / rebase -i.
- Po każdym commicie kodowym: test + build workspace.
- Docs-only: wystarczy `git status` + diff stat.

### 3. Push

```powershell
git push -u origin <current-branch>
```

- Push **dopiero na Owner GO**.
- Preferuj feature branch + PR gdy branch protection wymaga PR.
- Direct push na `main` możliwy tylko jeśli Owner świadomie akceptuje (release LFE tak zrobił; remote ostrzegał o regułach).

### 4. Weryfikacja po push

```powershell
git status -sb          # up to date with origin
git log --oneline -5
```

### 5. Pull Request (opcjonalnie)

- Twórz PR tylko na wyraźne GO (`gh pr create`).
- Nie twórz PR „przy okazji” po push na `main` jeśli zmiany już wylądowały.

## Rollback

| Sytuacja                         | Akcja                                                               |
| -------------------------------- | ------------------------------------------------------------------- |
| Przed pushem, zły ostatni commit | `git reset --soft HEAD~1` → popraw → nowy commit                    |
| Przed pushem, cofnij serię       | `git reset --soft <hash-przed-serią>` (unikaj `--hard` bez backupu) |
| Po pushu na feature branch       | revert lub fixing commit; force tylko na wyraźne GO                 |
| Po pushu / merge na `main`       | **revert** przez commit/PR — nie rewrite historii `main`            |

## Najważniejsze decyzje

- Nie pushuj połowy łańcucha LFE (A–D) — checkout byłby niespójny.
- Nie mieszaj GDD i featu LFE w jednym commicie.
- Testuj na pełnym working tree (untracked files zostają na dysku między commitami).

## Powiązania

[`WORKFLOW.md`](./WORKFLOW.md) · [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) · [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)

## Last updated

2026-07-23
