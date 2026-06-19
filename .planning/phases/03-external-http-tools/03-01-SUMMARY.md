---
phase: 03-external-http-tools
plan: "01"
subsystem: mcp-infra
tags: [mcp, error-handling, duck-typing, regression]
dependency_graph:
  requires: []
  provides: [duck-typed-domain-error-branch, d01-foundation]
  affects: [src/lib/mcp/tool-error.ts]
tech_stack:
  added: []
  patterns: [duck-typed-error-branch, Object.entries-spread, unknown-double-cast]
key_files:
  modified:
    - src/lib/mcp/tool-error.ts
    - src/lib/__tests__/mcp-tool-error.test.ts
decisions:
  - "D-01 implemented via structural typeof check on code:string + statusCode:number — no imports of domain error classes"
  - "Double cast through unknown (domainError as unknown as Record<string, unknown>) resolves TypeScript TS2352 overlap error"
  - "RouteError instanceof branch remains first per D-01 design intent and Pitfall 1"
metrics:
  duration: "10m"
  completed: "2026-06-19"
  tasks: 1
  files: 2
---

# Phase 3 Plan 01: Duck-Typed Domain-Error Branch Summary

**One-liner:** Duck-typed mcpToolHandler branch catches `{code:string, statusCode:number}` errors from CurrencyError/PortalLookupError/TranslationError without importing them, spreads extra enumerable props (retryable, retryAfterSeconds) for D-04 retry guidance.

## What Was Built

Extended `mcpToolHandler` in `src/lib/mcp/tool-error.ts` with a new branch inserted between the existing `instanceof RouteError` block and the `INTERNAL_SERVER_ERROR` fallback. The branch uses structural `typeof` checks to match any `Error` with `code: string` + `statusCode: number` — the shared shape of all three domain error classes (`CurrencyError`, `PortalLookupError`, `TranslationError`) without importing any of them.

The serialized payload includes `code`, `message`, `statusCode` from named accessors, plus a spread of all additional enumerable own-properties filtered through `Object.entries` (with `name`, `stack`, `message`, `code`, `statusCode` excluded). This enables Wave 2 tool callbacks to attach `retryable` and `retryAfterSeconds` via `Object.assign` and have those fields appear in the `isError` JSON payload (D-04).

Extended `mcp-tool-error.test.ts` with 3 new test cases simulating domain errors via `Object.assign(new Error(...), { code, statusCode, ... })` — no domain class imports in the test file.

## Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Duck-typed domain-error branch + regression tests | e89f450 | src/lib/mcp/tool-error.ts, src/lib/__tests__/mcp-tool-error.test.ts |

## Test Results

- `pnpm exec jest mcp-tool-error --forceExit --no-coverage`: **PASS (11) FAIL (0)**
  - 4 prior cases: all green (RouteError mapping, INTERNAL_SERVER_ERROR, success path, non-Error throw)
  - 3 new cases: duck-typed UPSTREAM_TIMEOUT (code/statusCode/message), extra-prop spread (retryable/retryAfterSeconds), RouteError regression (statusCode undefined in output)
- `pnpm exec tsc --noEmit`: **No errors found**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript TS2352 overlap error on Object.entries cast**
- **Found during:** Task 1 (TypeScript verification step)
- **Issue:** `domainError as Record<string, unknown>` fails TS2352 — `Error & { code: string; statusCode: number }` lacks an index signature, so TypeScript rejects the direct cast to `Record<string, unknown>`
- **Fix:** Added double cast through `unknown`: `domainError as unknown as Record<string, unknown>` — safe at runtime since `Object.entries` only reads enumerable own-properties
- **Files modified:** src/lib/mcp/tool-error.ts (line 54)
- **Commit:** e89f450

## Known Stubs

None — no placeholder data, no hardcoded responses, no TODO fields.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes. T-03-01 (info disclosure) and T-03-02 (branch ordering) are mitigated as designed: `stack`/`name` are non-enumerable and excluded from spread; `RouteError` instanceof check stays first.

## Self-Check: PASSED

- src/lib/mcp/tool-error.ts: exists, contains duck-typed branch with `statusCode` field
- src/lib/__tests__/mcp-tool-error.test.ts: exists, contains `UPSTREAM_TIMEOUT` test case
- Commit e89f450: confirmed via `git rev-parse --short HEAD`
- `pnpm exec tsc --noEmit`: clean (exit 0)
- `pnpm exec jest mcp-tool-error --forceExit --no-coverage`: PASS 11, FAIL 0 (exit 0)
