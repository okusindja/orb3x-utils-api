# Phase 1: MCP Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-18
**Phase:** 1-MCP Foundation
**Areas discussed:** Rate-limit policy, Bank logos post-refactor, Registry scaffold, Endpoint verification

---

## Rate-limit policy

### Per-IP threshold
| Option | Description | Selected |
|--------|-------------|----------|
| 60 req/min per IP | Moderate — accommodates legitimate agent sessions, blocks abuse | ✓ |
| 30 req/min per IP | Strict — more protective, may hinder chained agent calls | |
| 120 req/min per IP | Permissive — less friction, less abuse protection | |

### Scope
| Option | Description | Selected |
|--------|-------------|----------|
| /api/mcp only | Focuses protection on the new public endpoint; existing HTTP API unchanged | ✓ |
| All API (/api/*) | Also protects existing HTTP routes — behavior change to current API | |

### 429 response shape
| Option | Description | Selected |
|--------|-------------|----------|
| Same RouteError shape | JSON { error: { code, message } } + Retry-After, consistent with the API | ✓ |
| Plain text + Retry-After | Minimal text response with Retry-After header | |

**User's choice:** 60 req/min per IP, scoped to /api/mcp only, 429 in RouteError JSON shape + Retry-After.
**Notes:** Consistency with existing API error shape was a priority.

---

## Bank logos post-refactor

### Byte source for pdf-lib
| Option | Description | Selected |
|--------|-------------|----------|
| Read from public/ filesystem | PNGs in public/bank-logos/, read via fs at runtime — no network, fast, deterministic | ✓ |
| HTTP fetch from public URL | Fetch logo URL at runtime — adds network latency and a failure point per PDF | |
| Static asset import | Import as bundler modules — stays in bundle, less cold-start gain | |

### Missing-logo behavior
| Option | Description | Selected |
|--------|-------------|----------|
| Generate PDF without the logo | Graceful degradation — document still produced | ✓ |
| Structured error | Fail with RouteError indicating missing logo | |

**User's choice:** Filesystem read from public/bank-logos/, graceful degradation when a logo is missing.
**Notes:** —

---

## Registry scaffold

| Option | Description | Selected |
|--------|-------------|----------|
| Stub 'health' tool | Minimal tool to prove tools/list + call + error pipeline end-to-end | ✓ |
| Empty registry | Scaffold wired but no tools; validates execution path less | |

**User's choice:** Ship a `health` stub tool in Phase 1.
**Notes:** Purpose is to exercise the full MCP request lifecycle before real tools land.

---

## Endpoint verification

| Option | Description | Selected |
|--------|-------------|----------|
| MCP Inspector + Claude | npx inspector against localhost AND a real client (Claude) against deployed /api/mcp | ✓ |
| MCP Inspector only | Validate only locally; defer real-client testing | |
| Automated tests only | Jest against the handler; no manual client verification | |

**User's choice:** MCP Inspector locally plus a real MCP client against the deployed endpoint.
**Notes:** —

---

## Claude's Discretion

- `middleware.ts` matcher config and in-memory limiter data structure (sliding vs fixed window).
- `mcpToolHandler` HOF signature and `src/lib/mcp/` directory layout beyond registry.ts / tool-error.ts.
- `health` tool output shape.

## Deferred Ideas

- Domain tools (salary, phone, geo, address, calendar, finance, currency, NIF, translation, documents) — Phases 2–4.
- structuredContent/outputSchema, MCP resources/prompts, optional auth/OAuth — v2.
- Vercel Firewall WAF rate limiting as production hardening beyond middleware.ts — revisit if abuse appears.
