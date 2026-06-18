# Phase 3: External HTTP Tools - Context

**Gathered:** 2026-06-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Expose finance, currency, NIF, and translation as MCP tools. Three of these make upstream HTTP calls (currency → Render API, NIF → AGT portal scrape, translation → Google) and must never throw on upstream failure — they return structured `isError`. Finance is actually pure computation (no HTTP) but is grouped here per the roadmap. Covers FIN-01, FIN-02, NIF-01, TRN-01. Builds on the Phase 1 foundation + Phase 2 tool patterns. No PDF/binary (Phase 4).

**Tool map (7 tools, full-parity per the Phase 2 D-01 precedent):**
- **finance** (pure, FIN-01): `finance_vat` → `calculateVat`, `finance_invoice_total` → `calculateInvoiceTotals`, `finance_inflation_adjust` → `adjustForInflation`
- **currency** (external, FIN-02): `currency_rates` → `fetchCurrencyRates`, `currency_convert` → `convertCurrencyRates`
- **nif** (external, NIF-01): `nif_lookup` → `lookupTaxpayerByNif`
- **translation** (external, TRN-01): `translate_text` → `translateText`

</domain>

<decisions>
## Implementation Decisions

### Upstream Error Mapping (the crux)
- **D-01:** Extend `mcpToolHandler` (`src/lib/mcp/tool-error.ts`) with a **generic duck-typed branch**: after the existing `RouteError` check, if a caught `Error` has a `string` `code` and a `number` `statusCode`, map it to a structured `{ isError: true, content: [{ type:'text', text: JSON.stringify({ code, message, ... }) }] }`. This covers `CurrencyError`, `PortalLookupError`, and `TranslationError` (all extend `Error` with `code` + `statusCode`) without importing them — keeps the MCP infra domain-agnostic and future-proof. Falls through to `INTERNAL_SERVER_ERROR` only for truly unknown errors.
- **D-02:** This `mcpToolHandler` extension is a **foundation prerequisite** — it must land (with its test) before the external tools rely on it, because it edits the shared `tool-error.ts`. Plan it as the first step (own plan/task), with the external-tool plans depending on it. The existing Phase 1/2 RouteError mapping must remain unchanged (regression).

### Per-Tool Timeouts
- **D-03:** Tune `AbortSignal.timeout` per upstream (all currently 15s; `maxDuration: 60` gives headroom): **NIF 25s** (AGT portal is slow — NIF-01), **currency 20s** (Render free tier cold-starts ~30–50s; 20s balances), **translation 15s** (Google is fast). The tool sets/relies on the client's abort; bump the client timeout where it is hardcoded (NIF 15s→25s, currency 15s→20s). Finance has no timeout (pure).

### Upstream Failure UX
- **D-04:** Upstream failure/timeout `isError` payloads are **structured**: `{ code, message, retryable: true, retryAfterSeconds: <n> }` plus a human-readable message (e.g., NIF: "The AGT portal did not respond within 25s; it is frequently slow — retry in a few seconds."). LLMs can act on `retryable`/`retryAfterSeconds`. Applies to currency + NIF (and translation upstream failures). Validation/bad-input errors stay non-retryable.

### Currency Caching
- **D-05:** `currency_rates` uses a **module-level in-memory cache keyed by base currency, ~60s TTL** (per-instance, stateless — resets on cold start). Cuts repeated Render cold-starts within an agent session. Scope: **currency only** — NIF and translation are NOT cached. `currency_convert` may reuse the cached rates.

### Carried forward from Phases 1–2 (locked — not re-discussed)
- Full-parity granularity (D-01-precedent), `domain_operation` snake_case naming, sibling anti-collision descriptions, one `tools/<domain>.ts` file per domain, parallel per-domain plans + final registry integration, Zod inputSchema mirroring HTTP parsers, result as JSON `text` content block, `z.number()` not `z.coerce`.

