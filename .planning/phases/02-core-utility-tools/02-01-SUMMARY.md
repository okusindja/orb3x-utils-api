---
phase: 02-core-utility-tools
plan: "01"
subsystem: mcp-tools-salary
tags: [mcp, salary, angola, tool-adapter, tdd]
dependency_graph:
  requires:
    - src/lib/angola/salary.ts
    - src/lib/mcp/tool-error.ts
  provides:
    - src/lib/mcp/tools/salary.ts (registerSalaryTools)
  affects:
    - src/lib/mcp/registry.ts (wired in plan 02-06)
tech_stack:
  added: []
  patterns:
    - mcpToolHandler HOF wrapping domain functions
    - z.number() (not z.coerce) for MCP typed-JSON inputs
    - D-03 anti-collision descriptions per tool
key_files:
  created:
    - src/lib/mcp/tools/salary.ts
    - src/lib/__tests__/mcp-tools-salary.test.ts
  modified: []
decisions:
  - "Used z.number() (not z.coerce.number()) because MCP sends typed JSON, not URL query strings"
  - "salary_employer_cost description avoids mentioning internal delegation to calculateNetSalary to prevent LLM confusion"
  - "registry.ts not touched per D-05 — wiring is deferred to plan 02-06"
metrics:
  duration: "~5 minutes"
  completed: "2026-06-18"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 2 Plan 01: Salary MCP Tools Summary

**One-liner:** Three thin MCP tool adapters (salary_net, salary_gross, salary_employer_cost) over Angola salary domain functions, with Zod inputSchema, D-03 anti-collision descriptions, and full TDD coverage.

## What Was Built

- `src/lib/mcp/tools/salary.ts` — exports `registerSalaryTools(server: McpServer): void` registering three tools
- `src/lib/__tests__/mcp-tools-salary.test.ts` — 4 tests covering registration, D-03 compliance, happy path, and error path

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wave 0 — failing test scaffold (RED) | a3ff61a | src/lib/__tests__/mcp-tools-salary.test.ts |
| 2 | Implement registerSalaryTools (GREEN) | be9db3b | src/lib/mcp/tools/salary.ts |

## Verification

- `pnpm test -- mcp-tools-salary` — 4/4 tests passing
- `pnpm exec tsc --noEmit` — no errors
- `registry.ts` — untouched (D-05 constraint satisfied)

## TDD Gate Compliance

- RED commit: `a3ff61a` — test(02-01): add failing test scaffold for salary tools
- GREEN commit: `be9db3b` — feat(02-01): implement registerSalaryTools

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all three tools delegate to live domain functions with no stubbed data.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes at trust boundaries beyond what the plan's threat model covers. Zod `.nonnegative()` and `.int()` mitigate T-02-01 (Tampering) as specified.

## Self-Check: PASSED

- `src/lib/mcp/tools/salary.ts` — FOUND
- `src/lib/__tests__/mcp-tools-salary.test.ts` — FOUND
- Commit a3ff61a — FOUND
- Commit be9db3b — FOUND
