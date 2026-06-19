# Phase 5: MCP Documentation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-19
**Phase:** 05-mcp-documentation
**Areas discussed:** Tool catalog rendering, i18n translation depth, Connection examples scope, Page placement & NIF disclosure

---

## Tool Catalog Rendering

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-generate from registry | Introspect registerAllTools at build time to emit the tool list. Never drifts; needs build-time extraction. | |
| Hand-authored table | DocsSection table written directly in en copy. Simplest; manual updates / drift risk. | |
| Hybrid: generated list + curated grouping | Generated/verified names from the registry, grouped by domain with hand-written intros. | ✓ |

**User's choice:** Hybrid → refined to "registry-verified hand-authored catalog": names cross-checked against `registerAllTools` by an automated test; structure curated.

### Detail level per tool

| Option | Description | Selected |
|--------|-------------|----------|
| Name + one-line description | Compact table; schemas live in tools/list. | |
| Name + description + key inputs | Also list Zod input fields. Heavier; duplicates tools/list. | |
| Name + desc + link to HTTP doc | Compact row linking to existing /docs/[slug] page. | ✓ |

**User's choice:** Name + desc + link to the tool's existing HTTP docs page.

### Description text source

| Option | Description | Selected |
|--------|-------------|----------|
| Short curated one-liner | Author concise one-line copy per tool (localizable). | ✓ |
| First sentence of registry desc | Auto-extract up to first period. | |
| Full registry description verbatim | Complete anti-collision string. Verbose. | |

**User's choice:** Short curated one-liner per tool.

---

## i18n Translation Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Chrome localized, body English | Translate chrome only; body (catalog, snippets) English. | |
| Full translation everywhere | Translate all prose + tool lines in 7 locales. | |
| Chrome + catalog, snippets English | Translate chrome AND tool one-liners; snippets/config/endpoint English. | ✓ |

**User's choice:** Chrome + catalog one-liners localized; code snippets / config / endpoint stay English; deep-merge fallback to en.

---

## Connection Examples Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Claude Desktop + generic + mcp-remote | Three snippets. | |
| Generic config + mcp-remote only | Two snippets, leanest. | |
| Claude Desktop + Cursor + generic + mcp-remote | Four snippets, most coverage. | ✓ |

**User's choice:** Four snippets (Claude Desktop, Cursor, generic mcp.json, npx mcp-remote).
**Notes:** Endpoint confirmed as `https://utils.api.orb3x.com/api/mcp` (SITE_URL from src/lib/seo.ts); Streamable HTTP, SSE disabled.

---

## Page Placement & NIF Disclosure

### Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Top, right after getting-started | 2nd slug; first-class prominence. | |
| After api-reference | 3rd slug; reference peer. | |
| End of the list | Append after examples; least disruption. | ✓ |

**User's choice:** Append `mcp` as the last slug; reuse standard DocsPage shape.

### NIF latency disclosure

| Option | Description | Selected |
|--------|-------------|----------|
| Note on the NIF catalog row + callout | Inline row note AND dedicated callout section. | ✓ |
| Dedicated callout section only | Single Performance section. | |
| Inline catalog note only | Just a short row note. | |

**User's choice:** Both — inline note on the nif_lookup row + a dedicated "Performance & latency" section citing the 5–30 s AGT portal scrape.

---

## Claude's Discretion

- Exact one-liner wording per tool; exact summaryCards; exact snippet formatting.
- `health` tool's docs-slug link target (api-reference / none).
- Whether address_* and geo_* are one combined group or two.
- Section ordering and grouping headings on the page.

## Deferred Ideas

None — discussion stayed within phase scope.
