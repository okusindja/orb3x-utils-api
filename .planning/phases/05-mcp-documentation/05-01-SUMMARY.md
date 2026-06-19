---
phase: 05-mcp-documentation
plan: 01
subsystem: ui
tags: [mcp, docs, i18n, next-link, jest, streamable-http, mcp-remote]

requires:
  - phase: 01-mcp-foundation
    provides: registerAllTools registry + POST /api/mcp Streamable HTTP endpoint
  - phase: 02-core-utility-tools
    provides: pure-function MCP tools (salary/phone/geo/address/calendar/finance/currency)
  - phase: 03-external-http-tools
    provides: nif_lookup, translate_text, currency tools
  - phase: 04
    provides: generate_*_pdf document tools
provides:
  - Localized /docs/mcp documentation page across all 7 site locales
  - src/lib/mcp/catalog.ts — canonical 25-tool name+slug source of truth
  - Registry↔catalog coverage test (two-way set equality, count 25)
  - Backward-compatible DocsTableCell link-cell render extension in DataTable
affects: [mcp-documentation, future-docs-pages, future-mcp-tools]

tech-stack:
  added: []
  patterns:
    - "Single source-of-truth name list (catalog.ts) reconciled with live registry via mock-server capture test"
    - "DocsTableCell union (string | {label, href}) for in-table next/link cells — backward-compatible widening"
    - "7-locale DocsPageMap totality enforced only by pnpm build tsc (not jest)"

key-files:
  created:
    - src/lib/mcp/catalog.ts
    - src/lib/__tests__/mcp-catalog.test.ts
    - .planning/phases/05-mcp-documentation/05-01-SUMMARY.md
  modified:
    - src/lib/site-content.ts
    - src/components/site-primitives.tsx
    - src/locales/site/docs/en.ts
    - src/locales/site/docs/pt.ts
    - src/locales/site/docs/es.ts
    - src/locales/site/docs/fr.ts
    - src/locales/site/docs/de.ts
    - src/locales/site/docs/zh.ts
    - src/locales/site/docs/ja.ts

key-decisions:
  - "health tool docsSlug resolved to 'api-reference' (no dedicated HTTP doc page exists)"
  - "Test accessor: getLocalizedDocsPage(locale, slug) from src/lib/site-copy.ts"
  - "'5–30' uses EN DASH U+2013 in both the nif_lookup catalog row and the latency note, in all 7 locales"
  - "Claude Desktop snippet uses the mcp-remote stdio bridge (NOT a bare remote url) + a Settings → Connectors note"
  - "Combined geo_* + address_* into one catalog-address-geo group (both map to address-geo slug)"
  - "health placed in its own 'Platform' (catalog-platform) group"

patterns-established:
  - "Catalog single-source-of-truth: page rows + coverage test both read MCP_TOOL_NAMES; never two lists"
  - "DocsTableCell object cell renders as next/link styled font-semibold text-primary, with key collision guarded"

requirements-completed: [DOCS-01, DOCS-02, DOCS-03]

duration: ~25min
completed: 2026-06-19
---

# Phase 5 Plan 01: MCP Documentation Summary

**Localized /docs/mcp page across all 7 locales documenting the POST /api/mcp Streamable HTTP endpoint, a registry-verified 25-tool catalog with per-tool docs links, 4 client connection snippets (mcp-remote bridge for Claude Desktop), and the NIF 5–30 s AGT-portal latency disclosure.**

## Performance

- **Duration:** ~25 min
- **Tasks:** 3
- **Files modified:** 9 (2 created, 7 modified) + 1 SUMMARY

## Accomplishments
- Authored a complete, localized `mcp` DocsPage in all 7 locale `DocsPageMap`s (en authored fully; pt/es/fr/de/zh/ja localize chrome + 25 one-liners while keeping snippets/endpoint/tool names/hrefs English).
- Created `src/lib/mcp/catalog.ts` as the single source of truth (25 `{name, docsSlug}` entries) and a two-way set-equality coverage test that reconciles the catalog against the live `registerAllTools` registry — drift now fails CI.
- Extended `DocsTableCell` to a backward-compatible union and taught `DataTable` to render object cells as `next/link`, with the pre-existing `key={cell}` collision fixed for object cells.
- NIF 5–30 s latency disclosed on BOTH surfaces (inline `nif_lookup` row + dedicated "Performance & latency" section) using the EN DASH (U+2013) in every locale.

