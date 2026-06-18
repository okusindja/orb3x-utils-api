---
phase: 3
slug: external-http-tools
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-18
---

# Phase 3 — Validation Strategy

> Per-phase validation contract. Per-task rows refined by the planner from the PLAN.md files.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.x |
| **Config file** | `jest.config.js` |
| **Quick run command** | `pnpm test -- <pattern>` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** `pnpm test -- <pattern>`
- **After every plan wave:** `pnpm test`
- **Before verify:** full suite green + `pnpm exec tsc --noEmit` clean
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

> External-tool upstream calls are MOCKED in unit tests (no live network). Populated/expanded by the planner.

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-XX | tool-error ext | 1 | (foundation) | unit | `pnpm test -- mcp-tool-error` | ✅ extend | ⬜ pending |
| 3-XX | finance | 2 | FIN-01 | unit | `pnpm test -- mcp-tools-finance` | ❌ W0 | ⬜ pending |
| 3-XX | currency | 2 | FIN-02 | unit (mocked fetch) | `pnpm test -- mcp-tools-currency` | ❌ W0 | ⬜ pending |
| 3-XX | nif | 2 | NIF-01 | unit (mocked fetch) | `pnpm test -- mcp-tools-nif` | ❌ W0 | ⬜ pending |
| 3-XX | translation | 2 | TRN-01 | unit (mocked fetch) | `pnpm test -- mcp-tools-translation` | ❌ W0 | ⬜ pending |
| 3-XX | registry integration | 3 | all | unit | `pnpm test -- mcp-registry && pnpm exec tsc --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Extend `mcp-tool-error.test.ts` — assert a duck-typed `{code,statusCode}` error maps to structured isError AND a `RouteError` still maps via its own branch (regression) AND extra props (retryable/retryAfterSeconds) are serialized
- [ ] `mcp-tools-finance.test.ts` — finance_vat/invoice_total/inflation_adjust happy + isError
- [ ] `mcp-tools-currency.test.ts` — currency_rates/convert; mock fetch success + upstream-failure → structured retryable isError; cache hit avoids second fetch
- [ ] `mcp-tools-nif.test.ts` — nif_lookup; mock success + timeout → retryable isError with retryAfterSeconds
- [ ] `mcp-tools-translation.test.ts` — translate_text; mock success + failure → isError
- [ ] Jest already installed

*External upstreams are mocked (jest.spyOn on global fetch / the client functions). No live network in tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live external tools against real upstreams | FIN-02, NIF-01, TRN-01 | Real network + live AGT/Render/Google | After deploy, call currency_rates (live rates), nif_lookup (real NIF), translate_text against `/api/mcp`; confirm a slow/unreachable upstream yields structured retryable isError, not a 500 |

---

## Validation Sign-Off

- [ ] Every tool/foundation task has an `<automated>` verify or Wave 0 dependency
- [ ] No 3 consecutive auto tasks without an automated verify
- [ ] Wave 0 covers tool-error extension + 4 domain test files
- [ ] mcpToolHandler regression covered (RouteError still maps)
- [ ] No watch-mode flags; latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
