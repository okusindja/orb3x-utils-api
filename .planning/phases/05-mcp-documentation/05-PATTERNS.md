# Phase 5: MCP Documentation - Pattern Map

**Mapped:** 2026-06-19
**Files analyzed:** 11 (2 create, 9 modify)
**Analogs found:** 11 / 11

This is a content + one type/render-extension + one test phase. Every file copies an
existing in-repo pattern; there are no greenfield abstractions. Excerpts below are concrete
and load-bearing — copy them directly.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/mcp/catalog.ts` (CREATE) | config / typed const module | transform (name list) | `src/lib/site-content.ts` (`as const` + derived type) | role-match |
| `src/lib/__tests__/mcp-catalog.test.ts` (CREATE) | test | batch / introspection | `src/lib/__tests__/mcp-registry.test.ts` | exact |
| `src/lib/site-content.ts` (MODIFY) | config / type defs | transform | self (extend in place) | exact |
| `src/components/site-primitives.tsx` (MODIFY, `DataTable`) | component | request-response (render) | `src/components/docs-detail-content.tsx` relatedSlugs `<Link>` (~line 165–177) | role-match |
| `src/locales/site/docs/en.ts` (MODIFY) | content / i18n base | transform | `documents` + `nif-verification` entries (same file) | exact |
| `src/locales/site/docs/{pt,es,fr,de,zh,ja}.ts` (MODIFY ×6) | content / i18n override | transform | `en.ts` `mcp` entry (authored this phase) + existing locale entries | exact |

---

## Pattern Assignments

### `src/lib/mcp/catalog.ts` (config, typed const module) — CREATE

**Analog:** `src/lib/site-content.ts` lines 1–18 (the `as const` array → derived literal type pattern), and the tool→slug table in `05-CONTEXT.md` lines 81–95.

**Pattern to replicate** — ordered `as const` array of `{ name, docsSlug }`, with a derived name list the test imports. Mirror the `docsPageSlugs` style:

```ts
// site-content.ts:1-18 — the as-const → literal-type idiom to copy
export const docsPageSlugs = [
  'getting-started',
  // ...
  'examples',
] as const;
export type DocsPageSlug = (typeof docsPageSlugs)[number];
```

**Concrete content for catalog.ts** (names verified against the registry test, `05-RESEARCH.md` lines 154–165; slugs from `05-CONTEXT.md` lines 81–95):

```ts
import type { DocsPageSlug } from '@/lib/site-content';

export type McpToolCatalogEntry = {
  name: string;
  docsSlug: DocsPageSlug | null; // health → null or 'api-reference' (D-discretion)
};

export const MCP_TOOL_CATALOG = [
  { name: 'health', docsSlug: 'api-reference' },        // or null (discretion)
  { name: 'salary_net', docsSlug: 'salary' },
  { name: 'salary_gross', docsSlug: 'salary' },
  { name: 'salary_employer_cost', docsSlug: 'salary' },
  { name: 'phone_parse', docsSlug: 'phone' },
  { name: 'phone_validate', docsSlug: 'phone' },
  { name: 'phone_operator', docsSlug: 'phone' },
  { name: 'geo_provinces', docsSlug: 'address-geo' },
  { name: 'geo_municipalities', docsSlug: 'address-geo' },
  { name: 'geo_communes', docsSlug: 'address-geo' },
  { name: 'address_normalize', docsSlug: 'address-geo' },
  { name: 'address_suggest', docsSlug: 'address-geo' },
  { name: 'calendar_holidays', docsSlug: 'calendar' },
  { name: 'calendar_working_days', docsSlug: 'calendar' },
  { name: 'calendar_add_working_days', docsSlug: 'calendar' },
  { name: 'finance_vat', docsSlug: 'finance' },
  { name: 'finance_invoice_total', docsSlug: 'finance' },
  { name: 'finance_inflation_adjust', docsSlug: 'finance' },
  { name: 'currency_rates', docsSlug: 'currency-exchange' },
  { name: 'currency_convert', docsSlug: 'currency-exchange' },
  { name: 'nif_lookup', docsSlug: 'nif-verification' },
  { name: 'translate_text', docsSlug: 'translation' },
  { name: 'generate_invoice_pdf', docsSlug: 'documents' },
  { name: 'generate_receipt_pdf', docsSlug: 'documents' },
  { name: 'generate_contract_pdf', docsSlug: 'documents' },
] as const satisfies readonly McpToolCatalogEntry[];

