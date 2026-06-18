# Requirements: orb3x-utils-api — Public MCP Server

**Defined:** 2026-06-18
**Core Value:** AI clients (and any MCP-compatible tool) can reliably invoke the Angola utility functions as MCP tools over a single hosted endpoint — reusing the existing `src/lib/angola/` domain logic, with zero new paid infrastructure.

## v1 Requirements

Requirements for this milestone. Each maps to a roadmap phase.

### MCP Server Foundation

- [x] **MCP-01**: MCP client can connect to a public Streamable HTTP endpoint at `/api/mcp` (served by `mcp-handler` from `app/api/[transport]/route.ts`, exporting GET/POST/DELETE)
- [x] **MCP-02**: Server runs statelessly on the Vercel free tier — no Redis, Node.js runtime, `maxDuration: 60`. **Revised in Phase 1:** SSE disabled (`disableSse: true`) because `mcp-handler` SSE requires Redis (conflicts with the no-Redis lock); Streamable HTTP is the supported transport, with `mcp-remote` as the bridge for SSE-only clients
- [x] **MCP-03**: Client can discover all available tools via `tools/list`, each with a `name`, `title`, `description`, and Zod `inputSchema` with per-field descriptions
- [x] **MCP-04**: A tool that fails returns a structured MCP error (`{ isError: true, content: [...] }`) instead of throwing, mapping `RouteError` and domain error classes to a consistent shape
- [x] **MCP-05**: Requests to `/api/mcp` are rate-limited per IP via stateless in-memory `middleware.ts` throttling. **Caveat (Phase 1):** best-effort only — per-instance state cannot enforce a global per-IP cap across Vercel's scaled instances (live burst showed 0× 429). Logic unit-verified; a true global limit is deferred to v2 (SEC-01: Vercel Firewall WAF or shared KV)

### Salary & Tax Tools

- [x] **SAL-01**: Client can calculate Angola net salary and tax breakdown from gross input via an MCP tool (reusing `src/lib/angola/salary.ts`)

### Location Tools (Phone, Geo, Address)

- [x] **LOC-01**: Client can validate/parse an Angola phone number via an MCP tool
- [x] **LOC-02**: Client can resolve Angola geolocation data (provinces/municipalities) via an MCP tool
- [ ] **LOC-03**: Client can parse/normalize an Angola address via an MCP tool

### Calendar Tools

- [ ] **CAL-01**: Client can query Angola calendar/holiday information via an MCP tool

### Finance & Currency Tools

- [ ] **FIN-01**: Client can run Angola finance utilities (`src/lib/angola/finance.ts`) via an MCP tool
- [ ] **FIN-02**: Client can fetch currency exchange rates via an MCP tool, with an upstream timeout guard and structured error on failure

### NIF Tool

- [ ] **NIF-01**: Client can look up a NIF on the AGT portal via an MCP tool, with an upstream timeout (~25s) and a structured retry-guidance error when the portal is slow/unavailable

### Translation Tool

- [ ] **TRN-01**: Client can translate text via an MCP tool (reusing `src/lib/translate.ts`), with a structured error on upstream failure

### Document Tools (PDF)

- [ ] **DOC-01**: Client can generate an invoice PDF via an MCP tool, returned as a base64 embedded resource blob plus a `text` fallback block
- [ ] **DOC-02**: Client can generate a receipt PDF via an MCP tool, returned as base64 + text fallback
- [ ] **DOC-03**: Client can generate a contract PDF via an MCP tool, returned as base64 + text fallback
- [ ] **DOC-04**: Document tools enforce a size guard (`pdfBytes.length * 1.34 > 4_000_000` → `isError: true`) so a too-large PDF fails cleanly instead of a Vercel 413
- [ ] **DOC-05**: The deleted versioned shims `app/api/v1/documents/contract/route.ts` and `app/api/v1/documents/receipt/route.ts` are restored (re-export shims mirroring the existing `invoice` shim) so the build and versioned URLs work again

### Performance Hardening

- [x] **PERF-01**: `src/lib/angola/bank-images.ts` is refactored from ~1.4 MB inline base64 to URL references under `public/bank-logos/`, reducing PDF payload size and cold-start time

### Documentation

- [ ] **DOCS-01**: A docs-site page documents the MCP server — endpoint URL and the catalog of available tools
- [ ] **DOCS-02**: The MCP docs page includes client connection snippets for native Streamable HTTP and the `mcp-remote` bridge fallback, plus NIF portal latency disclosure
- [ ] **DOCS-03**: The MCP docs page is localized across all 7 site locales (en, pt, es, fr, de, zh, ja) using the existing deep-merge site-copy pattern

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Tool Output

- **STRUCT-01**: Add `structuredContent` + `outputSchema` to salary and currency tools once output shapes are stable
- **STRUCT-02**: Add `annotations` (`audience: ["user"]`) to PDF content blocks

### MCP Capabilities

- **CAP-01**: Expose static Angola data (IRT tax brackets, holiday tables) via MCP `resources`
- **CAP-02**: Provide a `server_overview` MCP prompt via `prompts/list`

### Security

- **SEC-01**: Optional API-key / OAuth gating if abuse of the public endpoint becomes a problem (Vercel Firewall WAF rate-limiting if Hobby supports it)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Authentication / API keys / OAuth (v1) | Chosen public access, matching the already-public HTTP API |
| SSE with Redis-backed resumable sessions | Requires paid storage; tools are request/response so stateless SSE suffices |
| Reimplementing document PDF logic | `generate{Invoice,Receipt,Contract}Pdf` already exist and are reused |
| Edge runtime | `mcp-handler` and AGT scraping require Node.js runtime |
| New utility domains beyond the existing HTTP API | MCP wraps existing `src/lib/angola/` logic only |

## Traceability

Populated during roadmap creation. Each requirement maps to exactly one phase.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MCP-01 | Phase 1 | Complete |
| MCP-02 | Phase 1 | Complete |
| MCP-03 | Phase 1 | Complete |
| MCP-04 | Phase 1 | Complete |
| MCP-05 | Phase 1 | Complete |
| PERF-01 | Phase 1 | Complete |
| SAL-01 | Phase 2 | Complete |
| LOC-01 | Phase 2 | Complete |
| LOC-02 | Phase 2 | Complete |
| LOC-03 | Phase 2 | Pending |
| CAL-01 | Phase 2 | Pending |
| FIN-01 | Phase 3 | Pending |
| FIN-02 | Phase 3 | Pending |
| NIF-01 | Phase 3 | Pending |
| TRN-01 | Phase 3 | Pending |
| DOC-01 | Phase 4 | Pending |
| DOC-02 | Phase 4 | Pending |
| DOC-03 | Phase 4 | Pending |
| DOC-04 | Phase 4 | Pending |
| DOC-05 | Phase 4 | Pending |
| DOCS-01 | Phase 5 | Pending |
| DOCS-02 | Phase 5 | Pending |
| DOCS-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23 (roadmap complete)
- Unmapped: 0

---
*Requirements defined: 2026-06-18*
*Last updated: 2026-06-18 after roadmap creation*
