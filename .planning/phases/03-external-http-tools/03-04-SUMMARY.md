---
phase: 03-external-http-tools
plan: "04"
subsystem: mcp-tools/nif
tags: [mcp, nif, external-http, retry, timeout]
dependency_graph:
  requires:
    - "03-01: duck-typed mcpToolHandler branch (serializes retryable + retryAfterSeconds)"
  provides:
    - "nif_lookup MCP tool (NIF-01)"
    - "agt-nif 25s timeouts on both fetch paths (D-03)"
    - "D-04 retry enrichment for UPSTREAM_TIMEOUT/UNAVAILABLE/BAD_RESPONSE"
  affects:
    - "src/lib/agt-nif.ts (timeout bump — all callers of lookupTaxpayerByNif benefit)"
tech_stack:
  added: []
  patterns:
    - "external HTTP tool with D-04 retry enrichment (matches currency.ts pattern)"
    - "jest.mock for module with ESM-only transitive deps (cheerio@1.2.0 jsdom guard)"
key_files:
  created:
    - src/lib/mcp/tools/nif.ts
    - src/lib/__tests__/mcp-tools-nif.test.ts
  modified:
    - src/lib/agt-nif.ts
decisions:
  - "jest.mock('@/lib/agt-nif') in test avoids loading cheerio's ESM browser build under jsdom testEnvironment"
  - "retryAfterSeconds: UPSTREAM_TIMEOUT=10, UPSTREAM_UNAVAILABLE=15, UPSTREAM_BAD_RESPONSE=10 (D-04)"
  - "UPSTREAM_TIMEOUT message hardcoded to mention 25s portal slowness; others append 'Retry in N seconds.'"
metrics:
  duration: "~5 minutes"
  completed: "2026-06-19"
  tasks_completed: 1
  files_changed: 3
---

# Phase 3 Plan 04: NIF Lookup MCP Tool Summary

**One-liner:** AGT portal NIF lookup exposed as `nif_lookup` MCP tool with 25s dual-path timeout and D-04 structured retry enrichment.

## What Was Built

### Task 1: Bump BOTH agt-nif timeouts 15s→25s and implement registerNifTools

**agt-nif.ts timeout edits (D-03):**
- Line 222: `AbortSignal.timeout(15000)` → `AbortSignal.timeout(25000)` — primary `fetch()` path
- Line 280: `request.setTimeout(15000, ...)` → `request.setTimeout(25000, ...)` — `node:https` TLS-fallback path

Both paths now respect the 25s intent. Before, TLS-fallback lookups were silently cut off at 15s.

**nif.ts — registerNifTools:**
- Registers `nif_lookup` with title "Angola NIF Lookup"
- `inputSchema`: `z.string().min(1)` for `nif`; NIF validation delegated to `sanitizeNif` inside `lookupTaxpayerByNif`
- Callback wraps `lookupTaxpayerByNif`; catches `PortalLookupError` and enriches with:
  - `retryable: true` for UPSTREAM_TIMEOUT / UPSTREAM_UNAVAILABLE / UPSTREAM_BAD_RESPONSE
  - `retryAfterSeconds`: 10 / 15 / 10 respectively
  - Hardcoded timeout message: "The AGT portal did not respond within 25s; it is frequently slow — retry in 10 seconds."
  - Other retryable codes append `"Retry in N seconds."` to the original message
- Non-retryable codes (INVALID_NIF, NIF_NOT_FOUND, UNPARSEABLE_RESPONSE) keep original message, `retryable` is not set
- Duck-typed branch in `mcpToolHandler` serializes `retryable + retryAfterSeconds` (D-04)

**mcp-tools-nif.test.ts (5 tests, all green):**
- Registration: `nif_lookup` exists with non-empty title and anti-collision description
- Happy path: mocked `lookupTaxpayerByNif` returns TaxVerificationResult → `isError` undefined
- UPSTREAM_TIMEOUT: mocked rejection → `isError:true`, `retryable:true`, `retryAfterSeconds:10`, message contains "retry"
- INVALID_NIF: mocked rejection → `isError:true`, `retryable` falsy

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] jest.mock used to isolate agt-nif from cheerio ESM in jsdom**
- **Found during:** Task 1 (test execution — RED phase)
- **Issue:** `cheerio@1.2.0` has ESM browser exports (`export { ... }`) which Jest jsdom env resolves via the `browser` export condition. The existing `transformIgnorePatterns: ['node_modules/(?!(cheerio)/)']` targets the module but jest resolves `dist/browser/index.js` (uses `export`) rather than `dist/commonjs/index.js`. Result: `SyntaxError: Unexpected token 'export'` when the test suite loads `agt-nif.ts`.
- **Fix:** Changed test approach from real `global.fetch` mock (which would load cheerio) to `jest.mock('@/lib/agt-nif')` that replaces the entire module with a mock. This is consistent with the plan's intent (test the MCP tool wrapper, not the parser internals).
- **Files modified:** `src/lib/__tests__/mcp-tools-nif.test.ts`
- **Commit:** 289a128

## Self-Check

### Created Files Exist
- `src/lib/mcp/tools/nif.ts`: created
- `src/lib/__tests__/mcp-tools-nif.test.ts`: created

### Commits Exist
- `289a128`: feat(03-04): implement nif_lookup MCP tool and bump agt-nif timeouts to 25s

## Self-Check: PASSED
