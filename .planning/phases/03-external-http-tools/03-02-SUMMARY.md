---
phase: 03-external-http-tools
plan: 02
subsystem: api
tags: [mcp, finance, vat, invoice, inflation, zod, angola]

# Dependency graph
requires:
  - phase: 03-external-http-tools
    provides: tool-error.ts with mcpToolHandler (plan 01 extended with duck-typed branch)
  - phase: 02-domain
    provides: calculateVat, calculateInvoiceTotals, adjustForInflation in @/lib/angola/finance
provides:
  - registerFinanceTools in src/lib/mcp/tools/finance.ts (3 pure MCP tools)
  - mcp-tools-finance.test.ts (6 tests: registration, anti-collision, happy path, 3 error codes)
affects: [registry.ts (plan 05), 03-external-http-tools plans 03-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pure MCP tool delegation (no timeout/retry/cache) via mcpToolHandler wrapping domain functions
    - z.string() for year fields that domain functions slice internally (Pitfall 5)
    - Anti-collision descriptions: each tool names sibling tools by backtick-name

key-files:
  created:
    - src/lib/mcp/tools/finance.ts
    - src/lib/__tests__/mcp-tools-finance.test.ts
  modified: []

key-decisions:
  - "from/to fields use z.string() not z.number() because adjustForInflation calls .slice() on them internally"
  - "No catch inside tool callbacks — finance tools are pure; RouteError propagates to mcpToolHandler RouteError branch"
  - "finance_invoice_total lines array uses z.array(...).min(1) for Zod-level DoS bound before domain validation"

patterns-established:
  - "Pure finance tool pattern: mcpToolHandler(async (input) => domainFn(input)) with no error catching in callback"

requirements-completed: [FIN-01]

# Metrics
duration: 8min
completed: 2026-06-19
---

# Phase 03 Plan 02: Finance MCP Tools Summary

**3 pure Angola finance MCP tools (finance_vat, finance_invoice_total, finance_inflation_adjust) wrapping calculateVat/calculateInvoiceTotals/adjustForInflation via mcpToolHandler — no timeout, retry, or cache**

## Performance

- **Duration:** 8 min
- **Started:** 2026-06-19T00:00:00Z
- **Completed:** 2026-06-19T00:08:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Implemented `registerFinanceTools` in `src/lib/mcp/tools/finance.ts` following the exact salary.ts template pattern
- Three pure MCP tools (finance_vat, finance_invoice_total, finance_inflation_adjust) with anti-collision descriptions
- `from`/`to` fields on finance_inflation_adjust correctly typed as `z.string()` per Pitfall 5 (domain slices strings)
- Full test coverage: registration, anti-collision descriptions, happy path (VAT), and all 3 error codes (INVALID_RATE, INVALID_INVOICE_LINES, UNSUPPORTED_CPI_YEAR)

## Task Commits

1. **Task 1: Implement registerFinanceTools (3 pure tools)** - `82f9804` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/lib/mcp/tools/finance.ts` - Exports registerFinanceTools; registers finance_vat, finance_invoice_total, finance_inflation_adjust as pure MCP tools
- `src/lib/__tests__/mcp-tools-finance.test.ts` - 6 tests verifying registration, anti-collision descriptions, VAT happy path, and 3 RouteError codes

## Decisions Made

- Used `z.string()` for `from`/`to` on finance_inflation_adjust because `adjustForInflation` calls `.slice(0, 4)` on them (string operation per research Pitfall 5)
- No try/catch inside tool callbacks because finance functions are pure and throw RouteError, which is already handled by mcpToolHandler's `instanceof RouteError` branch
- `z.array(...).min(1)` on `lines` provides Zod-level validation before the domain function's empty-array check (defence in depth, T-03-F2 DoS mitigation)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `registerFinanceTools` is ready to be wired into `src/lib/mcp/registry.ts` (plan 05 scope per D-05 constraint)
- Plans 03-04 (currency, NIF, translation tools) can proceed in parallel
- TypeScript clean (`pnpm exec tsc --noEmit`) and all tests green

---
*Phase: 03-external-http-tools*
*Completed: 2026-06-19*
