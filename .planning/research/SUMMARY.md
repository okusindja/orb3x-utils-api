# Project Research Summary

**Project:** orb3x-utils-api — Public MCP Server (Angola Utilities)
**Domain:** MCP server adapter over an existing Next.js 16 utility API, hosted on Vercel free tier
**Researched:** 2026-06-18
**Confidence:** HIGH

## Executive Summary

This milestone adds a public Model Context Protocol (MCP) server to an existing brownfield Next.js 16.2.1 project that already exposes Angola-specific utilities (salary/tax, phone, geo, address, finance, currency, NIF lookup, calendar, PDF documents) over a versioned HTTP API. The recommended approach is to treat the MCP layer as a thin adapter over the already-clean `src/lib/angola/` domain logic — mirroring exactly how the existing versioned route handlers work. `mcp-handler@1.1.0` (the official Vercel-maintained Next.js adapter) handles all MCP protocol framing via a single `app/api/[transport]/route.ts` dynamic route, using stateless Streamable HTTP transport (no Redis, no paid add-ons), which is fully compatible with the Vercel Hobby free tier.

The core architectural decision is a hard boundary: all MCP adapter code lives in `src/lib/mcp/` (new) and `app/api/[transport]/` (new); everything in `src/lib/angola/` is untouched. Tools are registered per-domain in separate `src/lib/mcp/tools/*.ts` files, composed by a central `registry.ts`, and protected by a shared `mcpToolHandler` higher-order function that translates domain errors (`RouteError`, `PortalLookupError`, etc.) into valid MCP `{ isError: true, content: [...] }` responses — never throwing. This pattern means adding an MCP surface produces zero changes to the existing HTTP API or domain logic.

The highest-impact risks are: (1) the 4.5 MB Vercel response body limit colliding with base64-encoded PDFs inflated by a 1.4 MB `bank-images.ts` module; (2) stateless Streamable HTTP being unfamiliar to clients that only speak SSE — handled by leaving both transports enabled at launch; and (3) no rate limiting on a fully public endpoint that will be hit by AI agents at much higher frequency than human users. All three must be addressed in the foundation phase before any tools go live.

---

## Cross-Report Tensions Resolved

### PDF Payload Limits: Which Ceiling Governs?

Two limits are in play:

- **Vercel function body limit: 4.5 MB** — hard ceiling for the HTTP response body. Base64 inflates binary by ~33%, so a PDF must be under ~3.4 MB raw to stay under 4.5 MB encoded. This is the governing constraint for MCP tool responses that return PDFs. Causes HTTP 413 on breach — hard failure.
- **MCP embedded-resource blob limit: ~1 MB** — a practical client-side rendering limit observed in community implementations, not in the MCP spec. Governs whether clients render the blob, not whether Vercel accepts the response. Causes silent render failures in some clients.

**Resolution:** The Vercel 4.5 MB limit is the infrastructure constraint that must be prevented. The 1 MB client limit is a UX concern. In practice, the 1.4 MB `bank-images.ts` inline base64 data means realistic invoices can breach both. The two-pronged mitigation: (a) size guard in document tools — if `pdfBytes.length * 1.34 > 4_000_000`, return `isError: true` before Vercel 413s; (b) refactor `bank-images.ts` to URL references in `public/bank-logos/`, eliminating ~1.4 MB from PDF payload and cold-start bundle simultaneously. Bank-images refactor is a Phase 1 prerequisite, not a later optimization.

### SSE vs Stateless: What mcp-handler Actually Serves

PROJECT.md locks: no Redis, stateless Streamable HTTP. PITFALLS.md warns: keep SSE enabled for client compatibility. These are not in conflict.

**Resolution:** `mcp-handler` serves both Streamable HTTP (POST) and SSE (GET) from the same `[transport]` route. In stateless mode (no `redisUrl`), SSE connections are served statelessly — no Redis required. The `redisUrl` option enables multi-invocation session continuity for resumable streams, which is the paid feature. Stateless SSE still works; it cannot resume mid-stream across function recycling, but all Angola utility tools are request/response (no mid-result streaming), so this is a non-issue. **Leave both transports enabled at launch (mcp-handler default). Do not pass `disableSse: true`.** The only cost is that idle SSE connections hold a function instance open; acceptable at low traffic.

### Rate Limiting: Public Endpoint, No Auth

PROJECT.md locks public/no-auth access. PITFALLS.md flags this as the highest security risk for an MCP endpoint.

**Resolution:** Noted risk within project constraints — not a scope change. IP-level rate limiting in Next.js `middleware.ts` (in-memory, stateless, per-instance) provides meaningful friction without adding auth. Vercel Firewall WAF rate limiting scoped to `/api/mcp` is the correct production path if Hobby plan supports it (confirm before Phase 1). This must be in place before launch, not deferred.

---

## Key Findings

### Recommended Stack

