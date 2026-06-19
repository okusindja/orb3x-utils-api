# Phase 5: MCP Documentation - Research

**Researched:** 2026-06-19
**Domain:** MCP client connection config (external) + typed docs-slug addition + registry-coverage test (internal)
**Confidence:** HIGH (internal codebase facts), MEDIUM (external client config — version-volatile, authored defensively)

## Summary

This phase adds one localized `/docs/mcp` page. The codebase design contract is fully resolved in
`05-UI-SPEC.md` (reuse the typed `DocsPage`/`DocsSection` shell, the one Option-A `DocsTableCell` link
extension, the section/snippet mapping). Research here covers only the EXTERNAL unknowns and the two
verification surfaces the planner must get right: (1) **correct, current MCP client connection snippets**
for the four target clients, and (2) the **registry↔catalog coverage test** plus the **7-locale TS compile**
constraint introduced by adding a new slug.

The single highest-risk finding: **Claude Desktop does NOT support a remote Streamable HTTP `url` entry in
`claude_desktop_config.json`.** Remote servers are added via **Settings → Connectors (Custom Connectors)**,
or wrapped with the **`mcp-remote` stdio bridge** inside `claude_desktop_config.json`. Cursor *does* support a
native `"url"` entry. Generic `mcp.json` uses a `mcpServers` map with `"type": "http"` + `"url"` — but the
`type` token name varies by client (`"http"` vs `"streamable-http"`), so snippets must be authored
defensively with an inline comment.

The internal facts are all verified against the codebase: 24 tool names are enumerated explicitly in the
existing registry test (the 25th is `health`), the MCP endpoint is `POST /api/mcp` with `disableSse: true`,
and adding `'mcp'` to `docsPageSlugs` forces an `mcp: DocsPage` entry in **all 7** `*DocsPages` files because
each is annotated `: DocsPageMap` (a total `Record<DocsPageSlug, DocsPage>`), not a partial.

**Primary recommendation:** Author 4 English/canonical connection snippets (Claude Desktop = `mcp-remote`
bridge + a "or add via Settings → Connectors" note; Cursor = native `url`; generic `mcp.json` = `type:http`+`url`;
standalone `mcp-remote` bash). Put the canonical 25-name catalog tool-name list in **one shared module** read by
both the page-building code and the coverage test. Add `mcp: DocsPage` to all 7 locale docs files (en full,
6 locales full but free to reuse en strings for English-canonical fields).

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Hybrid catalog, registry-verified. Catalog tool-name set MUST be cross-checked against `registerAllTools` by an automated test (every registered name appears; no phantom names).
- **D-02:** Detail level = name + one-liner + link to existing `/docs/[slug]`. No Zod schema duplication. Requires tool→docs-slug mapping.
- **D-03:** Description = short curated one-liner per tool (localizable). Not the registry anti-collision string, not an auto-extract.
- **D-04:** Chrome + the 25 tool one-liners localized in all 7 locales; snippets, config blocks, endpoint path, and tool names stay English/canonical. Untranslated keys fall back to `en` via `mergeDeep`. All 7 locale files must TS-compile (criterion 4).
- **D-05:** Four snippets — Claude Desktop, Cursor, generic `mcp.json`, `npx mcp-remote` bridge. Endpoint in every snippet: `https://utils.api.orb3x.com/api/mcp`. Streamable HTTP; SSE disabled server-side.
- **D-06:** Append `mcp` as the LAST slug in `docsPageSlugs` (after `examples`). Reuse standard `DocsPage` shape with `endpoint: { method: 'POST', path: '/api/mcp', detail }`, 3 summaryCards, sections[], relatedSlugs. Add `'mcp'` to the `as const` array and an `mcp` entry to each locale `DocsPageMap`.
- **D-07:** NIF latency on BOTH surfaces — inline note on the `nif_lookup` catalog row AND a dedicated "Performance & latency" section (5–30 s, advise generous timeouts).

### Claude's Discretion
- Exact one-liner wording per tool; exact `summaryCards` values; exact snippet formatting and field names.
- Docs-slug link target for the `health` tool (no dedicated HTTP doc page — link to `api-reference`/`getting-started`, or leave linkless).
- Whether `address_*` and `geo_*` are one combined group or two (both map to `address-geo`).
- Section ordering and grouping headings.

