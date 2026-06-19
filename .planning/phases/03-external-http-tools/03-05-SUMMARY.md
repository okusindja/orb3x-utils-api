---
phase: 03-external-http-tools
plan: 05
subsystem: api
tags: [mcp, translation, zod, google-translate, tdd]

# Dependency graph
requires:
  - phase: 03-external-http-tools
    plan: 01
    provides: mcpToolHandler duck-typed domain-error branch (D-01) that serializes retryable+retryAfterSeconds from Object.assign
provides:
  - registerTranslationTools (translate_text MCP tool; TRN-01)
  - DoS guard: text bounded by z.string().max(5000)
  - D-04 retry enrichment for UPSTREAM_TIMEOUT/UPSTREAM_UNAVAILABLE/UPSTREAM_BAD_RESPONSE with retryAfterSeconds:5
  - TDD test coverage: mcp-tools-translation.test.ts (5 cases)
affects:
  - 03-06 registry integration (must import and wire registerTranslationTools)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TranslationError caught in tool callback, re-thrown with Object.assign enrichment; duck-typed branch in mcpToolHandler serializes retryable+retryAfterSeconds
    - Full per-code comparisons for retryable check (not bare string literals) to avoid INVALID_TEXT/INVALID_LANGUAGE wrongly becoming retryable
    - jest.mock of @/lib/translate to avoid real network calls; inline MockTranslationError class mirrors constructor signature

key-files:
  created:
    - src/lib/mcp/tools/translation.ts
    - src/lib/__tests__/mcp-tools-translation.test.ts
  modified: []

key-decisions:
  - "Full per-code comparisons in retryable guard: error.code === 'UPSTREAM_TIMEOUT' || error.code === 'UPSTREAM_UNAVAILABLE' || error.code === 'UPSTREAM_BAD_RESPONSE' (bare string literals would always be truthy)"
  - "retryAfterSeconds: 5 for all retryable translation errors (discretionary per D-04, consistent with NIF/currency pattern)"
  - "Enriched message appends lowercase 'retry in a few seconds.' so toContain('retry') test assertion passes"
  - "jest.mock(@/lib/translate) with inline MockTranslationError class avoids network calls in test environment"
  - "translate.ts timeout stays 15000 (D-03 — Google is fast; no change required)"

patterns-established:
  - "Pattern: External HTTP tool TDD — mock the domain client module, test registration + happy path + retryable upstream failure + non-retryable validation error"

requirements-completed: [TRN-01]

# Metrics
duration: 8min
completed: 2026-06-19
---

# Phase 3 Plan 05: Translation Tool Summary

**translate_text MCP tool wrapping Google Translate with DoS guard (max 5000 chars), D-04 retry enrichment for upstream failures, and non-retryable validation errors**

## Performance

- **Duration:** 8 min
- **Started:** 2026-06-19T09:00:00Z
- **Completed:** 2026-06-19T09:08:00Z
- **Tasks:** 1 (TDD: RED + GREEN)
- **Files modified:** 2

## Accomplishments

- `translate_text` tool registered via `registerTranslationTools(server)` — TRN-01 complete
- `z.string().min(1).max(5000)` on text input guards the unofficial Google Translate API against DoS (T-03-T1 mitigated)
- D-04 retry enrichment: `UPSTREAM_TIMEOUT | UPSTREAM_UNAVAILABLE | UPSTREAM_BAD_RESPONSE` → `retryable: true`, `retryAfterSeconds: 5`; validation codes (`INVALID_TEXT`, `INVALID_LANGUAGE`) stay non-retryable using full per-code comparisons
- `translate.ts` AbortSignal.timeout confirmed unchanged at 15000 (D-03)
- 5 test cases green: registration, title/description anti-collision, happy path, UPSTREAM_TIMEOUT retryable, INVALID_TEXT non-retryable

## Task Commits

TDD red-green cycle (single task):

1. **RED: mcp-tools-translation.test.ts** — `2f6b525` (test)
2. **GREEN: translation.ts implementation** — `c303aa2` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/lib/mcp/tools/translation.ts` — `registerTranslationTools`: translate_text with Zod inputSchema, TranslationError catch with D-04 enrichment
- `src/lib/__tests__/mcp-tools-translation.test.ts` — 5-case TDD test suite (registration, anti-collision, happy, UPSTREAM_TIMEOUT, INVALID_TEXT)

## Decisions Made

- Full per-code comparisons for retryable guard — bare string literals are always truthy and would wrongly mark `INVALID_TEXT`/`INVALID_LANGUAGE` as retryable
- Enriched message appends lowercase `retry in a few seconds.` so the `toContain('retry')` assertion is satisfied without case-insensitive workarounds
- `jest.mock('@/lib/translate')` with inline `MockTranslationError` class — avoids real network calls and ESM issues in jsdom

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Lowercase 'retry' in enriched message to match test assertion**
- **Found during:** Task 1 GREEN phase (first test run)
- **Issue:** Enriched message used `Retry in a few seconds.` (capital R) but test `toContain('retry')` is case-sensitive
- **Fix:** Changed to `retry in a few seconds.` (lowercase r) — matches the pattern established by nif.ts sibling
- **Files modified:** `src/lib/mcp/tools/translation.ts`
- **Verification:** All 5 tests pass
- **Committed in:** c303aa2 (GREEN implementation commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug, incorrect message casing)
**Impact on plan:** Minimal. Only the message casing changed; all behaviour, logic, and structure match the plan exactly.

## Issues Encountered

None beyond the casing fix above.

## User Setup Required

None — no external service configuration required. `translateText` uses the existing `fetch`-based Google Translate client.

## Next Phase Readiness

- `registerTranslationTools` is ready to be wired into the registry in plan 03-06
- `registry.ts` integration is the only remaining step in Phase 3

## TDD Gate Compliance

RED gate: `2f6b525` — `test(03-05): add failing tests for translate_text MCP tool (TRN-01)`
GREEN gate: `c303aa2` — `feat(03-05): implement registerTranslationTools with DoS guard and D-04 enrichment (TRN-01)`

Both gates present and in correct order.

## Self-Check: PASSED

- `src/lib/mcp/tools/translation.ts` — FOUND
- `src/lib/__tests__/mcp-tools-translation.test.ts` — FOUND
- Commit `2f6b525` — FOUND (RED test)
- Commit `c303aa2` — FOUND (GREEN implementation)
- `pnpm exec jest mcp-tools-translation` — 5 passed, 0 failed
- `pnpm exec tsc --noEmit` — No errors found
- `translate.ts` AbortSignal.timeout — 15000 (unchanged, D-03 satisfied)
- registry.ts — NOT modified (D-05 constraint honoured)
- tool-error.ts — NOT modified (D-05 constraint honoured)

---
*Phase: 03-external-http-tools*
*Completed: 2026-06-19*