Three new dependencies are required: `mcp-handler@1.1.0`, `@modelcontextprotocol/sdk@1.29.0`, and `zod@^3` (Zod 3.x — not 4.x; `mcp-handler` peer dep is `zod@^3` and Zod 4 has breaking API changes not yet supported). All added via `pnpm add mcp-handler @modelcontextprotocol/sdk zod`. Existing stack requires no changes.

**Core technologies:**
- `mcp-handler@1.1.0`: MCP entry point for Next.js App Router; handles Streamable HTTP + SSE dispatch, JSON-RPC framing, `tools/list`; Vercel-maintained official adapter
- `@modelcontextprotocol/sdk@1.29.0`: MCP protocol engine; do not use < 1.26.0 (known security vulnerability)
- `zod@^3` (3.24.x): Tool `inputSchema` definitions; required by `mcp-handler`; pin to 3.x until `mcp-handler` explicitly supports Zod 4
- `@modelcontextprotocol/inspector` (npx, dev only): Browser-based MCP testing against `http://localhost:3000/api/mcp`

### Expected Features

**Must have (table stakes):**
- Streamable HTTP endpoint at `app/api/[transport]/route.ts` with `GET` + `POST` + `DELETE` exports
- All domain tools registered with `name`, `title`, `description`, `inputSchema` (Zod with `.describe()` on every field)
- Tool results as `{ content: [{ type: "text", text: JSON.stringify(result) }] }` for JSON utilities
- Tool errors as `{ content: [...], isError: true }` — never throw from a tool handler
- Document tools return base64 PDF as embedded resource blob plus `type: "text"` fallback
- Restore deleted `app/api/v1/documents/contract/route.ts` and `app/api/v1/documents/receipt/route.ts` shims
- MCP docs page, all 7 locales, with Streamable HTTP and `mcp-remote` client config snippets

**Should have (differentiators):**
- `title` field on every tool
- `structuredContent` + `outputSchema` on salary and currency tools once output shape is stable
- `annotations` on PDF content blocks (`audience: ["user"]`)
- "Use this when / do not use this when" guidance in descriptions for tools with close siblings
- Dual client config documentation (native Streamable HTTP + `mcp-remote` fallback)

**Defer (v2+):**
- `prompts/list` with `server_overview` prompt
- MCP `resources` capability for static Angola data (IRT tax brackets, holiday tables)
- Authentication / API keys / OAuth (explicitly out of scope this milestone)

### Architecture Approach

Parallel adapter pattern: MCP layer and existing HTTP route layer are two independent thin adapters both calling `src/lib/angola/*.ts` directly. New code is entirely in `src/lib/mcp/` and `app/api/[transport]/route.ts`. No existing files are modified.

**Major components:**
1. `app/api/[transport]/route.ts` — MCP entry point; `createMcpHandler` setup; `runtime: 'nodejs'`, `maxDuration: 60`; exports `GET`, `POST`, `DELETE`
2. `src/lib/mcp/registry.ts` — composes all `register*Tools(server)` calls; called once at init time
3. `src/lib/mcp/tools/*.ts` — nine domain tool modules (salary, phone, geo, address, calendar, finance, documents, nif, translate)
4. `src/lib/mcp/tool-error.ts` — `mcpToolHandler` HOF; single error boundary; maps `RouteError`/domain errors to `{ isError: true, content }` shape
5. `src/lib/angola/*.ts` — existing, unchanged; single source of truth for all business logic

### Critical Pitfalls

1. **4.5 MB PDF response ceiling** — base64 inflation + `bank-images.ts` 1.4 MB inline images can push realistic invoices past the Vercel hard limit. Add size guard before returning; refactor `bank-images.ts` to URL references in `public/`.
2. **NIF tool upstream timeout** — AGT portal takes 5–30 s and sometimes does not respond. Set `maxDuration: 60`; increase NIF fetch abort to 25 s; return structured `isError: true` with retry guidance.
3. **No rate limiting on a public agentic endpoint** — AI agents call MCP tools at 10–100x human frequency. `middleware.ts` with per-IP throttling must be in place before any tool goes live.
4. **Cold start amplified by `bank-images.ts`** — 1.4 MB inline base64 parsed on every cold start; adds 2–4 s. Refactor in Phase 1; structure tool files for tree-shaking.
5. **Zod schema gaps letting malformed inputs reach domain layer** — LLM-generated inputs are adversarial. Apply domain-specific refinements on every tool input; run adversarial input tests per tool.

---

## Implications for Roadmap

Suggested phases: 5

