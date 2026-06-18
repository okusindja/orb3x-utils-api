# Pitfalls Research

**Domain:** Public MCP server on Vercel free tier (Next.js 16, Streamable HTTP, no Redis, no auth)
**Researched:** 2026-06-18
**Confidence:** HIGH — all hard limits verified against official Vercel docs (last updated 2026-06-02); MCP-specific behaviour verified against mcp-handler repo and MCP spec

---

## Critical Pitfalls

### Pitfall 1: NIF Tool Timing Out on the Hobby Plan

**What goes wrong:**
`agt-nif.ts` fires an HTTPS scrape against `portaldocontribuinte.minfin.gov.ao` (an Angolan government portal with variable latency) and currently sets `AbortSignal.timeout(15000)` — a 15-second internal abort. The MCP handler route will need its own `maxDuration`. If the MCP function is configured like the existing HTTP shims (`maxDuration = 30`), a 15-second upstream + MCP protocol overhead leaves barely 15 seconds of headroom.

The real danger: Vercel Hobby free tier hard cap is **300 seconds** (Fluid Compute on Node.js), so that part is fine. The danger is the *upstream*: the government portal is slow (anecdotally 5–20 s, sometimes unresponsive), and the existing 15-second abort kills the fetch, resulting in a 502 from the MCP tool while still consuming function time. Callers — LLMs included — see a hard error with no context.

**Why it happens:**
The abort signal protects the HTTP route, but MCP callers have no retry awareness. An LLM calling `nif_lookup` gets `UPSTREAM_TIMEOUT` as MCP tool content and may re-call immediately, amplifying portal load and Vercel invocation count.

**How to avoid:**
- Set `maxDuration = 60` on the MCP route specifically (well within the 300 s Hobby ceiling).
- Expose the upstream timeout as a configurable constant; consider increasing the NIF fetch abort to 25 s inside the MCP tool, since the portal is the only thing running.
- Return a structured MCP error with `isError: true` and a human-readable message ("NIF portal did not respond within 25 s; the tool can be retried") so the LLM can make an informed decision rather than looping blindly.
- Add the `nif_lookup` tool description's `remarks` field: "This tool makes a live request to the Angolan tax portal and may take up to 30 seconds."

**Warning signs:**
- `FUNCTION_INVOCATION_TIMEOUT` (504) appearing in Vercel logs for the MCP route.
- LLM agents stuck in retry loops calling `nif_lookup` repeatedly without user-visible progress.
- `AbortError` appearing in function logs from the NIF scraper.

**Phase to address:** MCP Foundation phase (when the MCP route is created). The `maxDuration` and `isError` response shape must be decided before tools go live.

---

### Pitfall 2: Base64 PDF Response Hitting the 4.5 MB Hard Ceiling

**What goes wrong:**
Vercel enforces a hard **4.5 MB limit on both request and response bodies** for serverless functions. `generateInvoicePdf`, `generateReceiptPdf`, and `generateContractPdf` use `pdf-lib` to produce binary PDFs and the current decision is to return them base64-encoded inside MCP tool content.

Base64 encoding inflates size by ~33%. A modest 3 MB PDF becomes ~4 MB base64. A detailed invoice with many line items, embedded fonts, or bank logos (from the 1.4 MB `bank-images.ts`) can easily breach 4.5 MB. Vercel returns `413 FUNCTION_PAYLOAD_TOO_LARGE` — no retry, no partial response, hard failure.

Additionally, MCP clients themselves may impose their own message size limits (GitHub Copilot CLI has been observed silently truncating tool responses above 10 KB).

**Why it happens:**
Teams prototype with small test PDFs that stay under the limit. Real-world payloads with bank logos and full line-item tables are larger. The decision to return base64 in MCP content is architecturally correct (no storage required) but collides with the Vercel ceiling.

**How to avoid:**
- Before implementing document tools, measure the actual PDF output size for realistic invoice/receipt/contract inputs using the existing lib functions.
- Set a hard size guard in the MCP document tool: if `pdfBytes.length * 1.34 > 4_000_000`, return an `isError: true` response explaining the size constraint rather than letting Vercel 413.
- Exclude bank logo images from PDF output where possible — the `bank-images.ts` 1.4 MB base64 blob is the primary inflation source; referencing CDN URLs instead of inline data URIs would eliminate this.
- Consider streaming as a fallback path: Vercel streaming functions bypass the 4.5 MB body limit. The `mcp-handler` Streamable HTTP transport already streams, so large base64 chunks wrapped in SSE frames avoid the ceiling. This requires verification against the actual streaming codepath in mcp-handler.

