---
phase: 2
slug: core-utility-tools
status: draft
nyquist_compliant: false
wave_0_complete: false
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
| 2-XX | salary | 1 | SAL-01 | unit | `pnpm test -- mcp-tools-salary` | ❌ W0 | ⬜ pending |
| 2-XX | phone | 1 | LOC-01 | unit | `pnpm test -- mcp-tools-phone` | ❌ W0 | ⬜ pending |
| 2-XX | geo | 1 | LOC-02 | unit | `pnpm test -- mcp-tools-geo` | ❌ W0 | ⬜ pending |
| 2-XX | address | 1 | LOC-03 | unit | `pnpm test -- mcp-tools-address` | ❌ W0 | ⬜ pending |
| 2-XX | calendar | 1 | CAL-01 | unit | `pnpm test -- mcp-tools-calendar` | ❌ W0 | ⬜ pending |
| 2-XX | registry-integration | 2 | all | unit | `pnpm test -- mcp-registry && pnpm exec tsc --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `mcp-tools-salary.test.ts` — tools/list has salary_net/gross/employer_cost; happy-path + isError
- [ ] `mcp-tools-phone.test.ts` — phone_parse/validate/operator
- [ ] `mcp-tools-geo.test.ts` — geo_provinces/municipalities/communes
- [ ] `mcp-tools-address.test.ts` — address_normalize/suggest
- [ ] `mcp-tools-calendar.test.ts` — calendar_holidays/working_days/add_working_days
- [ ] Jest already installed — no framework install

*Test pattern mirrors existing `src/lib/__tests__/mcp-registry.test.ts` and `mcp-tool-error.test.ts`.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Live MCP client lists + calls the 14 tools | all | Requires deployed endpoint + client | After deploy, MCP Inspector / Claude against `/api/mcp`: tools/list shows 14 new tools; spot-call salary_net, phone_validate, geo_provinces |

---

## Validation Sign-Off

- [ ] Every tool has an `<automated>` verify or Wave 0 dependency
- [ ] No 3 consecutive auto tasks without an automated verify
- [ ] Wave 0 covers all 5 domain test files
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
