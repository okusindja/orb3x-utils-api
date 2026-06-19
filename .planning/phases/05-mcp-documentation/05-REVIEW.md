---
phase: 05-mcp-documentation
reviewed: 2026-06-19T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/components/site-primitives.tsx
  - src/lib/site-content.ts
  - src/lib/mcp/catalog.ts
  - src/lib/__tests__/mcp-catalog.test.ts
  - src/locales/site/docs/en.ts
  - src/locales/site/docs/pt.ts
  - src/locales/site/docs/de.ts
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2026-06-19
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Phase 5 adds the localized `/docs/mcp` page: a `DocsTableCell` string-or-object
union, a `DataTable` that renders object cells as `next/link`, a canonical 25-tool
`MCP_TOOL_CATALOG`, a registry↔catalog coverage test, and 7 locale clones of the MCP
docs content.

Verified working: `pnpm tsc --noEmit` passes; the new test suite passes (4/4); the
`DocsTableCell` widening is backward-compatible (string cells still render verbatim);
the registry coverage test is genuinely two-way (Jest `Set` `toEqual` compares size +
membership, so both missing and phantom tools fail); the en.ts catalog tables list
exactly the same 25 tool names as `MCP_TOOL_CATALOG` (diff-verified); all link `href`
values are internal `/docs/<slug>` literal constants (no XSS / open-redirect surface);
the Claude Desktop snippet correctly uses the `mcp-remote` bridge (not a bare remote URL);
no en↔pt↔de i18n key drift in the MCP section.

No blockers. The most material finding is that `MCP_TOOL_CATALOG` does not actually
deliver its stated anti-drift guarantee for the docs page (WR-01) — the docs tables are
hand-maintained and the catalog is consumed only by the test.

**Note on scope:** The 4 remaining locale clones (`es.ts`, `fr.ts`, `zh.ts`, `ja.ts`)
were NOT individually read. They are described as structural clones of the `pt.ts` /
`de.ts` samples, both of which were verified structurally conformant (4 connect snippets,
correct `nif_lookup` 5–30 s latency row + latency note, identical object-cell `href`
literals, English `Tool/Description/Docs` column headers). Findings below may apply to
those clones by extension.

## Warnings

### WR-01: Catalog's "single source of truth" / anti-drift guarantee is not wired into the docs page

**File:** `src/lib/mcp/catalog.ts:8-18`, `src/locales/site/docs/en.ts:1619-1743`
**Issue:** The catalog's doc comment claims it is "the single source of truth for the
catalog's tool-name set. Both the `/docs/mcp` page (table rows) and the registry-coverage
test read from this list so the docs can never silently drift from `registerAllTools`."
This is false. `MCP_TOOL_CATALOG` / `MCP_TOOL_NAMES` are imported by exactly one consumer —
the test (`mcp-catalog.test.ts`). The `/docs/mcp` page hand-writes the 25 tool rows
directly in `en.ts` (and 6 locale clones) and does **not** import the catalog. The
`docsSlug` field (the entire D-02 link mapping) is never read by any rendering code; each
en.ts object cell hardcodes its own `{ label, href }`. Today the hand-written tables
happen to match the catalog, but nothing enforces it: a tool can be added to
`MCP_TOOL_CATALOG` + registry (test stays green) while the docs tables silently drift,
which is precisely the failure mode the catalog claims to prevent.
**Fix:** Either (a) derive the docs catalog tables from `MCP_TOOL_CATALOG` (map each entry
to a row, using `docsSlug` to build the `{ label, href }` cell) so the page genuinely
consumes the single source; or (b) add a test asserting the en.ts MCP table tool-name set
equals `MCP_TOOL_NAMES`; or (c) downgrade the doc comment to describe reality (catalog is
a test-only registry mirror) so the guarantee is not overstated.

### WR-02: Inconsistent React `key` strategy for object vs string cells in `DataTable`

