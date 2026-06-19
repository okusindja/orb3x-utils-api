---
phase: 5
slug: mcp-documentation
status: draft
nyquist_compliant: false
wave_0_complete: false
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
| 05-01-xx | 01 | 1 | DOCS-01 | — | Registry↔catalog coverage: the `mcp` page catalog lists EXACTLY the registered tool names (set equality vs `registerAllTools`) — no missing, no phantom | unit | `pnpm test -- mcp-catalog` | ❌ W0 | ⬜ pending |
| 05-01-xx | 01 | 1 | DOCS-01 | — | `'mcp'` added to `docsPageSlugs`; an `mcp` `DocsPage` exists in all 7 locale `DocsPageMap`s; `pnpm build` (tsc) passes | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 05-01-xx | 01 | 1 | DOCS-02 | — | The `mcp` page includes 4 connection snippets (Claude Desktop via mcp-remote, Cursor, generic mcp.json, npx mcp-remote command), all referencing `https://utils.api.orb3x.com/api/mcp` | unit | `pnpm test -- mcp-catalog` | ❌ W0 | ⬜ pending |
| 05-01-xx | 01 | 1 | DOCS-03 | — | NIF 5–30 s latency disclosed BOTH inline on the `nif_lookup` catalog row AND in a dedicated "Performance & latency" section | unit | `pnpm test -- mcp-catalog` | ❌ W0 | ⬜ pending |
| 05-01-xx | 01 | 1 | DOCS-01 | — | `DocsTableCell` link-cell extension renders a working `/docs/[slug]` link without breaking existing `string[][]` tables (existing docs render tests stay green) | unit/build | `pnpm test && pnpm build` | ✅ (existing) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/__tests__/mcp-catalog.test.ts` (or similar) — registry↔catalog set-equality test + connection-snippet presence + NIF latency string presence. Mirror `mcp-registry.test.ts`'s mock-server `registerTool` capture; keep the `jest.mock('@/lib/agt-nif', …)` block (cheerio/ESM breaks under jsdom otherwise).
- [ ] Canonical tool-name source `src/lib/mcp/catalog.ts` (recommended) so the page and the test read ONE list.

*Existing jest infrastructure covers all phase requirements — no framework install needed. The 7-locale totality gate relies on `pnpm build` (tsc), not jest.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Each of the 7 locales renders the `/docs/mcp` page without error | DOCS-01 | Visual render across locales is best eyeballed (automated render-smoke can assert no-throw, but visual correctness is manual) | `pnpm dev`; visit `/en/docs/mcp` … `/ja/docs/mcp` (per the locale routing); confirm catalog, snippets, NIF section render |
| Connection snippets actually connect a real MCP client | DOCS-02 | Requires a live MCP client (Claude Desktop / Cursor) against the deployed endpoint | Paste each snippet into the respective client; confirm it lists the 25 tools |

*Automated tests assert structural presence (tool coverage, snippet blocks, latency string, TS compile); live-client connection + visual render are the manual surfaces.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (tests)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
