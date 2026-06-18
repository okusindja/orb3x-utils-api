---
phase: 01-mcp-foundation
plan: 02
subsystem: mcp-foundation
tags: [mcp, tool-error, registry, route, wave-2]
dependency_graph:
  requires: [01-01]
  provides: [mcpToolHandler, registerHealthTool, registerAllTools, app/api/[transport]/route.ts]
  affects: [plans 03/04/05 (middleware, domain tools, checkpoint — all depend on route + registry)]
tech_stack:
  added: []
  patterns: [HOF-error-boundary, aggregator-registry, dynamic-transport-route]
key_files:
  created:
    - src/lib/mcp/tool-error.ts
    - src/lib/mcp/tools/health.ts
    - src/lib/mcp/registry.ts
    - app/api/[transport]/route.ts
decisions:
  - "McpServer type resolved from @modelcontextprotocol/sdk/server/mcp.js (not mcp-handler direct export) — confirmed via node_modules/mcp-handler/dist/index.d.ts inspection"
  - "basePath '/api' confirmed per Pitfall 1: prefix before [transport], NOT the full public path /api/mcp"
  - "TSC errors in bank-images.test.ts and middleware-rate-limit.test.ts are pre-existing Wave 0 RED scaffolds for Plans 04 and 03 respectively — not introduced by this plan"
metrics:
  duration: ~10 minutes
  completed: 2026-06-18
---

# Phase 01 Plan 02: MCP Core — Tool-Error Boundary, Health Stub, Registry, Route Summary

**One-liner:** Implemented mcpToolHandler HOF error boundary, health stub tool + registry aggregator, and the stateless createMcpHandler route at app/api/[transport]/route.ts; Wave 0 RED tests for MCP-03/04 now GREEN.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Implement mcpToolHandler error boundary | e4f3ba5 | src/lib/mcp/tool-error.ts |
| 2 | Implement health tool and registry aggregator | a26535f | src/lib/mcp/tools/health.ts, src/lib/mcp/registry.ts |
| 3 | Wire createMcpHandler route | a29f6a5 | app/api/[transport]/route.ts |

## McpServer Type Resolution (Open Question 2 from RESEARCH.md)

**Resolved:** `McpServer` is NOT directly exported by `mcp-handler`. It is re-exported from `@modelcontextprotocol/sdk/server/mcp.js`. In `mcp-handler/dist/index.d.ts` line 2: `import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'`.

**For Phase 2 tool authors:** Use:
```typescript
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
```
Do NOT use `import type { McpServer } from 'mcp-handler'` — that type is not exported.

## Test Results

| Suite | Tests | Status |
|-------|-------|--------|
| mcp-tool-error.test.ts | 4 | GREEN |
| mcp-registry.test.ts | 2 | GREEN |

## Route Acceptance Criteria Verification

| Criterion | Status |
|-----------|--------|
| GET exported | PASS |
| POST exported | PASS |
| DELETE exported | PASS |
| basePath '/api' | PASS |
| maxDuration 60 | PASS |
| runtime 'nodejs' | PASS |
| No redisUrl | PASS |
| No disableSse | PASS |

## Deviations from Plan

None — plan executed exactly as written. The pre-existing TSC errors in `bank-images.test.ts` and `middleware-rate-limit.test.ts` (Wave 0 RED scaffolds from Plan 01 for Plans 04 and 03 respectively) are not caused by this plan.

## Known Stubs

- `registerHealthTool`: Health tool returns a static `{ status: 'ok', server, timestamp }` response. This is the intentional Phase 1 stub per D-07 — real domain tools land in Phases 2-4.

## Threat Flags

None — no new trust boundaries introduced. The `mcpToolHandler` error boundary correctly collapses non-RouteError internals to a generic INTERNAL_SERVER_ERROR (T-01-04 mitigated). Tool input validation via Zod `z.object({})` in `registerTool` establishes the SDK's Zod validation contract (T-01-03 foundation established).

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/lib/mcp/tool-error.ts | FOUND |
| src/lib/mcp/tools/health.ts | FOUND |
| src/lib/mcp/registry.ts | FOUND |
| app/api/[transport]/route.ts | FOUND |
| Commit e4f3ba5 (tool-error) | FOUND |
| Commit a26535f (health + registry) | FOUND |
| Commit a29f6a5 (route) | FOUND |
| mcp-tool-error tests GREEN (4/4) | PASS |
| mcp-registry tests GREEN (2/2) | PASS |
