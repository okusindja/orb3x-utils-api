---
phase: 02-core-utility-tools
plan: "04"
subsystem: mcp-tools
tags: [mcp, address, angola, tool-adapter, tdd]
requirements: [LOC-03]

dependency_graph:
  requires:
    - src/lib/angola/address.ts
    - src/lib/mcp/tool-error.ts
  provides:
    - src/lib/mcp/tools/address.ts (registerAddressTools)
  affects:
    - src/lib/mcp/registry.ts (unchanged — D-05 disjoint files)

tech_stack:
  added: []
  patterns:
    - mcpToolHandler wrapping domain functions
    - Zod z.string().min(1) guard for required string inputs
    - z.number().int().positive().optional().default(8) for bounded integer with default
    - Anti-collision descriptions referencing sibling tool by name (D-03)

key_files:
  created:
    - src/lib/mcp/tools/address.ts
    - src/lib/__tests__/mcp-tools-address.test.ts
  modified: []

decisions:
  - "Used z.number() (not z.coerce) for limit parameter — MCP clients send typed JSON; coerce is for HTTP string inputs (Pitfall 1/5 from PATTERNS.md)"
  - "address_normalize description explicitly documents best-effort resolution: null components are expected, not errors"
  - "Did not touch registry.ts per D-05 wave-1 disjoint-files constraint"

metrics:
  duration: "5m"
  completed: "2026-06-18"
  tasks: 2
  files: 2
---

# Phase 2 Plan 04: Address MCP Tools Summary

Delivered address_normalize and address_suggest MCP tool adapters wrapping `src/lib/angola/address.ts` with Zod input validation and mcpToolHandler error boundary.

## What Was Built

**src/lib/mcp/tools/address.ts** — exports `registerAddressTools(server)` registering two tools:

- `address_normalize` (title: 'Normalize Angola Address'): accepts `{ address: string (min 1) }`, calls `normalizeAngolanAddress(address)`, returns `{ input, normalized, components, diagnostics }`. Description documents best-effort resolution — null components are expected when a geo segment is unrecognized, not an error.
- `address_suggest` (title: 'Suggest Angola Address Parts'): accepts `{ query, type?, province?, municipality?, limit? }` with full Zod schema including `z.enum` for type and `z.number().int().positive().optional().default(8)` for limit. Calls `suggestAngolanAddressParts(...)`.

Both tools use anti-collision descriptions (D-03) that name the sibling tool.

**src/lib/__tests__/mcp-tools-address.test.ts** — 4 tests covering:
- Registration of both tools
- Non-empty title and description on each
- address_normalize happy path: components field present
- address_suggest happy path: returns array

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 (RED) | 7e745e7 | test(02-04): add failing tests for address_normalize and address_suggest |
| Task 2 (GREEN) | 8346572 | feat(02-04): implement registerAddressTools |

## Deviations from Plan

None — plan executed exactly as written.

## TDD Gate Compliance

- RED gate: commit 7e745e7 — test(02-04) commit with failing tests (Cannot find module)
- GREEN gate: commit 8346572 — feat(02-04) commit, all 4 tests pass

## Threat Model Coverage

| Threat | Mitigation Applied |
|--------|--------------------|
| T-02-07: Empty string inputs | z.string().min(1) on address and query; domain functions throw RouteError mapped to isError by mcpToolHandler |
| T-02-08: Oversized limit | z.number().int().positive() enforced; function works over in-memory data only |

## Self-Check: PASSED

- src/lib/mcp/tools/address.ts: EXISTS
- src/lib/__tests__/mcp-tools-address.test.ts: EXISTS
- registry.ts: UNTOUCHED (verified via git diff)
- All 4 tests: PASS
- tsc --noEmit: CLEAN
