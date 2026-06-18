# Phase 3: External HTTP Tools - Discussion Log

> **Audit trail only.** Decisions are in CONTEXT.md — this preserves the alternatives considered.

**Date:** 2026-06-18
**Phase:** 3-External HTTP Tools
**Areas discussed:** Upstream error mapping, Per-tool timeouts, Upstream failure UX (retry), Currency caching

---

## Upstream error mapping

| Option | Description | Selected |
|--------|-------------|----------|
| Extend mcpToolHandler (duck-type .code+.statusCode) | Generic branch; covers all 3 domain error classes without coupling tool-error.ts to domains | ✓ |
| Explicit instanceof of the 3 classes | Type-safe but couples MCP infra to domain clients | |
| Per-tool try/catch → RouteError | Spreads error logic across tools, less DRY | |

**User's choice:** Extend mcpToolHandler with a duck-typed branch. RouteError check stays first.

---

## Per-tool timeouts

| Option | Description | Selected |
|--------|-------------|----------|
| NIF 25s, currency 20s, translation 15s | Tuned per upstream (AGT slow, Render sleeps, Google fast) | ✓ |
| NIF 25s, rest 15s | Minimal change | |
| All 25s | Uniform/generous | |

**User's choice:** NIF 25s, currency 20s, translation 15s. Bump client timeouts where hardcoded.

---

## Upstream failure UX (retry guidance)

| Option | Description | Selected |
|--------|-------------|----------|
| Structured: retryable + retryAfter + message | isError { code, message, retryable, retryAfterSeconds } + human message | ✓ |
| Plain message only | code + a retry-suggesting message, no structured fields | |

**User's choice:** Structured retryable/retryAfterSeconds + human-readable message (currency + NIF + translation upstream failures).

---

## Currency caching

| Option | Description | Selected |
|--------|-------------|----------|
| In-memory per-instance, ~60s TTL (currency only) | Module Map cuts Render cold-starts within a session; stateless | ✓ |
| No cache | Always fresh, simpler, slow per call | |
| Cache currency + NIF/translation | More gain, more complexity/memory | |

**User's choice:** Currency-only in-memory cache, ~60s TTL, per-instance. No Redis.

---

## Claude's Discretion

- Exact Zod schemas (mirror HTTP parsers); retryAfterSeconds values + message wording; cache Map shape; whether currency_convert reuses fetchCurrencyRates/cache.

## Deferred Ideas

- Phase 4 documents; Phase 5 docs page; v2 structuredContent; NIF/translation caching declined.
