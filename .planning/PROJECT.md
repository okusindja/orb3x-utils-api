# orb3x-utils-api

## What This Is

A Next.js 16 API and documentation site providing Angola-specific utilities — salary/tax
calculation, phone validation, geolocation, address parsing, finance, currency exchange,
NIF lookup (AGT portal), calendar/holidays, and PDF document generation (invoice, receipt,
contract). This milestone adds a **public MCP (Model Context Protocol) server**, deployed on
Vercel's free tier, that exposes every existing utility domain as MCP tools so AI agents and
MCP-compatible clients can call them directly.

## Core Value

AI clients (and any MCP-compatible tool) can reliably invoke the Angola utility functions as
MCP tools over a single hosted endpoint — reusing the existing `src/lib/angola/` domain logic,
with zero new paid infrastructure.

## Requirements

### Validated

<!-- Inferred from existing code — already shipped and relied upon. -->

- ✓ Salary/tax net calculation API (`src/lib/angola/salary.ts`) — existing
- ✓ Phone validation, geolocation, address parsing APIs (`src/lib/angola/{phone,geo,address}.ts`) — existing
- ✓ Finance utilities and currency exchange proxy (`src/lib/angola/finance.ts`, `src/lib/currency.ts`) — existing
- ✓ NIF lookup via AGT portal scraping (`src/lib/agt-nif.ts`) — existing
- ✓ Calendar/holidays utilities (`src/lib/angola/calendar.ts`) — existing
- ✓ PDF document generation: invoice, receipt, contract (`src/lib/angola/documents.ts`) — existing
- ✓ Google Translate proxy (`src/lib/translate.ts`) — existing
- ✓ Versioned `/api/v1/` routing with Vercel runtime config shims — existing
- ✓ Multilingual docs site, 7 locales (en, pt, es, fr, de, zh, ja) — existing

### Active

<!-- This milestone. Hypotheses until shipped and validated. -->

- [ ] Public MCP server hosted on Vercel free tier (Streamable HTTP, no Redis, no paid services)
- [ ] MCP tools exposing the salary/tax domain
- [ ] MCP tools exposing phone, geo, and address domains
- [ ] MCP tools exposing finance and currency exchange domains
- [ ] MCP tools exposing NIF lookup, calendar, and documents domains
- [ ] Document MCP tools return generated PDFs as base64-encoded content
- [ ] Restore the deleted `/api/v1/documents/{contract,receipt}` re-export shims so versioned URLs work again
- [ ] MCP documentation page on the existing docs site, localized across all 7 languages

### Out of Scope

- Authentication / API keys / OAuth on the MCP server — chosen public access, matching the already-public HTTP API
- SSE transport with persistent sessions — would require Redis; Streamable HTTP stateless mode avoids any paid storage
- Reimplementing document PDF logic — `generateInvoicePdf`/`generateReceiptPdf`/`generateContractPdf` already exist and are reused
- Edge runtime — all routes use Node.js runtime (Fluid Compute); unchanged
- New utility domains beyond what the HTTP API already offers — MCP wraps existing logic only

## Context

- Brownfield Next.js 16.2.1 App Router project; TypeScript strict; pnpm; React 19.
- Domain logic is cleanly isolated in `src/lib/angola/*.ts` (pure, testable) — the MCP layer
  is a thin adapter over these, mirroring how route handlers already call them.
- Two-tier routing: real handlers at `app/[domain]/[action]/route.ts`; thin versioned shims
  at `app/api/v1/[domain]/[action]/route.ts` add Vercel config (`runtime`, `dynamic`, `maxDuration`).
- On Vercel, MCP servers use the `mcp-handler` package (formerly `@vercel/mcp-adapter`) as a
  Next.js route handler with Streamable HTTP transport, running on Fluid Compute (free tier).
- **Codebase-map correction:** the map claimed the *real* contract/receipt routes were deleted.
  In reality the real routes (`app/documents/{contract,receipt}/route.ts`) and lib functions
  exist; the deleted files (git status `D`) are the `app/api/v1/documents/{contract,receipt}`
  **shims**. Restoration = recreating those two shim files (like the existing `invoice` shim).
- No database, no auth, no rate limiting currently; all API routes are public and stateless.

## Constraints

- **Tech stack**: Must stay within Next.js 16 App Router + TypeScript; reuse `src/lib/angola/` logic.
- **Budget**: Free Vercel tier only — no Redis, no paid storage, no paid add-ons.
- **Compatibility**: MCP server runs on Node.js runtime / Fluid Compute (no Edge).
- **Consistency**: MCP tool errors should map to the existing `RouteError` structured error shape.
- **i18n**: New docs content must follow the existing 7-locale deep-merge site-copy pattern.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use `mcp-handler` with Streamable HTTP (stateless) | Official Vercel-supported MCP path; avoids Redis and stays on free tier | — Pending |
| Public MCP access, no auth | Matches the already-public HTTP API; simplest to ship | — Pending |
| Document tools return PDF as base64 | MCP returns content, not file downloads; base64 is self-contained, no storage | — Pending |
| Reuse `src/lib/angola/` domain logic directly | Single source of truth; MCP is a thin adapter like the HTTP routes | — Pending |
| Restore contract/receipt as v1 shims (not reimplement) | Real routes + lib functions already exist; only shims are missing | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-18 after initialization*
