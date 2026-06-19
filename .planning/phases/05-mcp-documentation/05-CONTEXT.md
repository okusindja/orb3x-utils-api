# Phase 5: MCP Documentation - Context

**Gathered:** 2026-06-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a single new localized docs page, slug **`mcp`**, that documents the public MCP server: the endpoint URL, the full 25-tool catalog (grouped by domain), client connection examples (native Streamable HTTP + `mcp-remote` fallback), and the NIF tool's AGT portal latency disclosure. Built entirely on the existing typed `DocsPage`/`DocsSection` rendering and the `mergeDeep(enSiteCopy, localeCopy)` 7-locale i18n pattern — **no new rendering components**. Covers DOCS-01, DOCS-02, DOCS-03.

This is a docs/content phase (UI hint: yes) but it reuses the existing docs page shell; the work is content authoring + a small typed-slug addition + a registry-coverage test. No new API/runtime behavior.

</domain>

<decisions>
## Implementation Decisions

### Tool Catalog Rendering (DOCS-01)
- **D-01:** **Hybrid catalog, registry-verified.** The catalog is hand-authored docs copy, grouped by domain with curated section intros, BUT the set of tool names must be cross-checked against the live registry (`registerAllTools`) by an **automated test** so it can never silently drift from the 25 registered tools (test asserts: every registered tool name appears in the catalog, and the catalog lists no phantom tools). This is the "generated/in-sync" half of the hybrid — names are validated against the registry, structure is human-curated.
- **D-02:** **Detail level = name + one-liner + link.** Each catalog row shows: the tool name, a short curated one-line description, and a link to that tool's existing `/docs/[slug]` HTTP page (which already has params + examples). Do NOT duplicate Zod input schemas into the catalog — MCP clients discover those via the live `tools/list` response. Requires a **tool→docs-slug mapping** (see code_context).
- **D-03:** **Description text = short curated one-liner.** Author a concise one-line description per tool for the catalog — NOT the verbose registry anti-collision string and NOT the first-sentence auto-extract. These one-liners are localizable copy (see D-04).

### i18n Translation Depth (DOCS-01 / criterion 4)
- **D-04:** **Chrome + catalog localized; snippets English.** Translate in all 7 locales: page chrome (`label`, `eyebrow`, `title`, `intro`, section headings, `summaryCards`) AND the 25 tool one-liners. Keep in English (canonical): code snippets, connection config blocks, the endpoint path, and tool names. Untranslated keys fall back to `en` automatically via `mergeDeep`. All 7 locale files must compile (TypeScript) — criterion 4.

### Connection Examples (DOCS-02)
- **D-05:** **Four snippets.** (1) Claude Desktop `claude_desktop_config.json` with a native Streamable HTTP entry; (2) Cursor config; (3) a generic `mcp.json` config block; (4) the `npx mcp-remote` bridge command (fallback for clients without native Streamable HTTP). Endpoint URL in every snippet: **`https://utils.api.orb3x.com/api/mcp`** (derived from `SITE_URL` in `src/lib/seo.ts`; transport is Streamable HTTP — SSE is intentionally disabled server-side). Snippets are English/canonical (per D-04).

### Page Placement & Shape (DOCS-01)
- **D-06:** **Append `mcp` as the LAST slug** in `docsPageSlugs` (after `examples`), lowest nav disruption. Reuse the standard `DocsPage` shape: `eyebrow`, `title`, `intro`, `endpoint: { method: 'POST', path: '/api/mcp', detail }`, `summaryCards` (e.g. "25 tools", "Streamable HTTP", "7 locales"), `sections[]`, `relatedSlugs`. Add `'mcp'` to the `docsPageSlugs` `as const` array and an `mcp` entry to each locale's `DocsPageMap`.

### NIF Latency Disclosure (DOCS-03)
- **D-07:** **Both surfaces.** (a) A short inline note on the `nif_lookup` catalog row, AND (b) a dedicated "Performance & latency" `DocsSection` explaining the AGT portal live-scrape behavior (**5–30 s**) and advising clients to set generous timeouts. Most discoverable — seen in context and called out explicitly.

