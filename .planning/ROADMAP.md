# Roadmap: orb3x-utils-api — Public MCP Server

## Overview

This milestone adds a public MCP server to the existing Angola utilities API. The work proceeds in five phases: a foundation that wires up the endpoint, rate limiting, and performance prerequisites; two tool phases that progress from pure-function domains to external-HTTP domains; a document tools phase that handles binary PDF output; and a final documentation phase that localizes the MCP docs across all seven site locales. Every phase delivers a coherent, independently verifiable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: MCP Foundation** - Endpoint live, rate-limited, error-safe, with bank-images refactored
- [ ] **Phase 2: Core Utility Tools** - Salary, phone, geo, address, and calendar tools registered and callable
- [ ] **Phase 3: External HTTP Tools** - Finance, currency, NIF, and translation tools with upstream timeout guards
- [ ] **Phase 4: Document Tools** - Invoice, receipt, and contract PDF tools with size guard and restored v1 shims
- [ ] **Phase 5: MCP Documentation** - MCP docs page live in all 7 locales

## Phase Details

### Phase 1: MCP Foundation
**Goal**: The MCP endpoint is publicly reachable, stateless, rate-limited per IP, and returns structured errors; the bank-images refactor eliminates the cold-start and PDF payload risk before any tools go live.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: MCP-01, MCP-02, MCP-03, MCP-04, MCP-05, PERF-01
**Success Criteria** (what must be TRUE):
  1. An MCP client can connect to `https://<host>/api/mcp` via Streamable HTTP (POST) and SSE (GET) and receive a valid JSON-RPC response
  2. `tools/list` returns an empty or stub tool list with correct `name`, `title`, `description`, and Zod `inputSchema` shape (registry scaffold wired but initially empty)
  3. A tool that throws returns `{ isError: true, content: [...] }` — the response is never a 500 or unhandled exception
  4. A client that sends more than the throttle limit of requests per IP within the window receives a 429 response from `middleware.ts`
  5. `src/lib/angola/bank-images.ts` no longer contains inline base64; bank logo images are served from `public/bank-logos/` as URLs
**Plans**: 5 plans

Plans:
- [ ] 01-01-PLAN.md — Wave 0: install MCP packages, extract bank logo PNGs, create failing test scaffolds
- [ ] 01-02-PLAN.md — MCP core slice: tool-error boundary, health stub, registry, /api/mcp route (GET/POST/DELETE)
- [ ] 01-03-PLAN.md — Per-IP rate-limit middleware.ts (60/min, /api/mcp + /api/sse, 429 RouteError shape)
- [ ] 01-04-PLAN.md — PERF-01: bank-images base64 -> filesystem refactor + banks.ts logo-bytes read
- [ ] 01-05-PLAN.md — Verification gate (full suite + MCP Inspector + real client, D-09) [checkpoint]

### Phase 2: Core Utility Tools
**Goal**: MCP clients can invoke salary/tax, phone, geo, address, and calendar tools — all pure-function domains — and receive well-formed results or structured errors.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: SAL-01, LOC-01, LOC-02, LOC-03, CAL-01
**Success Criteria** (what must be TRUE):
  1. Client calls `calculate_net_salary` with a gross amount and receives a net salary and tax breakdown as a JSON text content block
  2. Client calls `validate_phone` with an Angola phone number string and receives parsed phone data or a structured `isError` response for invalid input
  3. Client calls `resolve_geolocation` with a province/municipality identifier and receives the corresponding Angola geo data
  4. Client calls `parse_address` with an address string and receives a normalized Angola address structure
  5. Client calls `query_calendar` with a date or year and receives Angola public holiday/calendar data
**Plans**: TBD

### Phase 3: External HTTP Tools
**Goal**: MCP clients can invoke finance, currency, NIF, and translation tools — all of which make upstream HTTP calls — and receive results or structured timeout/failure errors without the tool ever throwing.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: FIN-01, FIN-02, NIF-01, TRN-01
**Success Criteria** (what must be TRUE):
  1. Client calls a finance utility tool and receives Angola finance calculation results as a JSON text content block
  2. Client calls the currency exchange tool and receives live exchange rate data; when the upstream is unreachable within the timeout, the tool returns `{ isError: true, content: [...] }` rather than a 500
  3. Client calls the NIF lookup tool with a valid NIF and receives AGT portal data; when the portal does not respond within ~25 s, the tool returns `{ isError: true }` with retry guidance text
  4. Client calls the translate tool with a text string and target locale and receives translated text; upstream failures return a structured `isError` response
**Plans**: TBD

### Phase 4: Document Tools
**Goal**: MCP clients can generate invoice, receipt, and contract PDFs via MCP tools; PDFs are returned as base64 embedded resource blobs with a text fallback; oversized PDFs fail cleanly before hitting the Vercel 413 ceiling; and the deleted v1 document shims are restored so versioned HTTP URLs also work.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: DOC-01, DOC-02, DOC-03, DOC-04, DOC-05
**Success Criteria** (what must be TRUE):
  1. Client calls `generate_invoice_pdf` with valid invoice data and receives a response containing an embedded resource blob (`type: "resource"`, `mimeType: "application/pdf"`, base64 data) plus a `type: "text"` fallback block
  2. Client calls `generate_receipt_pdf` and `generate_contract_pdf` and receives the same base64 + text fallback structure as the invoice tool
  3. When a generated PDF would exceed the size guard threshold (`pdfBytes.length * 1.34 > 4_000_000`), the tool returns `{ isError: true, content: [...] }` before any Vercel response is sent
  4. HTTP requests to `GET/POST /api/v1/documents/contract` and `GET/POST /api/v1/documents/receipt` return valid responses (restored shims; build passes with no import errors)
**Plans**: TBD
**UI hint**: no

### Phase 5: MCP Documentation
**Goal**: The docs site has a localized MCP page in all 7 languages that documents the endpoint URL, full tool catalog, client connection examples (native Streamable HTTP and `mcp-remote` fallback), and NIF portal latency disclosure.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: DOCS-01, DOCS-02, DOCS-03
**Success Criteria** (what must be TRUE):
  1. Navigating to the MCP docs page in any of the 7 site locales (en, pt, es, fr, de, zh, ja) renders without error and displays the MCP endpoint URL and tool catalog
  2. The docs page includes copy-pasteable client config snippets for both native Streamable HTTP and the `mcp-remote` bridge fallback
  3. The NIF tool's AGT portal latency (5–30 s) is disclosed on the docs page with appropriate user guidance
  4. The MCP docs page content follows the existing deep-merge site-copy pattern (`mergeDeep(enSiteCopy, localeCopy)`) and all 7 locale files compile without TypeScript errors
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. MCP Foundation | 0/5 | Planned | - |
| 2. Core Utility Tools | 0/TBD | Not started | - |
| 3. External HTTP Tools | 0/TBD | Not started | - |
| 4. Document Tools | 0/TBD | Not started | - |
| 5. MCP Documentation | 0/TBD | Not started | - |
