---
phase: 02-core-utility-tools
plan: 05
subsystem: mcp-calendar-tools
tags: [mcp, calendar, holidays, angola, tool-adapter, tdd]
dependency_graph:
  requires:
    - src/lib/angola/calendar.ts
    - src/lib/mcp/tool-error.ts
  provides:
    - src/lib/mcp/tools/calendar.ts (registerCalendarTools)
  affects:
    - registry.ts (wired in integration plan 06)
tech_stack:
  added: []
  patterns:
    - mcpToolHandler HOF wrapping all callbacks
    - Zod inputSchema with ISO-date regex and runtime year default
    - HTTP envelope mirroring ({ year, holidays, assumptions })
key_files:
  created:
    - src/lib/mcp/tools/calendar.ts
    - src/lib/__tests__/mcp-tools-calendar.test.ts
  modified: []
decisions:
  - year resolved via `year ?? new Date().getUTCFullYear()` in callback body, NOT Zod .default() (Pitfall 2 avoidance)
  - days field has no .nonnegative() — negative values are valid to go backward
  - calendar_holidays mirrors HTTP envelope { year, holidays, assumptions } verbatim
  - registry.ts untouched per D-05 (parallel domain plan)
metrics:
  duration: 1m
  completed: "2026-06-18"
  tasks_completed: 2
  files_changed: 2
---

# Phase 2 Plan 5: Calendar MCP Tools Summary

**One-liner:** Calendar MCP tool adapter registering `calendar_holidays`, `calendar_working_days`, `calendar_add_working_days` as thin wrappers over `src/lib/angola/calendar.ts` with runtime year default and HTTP-envelope mirroring.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wave 0 — failing test scaffold (RED) | 64e7aa6 | src/lib/__tests__/mcp-tools-calendar.test.ts |
| 2 | Implement registerCalendarTools (GREEN) | 2b8cff1 | src/lib/mcp/tools/calendar.ts |

## Decisions Made

1. **Runtime year default over Zod .default():** Used `year ?? new Date().getUTCFullYear()` inside the callback to avoid freezing the year at module load time (mirrors HTTP route behavior; Pitfall 2 from RESEARCH.md).

2. **No .nonnegative() on days:** The `calendar_add_working_days` days field accepts negative integers to go backward in time. This is intentional per RESEARCH.md spec.

3. **HTTP envelope mirrored exactly:** `calendar_holidays` returns `{ year, holidays, assumptions }` matching the HTTP route in `app/calendar/holidays/route.ts`.

4. **registry.ts untouched:** This is a D-05 parallel domain plan — registry wiring deferred to the integration plan.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. All three tools are fully wired to live domain functions; no placeholder data.

## TDD Gate Compliance

- RED gate commit: `64e7aa6` (`test(02-05): add failing test scaffold...`)
- GREEN gate commit: `2b8cff1` (`feat(02-05): implement registerCalendarTools...`)
- REFACTOR: not needed — implementation is minimal and clean

## Threat Surface Scan

No new network endpoints or auth paths introduced. `registerCalendarTools` is a pure in-memory adapter. Threat T-02-09 mitigated: `z.number().int().min(2000).max(2100)` on year; ISO-date regex on from/to/date; `z.number().int()` on days. Domain functions throw INVALID_YEAR/INVALID_DATE/INVALID_DATE_RANGE/INVALID_INTEGER which `mcpToolHandler` maps to `isError`.

## Self-Check: PASSED

- [x] src/lib/mcp/tools/calendar.ts exists
- [x] src/lib/__tests__/mcp-tools-calendar.test.ts exists
- [x] Commit 64e7aa6 exists (test scaffold)
- [x] Commit 2b8cff1 exists (implementation)
- [x] All 5 tests pass
- [x] tsc --noEmit clean
- [x] registry.ts untouched