### Claude's Discretion
- Exact one-liner wording per tool; exact `summaryCards` values; exact snippet formatting and field names.
- The docs-slug link target for the `health` tool (it has no dedicated HTTP doc page — link to `api-reference`/`getting-started`, or leave it linkless). Implementer's call.
- Whether `address_*` and `geo_*` are shown as one combined group or two (both map to the `address-geo` docs slug).
- Section ordering on the page and the precise grouping headings.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Docs content + i18n pattern (the core of this phase)
- `src/lib/site-content.ts` — `DocsPage` / `DocsSection` / `DocsPageMap` types + the `docsPageSlugs` `as const` array (add `'mcp'`); `DocsPageSlug` is derived from it.
- `src/lib/site-copy.ts` — `mergeDeep` deep-merge implementation + `supportedLocales` (`en, pt, es, fr, de, zh, ja`); `getSiteCopy`.
- `src/locales/site/docs/en.ts` — base docs copy + the `routeSection(...)` helper and `DocsSection` usage to mirror for the new `mcp` page.
- `src/locales/site/docs/{pt,es,fr,de,zh,ja}.ts` — per-locale override files; add the localized `mcp` chrome + tool one-liners here (untranslated keys fall back to `en`).

### Rendering (reuse — do not rebuild)
- `app/docs/[slug]/page.tsx`, `app/docs/page.tsx`, `app/docs/layout.tsx` — docs route + `generateStaticParams` over `docsPageSlugs`.
- `src/components/pages/docs-overview-page.tsx` — docs overview/nav rendering.

### Source-of-truth for the catalog
- `src/lib/mcp/registry.ts` — `registerAllTools`; the 25 tool names the catalog must match (the D-01 coverage test reads from here / a mock server).
- `app/api/[transport]/route.ts` — MCP endpoint is `POST /api/mcp`, Streamable HTTP, `disableSse: true` (no Redis / free tier).
- `src/lib/seo.ts` — `SITE_URL = https://utils.api.orb3x.com` (endpoint base for snippets).

### Requirements / roadmap
- `.planning/ROADMAP.md` §"Phase 5: MCP Documentation"
- `.planning/REQUIREMENTS.md` — DOCS-01, DOCS-02, DOCS-03

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The typed `DocsPage` shell (eyebrow/title/intro/endpoint/summaryCards/sections/relatedSlugs) + `routeSection`/`DocsSection` (table, bullets, codes, note) render everything this page needs — **no new components**.
- `mergeDeep` i18n: add an `mcp` key to each locale's `DocsPageMap`; English base, locale overrides, automatic fallback.
- Existing curl/node code-sample helpers (`makeCurlAndNodeCodeSamples` in `src/lib/docs-code.ts`) — pattern for code blocks, though MCP snippets are config/JSON not curl.

### Established Patterns
- Slugs are an `as const` array → literal `DocsPageSlug` type; adding `'mcp'` is a one-line typed change that `generateStaticParams` picks up automatically.
- Each locale `docs/*.ts` exports a `DocsPageMap`; the deep-merge composes `en` base + locale override.

### Integration Points — tool → docs-slug mapping (25 tools)
| Domain (module) | Tools | Existing `/docs/[slug]` |
|-----------------|-------|--------------------------|
| salary | salary_net, salary_gross, salary_employer_cost | `salary` |
| phone | phone_validate, phone_parse, phone_operator | `phone` |
| address + geo | address_normalize, address_suggest, geo_provinces, geo_municipalities, geo_communes | `address-geo` |
| calendar | calendar_holidays, calendar_working_days, calendar_add_working_days | `calendar` |
| finance | finance_vat, finance_invoice_total, finance_inflation_adjust | `finance` |
| documents | generate_invoice_pdf, generate_receipt_pdf, generate_contract_pdf | `documents` |
| nif | nif_lookup | `nif-verification` (+ D-07 latency note) |
| translation | translate_text | `translation` |
| currency | currency_convert, currency_rates | `currency-exchange` |
| health | health | discretion (api-reference / none) |

Total: **25 tools** (matches registry; the D-01 test enforces this).

</code_context>

<specifics>
## Specific Ideas

- Endpoint shown everywhere as `https://utils.api.orb3x.com/api/mcp` (Streamable HTTP, POST).
- NIF latency wording must cite the concrete **5–30 s** range and advise generous client timeouts.
- Catalog rows link out to the existing per-domain HTTP docs rather than re-documenting params.
- `summaryCards` should surface the headline facts: 25 tools, Streamable HTTP transport, 7 locales.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. (Auto-generating tool descriptions from the registry, per-tool MCP schema pages, and an interactive "try it" console were implicitly out of scope; the hybrid catalog with curated one-liners + a registry-coverage test was chosen instead.)

</deferred>

---

*Phase: 5-MCP Documentation*
*Context gathered: 2026-06-19*
