---
phase: 01-mcp-foundation
plan: 03
subsystem: mcp-foundation
tags: [middleware, rate-limit, mcp, security, wave-2]
dependency_graph:
  requires: [01-01 (wave-0-test-scaffolds)]
  provides: [per-IP-rate-limiter, middleware.ts]
  affects: [plan-05 (confirm SSE path matches matcher), all /api/mcp and /api/sse traffic]
tech_stack:
  added: []
  patterns: [next-middleware-fixed-window-rate-limit, x-forwarded-for-ip-extraction]
key_files:
  created:
    - middleware.ts
  modified: []
decisions:
  - "In-memory Map chosen over Redis for rate-limit state (D-04 free-tier constraint); counts reset on cold start is accepted, not a defect"
  - "IP extracted from x-forwarded-for first hop; falls back to 'unknown' which shares one bucket — over-throttles rather than under-throttles (T-01-SPOOF accepted)"
  - "matcher covers /api/mcp AND /api/sse to prevent SSE GET transport from bypassing throttling (D-02, Pitfall 5)"
  - "Plan-05 flag: confirm deployed SSE path equals /api/sse via MCP Inspector; adjust matcher if it differs"
metrics:
  duration: ~5 minutes
  completed: 2026-06-18
---

# Phase 01 Plan 03: Per-IP Rate-Limit Middleware Summary

**One-liner:** Created middleware.ts with 60 req/min per-IP fixed-window limiter scoped to /api/mcp + /api/sse, returning 429 in RouteError JSON shape with Retry-After and Cache-Control: no-store.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Implement per-IP fixed-window rate limiter | 0bf36a1 | middleware.ts |

## Implementation Details

### Rate Limiter Design

- **Constants:** `WINDOW_MS = 60_000`, `MAX_REQUESTS = 60` (D-01)
- **State:** Module-level `const store = new Map<string, WindowEntry>()` — per-instance, no Redis (D-04)
- **IP extraction:** `x-forwarded-for` first hop via `.split(',')[0].trim()`; falls back to `'unknown'` — never uses `request.ip`
- **Window reset:** On each request, if `now >= entry.resetAt`, entry is replaced with a fresh window
- **429 body:** `{ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please wait before retrying.' } }`
- **429 headers:** `Content-Type: application/json`, `Cache-Control: no-store`, `Retry-After: <seconds>`
- **Pass-through:** `NextResponse.next()` for requests within limit
- **Matcher:** `['/api/mcp', '/api/sse']` — both MCP transports covered (D-02)

### Threat Model Mitigations Applied

| Threat | Mitigation |
|--------|-----------|
| T-01-DoS | Per-IP 60 req/min; 429 + Retry-After on breach |
| T-01-SPOOF | x-forwarded-for accepted; unknown-IP bucket over-throttles (accepted) |
| T-01-STATE | Per-instance Map; cold-start reset documented as accepted constraint |

## Test Results

`pnpm test -- middleware-rate-limit`: 5/5 GREEN

| Test Case | Result |
|-----------|--------|
| Allows ≤60 requests through (pass-through) | PASS |
| 61st request returns 429 | PASS |
| 429 includes Retry-After header > 0 | PASS |
| 429 body matches { error: { code: RATE_LIMIT_EXCEEDED, message } } | PASS |
| Different IP not throttled after first IP is throttled | PASS |

## Deviations from Plan

None — plan executed exactly as written. Implementation matches the concrete code in 01-PATTERNS.md verbatim.

## Known Stubs

None — middleware.ts is fully functional. All acceptance criteria met.

## Flag for Plan 05

Confirm the live SSE path equals `/api/sse` via MCP Inspector after deployment. If the deployed SSE path differs (e.g., `/api/mcp/sse`), the matcher must be updated in a follow-up commit.

## Threat Flags

None — middleware.ts introduces rate-limiting at the trust boundary (public internet → /api/mcp + /api/sse) as planned. No new unmitigated surfaces.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| middleware.ts created | FOUND |
| config.matcher includes '/api/mcp' | FOUND |
| config.matcher includes '/api/sse' | FOUND |
| Commit 0bf36a1 | FOUND |
| middleware-rate-limit.test.ts: 5/5 GREEN | VERIFIED |