## Task Commits

Each task was committed atomically:

1. **Task 1: Catalog source-of-truth + registry-coverage test** - `aae6993` (test — TDD: coverage assertions green, page assertions authored RED)
2. **Task 2: 'mcp' slug + DocsTableCell link-cell extension** - `074f28a` (feat)
3. **Task 3: Author mcp DocsPage in en + 6 locale overrides** - `a2dd14a` (feat — turned the RED page assertions green; build totality gate passes)

_Note: TDD Task 1 RED→GREEN spans the test commit (aae6993) and the en authoring in Task 3 (a2dd14a)._

## Files Created/Modified
- `src/lib/mcp/catalog.ts` - Ordered `MCP_TOOL_CATALOG` (25 `{name, docsSlug}`) + derived `MCP_TOOL_NAMES`; imports `DocsPageSlug` so slug typos fail at compile.
- `src/lib/__tests__/mcp-catalog.test.ts` - Keeps the `jest.mock('@/lib/agt-nif', …)` block (cheerio ESM guard); set-equality vs registry (25); connect-section 4-snippet + NIF 5–30 s presence assertions via `getLocalizedDocsPage('en','mcp')`.
- `src/lib/site-content.ts` - Appended `'mcp'` slug; added `DocsTableCell` union; widened `DocsTable.rows` to `DocsTableCell[][]`.
- `src/components/site-primitives.tsx` - `DataTable` renders object cells as `<Link className="font-semibold text-primary">`; guarded `<tr>`/`<td>` keys for object cells.
- `src/locales/site/docs/{en,pt,es,fr,de,zh,ja}.ts` - Complete `mcp` DocsPage entry (connect + 10 catalog tables + latency).

## Decisions Made
- **health → api-reference:** the `health` tool has no dedicated `/docs/[slug]` HTTP page, so its catalog row links to `api-reference` (the platform-level target that already exists in `docsPageSlugs`).
- **Test accessor:** `getLocalizedDocsPage(locale, slug)` (from `src/lib/site-copy.ts`) is the canonical accessor used by the coverage test to read the en page.
- **EN DASH (U+2013):** `5–30` uses the en dash in both the `nif_lookup` row one-liner and the `latency` note, across all 7 locales (zh/ja phrase it as `5–30 秒`, still containing the `5–30` substring the test asserts).
- **Connection snippets:** Claude Desktop = `mcp-remote` stdio bridge (NOT a bare remote `url`, which Claude Desktop does not support) plus a "Settings → Connectors" note; Cursor = bare `url`; generic `mcp.json` = `type:'http'` + a `streamable-http`/`transport` defensive note; standalone `npx -y mcp-remote …`. No API key or Authorization header in any snippet (public endpoint, T-05-02 accept-by-design).
- **Grouping (discretion):** geo_* + address_* combined into one `catalog-address-geo` group; `health` in its own `catalog-platform` group.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None. The TDD RED state in Task 1 (the 2 page-content assertions failing before the en page existed) was expected and turned green in Task 3.

## User Setup Required
None - no external service configuration required. `mcp-remote` is referenced only inside documentation snippets that end users run via `npx`; it is NOT added to `package.json` (T-05-03 accept).

## Next Phase Readiness
- DOCS-01/02/03 satisfied; this was the single plan of the final phase of the MCP milestone.
- `pnpm test` (113 tests, incl. mcp-catalog) green; `pnpm build` passes the 7-locale `DocsPageMap` totality gate; `/docs/[slug]` is SSG and now generates `mcp`.
- Manual visual verification (visit `/docs/mcp` in each locale via `pnpm dev`) recommended before milestone sign-off.

---
*Phase: 05-mcp-documentation*
*Completed: 2026-06-19*

## Self-Check: PASSED

- Created files verified present: `src/lib/mcp/catalog.ts`, `src/lib/__tests__/mcp-catalog.test.ts`, `05-01-SUMMARY.md`.
- Commits verified on branch: `aae6993`, `074f28a`, `a2dd14a`.
- Note: a pre-existing corrupt loose ref (`refs/heads/master 2`, an iCloud-sync artifact) makes `git log --all` error; commits verified via `git cat-file -t` and direct `git log` instead. Unrelated to this plan.