### Deferred Ideas (OUT OF SCOPE)
- None. (Auto-generating descriptions from registry, per-tool MCP schema pages, interactive "try it" console — implicitly out of scope.)

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DOCS-01 | Docs page documents MCP server — endpoint URL + tool catalog | Endpoint verified `POST /api/mcp` (`app/api/[transport]/route.ts`); 25-tool catalog mapping in CONTEXT + registry; coverage-test approach below |
| DOCS-02 | Connection snippets (native Streamable HTTP + `mcp-remote` fallback) + NIF latency disclosure | 4 client configs verified below; `mcp-remote` package verified on npm; NIF 5–30 s from D-07 / NIF-01 |
| DOCS-03 | Localized across all 7 locales via deep-merge site-copy | 7-locale TS-compile constraint verified below; `mergeDeep` fallback confirmed |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Render `/docs/mcp` page | Frontend Server (SSR / static) | — | `generateStaticParams` over `docsPageSlugs`; static docs page, no client fetch |
| Catalog tool-name list (source of truth) | Static / shared module | API (registry) | Page reads a shared name list; coverage test reconciles it with the runtime registry |
| Connection config content | Static content (English-canonical) | — | Pure authored strings; no runtime behavior |
| Registry introspection (test only) | Build/test tier | API (`registerAllTools`) | Test mocks the MCP server to capture `registerTool(name, …)` calls |

This phase touches NO API/runtime tier behavior — it is content + one type/render extension + one test.

## Standard Stack

No new runtime dependencies. The phase reuses what is already installed.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `mcp-handler` | (installed) | Serves the MCP endpoint (already wired, not edited this phase) | Existing `app/api/[transport]/route.ts` |
| `@modelcontextprotocol/sdk` | (installed) | `McpServer` type for the registry | Already a dependency |
| `next` (`next/link`) | 16.2.1 | The Option-A link cell uses `<Link>` | Already used by `relatedSlugs` "Open" links |
| Jest | 30.x | Coverage test runner | Existing `mcp-registry.test.ts` |

### Referenced-only external tool (NOT installed into the repo)
| Tool | Verified Version | Role | Notes |
|------|------------------|------|-------|
| `mcp-remote` | **0.1.38** (npm `time.modified` 2026-02-05) | stdio↔Streamable-HTTP bridge for clients without native remote HTTP support | Invoked by END USERS via `npx mcp-remote <url>`; appears ONLY inside the documented snippets, never added to `package.json`. `[VERIFIED: npm registry]` for existence/version; usage shape `[CITED: npmjs.com/package/mcp-remote, modelcontextprotocol.io]` |

**Version verification run:**
```bash
npm view mcp-remote version        # → 0.1.38
npm view mcp-remote time.modified  # → 2026-02-05T23:21:45Z (actively maintained)
```

## Package Legitimacy Audit

This phase installs **no new packages**. `mcp-remote` is referenced only inside documentation snippets that end users run; it is never added to the project's `package.json`. No legitimacy gate required for project installs. For completeness, `mcp-remote` is a real, widely-used package (Cloudflare/community remote-MCP bridge), verified above.

## Architecture Patterns

### System Architecture Diagram (this phase's data flow)

```
docsPageSlugs (+ 'mcp')  ──►  generateStaticParams  ──►  /docs/mcp static page
        │                                                       ▲
        ▼                                                       │
getSiteCopy(locale).docsPages['mcp']  ◄── mergeDeep(enDocsPages, localeDocsPages)
        │
        ├─ chrome/oneliners (localized, fall back to en)
        ├─ sections[]: connect (4 codes) │ catalog-* (tables w/ link cells) │ latency (note)
        └─ catalog tool names ──┐
                                │ (must equal)
   registerAllTools(mockServer) ┘ ──► registry test asserts name-set equality
        (POST /api/mcp, disableSse:true — runtime, unchanged this phase)
```