### Claude's Discretion
- Exact Zod schemas per tool (mirror `app/finance/*`, `app/api/exchange`, `app/api/nif`, `app/api/translate` parsers).
- Exact `retryAfterSeconds` values and message wording.
- Cache data structure details (Map shape, timestamp check).
- Whether `currency_convert` calls `fetchCurrencyRates` internally (and thus shares the cache) or takes rates as input — derive from `convertCurrencyRates` signature.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Foundation + prior phases
- `src/lib/mcp/tool-error.ts` — `mcpToolHandler` to EXTEND (D-01); keep RouteError mapping intact
- `src/lib/mcp/tools/salary.ts` (or any Phase 2 module) — canonical `register<Domain>Tools` pattern
- `src/lib/mcp/registry.ts` — wire the 4 new `register*Tools` in the integration step
- `src/lib/route-error.ts` — RouteError (still used for input validation)
- `.planning/phases/02-core-utility-tools/02-CONTEXT.md` — carried-forward conventions
- `.planning/phases/01-mcp-foundation/01-CONTEXT.md` — foundation decisions

### Domain clients to wrap (read signatures + error classes + timeouts)
- `src/lib/angola/finance.ts` — `calculateVat`, `calculateInvoiceTotals`, `adjustForInflation` (pure)
- `src/lib/currency.ts` — `fetchCurrencyRates`, `convertCurrencyRates`, `CurrencyError` (code+statusCode), 15s timeout
- `src/lib/agt-nif.ts` — `lookupTaxpayerByNif`, `sanitizeNif`, `PortalLookupError`, 15s timeout
- `src/lib/translate.ts` — `translateText`, `TranslationError`, 15s timeout

### HTTP parsers to mirror for Zod schemas
- `app/finance/vat/route.ts`, `app/finance/invoice-total/route.ts`, `app/finance/inflation-adjust/route.ts`
- `app/api/exchange/[base]/route.ts`, `app/api/nif/[nif]/route.ts`, `app/api/translate/route.ts`

### Requirements / roadmap
- `.planning/REQUIREMENTS.md` — FIN-01, FIN-02, NIF-01, TRN-01
- `.planning/ROADMAP.md` §"Phase 3: External HTTP Tools"

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `mcpToolHandler` — extend once (D-01), then every tool wraps through it as in Phase 2.
- Phase 2 tool modules — exact template for the 4 new domain modules.
- The existing HTTP route handlers for these domains already catch the domain error classes manually (codebase ARCHITECTURE flagged this as an anti-pattern) — the MCP layer does it correctly once, centrally, via the extended `mcpToolHandler`.

### Established Patterns
- Errors propagate (never caught inside the tool callback); `mcpToolHandler` is the sole boundary.
- `@/lib/...` alias, `node:` prefix, named exports, single quotes, 2-space (CLAUDE.md).

### Integration Points
- Modified (foundation, shared): `src/lib/mcp/tool-error.ts` (+ its test) — must precede external tools.
- Modified (timeouts): `src/lib/currency.ts` (15s→20s), `src/lib/agt-nif.ts` (15s→25s) — small, targeted.
- New: `src/lib/mcp/tools/{finance,currency,nif,translation}.ts` + 4 test files.
- Modified (integration): `src/lib/mcp/registry.ts` (wire 4 register*Tools) — integration step only (D-05 parallel-safety from Phase 2).

### Wave-safety note
- `tool-error.ts` (foundation, wave 1) and `registry.ts` (integration, last wave) are shared — keep them out of the parallel domain plans. `currency.ts`/`agt-nif.ts` timeout edits belong to the currency/nif tool plans respectively (disjoint).

</code_context>

<specifics>
## Specific Ideas

- Finance tools are PURE — no timeout, no retryable error, no cache. They behave exactly like Phase 2 tools; only currency/nif/translation get the upstream treatment.
- The duck-typed error branch must NOT swallow RouteError behavior — RouteError check stays first.
- Cache is currency-only and per-instance; do not introduce Redis or any shared store (free-tier lock).

</specifics>

<deferred>
## Deferred Ideas

- Document/PDF tools — Phase 4.
- MCP docs page — Phase 5.
- `structuredContent`/`outputSchema` on currency — v2 (STRUCT-01).
- Caching NIF/translation results — considered and declined for this phase (currency-only).
- Vercel-platform CDN cache on the currency HTTP route — out of MCP scope.

None of the discussion strayed outside the phase scope.

</deferred>

---

*Phase: 3-External HTTP Tools*
*Context gathered: 2026-06-18*