**Warning signs:**
- `FUNCTION_PAYLOAD_TOO_LARGE` (413) in Vercel function logs.
- MCP client showing an empty or truncated tool result for document tools.
- PDF generation succeeding locally but failing only in Vercel deployments.

**Phase to address:** Documents/PDF tools phase. Size profiling must happen before the tool is declared complete.

---

### Pitfall 3: Transport Mismatch Breaking Clients That Only Speak SSE or stdio

**What goes wrong:**
`mcp-handler` supports both Streamable HTTP (the 2025 standard) and SSE. However, many deployed MCP clients — including older Cursor versions, some Claude Desktop configurations, and any stdio-only wrapper — only support SSE or stdio transport. If the MCP server is deployed with SSE disabled, these clients silently fail to connect or report "unsupported transport."

The inverse also causes problems: SSE keeps a persistent connection alive for the function's full `maxDuration`, burning CPU-time billing on the Hobby plan even when idle.

**Why it happens:**
Streamable HTTP is the right long-term choice and is the Vercel-recommended default. But "Streamable HTTP only" is a breaking change for clients that haven't upgraded. Teams ship Streamable HTTP and then discover a subset of their users can't connect at all.

**How to avoid:**
- Deploy with **both transports enabled** (mcp-handler's default). Do not pass `disableSse: true` until all target clients confirm Streamable HTTP support.
- Document the transport URLs clearly in the MCP docs page: `POST /api/mcp` for Streamable HTTP, and note that SSE is available for legacy clients at the same route.
- Test with at least two clients before launch: one Streamable HTTP client (MCP Inspector, Cursor 0.48+) and one SSE/stdio client via `mcp-remote`.
- If SSE must be disabled to reduce CPU cost, do it in a follow-up phase after confirming client compatibility, not on initial launch.

**Warning signs:**
- Client connects but `list_tools` returns empty or times out.
- Vercel logs show `GET /api/mcp` requests being held open for the full `maxDuration` (SSE idle connections).
- Client error: "transport not supported" or connection immediately closed.

**Phase to address:** MCP Foundation phase (transport configuration). Client compatibility testing must be a go/no-go gate before broader promotion.

---

### Pitfall 4: Cold Starts Amplified by the 1.4 MB bank-images.ts Module

**What goes wrong:**
The MCP route will share a function bundle with the existing app. Every cold start evaluates `bank-images.ts` — a 1.4 MB TypeScript module of inline base64 bank logo strings. Vercel Fluid Compute reduces cold-start frequency via instance sharing, but a cold start for the MCP route (a new entry point) still incurs this parsing cost. Observed cold-start penalty: 2–4 seconds for this module alone.

MCP clients typically have a connection timeout (Claude Desktop default: 30 s, MCP Inspector: 10 s). If a cold start takes 4 s + Zod schema compilation + MCP handshake, you burn meaningful time before the first tool call.

**Why it happens:**
`bank-images.ts` was noted in CONCERNS.md as a performance bottleneck but hasn't been fixed. Adding an MCP entry point doesn't make it worse — it just adds another consumer.

**How to avoid:**
- Treat `bank-images.ts` refactoring as a prerequisite or early phase task: move bank logos to `public/bank-logos/` and replace inline base64 with URL strings. This alone reduces the module from 1.4 MB to ~5 KB.
- Until that refactor is done: avoid importing `banks.ts` in any MCP tool that doesn't need it. The MCP tool list covers NIF, salary, phone, geo, address, finance, currency, calendar, and documents — only the `validate/bank-account` and `validate/iban` tools need bank data.
- Structure tools in separate files so bundlers can tree-shake unused imports from the MCP route bundle.

**Warning signs:**
- MCP Inspector showing >5 s to first response on fresh invocations.
- Vercel function logs showing initialization time > 3 s.
- Cold start latency visible as gaps between tool call invocations in agent traces.

**Phase to address:** MCP Foundation phase (bundle structure); bank-images refactor ideally in a Tech Debt phase before or alongside MCP work.

---

### Pitfall 5: In-Memory Session State Vanishing Between Requests

**What goes wrong:**
Vercel serverless functions are stateless. Any in-memory object stored in module-level scope (e.g., a session map, a tool call counter, a cached response) is wiped when the function instance is recycled or a new instance spins up. This project has deliberately chosen stateless Streamable HTTP (no Redis) — the right call — but it is easy to accidentally write tools that assume state persists.

Concrete risk here: the currency exchange endpoint fetches rates with `cache: "no-store"` on every call. If an MCP tool calls it repeatedly within one agent session, each call hits the upstream Render service (which itself may be cold). With no caching layer, 5 tool calls = 5 upstream fetches within seconds.

The second risk: if someone attempts to add request deduplication or a per-session nonce map in module scope to prevent abuse, it will fail silently — different function instances have independent memory.

**Why it happens:**
Stateless design is easy to intend but hard to stay disciplined about. Any module-level `const cache = new Map()` is a trap.

**How to avoid:**
- Enforce a rule: no module-level mutable state in MCP tool files. All tools must be pure function calls into `src/lib/angola/`.
- Add `Cache-Control: public, max-age=300` on the currency exchange route's *Vercel CDN layer* (not module-level cache) so repeated MCP tool calls for exchange rates hit the CDN, not the upstream.
- Document in a code comment on the MCP handler: "This handler is stateless by design. Do not add module-level caches or session maps."

**Warning signs:**
- Currency exchange tool taking 30+ seconds when the upstream Render service is cold (sleeping).
- Agent sessions that work on first run but behave differently on second run.
- Unexpected 504s on currency tool calls after a period of inactivity.

**Phase to address:** MCP Foundation phase (enforce stateless discipline) and Currency/Finance tools phase (add CDN-level caching).

---

### Pitfall 6: Poor Tool Descriptions Causing LLM Tool Selection Failures

**What goes wrong:**
The MCP tool list for this project will have 15–25 tools covering salary, phone, geo, address, finance, currency, NIF, calendar, and documents. When multiple tools have vague or overlapping descriptions, LLMs fail to select the right one, call tools with wrong parameter types, or enter "doom loops" trying different tools with no clear selection criteria.

Specific risks for this domain:
- `salary_net` vs `salary_gross` vs `salary_employer_cost` — three related tools with similar purposes; without clear boundaries in descriptions, LLMs confuse them.
- `phone_validate` vs `phone_parse` vs `phone_operator` — three phone tools that look nearly identical to an LLM without explicit "use this when" guidance.
- NIF tool not flagging that it makes a live network request (causing agents to call it in loops expecting instant results).

**Why it happens:**
Developers write tool descriptions from their own technical perspective ("Calculates net salary") rather than from the LLM's decision-making perspective ("Use this when you have a gross salary and need to know the employee's take-home pay after IRT tax and INSS deductions").

**How to avoid:**
- Follow the "use this when / do not use this when" pattern for every tool with a close sibling.
- Include expected input format in parameter descriptions (e.g., "Angola phone number in format +244XXXXXXXXX or 09XXXXXXXX").
- Flag slow/network-dependent tools explicitly: "This tool calls a live government portal; expect 5–30 second latency."
- After implementing all tools, do a "description audit": present the full tool list to an LLM and ask it to select the correct tool for 10 realistic user queries. Fix any mis-selections before shipping.

**Warning signs:**
- Agent traces showing the same tool called multiple times with slight parameter variations.
- LLM calling `salary_gross` when user asked for net salary.
- LLM passing `"244912345678"` (string) to a numeric parameter.

**Phase to address:** Each feature phase when tools are authored; description audit as a final gate before MCP documentation.

---

### Pitfall 7: No Rate Limiting on a Public Endpoint with Expensive Operations

**What goes wrong:**
This MCP server is public with no auth — matching the existing HTTP API. But the MCP endpoint concentrates several expensive operations in one place: NIF portal scraping (external HTTP), PDF generation (CPU + memory), currency exchange (external HTTP to a sleeping Render service), and translation (unofficial Google endpoint).

A single MCP client configured to call tools aggressively — or an automated scanner discovering the endpoint — can exhaust the Vercel Hobby plan's free invocation quota or trigger upstream rate limits on the AGT portal, the currency API, or the Google translate endpoint. The currency Render service may also blacklist the Vercel egress IP under high load.

Vercel Hobby plan limits: 100,000 serverless function invocations per month (shared across all routes). A single agent session calling 10 MCP tools = 10 invocations. 10,000 agent sessions = entire monthly quota.

**Why it happens:**
Public MCP servers look like any other API endpoint, but AI agents call them at much higher frequency than humans using a browser. One agent loop can generate hundreds of tool calls per minute.

**How to avoid:**
- Add a Next.js `middleware.ts` with IP-based rate limiting using `@vercel/firewall` or a lightweight in-memory counter with TTL (accepting the stateless caveat — it throttles per instance, not globally, but provides meaningful friction).
- Alternatively, use Vercel WAF rate limiting rules (available on Hobby via Vercel Firewall if the project qualifies) scoped to `/api/mcp`.
- For the NIF and PDF tools specifically, add a per-tool internal guard: if a request arrives within N seconds of the last one from the same IP (extracted from request headers), return a 429-equivalent MCP error before calling the expensive operation.
- Document rate limiting intent in the MCP docs page so legitimate users know the constraints.

**Warning signs:**
- Sudden spike in Vercel function invocations with no corresponding user activity.
- `UPSTREAM_RATE_LIMITED` errors from the currency or translate APIs.
- Vercel usage dashboard showing invocation count accelerating toward the monthly limit.

**Phase to address:** MCP Foundation phase (add middleware before any tool goes live). This is "table stakes" security, not an enhancement.

---

### Pitfall 8: Zod Schema Gaps Letting Malformed MCP Inputs Reach the Domain Layer

**What goes wrong:**
`mcp-handler` uses Zod schemas to define tool input contracts. The SDK validates inputs against these schemas and returns `InvalidParams (-32602)` on mismatch. However, Zod validation is only as strong as the schema written. Common gaps:

- Using `z.string()` for a NIF that must be exactly 9 digits — allows "not-a-nif" to reach `sanitizeNif()`.
- Using `z.number()` for a salary that must be positive — allows `-50000` to reach the IRT calculation.
- Using `z.string()` for a phone number instead of `z.string().regex(...)` — allows arbitrary strings to reach the parser.
- Missing `.optional()` vs `.default()` distinction — an optional field passed as `null` may crash the domain function expecting `undefined`.

Additionally, CONCERNS.md notes that `parseJsonBody` in `src/lib/http.ts` does a bare type-cast with no Zod validation. The MCP layer must not repeat this pattern — Zod validation in `server.tool()` must be the authoritative boundary, not a suggestion.

**Why it happens:**
Developers write minimal schemas to satisfy the type checker and trust the domain layer to validate. But the domain layer was written expecting internal callers, not arbitrary LLM-generated inputs.

**How to avoid:**
- Apply domain-specific Zod refinements for every tool: `.regex(/^\d{9}$/)` for NIF, `.positive()` for all monetary amounts, `.min(1).max(999)` for phone number string lengths, `.int()` for year parameters.
- Treat the Zod schema in each `server.tool()` call as the contract specification, not just a type hint.
- Test each tool with adversarial inputs: empty strings, negative numbers, SQL injection strings, extremely long strings.
- Map domain-layer errors (`RouteError`, `PortalLookupError`) to MCP `isError: true` responses at the tool boundary, so invalid inputs surface clearly.

**Warning signs:**
- 500 errors in function logs originating inside `src/lib/angola/` (domain layer) rather than at the MCP boundary.
- LLM receiving confusing error messages that expose internal function names.
- Unhandled promise rejections in tool callbacks.

**Phase to address:** Each feature phase, per tool. Add a schema review checklist to the phase success criteria.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Single MCP route file with all tools | Faster to scaffold | Bundle grows; Zod schema compilation cost on cold start grows linearly | Only for prototyping; split by domain before production |
| Copy-paste tool descriptions from HTTP docs | No translation work | Descriptions written for developers, not LLMs; tool selection degrades | Never — always rewrite for LLM audience |
| No `isError: true` on tool failures | Simpler code | LLM sees raw error strings, may retry incorrectly, cannot distinguish retriable vs fatal | Never — MCP spec requires `isError` for error distinction |
| Skip rate limiting on launch | Ships faster | First scrapers will drain invocation quota within days | Only acceptable for private/internal MCP endpoints |
| Keep bank-images.ts as-is | No refactor risk | 1.4 MB parsed on every cold start; inflates any PDF base64 response | Only if cold start time is confirmed acceptable via measurement |
| `z.string()` for all inputs | Less Zod boilerplate | Domain layer receives garbage; hard-to-debug failures in production | Never for inputs that have a known format |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| mcp-handler route config | Forgetting `export const runtime = 'nodejs'` — defaults to Edge which lacks Node.js APIs used by pdf-lib, cheerio, https module | Add `export const runtime = 'nodejs'` and `export const maxDuration = 60` to the MCP route file explicitly |
| mcp-handler basePath | Setting `basePath: '/api/mcp'` (full path) instead of the path prefix that precedes `[transport]` | Set `basePath: '/api'` when the route file is at `app/api/mcp/[transport]/route.ts` |
| AGT portal scraper in MCP tool | Swallowing `PortalLookupError` and returning a generic error string | Catch `PortalLookupError`, extract `.code` and `.statusCode`, return `{ isError: true, content: [{ type: 'text', text: '...' }] }` with the specific code |
| Currency exchange upstream (Render free tier) | No timeout guard — Render free services sleep and take 30+ s to wake | Add `AbortSignal.timeout(20000)` before calling upstream; return `isError: true` if it fires |
| Google Translate unofficial endpoint | No error handling for rate-limit responses (200 with empty body) | Check response body before parsing; treat empty/null translation as error |
| Zod version mismatch | Using zod@^3.22 from the app while mcp-handler requires @modelcontextprotocol/sdk@1.26.0 with its own Zod peer | Pin `zod@^3` as mcp-handler README specifies; do not use Zod v4 until the SDK explicitly supports it |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| bank-images.ts on every cold start | 2–4 s cold start; MCP Inspector connection timeout | Move logos to `public/`; reference URLs not base64 | Every cold start, worsens with traffic spikes |
| Currency fetch with `cache: 'no-store'` | Each `exchange_rate` tool call takes 1–30 s depending on Render cold state | Add CDN-layer `Cache-Control` on the exchange route; instruct MCP callers in tool description that rates update hourly | Immediately visible; worsens under agentic multi-call sessions |
| 50-iteration binary search for gross salary | Acceptable locally; each iteration calls calculateNetSalary with floating-point steps | Acceptable at current scale; O(50) pure arithmetic is fast; document as known cost | Not a real-world problem until thousands of concurrent calls |
| PDF generation with pdf-lib | 200–800 ms for complex documents; memory spike during generation | Measure; set `maxDuration` high enough; guard response size before returning | At concurrent load; each invocation allocates independently |
| Cheerio DOM parsing on NIF response | 50–200 ms parse time per call, acceptable | Already in production; no additional action needed for MCP | Not a bottleneck at free-tier concurrency levels |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| No rate limiting on MCP endpoint | Scrapers and automated agents exhaust Vercel invocation quota; upstream services (AGT portal, Render currency API) rate-limit or block the Vercel egress IP | Add `middleware.ts` with per-IP rate limiting before MCP route goes live |
| NIF forwarded to government portal without disclosure | Privacy risk; callers may not know their query is relayed to `minfin.gov.ao` | Add explicit disclosure in the `nif_lookup` tool description and MCP docs page |
| Public MCP endpoint with no abuse surface monitoring | Silent quota exhaustion; no signal until service degrades | Enable Vercel Analytics; watch function invocation count daily for first two weeks post-launch |
| Accepting arbitrary string inputs without validation | LLM-generated inputs may probe for SSRF or injection vectors via tool parameters | Strict Zod schemas with regex/min/max constraints on all string inputs |
| `@modelcontextprotocol/sdk` versions < 1.26.0 | Known security vulnerability per mcp-handler README | Pin `@modelcontextprotocol/sdk@1.26.0` or later; verify with `pnpm why @modelcontextprotocol/sdk` |

---

## "Looks Done But Isn't" Checklist

- [ ] **MCP route exported correctly:** `export { handler as GET, handler as POST, handler as DELETE }` — missing `DELETE` breaks session cleanup per MCP spec; verify all three are exported.
- [ ] **`runtime = 'nodejs'` on MCP route:** pdf-lib, cheerio, and the `https` Node module are all incompatible with Edge runtime. Verify the MCP route file has this export or the Vercel deployment will silently use Edge and crash at tool call time.
- [ ] **`maxDuration` set explicitly on MCP route:** The default may be lower than the NIF tool's 25-second abort. Verify `maxDuration = 60` (or higher) is in the route file, not inherited from a parent config.
- [ ] **`isError: true` on all tool error paths:** An MCP tool that throws instead of returning `{ isError: true, content: [...] }` causes the entire MCP session to error, not just that tool call. Verify every tool's catch block returns the correct shape.
- [ ] **Tool descriptions tested with an LLM:** Running the tool list through a real LLM and asking it to pick the right tool for 10 queries before shipping is the only reliable way to catch description quality problems.
- [ ] **Base64 PDF size measured on realistic inputs:** Do not ship document tools without measuring actual output size against the 4.5 MB ceiling. A test invoice with 20 line items is realistic; a 1-line test is not.
- [ ] **Deleted v1 shims restored:** `app/api/v1/documents/contract/route.ts` and `app/api/v1/documents/receipt/route.ts` are staged for deletion. They must be restored before the MCP milestone is complete (HTTP docs reference them; MCP callers may use the versioned HTTP endpoint as fallback).
- [ ] **CORS preflight handled:** If the MCP endpoint will be called from browser-based MCP clients, an `OPTIONS` handler must be present. mcp-handler does not automatically add CORS headers for preflight.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| 4.5 MB PDF breach in production | MEDIUM | Add size guard in tool before returning; deploy hotfix; no data loss |
| NIF tool causing 504s | LOW | Increase `maxDuration` on MCP route; redeploy; no state to restore |
| Transport mismatch breaking clients | LOW | Enable both transports (mcp-handler default); redeploy |
| Cold start timeouts | MEDIUM | Fix `bank-images.ts` import path; re-bundle; cold start penalty immediate |
| Rate limit exhaustion of Vercel quota | LOW-MEDIUM | Add middleware rate limiting; quota resets monthly |
| Bad tool descriptions causing LLM errors | MEDIUM | Rewrite descriptions; redeploy; no infrastructure change needed |
| Zod schema gaps letting garbage through | MEDIUM | Add refinements per tool; redeploy; audit for any domain-layer side effects from bad inputs already received |
| Session ID 404 loop in stateful clients | LOW | Stateless mode (mcp-handler default on Hobby) avoids sessions entirely; confirm `Stateless: true` in handler config |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| NIF tool timeout | MCP Foundation — route config + maxDuration | Test NIF tool with MCP Inspector; confirm 25 s abort and graceful isError response |
| 4.5 MB PDF ceiling | Documents/PDF tools phase | Measure base64 size of realistic invoice/receipt/contract before marking phase complete |
| Transport mismatch | MCP Foundation — transport config | Connect with two different client types (Inspector + mcp-remote stdio proxy) |
| Cold start / bank-images | Tech Debt phase (ideally before MCP) or MCP Foundation | Measure cold start with and without bank-images import; confirm < 2 s |
| Stateless discipline | MCP Foundation — architecture rules | Code review: grep for module-level `let` / `const` mutable state in MCP tool files |
| Poor tool descriptions | Each feature phase + pre-launch audit | LLM tool selection test with 10 realistic queries |
| No rate limiting | MCP Foundation — before any tool goes live | Confirm `middleware.ts` exists and blocks repeated calls from same IP |
| Zod schema gaps | Each feature phase, per tool | Adversarial input tests in CI (empty, negative, oversized, regex-busting strings) |

---

## Sources

- Vercel Functions Limits (official, last updated 2026-06-02): https://vercel.com/docs/functions/limitations
- Vercel MCP Deployment Guide (official): https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel
- mcp-handler README and security warning: https://github.com/vercel/mcp-handler
- MCP Transports Specification: https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
- Vercel 4.5 MB body limit KB article: https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions
- Building efficient MCP servers on Vercel (Vercel blog): https://vercel.com/blog/building-efficient-mcp-servers
- MCP tool description quality research (arXiv 2602.14878): https://arxiv.org/html/2602.14878v1
- MCP session ID 404 reconnection bug (Claude Code issue #27142): https://github.com/anthropics/claude-code/issues/27142
- MCP cold start optimization patterns: https://fast.io/resources/mcp-server-cold-start-optimization/
- Streamable HTTP vs SSE comparison: https://brightdata.com/blog/ai/sse-vs-streamable-http
- Vercel rate limiting documentation: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- Zod validation in MCP servers (Stanza course): https://www.stanza.dev/courses/mcp-servers/error-handling/mcp-servers-input-validation
- Codebase CONCERNS.md (project-specific): .planning/codebase/CONCERNS.md

---
*Pitfalls research for: Public MCP server on Vercel free tier (orb3x-utils-api)*
*Researched: 2026-06-18*