export const MCP_TOOL_NAMES = MCP_TOOL_CATALOG.map((t) => t.name);
```

**Notes:**
- 25 entries total. One-liners are NOT here — they live in the localized docs copy keyed by tool name (D-03/D-04). This module is name + slug only (the verification surface).
- Import `DocsPageSlug` from `@/lib/site-content` so slug typos fail at compile. `@/` → `src/` is configured (CLAUDE.md).
- The phase prompt referenced `src/lib/__tests__/mcp-catalog.test.ts`; RESEARCH (line 319) referenced `src/lib/mcp/__tests__/mcp-catalog.test.ts`. Either works under Jest's `roots`; the existing registry test lives at `src/lib/__tests__/`, so co-locate the new test there for consistency unless the planner prefers `src/lib/mcp/__tests__/`.

---

### `src/lib/__tests__/mcp-catalog.test.ts` (test, introspection) — CREATE

**Analog:** `src/lib/__tests__/mcp-registry.test.ts` (read in full, 112 lines). Copy three things verbatim: the `jest.mock('@/lib/agt-nif', …)` block, the `mockServer.registerTool` capture scaffold, and the import order (mock BEFORE importing the registry).

**MANDATORY top-of-file mock** (`mcp-registry.test.ts:1-19`) — without it the suite breaks under jsdom because `agt-nif` pulls in `cheerio` (ESM). Carry it forward unchanged:

```ts
jest.mock('@/lib/agt-nif', () => {
  class MockPortalLookupError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
      public readonly code: string,
    ) {
      super(message);
      this.name = 'PortalLookupError';
    }
  }
  return {
    PortalLookupError: MockPortalLookupError,
    lookupTaxpayerByNif: jest.fn(),
  };
});

import { registerAllTools } from '@/lib/mcp/registry';
import { MCP_TOOL_NAMES } from '@/lib/mcp/catalog';
```

**registerTool-capture scaffold** (`mcp-registry.test.ts:24-36`) — the mock-server that records names:

```ts
const registeredTools: Record<string, unknown> = {};
const mockServer = {
  registerTool: (name: string, meta: unknown) => {
    registeredTools[name] = meta;
  },
};
registerAllTools(mockServer as never);
const registeredNames = Object.keys(registeredTools); // live 25 names
```

**Two-way set-equality assertion (D-01)** — fails loudly in BOTH directions (missing AND phantom). Use `Set` equality, not `toContain` loops:

```ts
expect(new Set(MCP_TOOL_NAMES)).toEqual(new Set(registeredNames));
expect(MCP_TOOL_NAMES.length).toBe(25);
```

**Snippet + latency presence assertions (DOCS-02 / D-07, RESEARCH Test Map lines 309–310)** — read the en page via the site-copy accessor:

```ts
// connect section: 4 codes, each carrying the endpoint URL or mcp-remote
const connect = page.sections.find((s) => s.id === 'connect');
expect(connect?.codes).toHaveLength(4);
// nif_lookup row description AND latency section note both cite 5–30
expect(nifRowDescription).toContain('5–30');
expect(latencySection?.note).toContain('5–30');
```
> Note: `5–30` uses an EN DASH (U+2013), matching the UI-SPEC copy ("5–30 s"). Assert the exact character used in the authored copy.

**Anti-patterns (RESEARCH lines 168–171):** do NOT derive catalog names from rendered/localized copy; do NOT drop the `agt-nif` mock.

---

### `src/lib/site-content.ts` (config, type defs) — MODIFY

**Analog:** self. Three edits, all shown against current line numbers.

**Edit 1 — append `'mcp'` as last slug** (current lines 1–16, D-06):

```ts
export const docsPageSlugs = [
  'getting-started',
  // ... unchanged ...
  'examples',
  'mcp',            // ADD — last entry (D-06)
] as const;
```

**Edit 2 — add `DocsTableCell` union and widen `DocsTable.rows`** (current lines 26–29, UI-SPEC Option A):

```ts
export type DocsTableCell = string | { label: string; href: string };

