# Phase 1: MCP Foundation - Context

**Gathered:** 2026-06-18
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the foundation of the MCP server — everything that must be in place before any domain tool goes live. Concretely:

- A publicly reachable MCP endpoint at `/api/mcp` (via `app/api/[transport]/route.ts` using `mcp-handler`), stateless, on the Vercel free tier, exporting GET/POST/DELETE with both Streamable HTTP and SSE transports enabled.
- A tool error boundary (`mcpToolHandler`) that maps `RouteError` and domain error classes to MCP `{ isError: true, content: [...] }` — tools never throw to a 500.
- A tool registry scaffold (`src/lib/mcp/registry.ts`) wired into the handler, shipping with a single `health` stub tool to prove the end-to-end pipeline.
- Per-IP rate limiting on `/api/mcp` via a new `middleware.ts`.
- Refactor of `src/lib/angola/bank-images.ts` from inline base64 to filesystem-backed logo files, removing the cold-start and PDF-payload risk before document tools (Phase 4).

Covers requirements MCP-01, MCP-02, MCP-03, MCP-04, MCP-05, PERF-01. No domain tools are implemented in this phase (Phases 2–4).

</domain>

<decisions>
## Implementation Decisions

### Rate Limiting (MCP-05)
- **D-01:** Per-IP throttle of **60 requests/minute**. Moderate ceiling — accommodates legitimate agent sessions (which chain many calls) while blocking abuse.
- **D-02:** Scope the rate limiter to **`/api/mcp` only**. The existing HTTP API routes are left unchanged (no behavior change to current endpoints).
- **D-03:** A throttled request returns **429 in the existing `RouteError` JSON shape** (`{ error: { code, message } }`) for consistency with the rest of the API, plus a `Retry-After` header.
- **D-04:** Limiter state is in-memory / per-instance (stateless, no Redis). Acceptable that counts reset on cold start / instance recycling — this is the free-tier constraint, not a defect.

### Bank Logos Refactor (PERF-01)
- **D-05:** After removing the inline base64, `pdf-lib` obtains logo bytes by **reading PNG files from the filesystem** under `public/bank-logos/` at runtime (Node.js runtime). No network fetch, deterministic, fastest — and removes ~1.4 MB from the bundle/cold-start and from PDF payloads.
- **D-06:** If a bank's logo file is **missing, generate the PDF without the logo** (graceful degradation) rather than failing the document.

### Registry Scaffold (MCP-03)
- **D-07:** Phase 1 ships a minimal **`health` stub tool** (returns server status) so `tools/list` + tool-call + error-path are exercised end-to-end before real tools land. The stub may be removed or kept once Phase 2 adds real tools.

### Endpoint & Transport (MCP-01, MCP-02)
- **D-08:** Public path is **`/api/mcp`** (`basePath: '/api'`, `[transport]` dynamic segment). **Revised during execution (2026-06-18):** SSE is **disabled** (`disableSse: true`). Verification proved `mcp-handler@1.1.0`'s SSE GET transport calls `initializeRedis()` and throws `"redisUrl is required"` → HTTP 500 without Redis. Keeping SSE would require Redis, which violates the locked no-Redis / free-tier constraint. Streamable HTTP (POST) needs no Redis and is the transport all modern MCP clients (Claude Desktop/Code, Cursor) use; SSE-only clients can bridge via `mcp-remote`. The earlier "keep both transports" wording was based on a research assumption (MEDIUM confidence) that SSE worked statelessly — disproven by MCP Inspector.

### Verification
- **D-09:** Validate with **MCP Inspector** (`npx @modelcontextprotocol/inspector`) against `http://localhost:3000/api/mcp`, AND connect a **real MCP client (Claude Desktop/Code)** to the deployed `/api/mcp` before declaring the phase done.

### Claude's Discretion
- Exact `middleware.ts` matcher config, in-memory store data structure (Map + sliding window vs fixed window), and the `mcpToolHandler` HOF signature are implementation details left to research/planning.
- `health` tool's exact output shape.
- Directory layout under `src/lib/mcp/` (beyond `registry.ts`, `tool-error.ts`) is the planner's call.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — locked decisions (stateless, no Redis, public/no-auth, mcp-handler, base64 PDFs)
- `.planning/REQUIREMENTS.md` §"MCP Server Foundation" + "Performance Hardening" — MCP-01..05, PERF-01
- `.planning/ROADMAP.md` §"Phase 1: MCP Foundation" — goal + 5 success criteria