1. **MCP Foundation** — route handler, rate limiting middleware, transport config (`maxDuration: 60`, both transports), `mcpToolHandler` error boundary, `registry.ts` scaffold, `bank-images.ts` refactor to URL references, MCP Inspector verification. Everything depends on this. Avoids pitfalls 2, 3, 4, 5.
2. **Core Utility Tools (Salary, Phone, Geo, Address, Calendar)** — five pure-function domains; establishes per-domain module pattern, Zod conventions, description quality; LLM tool-selection audit gated before Phase 3. Avoids pitfall 6 (poor descriptions).
3. **Finance, Currency, NIF, Translation Tools** — external HTTP calls; per-tool timeout guards and structured upstream-failure errors. Avoids pitfall 1 (NIF timeout), pitfall 5.
4. **Document Tools (Invoice, Receipt, Contract PDF)** — binary base64 output; size guard (`pdfBytes.length * 1.34 > 4_000_000` → isError); embedded blob + text fallback; restore deleted v1 shims. Size profiling is a go/no-go gate. Avoids pitfall 2 (4.5 MB ceiling).
5. **MCP Documentation (7 Locales)** — docs page in all 7 locales; Streamable HTTP + `mcp-remote` client config snippets; NIF latency disclosure; rate-limiting intent documented. Follows existing i18n deep-merge pattern.

### Phase Ordering Rationale

- Foundation before tools: rate limiting and transport config cannot be safely retrofitted after the endpoint is public.
- Simple tools before complex: pure-function tools prove the pattern; external HTTP tools add timeout risk; binary output tools add payload risk.
- `bank-images.ts` refactor in Phase 1: affects both cold-start time and PDF payload size; fixing early unlocks Phase 4 safely.
- Document tools last: highest risk of Vercel 413 failures; benefits from all other patterns being proven first.

### Research Flags

**Needs deeper research during planning:**
- **Phase 4 (Document Tools):** Verify whether `mcp-handler` Streamable HTTP response streaming bypasses the 4.5 MB Vercel body ceiling on Hobby. Not confirmed.

**Standard patterns (skip research-phase):** Phases 1, 2, 3, 5.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions verified against npm, official Vercel docs (2026-06-02), `mcp-handler` README. Zod 3.x vs 4.x peer dep confirmed. |
| Features | HIGH | MCP spec (2025-06-18) consulted directly; tool registration and content shapes verified against SDK source. |
| Architecture | HIGH | Based on direct codebase inspection + `mcp-handler` Context7 docs. No speculative elements. |
| Pitfalls | HIGH | 4.5 MB body limit confirmed against official Vercel docs; cold-start timing from CONCERNS.md; rate-limiting risk inherent to public MCP servers. |

**Overall confidence:** HIGH

### Gaps to Address

- **Streaming as PDF escape hatch:** Whether `mcp-handler` Streamable HTTP streaming bypasses the 4.5 MB body limit end-to-end on Vercel Hobby is unconfirmed. Test in Phase 4 before relying on it.
- **Vercel Firewall on Hobby:** WAF rate limiting rules may require Vercel Pro. Confirm before Phase 1 completion.
- **Client blob rendering limit:** The ~1 MB embedded-resource limit is community-observed, not in the MCP spec. Validate with Claude Desktop and MCP Inspector in Phase 4.
- **Zod 4.x conflict:** If anything in the existing project already installs Zod 4, there will be a version conflict with `mcp-handler`'s `zod@^3` peer dep. Check with `pnpm why zod` at install time.

---

## Sources

### Primary (HIGH confidence)
- `/vercel/mcp-handler` (Context7) — `createMcpHandler` API, `[transport]` route pattern, `basePath`, stateless mode
- `/modelcontextprotocol/typescript-sdk` (Context7) — `registerTool`, Zod `inputSchema`, content shapes, `isError`
- [Vercel: Functions Limits](https://vercel.com/docs/functions/limitations) — 4.5 MB body limit, 300 s max duration (updated 2026-06-02)
- [Vercel: Fluid Compute](https://vercel.com/docs/fluid-compute) — Hobby free tier confirmed (updated 2026-05-14)
- [Vercel: Deploy MCP servers to Vercel](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel)
- [MCP Tools Specification 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [MCP Transports Specification 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/server/transports)
- Codebase (direct inspection): `src/lib/route-error.ts`, `src/lib/angola/*.ts`, `.planning/codebase/CONCERNS.md`

### Secondary (MEDIUM confidence)
- [MCP Server Best Practices — philschmid.de](https://www.philschmid.de/mcp-best-practices)
- [MCP Tool Descriptions: Best Practices — merge.dev](https://www.merge.dev/blog/mcp-tool-description)
- [Vercel rate limiting docs](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)

### Tertiary (LOW confidence — needs validation)
- [MCP Files and Resources Part 1 — llmindset.co.uk](https://llmindset.co.uk/posts/2025/01/mcp-files-resources-part1/) — ~1 MB embedded resource limit (community-observed, not in spec)
- [MCP cold start optimization — fast.io](https://fast.io/resources/mcp-server-cold-start-optimization/) — cold start timing estimates

---

*Research completed: 2026-06-18*
*Ready for roadmap: yes*