### Pattern 1: Single source of truth for the catalog tool-name list
**What:** Define the canonical 25-name list (or tool→{slug,one-liner-key} map) in ONE module that both the
page-building code and the coverage test import.
**When to use:** Always — this is what makes D-01 enforceable rather than two lists drifting.
**Recommendation:** Put it in a new small module, e.g. `src/lib/mcp/catalog.ts`, exporting an ordered
`MCP_TOOL_CATALOG` array of `{ name, docsSlug }` (one-liners stay in the localized docs copy keyed by `name`).
The page builds its tables from this list; the test reconciles `MCP_TOOL_CATALOG.map(t => t.name)` against the
registry-captured names. This avoids the test re-deriving names from rendered copy (brittle).

### Pattern 2: Registry introspection via mock server (mirror existing test)
**What:** Capture `registerTool(name, meta)` calls by passing a stub server into `registerAllTools`.
**Source:** `src/lib/__tests__/mcp-registry.test.ts` (existing, verified).
```ts
// Source: existing src/lib/__tests__/mcp-registry.test.ts (lines 26–36, 63–76)
const registeredTools: Record<string, unknown> = {};
const mockServer = {
  registerTool: (name: string, meta: unknown) => { registeredTools[name] = meta; },
};
registerAllTools(mockServer as never);
const registeredNames = Object.keys(registeredTools); // → the live 25 names
```
**Critical gotcha (carry forward):** The test file MUST keep the existing
`jest.mock('@/lib/agt-nif', …)` block at the top — `agt-nif` pulls in `cheerio` (ESM) which fails under
Jest's jsdom env. Without the mock, importing the registry (which transitively imports the nif tool) throws.

### Pattern 3: The two-way coverage assertion (D-01)
```ts
// catalogNames from the shared module; registeredNames from the mock server
expect(new Set(catalogNames)).toEqual(new Set(registeredNames)); // no missing, no phantom
expect(catalogNames.length).toBe(25);
```
Use set equality (not `toContain` loops) so BOTH directions fail loudly: a registered tool missing from the
catalog AND a phantom catalog name with no registration.

### The 25 registered tool names (verified)
24 are enumerated explicitly in the existing test; the 25th is `health` (asserted separately, plus the
`>= 25` count check). Full set:
```
health,
salary_net, salary_gross, salary_employer_cost,
phone_parse, phone_validate, phone_operator,
geo_provinces, geo_municipalities, geo_communes,
address_normalize, address_suggest,
calendar_holidays, calendar_working_days, calendar_add_working_days,
finance_vat, finance_invoice_total, finance_inflation_adjust,
currency_rates, currency_convert,
nif_lookup, translate_text,
generate_invoice_pdf, generate_receipt_pdf, generate_contract_pdf
```
`[VERIFIED: codebase grep — src/lib/__tests__/mcp-registry.test.ts lines 77–102 + registry.ts]`

### Anti-Patterns to Avoid
- **Deriving catalog names from rendered/localized copy in the test.** Brittle and locale-coupled. Read names from a typed shared list instead.
- **Dropping the `agt-nif` jest.mock** when copying the test pattern — breaks the whole suite under jsdom.
- **Putting a `<Link>` into a table cell without the Option-A type widening** — `DocsTable.rows` is `string[][]`; bare cells render as `<td>{cell}</td>`. Follow UI-SPEC Option A exactly (incl. the `key={cell}` fix).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Listing registered tools | A parser that scans `registry.ts` source text | Mock-server capture of `registerTool` calls | Runtime-accurate, matches the live server exactly |
| Per-locale fallback for untranslated keys | Manual `?? en` per field | Existing `mergeDeep` | Already composes en base + locale override automatically |
| Remote-HTTP→stdio bridging for users | Custom proxy docs | Document `mcp-remote` (existing community tool) | Standard, maintained, what every remote MCP server documents |

## Common Pitfalls