### Research
- `.planning/research/SUMMARY.md` — reconciled findings; see "Cross-Report Tensions Resolved" (4.5 MB vs 1 MB limits; SSE vs stateless; rate limiting) and the Phase 1 roadmap-implications block
- `.planning/research/STACK.md` — `mcp-handler@1.1.0`, `@modelcontextprotocol/sdk@1.29.0` (≥1.26.0), `zod@^3`, route pattern, stateless mode
- `.planning/research/ARCHITECTURE.md` — `src/lib/mcp/` layout, `mcpToolHandler` error mapping, `app/api/[transport]/route.ts`
- `.planning/research/PITFALLS.md` — 4.5 MB body limit, cold-start from bank-images, rate-limiting, stateless discipline

### Existing Codebase (integrate with, do not modify unless listed)
- `.planning/codebase/ARCHITECTURE.md` — versioned-shim pattern, RouteError boundary, error-handling strategy
- `src/lib/route-error.ts` — `RouteError` class; the 429 + tool-error shapes must align with it
- `src/lib/http.ts` — `noStoreJson`/`noStoreBinary`/`routeErrorResponse` response factories
- `src/lib/angola/bank-images.ts` — the file being refactored (currently `ANGOLA_BANK_IMAGE_DATA: Record<string,string>` of base64 data URIs)
- `src/lib/angola/documents.ts` — consumer of bank images via `generate*Pdf`; must switch to filesystem read
- `app/api/v1/documents/invoice/route.ts` — reference shim pattern (relevant later but already on disk)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `RouteError` (`src/lib/route-error.ts`) and `routeErrorResponse()` (`src/lib/http.ts`): reuse for both the 429 response and the basis of `mcpToolHandler`'s error mapping — keeps error shape consistent across HTTP and MCP surfaces.
- Existing per-route Vercel config pattern (`runtime='nodejs'`, `dynamic='force-dynamic'`, `maxDuration`): mirror it in `app/api/[transport]/route.ts` with `maxDuration: 60`.

### Established Patterns
- Domain logic isolation in `src/lib/angola/*.ts`: the MCP layer is a sibling adapter in `src/lib/mcp/`; Phase 1 must NOT touch `src/lib/angola/` except for the `bank-images.ts` refactor (and its consumer `documents.ts`).
- All routes are Node.js runtime, no Edge — `mcp-handler` and AGT scraping require this; keep it.

### Integration Points
- New: `app/api/[transport]/route.ts` (MCP entry), `middleware.ts` (rate limit, matcher scoped to `/api/mcp`), `src/lib/mcp/{registry,tool-error}.ts`, `public/bank-logos/*.png`.
- Modified: `src/lib/angola/bank-images.ts` (base64 → filesystem refs), `src/lib/angola/documents.ts` (read bytes from disk, graceful-skip on missing).

### Constraints to honor
- Three new deps to add: `mcp-handler@1.1.0`, `@modelcontextprotocol/sdk` (≥1.26.0, ~1.29.0), `zod@^3` (NOT 4.x — peer dep). Check `pnpm why zod` for conflicts at install.
- Confirm during planning: whether Vercel Firewall WAF rate-limiting is available on Hobby (the `middleware.ts` limiter is the primary mechanism regardless).

</code_context>

<specifics>
## Specific Ideas

- 429 must look identical to other API errors (RouteError JSON) — the user values consistency with the existing API.
- The `health` stub exists specifically to prove the full MCP request lifecycle (list → call → error) before investing in real tools.
- Logos via filesystem read from `public/bank-logos/`, never network fetch per PDF.

</specifics>

<deferred>
## Deferred Ideas

- Domain tools (salary, phone, geo, address, calendar, finance, currency, NIF, translation, documents) — Phases 2–4.
- `structuredContent` / `outputSchema`, MCP `resources`, `prompts`, optional auth/OAuth — v2 (see REQUIREMENTS.md v2 + Out of Scope).
- Vercel Firewall WAF rate limiting as a production hardening layer beyond `middleware.ts` — revisit if abuse appears (REQUIREMENTS.md SEC-01).

None of the discussion strayed outside the phase scope.

</deferred>

---

*Phase: 1-MCP Foundation*
*Context gathered: 2026-06-18*
