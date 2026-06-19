---
phase: 4
slug: document-tools
status: draft
nyquist_compliant: false
wave_0_complete: false
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
| 04-01-xx | 01 | 1 | DOC-01 | — | Invoice tool returns `{ content: [resourceBlock, textBlock] }`, resource `mimeType: 'application/pdf'` + base64 `blob`, no `isError` | unit | `pnpm test -- mcp-tools-documents` | ❌ W0 | ⬜ pending |
| 04-01-xx | 01 | 1 | DOC-02 | — | Receipt + contract tools return identical resource+text structure as invoice | unit | `pnpm test -- mcp-tools-documents` | ❌ W0 | ⬜ pending |
| 04-01-xx | 01 | 1 | DOC-03 | — | Text fallback block carries doc type, filename, byte size (genuinely useful metadata) | unit | `pnpm test -- mcp-tools-documents` | ❌ W0 | ⬜ pending |
| 04-01-xx | 01 | 1 | DOC-04 | T-04-01 | Oversized PDF (`bytes*1.34 > 4_000_000`) returns `{ isError: true }` with `PDF_TOO_LARGE` before any response sent | unit | `pnpm test -- mcp-tools-documents` | ❌ W0 | ⬜ pending |
| 04-01-xx | 01 | 1 | DOC-04 | — | Registry exposes 25 tools incl. `generate_invoice_pdf`/`generate_receipt_pdf`/`generate_contract_pdf` | unit | `pnpm test -- mcp-registry` | ✅ | ⬜ pending |
| 04-01-xx | 01 | 1 | DOC-05 | — | `pnpm build` / `tsc --noEmit` passes; `/api/v1/documents/{contract,receipt}` resolve | build | `pnpm build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/__tests__/mcp-tools-documents.test.ts` — new test file covering success shape, size-guard error, 3-tool parity (DOC-01..DOC-04)
- [ ] Update `src/lib/__tests__/mcp-registry.test.ts` — bump tool count 22→25, assert 3 new tool names

*Existing jest infrastructure (`jest.config.js`, jsdom + node env) covers all phase requirements — no framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real MCP client renders embedded PDF resource | DOC-01 | Requires a live MCP-compatible client to confirm rendering | Call `generate_invoice_pdf` from an MCP client; confirm resource block decodes to a valid PDF |

*Automated tests assert the content-block shape and base64 validity; live-client rendering is the only manual surface.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
