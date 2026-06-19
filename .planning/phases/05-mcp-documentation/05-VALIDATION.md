---
phase: 5
slug: mcp-documentation
status: verified
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-19
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 30.x + `pnpm build` (tsc) for the 7-locale compile gate |
| **Config file** | `jest.config.js` |
| **Quick run command** | `pnpm test -- mcp-catalog` |
| **Full suite command** | `pnpm test` |
| **Compile gate** | `pnpm build` (only tsc catches the all-7-locales `DocsPageMap` totality) |
| **Estimated runtime** | ~30 s tests + build |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- mcp-catalog`
- **After locale-file edits:** Run `pnpm build` (the only thing that catches a missing/partial `mcp` `DocsPage` in any of the 7 locale files)
- **Before `/gsd:verify-work`:** Full suite green + `pnpm build` passes
- **Max feedback latency:** ~30 s (tests); build longer

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | DOCS-01 | — | Registry↔catalog coverage: the `mcp` catalog lists EXACTLY the registered tool names (two-way `Set` equality vs `registerAllTools`, length 25) — no missing, no phantom | unit | `pnpm test -- mcp-catalog` | ✅ | ✅ green |
| 05-01-02 | 01 | 1 | DOCS-01/03 | — | `'mcp'` in `docsPageSlugs`; a complete `mcp` `DocsPage` exists in all 7 locale `DocsPageMap`s; `pnpm build` (tsc totality) passes | build | `pnpm build` | ✅ | ✅ green |
| 05-01-01 | 01 | 1 | DOCS-02 | — | The `mcp` page connect section has exactly 4 snippets, each referencing the endpoint URL or `mcp-remote` (Claude Desktop bridge, Cursor, generic mcp.json, npx) | unit | `pnpm test -- mcp-catalog` | ✅ | ✅ green |
| 05-01-01 | 01 | 1 | DOCS-02/03 | — | NIF `5–30` s latency disclosed BOTH inline on the `nif_lookup` row description AND in the dedicated `latency` section note | unit | `pnpm test -- mcp-catalog` | ✅ | ✅ green |
| 05-01-02 | 01 | 1 | DOCS-01 | — | `DocsTableCell` link-cell extension renders a working `/docs/[slug]` link without breaking existing `string[][]` tables (full suite + build stay green) | unit/build | `pnpm test && pnpm build` | ✅ | ✅ green |
| UAT-add | 01 | 1 | (extra) | — | `docsPageToMarkdown(page)` serializer correctness (title/intro/endpoint/cards/sections/tables-with-link-cells/code/notes/related) — 6 tests | unit | `pnpm test -- docs-markdown` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/lib/__tests__/mcp-catalog.test.ts` — registry↔catalog two-way set-equality + 4-snippet presence + NIF 5–30 on both surfaces. Mirrors `mcp-registry.test.ts`'s mock-server `registerTool` capture; keeps the `jest.mock('@/lib/agt-nif', …)` block.
- [x] Canonical tool-name source `src/lib/mcp/catalog.ts` — `MCP_TOOL_CATALOG` / `MCP_TOOL_NAMES`, read by the test (one source).

*Existing jest infrastructure covered all phase requirements — no framework install needed. The 7-locale totality gate relies on `pnpm build` (tsc), confirmed passing.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Each of the 7 locales renders the `/docs/mcp` page without error | DOCS-01 | Visual render across locales is best eyeballed (automated render-smoke can assert no-throw, but visual correctness is manual) | `pnpm dev`; visit `/en/docs/mcp` … `/ja/docs/mcp` (per the locale routing); confirm catalog, snippets, NIF section render |
| Connection snippets actually connect a real MCP client | DOCS-02 | Requires a live MCP client (Claude Desktop / Cursor) against the deployed endpoint | Paste each snippet into the respective client; confirm it lists the 25 tools |

*Automated tests assert structural presence (tool coverage, snippet blocks, latency string, TS compile); live-client connection + visual render are the manual surfaces.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s (catalog + markdown suites ~0.7s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** verified 2026-06-19

---

## Validation Audit 2026-06-19

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

All 3 requirements (DOCS-01..DOCS-03) have automated verification: `mcp-catalog.test.ts` (registry↔catalog two-way set equality + 25-count, 4 connection snippets, NIF 5–30 s on both surfaces) and the `pnpm build` tsc-totality gate (the `mcp` `DocsPage` is present and complete in all 7 locale `DocsPageMap`s). No MISSING or PARTIAL gaps — auditor spawn not required. The UAT-added `docs-markdown.ts` serializer also carries 6 dedicated tests. Manual-only surfaces (per-locale visual render, live MCP-client connect) confirmed via UAT (5/5 passed) — not requirement gaps, so Nyquist compliance stands.