### Pitfall 1: Claude Desktop has no `url` field in claude_desktop_config.json
**What goes wrong:** Authoring a Claude Desktop snippet as `{"mcpServers":{"orb3x":{"url":"…/api/mcp"}}}` —
this does NOT work and can even corrupt the config file in some versions.
**Why it happens:** Claude Desktop's local config only understands **stdio** `command`/`args` servers. Remote
Streamable HTTP servers are added through **Settings → Connectors (Custom Connectors)**, not the JSON file.
**How to avoid:** For the Claude Desktop snippet, document the **`mcp-remote` bridge** form (stdio command that
proxies to the remote URL) AND add a one-line note: "or add `https://utils.api.orb3x.com/api/mcp` directly via
Settings → Connectors → Add custom connector." `[CITED: support.claude.com/articles/11503834; github.com/anthropics/claude-code#37286]`
**Warning signs:** Snippet uses a bare `url` for Claude Desktop with no `command`/`args`.

```json
// Claude Desktop — claude_desktop_config.json (mcp-remote bridge form)
{
  "mcpServers": {
    "orb3x-utils": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://utils.api.orb3x.com/api/mcp"]
    }
  }
}
// Or skip this file: Settings → Connectors → Add custom connector → paste the URL.
```

### Pitfall 2: `type` token name varies across clients
**What goes wrong:** A "generic" snippet hard-codes `"type": "http"` but some clients expect
`"type": "streamable-http"` (or `"transport": "http"`).
**Why it happens:** The config schema is convention, not a ratified part of the MCP spec — the spec defines the
*wire transport*, not the *client config file format*. `[CITED: modelcontextprotocol.io/docs/concepts/transports]`
**How to avoid:** In the generic `mcp.json` snippet, use `"type": "http"` + `"url"` (most common) and add an
inline comment: `// some clients use "streamable-http" or "transport": "http"`. Keep Cursor's snippet as a
bare `"url"` (Cursor infers HTTP and needs no `type`). `[CITED: cursor.com/docs/mcp]`
**Warning signs:** A single snippet presented as universally correct with no defensive comment.

```json
// Generic mcp.json (Streamable HTTP)
{
  "mcpServers": {
    "orb3x-utils": {
      "type": "http",
      "url": "https://utils.api.orb3x.com/api/mcp"
    }
  }
}
// Note: some clients use "type": "streamable-http" or "transport": "http".
```
```json
// Cursor — ~/.cursor/mcp.json (global) or .cursor/mcp.json (project)
{
  "mcpServers": {
    "orb3x-utils": {
      "url": "https://utils.api.orb3x.com/api/mcp"
    }
  }
}
```
```bash
# Standalone mcp-remote bridge (any stdio-only client)
npx -y mcp-remote https://utils.api.orb3x.com/api/mcp
```

### Pitfall 3: New slug forces a full DocsPage in ALL 7 locale files
**What goes wrong:** Adding `'mcp'` to `docsPageSlugs` then only writing the `mcp` entry in `en` → the other
6 `*DocsPages` files fail to compile.
**Why it happens:** Each locale docs module is annotated `export const xxDocsPages: DocsPageMap = {…}`, and
`DocsPageMap = Record<DocsPageSlug, DocsPage>` (a **total** record). The `DeepPartial<SiteCopy>` on `overrides`
in `site-copy.ts` does NOT relax this — the partiality is erased because the inner `*DocsPages` const carries the
non-partial `DocsPageMap` annotation. `[VERIFIED: codebase — site-content.ts:69, docs/pt.ts:50, site-copy.ts:15]`
**How to avoid:** Add a **complete** `mcp: DocsPage` to all 7 docs files (en + pt/es/fr/de/zh/ja). The 6 non-en
files MAY reuse the English-canonical strings verbatim for English-only fields (endpoint path, snippets, tool
names) and translate only chrome + the 25 one-liners (D-04). `mergeDeep` still applies for any other shared keys,
but each file must independently satisfy `DocsPageMap`.
**Warning signs:** `tsc`/`pnpm build` error "Property 'mcp' is missing in type … but required in type 'DocsPageMap'".

### Pitfall 4: SSE is disabled — clients must use Streamable HTTP
**What goes wrong:** Docs imply SSE works, or a client is configured for the old HTTP+SSE transport.
**Why it happens:** `disableSse: true` is set server-side (no Redis on free tier); the SSE GET returns 404.
**How to avoid:** State plainly: transport is **Streamable HTTP (POST /api/mcp)**; SSE-only clients must use the
`mcp-remote` bridge. `[VERIFIED: codebase — app/api/[transport]/route.ts:24]`

