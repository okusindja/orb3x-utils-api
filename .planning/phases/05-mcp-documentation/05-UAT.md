---
status: complete
phase: 05-mcp-documentation
source: [05-01-SUMMARY.md]
started: 2026-06-19T00:00:00Z
updated: 2026-06-19T13:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. MCP docs page renders (English)
expected: /docs/mcp renders without error; shows title/intro, endpoint POST /api/mcp, summary cards (25 tools / Streamable HTTP / 7 languages), and the catalog/connection/latency sections.
result: pass
note: "Initial report (404 + no navbar item) resolved: the 404 was a stale dev server (page built correctly — tsc totality + SSG confirm it); the missing navbar item was a real gap — fixed in fb2c091 (added 'MCP Server' to header nav + navigation.mcp copy). User confirmed after clean restart."

### 2. Tool catalog — 25 tools, grouped, linked
expected: The catalog shows all 25 tools grouped into domain tables (salary, phone, address-geo, calendar, finance, documents, nif, translation, currency, health). Each tool row has a short one-liner and a link that navigates to that tool's /docs/[slug] page.
result: pass

### 3. Connection snippets (4, copy-pasteable)
expected: The page shows 4 connection examples — Claude Desktop (uses the `npx mcp-remote` bridge in claude_desktop_config.json, NOT a bare url, with a Settings → Connectors note), Cursor (native url entry), a generic mcp.json, and a standalone `npx mcp-remote https://utils.api.orb3x.com/api/mcp` command. All reference https://utils.api.orb3x.com/api/mcp.
result: pass

### 4. NIF latency disclosure (both surfaces)
expected: The NIF tool's 5–30 s AGT portal latency is disclosed twice — an inline note on the nif_lookup catalog row, AND a dedicated "Performance & latency" section advising generous client timeouts.
result: pass

### 5. Localization — non-English locale renders
expected: Visiting a non-English locale (e.g. /pt/docs/mcp or the Portuguese site) renders the MCP page with localized chrome (title, intro, section headings, summary card labels) and localized tool one-liners, while code snippets / endpoint / tool names stay in English. Repeat-spot-check another locale if desired.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0

## Gaps

- truth: "/docs/mcp renders the MCP page; MCP appears in the docs navigation"
  status: resolved
  reason: "404 was a stale dev server (page built correctly). Missing navbar item fixed in fb2c091."
  severity: blocker
  test: 1
  artifacts: [src/components/header.tsx, src/locales/site/en.ts]
  missing: []
