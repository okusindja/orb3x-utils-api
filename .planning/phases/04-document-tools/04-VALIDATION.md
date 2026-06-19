---
phase: 4
slug: document-tools
status: verified
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-19
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 30.x |
| **Config file** | `jest.config.js` |
| **Quick run command** | `pnpm test -- mcp-tools-documents` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- mcp-tools-documents`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green + `pnpm build` passes
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | DOC-01 | — | Invoice tool returns `{ content: [resourceBlock, textBlock] }`, resource `mimeType: 'application/pdf'` + base64 `blob`, no `isError` | unit | `pnpm test -- mcp-tools-documents` | ✅ | ✅ green |
| 04-01-01 | 01 | 1 | DOC-02 | — | Receipt + contract tools return identical resource+text structure as invoice (`it.each(TOOL_NAMES)`) | unit | `pnpm test -- mcp-tools-documents` | ✅ | ✅ green |
| 04-01-01 | 01 | 1 | DOC-03 | — | Text fallback block carries filename + byte size (asserted: text contains `.pdf` + byte count) | unit | `pnpm test -- mcp-tools-documents` | ✅ | ✅ green |
| 04-01-01 | 01 | 1 | DOC-04 | T-04-01 | Oversized PDF (`bytes*1.34 > 4_000_000`) returns `{ isError: true }` with `PDF_TOO_LARGE`, `retryable:false`, before any response sent | unit | `pnpm test -- mcp-tools-documents` | ✅ | ✅ green |
| 04-01-01 | 01 | 1 | DOC-04 | — | Registry exposes 25 tools incl. `generate_invoice_pdf`/`generate_receipt_pdf`/`generate_contract_pdf` | unit | `pnpm test -- mcp-registry` | ✅ | ✅ green |
| 04-01-02 | 01 | 1 | DOC-05 | — | `tsc`/`pnpm build` passes; `/api/v1/documents/{invoice,contract,receipt}` routes compile + resolve | build | `pnpm build` | ✅ | ✅ green |
| 04-01-02 | 01 | 1 | DOC-04 | T-04-03 | Input arrays bounded by Zod `.max()` (items≤200, parties≤50, clauses≤200) — oversized arrays rejected | unit | `pnpm test -- mcp-tools-documents` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/lib/__tests__/mcp-tools-documents.test.ts` — covers success shape, size-guard error, 3-tool parity, **and input-bound caps** (DOC-01..DOC-04, T-04-03). 9 tests.
- [x] Update `src/lib/__tests__/mcp-registry.test.ts` — bumped tool count 22→25, asserts 3 new tool names. 3 tests.

*Existing jest infrastructure (`jest.config.js`, jsdom + node env) covered all phase requirements — no framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real MCP client renders embedded PDF resource | DOC-01 | Requires a live MCP-compatible client to confirm rendering | Call `generate_invoice_pdf` from an MCP client; confirm resource block decodes to a valid PDF |

*Automated tests assert the content-block shape and base64 validity; live-client rendering is the only manual surface.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s (full suite ~1.6s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** verified 2026-06-19

---

## Validation Audit 2026-06-19

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

All 5 requirements (DOC-01..DOC-05) have automated verification (12 tests across `mcp-tools-documents` + `mcp-registry`, plus the `pnpm build` gate for DOC-05). No MISSING or PARTIAL gaps — auditor spawn not required. One supplementary **manual-only** check remains (live MCP client rendering the embedded PDF resource); it is not a requirement gap, so Nyquist compliance is unaffected.
