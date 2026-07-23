# Workflow — Last Football

## Cel dokumentu

Jak prowadzimy pracę: etapy + role Owner / ChatGPT / Cursor.

## Aktualny stan

Wzorzec potwierdzony na release LFE A–G: AUDIT → PLAN → EXECUTION (commity) → VERIFY → PUSH (na GO).

## Opis działania — etapy

```
AUDIT → PLAN → DESIGN → IMPLEMENT → VERIFY → TEST → RELEASE → POST RELEASE
```

| Etap | Co się dzieje |
|------|----------------|
| **AUDIT** | Analiza stanu (repo, API, freeze). **Bez** zmian kodu / commitów. |
| **PLAN** | Plan commitów / EPIC / GDD stage. Owner akceptuje. |
| **DESIGN** | GDD / UI / Architecture docs. Docs-only gdy tryb design. |
| **IMPLEMENT** | Kod zgodnie z planem; bez scope creep. |
| **VERIFY** | Status, diff, zgodność z SSOT / freeze. |
| **TEST** | `npm test`, typecheck/build workspace. |
| **RELEASE** | Commity A…N wg planu; push dopiero na GO. |
| **POST RELEASE** | Handoff / status update / changelog. |

### Zasady STOP

- Po AUDIT / DESIGN stage: **STOP** — czekaj na Owner GO.  
- Nie zaczynaj FINALIZE / następnego GDD / Physics bez GO.  
- Nie pushuj niepełnych commitów LFE na `main` (A–D były lokalne do E).

## Współpraca ról

| Rola | Odpowiedzialność |
|------|------------------|
| **Owner** | Priorytety, GO/NO-GO, decyzje produktowe, akceptacja freeze / release |
| **ChatGPT** | Planowanie, audyty, design GDD, dokumenty, rozbicie EPIC; nie omijać SSOT |
| **Cursor** | Implementacja w repo, commity na GO, testy, edycja plików, push na GO |

### Handoff między czatami

1. Przeczytaj [`HANDOFF.md`](./HANDOFF.md).  
2. Potwierdź [`PROJECT_STATUS.md`](./PROJECT_STATUS.md).  
3. Dla silnika: freeze + [`lfe/CURRENT_STATUS.md`](./lfe/CURRENT_STATUS.md).  
4. Dla produktu: GDD + [`game-design/CURRENT_DESIGN.md`](./game-design/CURRENT_DESIGN.md).

## Najważniejsze decyzje

- Owner jest SSOT decyzji; dokumenty są SSOT faktów.  
- Stary chat nie jest wymagany po HANDOFF.  
- Jedna zmiana = jeden jasny cel (nie mieszać GDD z Physics).

## Powiązania

[`RELEASE_PROCESS.md`](./RELEASE_PROCESS.md) · [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) · [`DECISIONS.md`](./DECISIONS.md)

## Last updated

2026-07-23
