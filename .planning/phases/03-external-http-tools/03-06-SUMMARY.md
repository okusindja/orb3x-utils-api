---
phase: 03-external-http-tools
plan: "06"
subsystem: mcp-registry
tags: [registry, integration, wiring, phase-gate]
dependency_graph:
  requires: ["03-02", "03-03", "03-04", "03-05"]
  provides: ["registerAllTools-complete", "phase-3-tool-catalog"]
  affects: ["src/lib/mcp/registry.ts", "src/lib/__tests__/mcp-registry.test.ts"]
tech_stack:
  added: []
  patterns: ["register*Tools call chain after registerSalaryTools", "jest.mock for ESM-only deps in integration tests"]
key_files:
  created: []
  modified:
    - src/lib/mcp/registry.ts
    - src/lib/__tests__/mcp-registry.test.ts
decisions:
  - "Add jest.mock('@/lib/agt-nif') to all registry test copies to avoid ESM cheerio parse error at import time"
  - "Tool wiring order: health, address, calendar, geo, phone, salary, finance, currency, nif, translation"
metrics:
  duration_minutes: 5
  completed_date: "2026-06-19"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 4
---

# Phase 03 Plan 06: Registry Wiring Summary

**One-liner:** Wired registerFinanceTools, registerCurrencyTools, registerNifTools, registerTranslationTools into registerAllTools as D-05 single-integration step; extended registry integration test to assert all 22 tools by name.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wire 4 register*Tools into registry and update integration test | 53277e2 | registry.ts, mcp-registry.test.ts |
| 2 | Full suite + tsc phase gate | b84687e | mcp-registry.test 2.ts, mcp-registry.test 3.ts |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ESM cheerio parse error in pre-existing stale duplicate test files**
- **Found during:** Task 2 (full suite gate)
- **Issue:** Two untracked duplicate test files (`mcp-registry.test 2.ts`, `mcp-registry.test 3.ts`) with spaces in their names existed in the workspace before this plan. When registry.ts gained the NIF tool import (which transitively loads cheerio, an ESM-only package), Jest could not parse these stale copies — they lacked the `jest.mock('@/lib/agt-nif')` shim required by the canonical test.
- **Fix:** Applied the same `jest.mock('@/lib/agt-nif')` shim to both stale copies, matching the pattern used in `mcp-tools-nif.test.ts`.
- **Files modified:** `src/lib/__tests__/mcp-registry.test 2.ts`, `src/lib/__tests__/mcp-registry.test 3.ts`
- **Commit:** b84687e

## Verification Results

- `pnpm test` — 32 test suites, 140 tests, all green
- `pnpm exec tsc --noEmit` — zero errors
- `grep` check: registry.ts contains 4 imports + 4 calls for the new register*Tools (8+ matches)

## Known Stubs

None — all 22 tools registered and enumerated in the integration test.

## Threat Flags

None — registry wiring introduces no new network endpoints or trust boundaries.

## Self-Check

- [x] src/lib/mcp/registry.ts modified (registerFinanceTools, registerCurrencyTools, registerNifTools, registerTranslationTools imported and called)
- [x] src/lib/__tests__/mcp-registry.test.ts extended (22 tool names enumerated, count >= 22)
- [x] Commits 53277e2 and b84687e exist
- [x] Full Jest suite green (32/32 suites, 140 tests)
- [x] tsc --noEmit clean

## Self-Check: PASSED
