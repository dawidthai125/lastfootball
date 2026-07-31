# LFE-PUBLIC-API-01 — PLAN (Package Surface Cleanup)

**EPIC:** LFE-PUBLIC-API-01  
**Typ:** Package / architecture chore · **bez** semantyki silnika  
**Data:** 2026-07-31  
**Wejście:** AUDIT COMPLETE · Owner **GO PLAN** · Owner **GO IMPLEMENT**  
**Status PLAN:** FULLY CLOSED · feat `ce00327` · CI GREEN · PRODUCTION VERIFY · DOCS CLOSE  
**Domain feat:** `ce00327`  
**Baseline wejścia:** tip `799fd8d` · Domain `9424dd8` · Docs pin `e77f1a4` · D1–D118  
**SSOT kontraktu:** [`../lfe/LFE_ARCHITECTURE_FREEZE.md`](../lfe/LFE_ARCHITECTURE_FREEZE.md)

---

## 0. Cel

Root `@lastfootball/lfe` eksportuje **wyłącznie Freeze PUBLIC** (+ Production MUST w Freeze §3).  
Testing surface → `@lastfootball/lfe/testing` (barrel only).  
`/advanced` **OUT**. SemVer **odłożone** do COMMIT.

## 1. Owner LOCK

1. Freeze nadrzędny.
2. Allowlist = Freeze PUBLIC + Production MUST.
3. Root = wyłącznie PUBLIC Contract.  
   4–5. `testing.ts` = wyłącznie barrel · zero logiki.
4. `/advanced` poza zakresem.
5. Brak zmian Engine / AI / Physics / ECS.
6. Brak zmian logiki Web.
7. `package.json` = exports (+ niezbędne metadane T2).
8. SemVer → COMMIT (nie IMPLEMENT).

## 2. Warianty (zatwierdzone)

| Temat    | Wybór                              |
| -------- | ---------------------------------- |
| Testing  | **T2** `@lastfootball/lfe/testing` |
| Advanced | **A1 defer**                       |
| SemVer   | Analiza only → Owner przy COMMIT   |

## 3. Milestones

M0 Contract · M1 Allowlist · M2 testing · M3 Root cleanup · M4 Docs · M5 Regression · M6 Verify

## Last updated

2026-07-31 — LFE-PUBLIC-API-01 FULLY CLOSED · feat `ce00327` · D119–D121 · PRODUCTION VERIFY · DOCS CLOSE
