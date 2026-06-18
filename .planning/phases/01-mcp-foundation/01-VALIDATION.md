---
phase: 1
slug: mcp-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-18
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Per-task rows are completed by the planner; this file is the draft scaffold.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.x (jest-environment-jsdom; @testing-library/react) |
| **Config file** | `jest.config.js` |
| **Quick run command** | `pnpm test -- <pattern>` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- <relevant pattern>`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

> Populated by the planner from PLAN.md tasks. Anchors derived from RESEARCH.md "Validation Architecture".

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-XX-XX | XX | 1 | MCP-01/02 | — | Endpoint handshake returns valid JSON-RPC over Streamable HTTP + SSE | integration | `pnpm test -- mcp` | ❌ W0 | ⬜ pending |
| 1-XX-XX | XX | 1 | MCP-03 | — | `tools/list` returns `health` tool with name/title/description/inputSchema | integration | `pnpm test -- mcp` | ❌ W0 | ⬜ pending |
| 1-XX-XX | XX | 1 | MCP-04 | — | A throwing tool returns `{ isError: true, content }` — never a 500 | unit | `pnpm test -- tool-error` | ❌ W0 | ⬜ pending |
| 1-XX-XX | XX | 1 | MCP-05 | — | Requests over 60/min per IP on `/api/mcp` (+ `/api/sse`) get 429 + Retry-After in RouteError shape | unit | `pnpm test -- middleware` | ❌ W0 | ⬜ pending |
| 1-XX-XX | XX | 1 | PERF-01 | — | `bank-images.ts` has no inline base64; logo bytes read from `public/bank-logos/`; missing file → graceful skip | unit | `pnpm test -- bank` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] MCP handler / tools integration test harness (invoke handler with JSON-RPC `tools/list` + `tools/call`)
- [ ] `middleware.ts` rate-limit unit test (simulate >60 req/min from one IP)
- [ ] `mcpToolHandler` error-mapping unit test (RouteError → isError shape)
- [ ] bank-logo filesystem-read unit test (present file + missing file fallback)
- [ ] Jest already installed — no framework install needed

*Existing Jest infrastructure covers the test runner; new test files are Wave 0 stubs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real MCP client connects to deployed endpoint | MCP-01 | Requires a live deploy + external client | Connect Claude Desktop/Code to `https://<host>/api/mcp`; confirm `health` tool is listed and callable |
| MCP Inspector handshake | MCP-01/02/03 | Interactive browser tool | `npx @modelcontextprotocol/inspector` against `http://localhost:3000/api/mcp`; confirm transports + tools/list |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
