---
phase: 03-external-http-tools
plan: "03"
subsystem: mcp-tools-currency
tags: [mcp, currency, external-http, cache, retry]
dependency_graph:
  requires: ["03-01"]
  provides: ["currency_rates", "currency_convert", "registerCurrencyTools"]
  affects: ["src/lib/mcp/registry.ts (future wiring in 03-06)"]
tech_stack:
  added: []
  patterns: ["module-level Map cache with TTL", "CurrencyError enrichment + rethrow", "duck-typed branch serialization of retryable"]
key_files:
  created:
    - src/lib/mcp/tools/currency.ts
    - src/lib/__tests__/mcp-tools-currency.test.ts
  modified:
    - src/lib/currency.ts
decisions:
  - "Cache key normalized BEFORE sanitizeCurrencyCode to avoid divergence between 'AOA', 'aoa', ' AOA ' (Pitfall 3)"
  - "retryAfterSeconds=5 for UPSTREAM_TIMEOUT and UPSTREAM_UNAVAILABLE; undefined for all other codes (RESEARCH A1)"
  - "DOMException('Timeout', 'TimeoutError') constructor sets .name automatically; Object.assign override fails (read-only property)"
  - "__clearCurrencyCache() exported as test helper; no jest.resetModules needed"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-19"
  tasks: 1
  files: 3
---

# Phase 3 Plan 03: Currency MCP Tools Summary

**One-liner:** Two MCP currency tools (`currency_rates`, `currency_convert`) with 60s module-level Map cache, `CurrencyError` enrichment carrying `retryable`+`retryAfterSeconds`, and 20s upstream timeout.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| RED | Failing test for registerCurrencyTools | 1c3173e | src/lib/__tests__/mcp-tools-currency.test.ts |
| GREEN | Implement registerCurrencyTools + timeout bump | 11d2183 | src/lib/mcp/tools/currency.ts, src/lib/currency.ts, src/lib/__tests__/mcp-tools-currency.test.ts |

## Verification

- `pnpm test -- mcp-tools-currency`: 6 tests passed (registration, happy path, UPSTREAM_TIMEOUT retryable, cache hit, currency_convert)
- `pnpm exec tsc --noEmit`: clean
- `grep -c "20000" src/lib/currency.ts`: 1; no 15000 remaining
- Cache NOT present in currency.ts (confirmed by grep)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] DOMException.name is a read-only property**
- **Found during:** GREEN phase test run
- **Issue:** `Object.assign(new DOMException('Timeout', 'TimeoutError'), { name: 'TimeoutError' })` throws `TypeError: Cannot set property name of [DOMException] which has only a getter`
- **Fix:** Removed the `Object.assign` override; `DOMException(message, 'TimeoutError')` constructor sets `.name = 'TimeoutError'` automatically per spec
- **Files modified:** src/lib/__tests__/mcp-tools-currency.test.ts
- **Commit:** 11d2183

**2. [Rule 1 - Bug] TypeScript error in buildMockServer return type**
- **Found during:** `pnpm exec tsc --noEmit` check
- **Issue:** `{ registerTool: (...args: unknown[]) => void }` incompatible with the concrete mock signature; TS2322
- **Fix:** Changed return type to `never` and cast `mockServer as never` (same pattern as salary/finance tests)
- **Files modified:** src/lib/__tests__/mcp-tools-currency.test.ts
- **Commit:** 11d2183

## Known Stubs

None. Both tools fetch live data from the upstream exchange API.

## Threat Surface Scan

No new surface beyond what the plan's threat model documents. `currency_rates` and `currency_convert` rely on `sanitizeCurrencyCode` inside `fetchCurrencyRates` for URL safety (T-03-C1), and the 20s `AbortSignal.timeout` + retryable `isError` pattern mitigates cold-start DoS (T-03-C2). No secrets or stack traces serialized (T-03-C3). Cache populated only from successful API responses with no external write path (T-03-C4).

## TDD Gate Compliance

- RED commit (`test(03-03)`) at 1c3173e — test suite failed with "Cannot find module" (module not yet created)
- GREEN commit (`feat(03-03)`) at 11d2183 — all 6 tests pass

## Self-Check: PASSED

- src/lib/mcp/tools/currency.ts: exists
- src/lib/__tests__/mcp-tools-currency.test.ts: exists
- src/lib/currency.ts: modified (20000 confirmed)
- Commits 1c3173e (RED) and 11d2183 (GREEN): verified in git log