## Code Examples

### The endpoint facts to state on the page (verified)
```
Method:    POST
Path:      /api/mcp   (basePath '/api' + [transport] = 'mcp')
Full URL:  https://utils.api.orb3x.com/api/mcp   (SITE_URL from src/lib/seo.ts)
Transport: Streamable HTTP (SSE disabled — disableSse: true)
Runtime:   nodejs, maxDuration 60
Tools:     25 (discoverable via tools/list)
```
`[VERIFIED: codebase — route.ts, seo.ts:6,12]`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HTTP+SSE two-endpoint transport | Streamable HTTP single endpoint | spec rev 2025-03-26 | Docs should say "Streamable HTTP", not "SSE" |
| Edit `claude_desktop_config.json` with a remote `url` | Settings → Connectors UI, or `mcp-remote` bridge in config | Claude Desktop remote support | Claude Desktop snippet must NOT use bare `url` |

**Deprecated/outdated:**
- HTTP+SSE transport: superseded by Streamable HTTP. Do not document SSE as a connection option.

## Runtime State Inventory

Not a rename/refactor/migration phase — section omitted (greenfield content addition only).
The one structural change is additive (`'mcp'` slug + `mcp` map entries + one widened type); no stored data,
service config, OS state, secrets, or build artifacts carry an old value to migrate.

## Validation Architecture

Framework: **Jest 30.x** (`jest.config.js`), `@/` → `src/` path alias mirrored in `moduleNameMapper`.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.x + ts (SWC) |
| Config file | `jest.config.js` |
| Quick run command | `pnpm test -- mcp-catalog` (new test file) |
| Full suite command | `pnpm test` |
| Compile gate | `pnpm build` (Next.js `tsc` — only the build's tsc catches `DocsPageMap` totality errors, per STATE.md Phase 4 note) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DOCS-01 | Catalog tool-name set == registry set (no missing/phantom), count == 25 | unit | `pnpm test -- mcp-catalog` | ❌ Wave 0 (new `src/lib/__tests__/mcp-catalog.test.ts`) |
| DOCS-01 | `mcp` page exists & renders for each locale | unit/integration | assert `getLocalizedDocsPage(locale,'mcp')` returns a page with `endpoint.path === '/api/mcp'` for all 7 locales | ❌ Wave 0 |
| DOCS-02 | All 4 connection snippets present in `connect` section | unit | assert the en `mcp` page `connect` section has 4 `codes[]` and each contains the endpoint URL (or `mcp-remote`) | ❌ Wave 0 |
| DOCS-02 | NIF 5–30 s latency string present (both surfaces) | unit | assert `nif_lookup` row description contains `5–30` AND a `latency` section note contains `5–30` | ❌ Wave 0 |
| DOCS-03 | All 7 locale docs files compile with new `mcp` slug | compile | `pnpm build` (tsc) | n/a — gate |

### Sampling Rate
- **Per task commit:** `pnpm test -- mcp-catalog`
- **Per wave merge:** `pnpm test`
- **Phase gate:** `pnpm build` green (TS totality) + full suite green before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] `src/lib/__tests__/mcp-catalog.test.ts` — registry↔catalog coverage + snippet/latency presence (covers DOCS-01, DOCS-02). Reuse the `jest.mock('@/lib/agt-nif', …)` block from `mcp-registry.test.ts`.
- [ ] `src/lib/mcp/catalog.ts` (or equivalent shared name list) — single source the page AND the test both read.
- No framework install needed — Jest already configured.

## Security Domain

`security_enforcement` not explicitly disabled; assessed and found N/A for this phase. The MCP endpoint, its
auth posture (public, by design), and rate limiting are owned by completed Phases 1–3 and are **not** modified
here. This phase adds static documentation content + one test + one type/render widening.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | no | No user input on a static docs page |
| V6 Cryptography | no | None |
| V14 Configuration | minor | Docs must not leak secrets — snippets contain only the public endpoint URL (no keys; the API is intentionally public). Verify no env values are embedded. |

