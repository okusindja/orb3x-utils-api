---
phase: 2
slug: core-utility-tools
status: verified
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-18
---

# Phase 2 — Validation Strategy

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

- **After every task commit:** `pnpm test -- <domain pattern>`
- **After every plan wave:** `pnpm test`
- **Before verify:** full suite green + `pnpm exec tsc --noEmit` clean
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

> One verification triplet per domain tool module: tools/list includes each tool; a happy-path call returns expected JSON; a bad-input call returns `{ isError: true }`. Populated/expanded by the planner.

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01 | salary | 1 | SAL-01 | unit | `pnpm test -- mcp-tools-salary` | ✅ | ✅ green |
| 2-02 | phone | 1 | LOC-01 | unit | `pnpm test -- mcp-tools-phone` | ✅ | ✅ green |
| 2-03 | geo | 1 | LOC-02 | unit | `pnpm test -- mcp-tools-geo` | ✅ | ✅ green |
| 2-04 | address | 1 | LOC-03 | unit | `pnpm test -- mcp-tools-address` | ✅ | ✅ green |
| 2-05 | calendar | 1 | CAL-01 | unit | `pnpm test -- mcp-tools-calendar` | ✅ | ✅ green |
| 2-06 | finance | 1 | FIN-01/FIN-02 | unit | `pnpm test -- mcp-tools-finance` | ✅ | ✅ green |
| 2-int | registry-integration | 2 | all | unit | `pnpm test -- mcp-registry && pnpm exec tsc --noEmit` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*No `time` MCP tool exists this milestone (time is HTTP-only) — correctly no `mcp-tools-time` test.*

---

## Wave 0 Requirements

- [x] `mcp-tools-salary.test.ts` — tools/list has salary_net/gross/employer_cost; happy-path + isError
- [x] `mcp-tools-phone.test.ts` — phone_parse/validate/operator
- [x] `mcp-tools-geo.test.ts` — geo_provinces/municipalities/communes
- [x] `mcp-tools-address.test.ts` — address_normalize/suggest
- [x] `mcp-tools-calendar.test.ts` — calendar_holidays/working_days/add_working_days
- [x] `mcp-tools-finance.test.ts` — finance_vat/invoice_total/inflation_adjust (additional domain, covered)
- [x] Jest already installed — no framework install

*All present and green (6 suites / 30 tests). Test pattern mirrors existing `src/lib/__tests__/mcp-registry.test.ts` and `mcp-tool-error.test.ts`.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live MCP client lists + calls the 14 tools | all | Requires deployed endpoint + client | After deploy, MCP Inspector / Claude against `/api/mcp`: tools/list shows 14 new tools; spot-call salary_net, phone_validate, geo_provinces |

---

## Validation Sign-Off

- [x] Every tool has an `<automated>` verify or Wave 0 dependency
- [x] No 3 consecutive auto tasks without an automated verify
- [x] Wave 0 covers all domain test files (salary/phone/geo/address/calendar/finance)
- [x] No watch-mode flags
- [x] Feedback latency < 30s (domain suites ~0.7s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** verified 2026-06-19

---

## Validation Audit 2026-06-19

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

Retroactive audit (milestone v1.0). The VALIDATION.md was a stale pre-execution draft (`nyquist_compliant: false`, rows pending) that was never updated post-execution — but the actual coverage was complete all along: all 6 Phase-2 MCP tool domains (salary, phone, geo, address, calendar, finance) have dedicated `mcp-tools-*.test.ts` files, **6 suites / 30 tests passing**, plus the registry-integration test. No `time` MCP tool exists (HTTP-only), so no test is owed there. No MISSING/PARTIAL gaps — auditor spawn not required; only the doc needed updating to reflect reality.
