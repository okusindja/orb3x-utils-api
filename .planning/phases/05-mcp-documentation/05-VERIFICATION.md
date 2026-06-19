---
phase: 05-mcp-documentation
verified: 2026-06-19T00:00:00Z
status: passed
score: 6/6 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: none
  note: initial verification
recommendations:
  - id: WR-01
    severity: non-blocking
    summary: "Page tool rows are hand-authored and not test-enforced to equal MCP_TOOL_CATALOG. The coverage test enforces catalog↔registry only, not page↔catalog. Page is correct today (diff-verified identical) but future drift is not CI-caught. Recommend either (a) derive page rows from MCP_TOOL_CATALOG, (b) add a page↔catalog set-equality test, or (c) soften the catalog.ts doc comment to describe reality."
---

# Phase 5: MCP Documentation Verification Report

**Phase Goal:** The docs site has a localized MCP page in all 7 languages that documents the endpoint URL, full tool catalog, client connection examples (native Streamable HTTP and `mcp-remote` fallback), and NIF portal latency disclosure.
**Verified:** 2026-06-19
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `/docs/mcp` renders in all 7 locales showing `POST /api/mcp` + 25-tool catalog | ✓ VERIFIED | `'mcp'` is last entry of `docsPageSlugs` (site-content.ts:16); `"mcp"`/`slug:'mcp'` present in all 7 locale files (en/pt bare-key, es/fr/de/zh/ja JSON-quoted at line 2362); `pnpm build` SSG-generates `/docs/[slug]` over `docsPageSlugs`; endpoint block `method:'POST', path:'/api/mcp'` present (endpoint refs ×5 per locale) |
| 2 | Catalog tool-name set exactly equals the 25 names from `registerAllTools` — enforced by automated set-equality test | ✓ VERIFIED | `mcp-catalog.test.ts:41` `new Set(MCP_TOOL_NAMES)` `toEqual` `new Set(registeredNames)` from `registerAllTools(mockServer)`; length-25 assert line 45; `pnpm test -- mcp-catalog mcp-registry` → 7 passed |
| 3 | Each catalog row shows tool name + one-liner + link to `/docs/[slug]` | ✓ VERIFIED | en mcp block: 25 rows `['name','one-liner',{label,href:'/docs/<slug>'}]`; 25 `href:'/docs/` cells; DataTable renders object cells as `<Link href={cell.href} className="font-semibold text-primary">` (site-primitives.tsx:451-453) |
| 4 | 4 copy-pasteable snippets — Claude Desktop (mcp-remote bridge, not bare url), Cursor (bare url), generic mcp.json (type:http), npx mcp-remote — all referencing the endpoint | ✓ VERIFIED | en connect section: 4 `language` snippets (3 json + 1 bash); Claude Desktop uses `"command":"npx","args":[...,"mcp-remote",...]`; Cursor uses bare `"url"`; all reference `https://utils.api.orb3x.com/api/mcp`; no Authorization/api-key/bearer/token found in any locale mcp block |
| 5 | NIF 5–30 s latency disclosed BOTH on nif_lookup row AND a dedicated latency section | ✓ VERIFIED | All 7 locales: `5–30` (EN DASH U+2013) appears exactly twice — once on the `nif_lookup` row, once in `id:'latency'` note; test `mcp-catalog.test.ts:63-73` asserts both surfaces on the en page |
| 6 | All 7 locale docs files carry a complete mcp DocsPage; `pnpm build` (tsc totality) passes | ✓ VERIFIED | `DocsPageMap` is total (`Record<DocsPageSlug, DocsPage>`); all 7 files have a full mcp entry (connect + 10 catalog tables + latency); `pnpm build` → "Compiled successfully", 29/29 static pages generated, exit 0 |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/mcp/catalog.ts` | 25 `{name,docsSlug}` + `MCP_TOOL_NAMES` | ✓ VERIFIED | 25 entries `as const satisfies readonly McpToolCatalogEntry[]`; `MCP_TOOL_NAMES` derived; imports `DocsPageSlug` |
| `src/lib/__tests__/mcp-catalog.test.ts` | registry↔catalog + snippet/latency asserts | ✓ VERIFIED | jest.mock agt-nif guard before import; 4 tests, all green |
| `src/lib/site-content.ts` | `'mcp'` slug + `DocsTableCell` union | ✓ VERIFIED | slug at line 16; `DocsTableCell = string \| {label,href}` line 27; `rows: DocsTableCell[][]` line 31 |
| `src/components/site-primitives.tsx` | object-cell `next/link` + key fix | ✓ VERIFIED | lines 445/448/451-453 render Link, guarded keys |
| `src/locales/site/docs/en.ts` (+6 overrides) | complete mcp DocsPage | ✓ VERIFIED | all 7 present and complete |

### Key Link Verification

| From | To | Via | Status |
|------|----|----|--------|
| mcp-catalog.test.ts | mcp/registry.ts | `registerAllTools(mockServer)` capture | ✓ WIRED |
| mcp-catalog.test.ts | mcp/catalog.ts | `MCP_TOOL_NAMES` set equality | ✓ WIRED |
| site-primitives.tsx | site-content.ts | `DocsTableCell` import + render | ✓ WIRED |
| 6 locale override files | site-content.ts | `DocsPageMap` totality forces `mcp` | ✓ WIRED (build passes) |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| /docs/mcp page rows | DocsPage.sections[].table.rows | hand-authored locale `DocsPageMap` (en base + mergeDeep) | Yes — 25 real tool rows, diff-verified identical to MCP_TOOL_CATALOG | ✓ FLOWING |

Note (Level 4 nuance, see WR-01): the page rows do NOT import `MCP_TOOL_CATALOG` — they are authored constants. Data is real and correct today (page↔catalog diff = identical, 25/25), but the wiring is content-authored rather than catalog-derived.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full test suite green | `pnpm test` | 24 suites, 113 tests passed | ✓ PASS |
| Catalog/registry coverage | `pnpm test -- mcp-catalog mcp-registry` | 2 suites, 7 tests passed | ✓ PASS |
| 7-locale totality + SSG | `pnpm build` | Compiled successfully, 29/29 static, `/docs/[slug]` SSG, exit 0 | ✓ PASS |
| Page rows == registry catalog | `diff` page col-0 names vs catalog names | IDENTICAL (25/25) | ✓ PASS |
| No secrets in snippets | grep Authorization/api-key/bearer/token in mcp blocks | none found | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DOCS-01 | 05-01 | Docs page documents endpoint URL + tool catalog | ✓ SATISFIED | Truths 1,2,3; endpoint block + 25-tool catalog present and registry-verified |
| DOCS-02 | 05-01 | Client snippets (native Streamable HTTP + mcp-remote) + NIF latency | ✓ SATISFIED | Truths 4,5; 4 snippets, mcp-remote bridge + bare url, latency disclosure |
| DOCS-03 | 05-01 | Localized across all 7 locales via deep-merge | ✓ SATISFIED | Truth 6; all 7 `DocsPageMap`s complete, build totality gate passes |

No orphaned requirements — REQUIREMENTS.md maps DOCS-01/02/03 to Phase 5, all claimed by the plan.

### Anti-Patterns Found

None. No TBD/FIXME/XXX/HACK/PLACEHOLDER markers in any modified file. Existing `string[][]` docs tables (24 in en.ts) compile unchanged under the widened `DocsTableCell[][]` union — backward compatibility confirmed by the passing build.

### Code-Review Finding Assessment — WR-01 (page↔catalog drift)

**Judgment: PASS-with-recommendation (not a gap).**

- **Goal test:** The goal requires the page to "document the full tool catalog." It does — all 25 registry tools are displayed, and a byte-level `diff` of the page's column-0 tool names against `MCP_TOOL_CATALOG` is IDENTICAL. DOCS-01's success criterion ("displays the MCP endpoint URL and tool catalog") is observably true in the codebase today.
- **What WR-01 actually flags:** a *future-proofing* gap, not a *current correctness* gap. The coverage test enforces catalog↔registry set-equality, and the hand-authored page rows happen to match the catalog, but no test locks page↔catalog. A future tool added to registry+catalog (test stays green) could leave the page silently stale.
- **CONTEXT D-01 intent ("a test so it can never silently drift"):** partially fulfilled. The canonical *name set* can never drift from `registerAllTools` (enforced). The *rendered page rows* are not under that same enforcement. D-01's literal mandate was the registry-coverage test — which exists and passes — so the phase's stated test contract is met; the stronger "page can never drift" reading is a reasonable but un-mandated extension.
- **Conclusion:** Deliverable is correct and complete today; the drift risk is a maintainability recommendation (carried in frontmatter `recommendations`), not a blocker. Status remains `passed`.

### Human Verification Required

None required for goal achievement (all criteria programmatically verified: build, tests, diff, grep). The plan's optional manual visual pass (`pnpm dev` → visit `/docs/mcp` in each locale to confirm visual rendering) is a nice-to-have for milestone sign-off but is not a gate — the SSG build already prerenders the page and the typed totality gate guarantees structural completeness.

### Gaps Summary

No gaps. All 6 must-haves verified, all 3 requirements (DOCS-01/02/03) satisfied, full test suite (113) green, build (7-locale totality + SSG) green, page tool rows diff-identical to the registry-verified catalog. The single code-review warning (WR-01) is a non-blocking future-drift recommendation, not a goal failure.

---

_Verified: 2026-06-19_
_Verifier: Claude (gsd-verifier)_