One content-security note for the planner: connection snippets MUST contain only the public URL — never an API
key, token, or `Authorization` header — because the endpoint is public by design (REQUIREMENTS "Out of Scope":
no auth in v1). Authored `headers` blocks in copied generic examples should be stripped.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node + pnpm + Jest | coverage test, build | ✓ (project standard) | per CLAUDE.md | — |
| `mcp-remote` on npm | referenced in docs only (end users run it) | ✓ | 0.1.38 | — (doc-only; not installed) |

No new local tooling required. Internet access is NOT needed at build/test time (snippets are static strings).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Generic `mcp.json` `"type": "http"` is the most broadly accepted token (vs `"streamable-http"`/`"transport"`) | Pitfall 2 | Low — mitigated by the inline defensive comment instructing the planner to author both variants in a note |
| A2 | `health` is the 25th tool (24 enumerated in the existing test + `health` asserted separately) | Tool names | Low — count `>= 25` and the new set-equality test would catch any drift at CI time |
| A3 | The 6 non-en docs files may reuse en strings for English-canonical fields and still satisfy `DocsPageMap` | Pitfall 3 | Low — verified the annotation is total; reuse is a content choice, types are satisfied either way |

## Open Questions (RESOLVED)

> RESOLVED in 05-01-PLAN.md: Q1 → lead with the `mcp-remote` bridge JSON + a Connectors-UI note; Q2 → `health` links to `api-reference`.

1. **Exact Claude Desktop config form to lead with (bridge vs. Connectors UI).** — RESOLVED: mcp-remote bridge JSON, with a Connectors-UI note.
   - What we know: bare `url` does NOT work in `claude_desktop_config.json`; both the `mcp-remote` bridge and the Settings → Connectors UI do.
   - What's unclear: which the team wants as the primary documented path.
   - Recommendation: lead with the `mcp-remote` bridge JSON (it's copy-pasteable into the snippet block, matching D-05's "Claude Desktop `claude_desktop_config.json`" framing) and add the one-line Connectors-UI note. This satisfies D-05 verbatim while staying correct.

2. **`health` tool docs-slug link target** (Claude's discretion per CONTEXT). — RESOLVED: link to `api-reference` (it exists in `docsPageSlugs`). No blocker.

## Sources

### Primary (HIGH confidence)
- Codebase: `src/lib/site-content.ts`, `src/lib/site-copy.ts`, `src/locales/site/docs/{en,pt}.ts`, `src/locales/site/types.ts`, `app/api/[transport]/route.ts`, `src/lib/seo.ts`, `src/lib/__tests__/mcp-registry.test.ts`, `src/lib/mcp/registry.ts` — verified by direct read/grep.
- modelcontextprotocol.io/docs/concepts/transports — Streamable HTTP transport definition (single POST/GET endpoint, SSE optional).
- npm `mcp-remote` 0.1.38 (verified via `npm view`).

### Secondary (MEDIUM confidence — version-volatile client config)
- support.claude.com/en/articles/11503834 + github.com/anthropics/claude-code#37286 — Claude Desktop remote servers via Connectors / `mcp-remote`, NOT bare `url`.
- cursor.com/docs/mcp — Cursor remote server uses bare `"url"`; `mcp.json` at `~/.cursor/` or project `.cursor/`.

### Tertiary (LOW confidence — flagged)
- Community guides on `"type": "http"` vs `"streamable-http"` token naming (mcpplaygroundonline, yaw.sh) — drove the A1 defensive-comment recommendation.

## Metadata

**Confidence breakdown:**
- Internal facts (endpoint, slug typing, tool names, test pattern): HIGH — verified against codebase.
- Connection snippets (Claude Desktop / Cursor / generic): MEDIUM — official docs confirm the *shape*, but client config formats shift; authored defensively with inline notes.
- `mcp-remote` existence/version: HIGH — npm verified.

**Research date:** 2026-06-19
**Valid until:** 2026-07-19 (internal facts stable; re-verify client config snippets if the phase slips — MCP client config is fast-moving, ~7-day volatility on the external snippets).
