---
phase: 1
slug: mcp-foundation
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-18
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Per-task rows completed by the planner from the five PLAN.md files.

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

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-T1 | 01 | 1 | — | T-01-SC | MCP packages installed, zod pinned to 3.x, no dual-version conflict | check | `pnpm why zod` | ✅ | ⬜ pending |
| 1-01-T2 | 01 | 1 | PERF-01 | T-01-02 | Bank logos extracted to public/bank-logos/ under alias filenames | check | node existsSync gate | ✅ (creates assets) | ⬜ pending |
| 1-01-T3 | 01 | 1 | MCP-03/04/05, PERF-01 | — | Failing Wave 0 test scaffolds exist and are discovered | unit (RED) | `pnpm test -- --listTests` | ✅ (creates tests) | ⬜ pending |
| 1-02-T1 | 02 | 2 | MCP-04 | T-01-04 | Throwing tool returns `{ isError:true, content }`, never a 500 | unit | `pnpm test -- mcp-tool-error` | ✅ (W0) | ⬜ pending |
| 1-02-T2 | 02 | 2 | MCP-03 | T-01-03 | `tools/list` returns `health` with name/title/description/Zod inputSchema | unit | `pnpm test -- mcp-registry` | ✅ (W0) | ⬜ pending |
| 1-02-T3 | 02 | 2 | MCP-01/02 | T-01-05 | Route exports GET/POST/DELETE, stateless, basePath '/api', maxDuration 60 | check | `pnpm exec tsc --noEmit` + grep gate | ✅ | ⬜ pending |
| 1-03-T1 | 03 | 2 | MCP-05 | T-01-DoS | >60 req/min per IP on /api/mcp + /api/sse get 429 + Retry-After in RouteError shape | unit | `pnpm test -- middleware-rate-limit` | ✅ (W0) | ⬜ pending |
| 1-04-T1 | 04 | 2 | PERF-01 | T-01-FS | bank-images.ts has no inline base64; path resolver returns path/null | unit | `pnpm test -- bank-images` | ✅ (W0) | ⬜ pending |
| 1-04-T2 | 04 | 2 | PERF-01 | T-01-AVL | getAngolaBankLogoBytes returns Uint8Array/null without throwing (graceful skip) | unit | `pnpm test -- angola-banks` | ✅ (extend) | ⬜ pending |
| 1-05-T1 | 05 | 3 | all | T-01-VERIFY | Full suite + tsc green (phase gate) | full suite | `pnpm test && pnpm exec tsc --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] MCP error-mapping unit test (`mcp-tool-error.test.ts`) — created in plan 01
- [x] MCP registry unit test (`mcp-registry.test.ts`) — created in plan 01
- [x] `middleware.ts` rate-limit unit test (`middleware-rate-limit.test.ts`) — created in plan 01
- [x] bank-logo filesystem-read unit test (`bank-images.test.ts`) — created in plan 01
- [x] Extend `angola-banks.test.ts` for `getAngolaBankLogoBytes` null fallback — done in plan 04
- [x] Jest already installed — no framework install needed

*All Wave 0 test stubs are created in plan 01-01 (RED), then driven GREEN by plans 02/03/04.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real MCP client connects to deployed endpoint | MCP-01 | Requires a live deploy + external client | Connect Claude Desktop/Code to `https://<host>/api/mcp`; confirm `health` tool listed and callable (plan 05 checkpoint step 7) |
| MCP Inspector handshake (both transports) | MCP-01/02/03 | Interactive browser tool | `npx @modelcontextprotocol/inspector` against `http://localhost:3000/api/mcp` (plan 05 checkpoint steps 1-5) |
| Live 429 throttle | MCP-05 | Requires running endpoint + burst traffic | 61+ requests in a minute → 429 (plan 05 checkpoint step 6) |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or are explicit human-verify checkpoints
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (created in plan 01)
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** planned
