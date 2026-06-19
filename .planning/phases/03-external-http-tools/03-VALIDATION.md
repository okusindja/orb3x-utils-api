---
phase: 3
slug: external-http-tools
status: verified
nyquist_compliant: true
wave_0_complete: true
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
| 3-01 | tool-error ext | 1 | (foundation) | unit | `pnpm test -- mcp-tool-error` | ✅ | ✅ green |
| 3-02 | finance | 2 | FIN-01 | unit | `pnpm test -- mcp-tools-finance` | ✅ | ✅ green |
| 3-03 | currency | 2 | FIN-02 | unit (mocked fetch) | `pnpm test -- mcp-tools-currency` | ✅ | ✅ green |
| 3-04 | nif | 2 | NIF-01 | unit (mocked fetch) | `pnpm test -- mcp-tools-nif` | ✅ | ✅ green |
| 3-05 | translation | 2 | TRN-01 | unit (mocked fetch) | `pnpm test -- mcp-tools-translation` | ✅ | ✅ green |
| 3-int | registry integration | 3 | all | unit | `pnpm test -- mcp-registry && pnpm exec tsc --noEmit` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Extend `mcp-tool-error.test.ts` — duck-typed `{code,statusCode}` → structured isError; `RouteError` still maps via its own branch (regression); extra props (retryable/retryAfterSeconds) serialized
- [x] `mcp-tools-finance.test.ts` — finance_vat/invoice_total/inflation_adjust happy + isError
- [x] `mcp-tools-currency.test.ts` — currency_rates/convert; mocked fetch success + upstream-failure → structured retryable isError
- [x] `mcp-tools-nif.test.ts` — nif_lookup; mocked success + failure → retryable isError
- [x] `mcp-tools-translation.test.ts` — translate_text; mocked success + failure → isError
- [x] Jest already installed

*External upstreams are mocked (jest.spyOn on global fetch / the client functions). No live network in tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live external tools against real upstreams | FIN-02, NIF-01, TRN-01 | Real network + live AGT/Render/Google | After deploy, call currency_rates (live rates), nif_lookup (real NIF), translate_text against `/api/mcp`; confirm a slow/unreachable upstream yields structured retryable isError, not a 500 |

---

## Validation Sign-Off

- [x] Every tool/foundation task has an `<automated>` verify or Wave 0 dependency
- [x] No 3 consecutive auto tasks without an automated verify
- [x] Wave 0 covers tool-error extension + 4 domain test files
- [x] mcpToolHandler regression covered (RouteError still maps)
- [x] No watch-mode flags; latency < 30s (external-HTTP suites ~0.6s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** verified 2026-06-19

---

## Validation Audit 2026-06-19

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

Retroactive audit (milestone v1.0). Like Phase 2, this VALIDATION.md was a stale pre-execution draft never updated post-execution — actual coverage was complete. All Phase-3 surfaces have green tests: `mcp-tool-error` (duck-typed external-error branch + RouteError regression + extra-prop serialization), `mcp-tools-currency` / `mcp-tools-nif` / `mcp-tools-translation` (mocked-fetch success + upstream-failure → structured retryable isError), plus `mcp-tools-finance`. The external-HTTP suites pass **4 suites / 23 tests** (mocked upstreams — no live network). Live-upstream behavior remains a documented manual-only check. No MISSING/PARTIAL gaps — auditor spawn not required.