**File:** `src/components/site-primitives.tsx:448`
**Issue:** `key={typeof cell === 'object' ? cell.href : `${cell}-${cellIndex}`}`. String
cells incorporate the position (`cellIndex`), but object cells use only `cell.href` with no
index. In the current MCP tables each row has exactly one object cell, so sibling keys do
not collide — but the asymmetry is fragile: any future table with two object cells sharing
the same `href` in one row (entirely plausible — e.g., two tools linking to the same
`/docs/<slug>`) produces duplicate sibling keys and a React key-collision warning / unstable
reconciliation. The `<tr>` key on line 445 was correctly made collision-free by always
appending `-${index}`; the `<td>` key for object cells was not given the same treatment.
**Fix:** Append the index uniformly:
```tsx
key={typeof cell === 'object' ? `${cell.href}-${cellIndex}` : `${cell}-${cellIndex}`}
```

### WR-03: `<tr>` key derived only from first cell can collide across tables with repeated first column

**File:** `src/components/site-primitives.tsx:445`
**Issue:** `key={`${typeof row[0] === 'object' ? row[0].href : row[0]}-${index}`}` is safe
for the MCP tables (unique tool name in column 0), but `DataTable` is shared by every docs
table. Pre-existing tables exist where column 0 repeats (e.g., not in MCP, but the union
widening now routes ALL docs tables through this same keying). The `-${index}` suffix does
make it unique per-render, so this is not a live bug — flagging because the key derivation
reads `row[0].href` which only exists when `row[0]` is an object; the ternary guards it
correctly, but relying on `row[0]` being meaningful/stable for keys is brittle. Prefer a
key that does not assume anything about cell 0's type.
**Fix:** Use the row index alone for the `<tr>` key (rows are static, non-reordered config
data): `key={index}` — simpler and collision-proof, since these tables never reorder.

## Info

### IN-01: `docsSlug` field and `null` branch are effectively dead

**File:** `src/lib/mcp/catalog.ts:5,21-45,48`
**Issue:** `McpToolCatalogEntry.docsSlug: DocsPageSlug | null` — no entry ever uses `null`,
and no code reads `docsSlug` at all (see WR-01). The `| null` union and the entire field are
currently unused surface area. `MCP_TOOL_NAMES` is also the only export anything consumes.
**Fix:** If WR-01(a) is adopted, `docsSlug` becomes load-bearing — keep it but drop the
unused `| null`. Otherwise consider removing `docsSlug` until a consumer exists.

### IN-02: `MCP_TOOL_NAMES` exported as mutable `string[]`

**File:** `src/lib/mcp/catalog.ts:48`
**Issue:** `export const MCP_TOOL_NAMES = MCP_TOOL_CATALOG.map((t) => t.name);` yields a
mutable `string[]`. The catalog itself is `as const satisfies readonly ...`, but the derived
name list loses that immutability and could be mutated by any importer.
**Fix:** `export const MCP_TOOL_NAMES = MCP_TOOL_CATALOG.map((t) => t.name) as readonly string[];`
(or append `as const`-friendly typing).

### IN-03: Untranslated summary-card values mix with translated labels in locale clones

**File:** `src/locales/site/docs/de.ts:2375-2377` (and pt.ts MCP `summaryCards`)
**Issue:** The MCP summary cards keep English values inside otherwise-German content:
`{ "label": "Sprachen", "value": "7 languages" }` and `"25 tools"` / `"Streamable HTTP"`.
The label is localized ("Sprachen") but the value ("7 languages") is not, producing a
mixed-language card. Same pattern in `pt.ts`. The shared `Tool/Description/Docs` table column
headers being English is plausibly the intended English-canonical decision; the summary-card
*values* mixing with localized labels reads as an oversight rather than a deliberate canon.
**Fix:** Localize the numeric/value strings (e.g., `"7 Sprachen"`, `"25 Tools"`) or, if
English-canonical values are intentional, make the labels English too for internal
consistency. Low priority — cosmetic.

### IN-04: Coverage test count assertion is brittle to a single magic number

**File:** `src/lib/__tests__/mcp-catalog.test.ts:44-46`
**Issue:** `expect(MCP_TOOL_NAMES.length).toBe(25)` hardcodes `25`. This is intentional
(it pins the documented tool count) but couples the test to a literal that also appears in
prose across 7 locale files ("25 tools", "all 25 Angola utility tools"). When the tool count
changes, this number must be updated in 8+ places with no single constant tying them.
**Fix:** Acceptable as-is for a guard test. Optionally export an `MCP_TOOL_COUNT` constant
from `catalog.ts` and reference it from the test and (if WR-01(a) is taken) the summary
cards, so the count has one source.

---

_Reviewed: 2026-06-19_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
