# Milestones

## v1.0 MVP (Shipped: 2026-06-19)

**Phases completed:** 5 phases, 19 plans, 12 tasks

**Key accomplishments:**

- One-liner:
- One-liner:
- One-liner:
- One-liner:
- One-liner:
- One-liner:
- Three Angola phone MCP tools (phone_parse, phone_validate, phone_operator) wrapping src/lib/angola/phone.ts via shared Zod schema and mcpToolHandler, with LOC-01 TDD coverage
- Three Angola geo MCP tools (geo_provinces, geo_municipalities, geo_communes) wrapping src/lib/angola/geo.ts with Zod schemas, HTTP-envelope mirroring, and RouteError propagation via mcpToolHandler
- src/lib/mcp/tools/address.ts
- One-liner:
- All 14 Angola utility tools (salary x3, phone x3, geo x3, address x2, calendar x3) plus health wired into registerAllTools and integration-tested; 75-test suite and tsc both clean.
- One-liner:
- 3 pure Angola finance MCP tools (finance_vat, finance_invoice_total, finance_inflation_adjust) wrapping calculateVat/calculateInvoiceTotals/adjustForInflation via mcpToolHandler — no timeout, retry, or cache
- One-liner:
- One-liner:
- translate_text MCP tool wrapping Google Translate with DoS guard (max 5000 chars), D-04 retry enrichment for upstream failures, and non-retryable validation errors
- One-liner:
- 1. [Rule 3 - Blocking] Generic `runPdfTool` to satisfy `CallToolResult`
- Localized /docs/mcp page across all 7 locales documenting the POST /api/mcp Streamable HTTP endpoint, a registry-verified 25-tool catalog with per-tool docs links, 4 client connection snippets (mcp-remote bridge for Claude Desktop), and the NIF 5–30 s AGT-portal latency disclosure.

---