export type DocsTable = {
  columns: string[];
  rows: DocsTableCell[][];   // was: string[][]
};
```
Backward-compatible: every existing `string[][]` rows literal still satisfies `DocsTableCell[][]`, so no existing locale file needs to change for this widening.

**No change** to `DocsSection` (lines 37–47) or `DocsPage` (lines 49–67) — both already support everything the MCP page needs (`endpoint`, `summaryCards`, `sections` with `table`/`codes`/`note`, `relatedSlugs`). `DocsPageMap = Record<DocsPageSlug, DocsPage>` (line 69) is TOTAL — this is what forces an `mcp` entry in all 7 locale files (see Shared Patterns).

---

### `src/components/site-primitives.tsx` — `DataTable` (component, render) — MODIFY

**Analog:** the `relatedSlugs` `<Link>` in `src/components/docs-detail-content.tsx` line 175 — copy its accent link style `text-sm font-semibold text-primary`. `next/link` is ALREADY imported in `site-primitives.tsx` (line 4: `import Link from 'next/link';`).

**Current props type** (lines 417–423) — widen `rows`:

```ts
export function DataTable({
  columns,
  rows,
}: {
  columns: readonly string[];
  rows: readonly (readonly string[])[];          // widen ↓
  // rows: readonly (readonly DocsTableCell[])[];  import DocsTableCell from '@/lib/site-content'
}) {
```

**Current cell render** (lines 443–453) — the ONLY render change this phase needs. Replace the bare `<td>{cell}</td>` and fix the `key={cell}` collision (checker note, UI-SPEC line 179):

```tsx
{rows.map((row, index) => (
  <tr key={`${typeof row[0] === 'object' ? row[0].href : row[0]}-${index}`}>
    {row.map((cell, cellIndex) => (
      <td
        key={typeof cell === 'object' ? cell.href : `${cell}-${cellIndex}`}  // was key={cell}
        className="px-4 py-3.5 align-top leading-7 text-muted-foreground sm:px-5 sm:py-4"
      >
        {typeof cell === 'object' ? (
          <Link href={cell.href} className="font-semibold text-primary">
            {cell.label}
          </Link>
        ) : (
          cell
        )}
      </td>
    ))}
  </tr>
))}
```
- Link style mirrors `docs-detail-content.tsx:175` (`font-semibold text-primary`); global `a` transition + focus ring come free (UI-SPEC line 197).
- The `<tr key>` at line 444 also reads `row[0]` — guard it for object cells too (shown above).
- Scope: ~2 type lines + ~6 render lines. No new component, no new CSS token.

---

### `src/locales/site/docs/en.ts` (i18n base) — MODIFY

**Analog:** the `documents` entry (lines 1119–1220) and `nif-verification` entry (lines 1221–1305) in the SAME file. Both read in full. The MCP page is authored as a NEW `mcp:` key on `enDocsPages` (insert before the closing `}` of the map, after `examples`).

**File imports already present** (lines 1–2): `makeCurlAndNodeCodeSamples` and `import type { DocsPageMap, DocsSection }`. No new imports needed (MCP snippets are plain string `codes`, not curl helpers).

**DocsPage envelope to copy** (from `documents`, lines 1119–1131 + `nif-verification` endpoint block 1229–1238):

```ts
mcp: {
  slug: 'mcp',
  label: 'MCP Server',
  description: '<short — nav/related-card subtitle>',
  eyebrow: 'Model Context Protocol',
  title: '<one sentence on the hosted MCP server>',
  intro: '<1–2 sentences: 25 Angola utility tools over one MCP endpoint, Streamable HTTP>',
  endpoint: {
    method: 'POST',
    path: '/api/mcp',
    detail: 'Streamable HTTP; SSE disabled — use mcp-remote for SSE-only clients.',
  },
  summaryCards: [
    { label: 'Tools', value: '25 tools' },
    { label: 'Transport', value: 'Streamable HTTP' },
    { label: 'Locales', value: '7 languages' },
  ],
  sections: [ /* see below */ ],
  relatedSlugs: [
    'salary', 'phone', 'address-geo', 'calendar', 'finance',
    'documents', 'nif-verification', 'translation', 'currency-exchange',
  ],
},
```

**Section 1 — `connect` (4 code samples), inline `DocsSection` object** (mirror the inline-codes shape; `DocsSection.codes` is `DocsCodeSample[]`, languages `'bash'|'json'|'js'|'ts'` per site-content.ts:31-35). NOT `routeSection` (that helper is for param-table API routes):

```ts
{
  id: 'connect',
  title: 'Connect a client',
  description: 'Add the hosted endpoint to your MCP client. Streamable HTTP (POST /api/mcp); SSE is disabled.',
  codes: [
    { label: 'Claude Desktop', language: 'json', content: `{
  "mcpServers": {
    "orb3x-utils": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://utils.api.orb3x.com/api/mcp"]
    }
  }
}` },
    { label: 'Cursor', language: 'json', content: `{
  "mcpServers": {
    "orb3x-utils": { "url": "https://utils.api.orb3x.com/api/mcp" }
  }
}` },
    { label: 'Generic mcp.json', language: 'json', content: `{
  "mcpServers": {
    "orb3x-utils": { "type": "http", "url": "https://utils.api.orb3x.com/api/mcp" }
  }
}` },
    { label: 'mcp-remote bridge', language: 'bash',
      content: 'npx -y mcp-remote https://utils.api.orb3x.com/api/mcp' },
  ],
},
```
Snippet bodies are verified in `05-RESEARCH.md` lines 193–241 (Claude Desktop = bridge form NOT bare url; Cursor = bare url; generic = `type:http`). Add the defensive inline note about `streamable-http`/`transport` token variance. Snippets are English/canonical (D-04). NEVER embed an API key/Authorization header (security note, RESEARCH lines 335–337).

**Section 2 — one `table` section per domain group** (copy the `documents` catalog section, lines 1132–1143). Columns `['Tool', 'Description', 'Docs']`; rows use the NEW `DocsTableCell` link cell in the 3rd column:

```ts
{
  id: 'catalog-salary',
  title: 'Salary tools',
  description: '<curated group intro>',
  table: {
    columns: ['Tool', 'Description', 'Docs'],
    rows: [
      ['salary_net', 'Compute net salary after IRT and social security.', { label: 'salary', href: '/docs/salary' }],
      ['salary_gross', '<one-liner>', { label: 'salary', href: '/docs/salary' }],
      ['salary_employer_cost', '<one-liner>', { label: 'salary', href: '/docs/salary' }],
    ],
  },
},
```
Repeat per group: salary, phone, address+geo (combine — both → `address-geo`, discretion), calendar, finance, documents, nif, translation, currency, health (own group or "Platform"). For **`nif_lookup`** ONLY, append the inline latency note to the description string (D-07a):
`'Look up a NIF on the AGT portal. Live scrape — 5–30 s; set generous timeouts.'`

**Section 3 — `latency` (`note` in secondary Card)** — copy the `note`-bearing inline section idiom (`nif-verification` section `error-cases`, lines 1282–1293, which pairs `bullets` + `note`):

```ts
{
  id: 'latency',
  title: 'Performance & latency',
  description: 'The nif_lookup tool scrapes the live AGT portal.',
  note: 'AGT portal lookups take 5–30 s. Set generous client timeouts; the server already enforces a ~25 s upstream cap.',
},
```

---

### `src/locales/site/docs/{pt,es,fr,de,zh,ja}.ts` (i18n overrides ×6) — MODIFY

**Analog:** `pt.ts` (confirmed: line 50 `export const ptDocsPages: DocsPageMap = {…}`, same imports as en.ts lines 1–2). Each locale module carries the TOTAL `DocsPageMap` annotation.

**Critical (RESEARCH Pitfall 3, lines 243–254):** adding `'mcp'` to `docsPageSlugs` makes `mcp` a REQUIRED key of `DocsPageMap`. Every locale file must add a COMPLETE `mcp: DocsPage` entry or `pnpm build` fails: `Property 'mcp' is missing in type … but required in type 'DocsPageMap'`. `DeepPartial` on overrides does NOT relax this — the inner const carries the non-partial annotation.

**Per-locale content rule (D-04):**
- TRANSLATE: `label`, `eyebrow`, `title`, `intro`, `description`, section `title`/`description`, `summaryCards` labels, the 25 tool one-liners (the row description column), the `latency` note.
- KEEP ENGLISH (verbatim from en.ts): endpoint `path`, snippet `codes[].content`, tool names (row col 1), the link cell `href` and `label`, the `5–30` latency figure.
- `mergeDeep` (`src/lib/site-copy.ts`) auto-falls-back any omitted key to en — but TS totality still requires the full key present, so author the full object (reusing en strings for English-canonical fields).

---

## Shared Patterns

### Single source of truth (D-01 enforceability)
**Source:** new `src/lib/mcp/catalog.ts` (`MCP_TOOL_NAMES`).
**Apply to:** the page table-building copy AND the coverage test. The test reconciles `MCP_TOOL_NAMES` against registry-captured names; the page derives its rows from the same list. Never two independent lists. (RESEARCH Pattern 1, lines 117–124.)

### Registry introspection via mock server
**Source:** `src/lib/__tests__/mcp-registry.test.ts:1-36`.
**Apply to:** the new coverage test. Copy the `agt-nif` mock + `registerTool` capture verbatim; mock import MUST precede the registry import.

### Total `DocsPageMap` record forces 7-locale parity
**Source:** `src/lib/site-content.ts:69` (`Record<DocsPageSlug, DocsPage>`) + per-locale `: DocsPageMap` annotation (e.g. `pt.ts:50`).
**Apply to:** all 7 docs files. Compile gate is `pnpm build` (Next tsc), not `pnpm test` — only the build's tsc catches totality errors (RESEARCH line 302).

### Accent link style for in-table / related links
**Source:** `src/components/docs-detail-content.tsx:175` (`text-sm font-semibold text-primary`).
**Apply to:** the new `DataTable` object link cell. Matches the UI-SPEC accent color contract; global `a` transition + `:focus-visible` ring inherited from `globals.css`.

### Inline `DocsSection` vs `routeSection`
**Source:** `en.ts` — `routeSection(...)` (lines 4–48) builds param-table API-route sections with curl+node code; INLINE section objects (e.g. `documents` catalog 1132–1143, `nif-verification` 1240–1303) are used for everything else.
**Apply to:** the MCP page uses INLINE section objects only (connect/catalog-*/latency). Do NOT use `routeSection` — MCP snippets are config blocks, not curl param tables.

---

## No Analog Found

None. Every file maps to an existing in-repo pattern.

---

## Metadata

**Analog search scope:** `src/lib/mcp/`, `src/lib/__tests__/`, `src/lib/site-content.ts`, `src/lib/site-copy.ts`, `src/components/`, `src/locales/site/docs/`.
**Files scanned:** registry.ts, mcp-registry.test.ts, site-content.ts, site-primitives.tsx (DataTable region), docs-detail-content.tsx (relatedSlugs region), en.ts (routeSection + documents + nif-verification entries), pt.ts (header).
**Pattern extraction date:** 2026-06-19
