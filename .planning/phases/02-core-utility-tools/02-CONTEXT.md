# Phase 2: Core Utility Tools - Context

**Gathered:** 2026-06-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Expose the five pure-function Angola domains as MCP tools over the Phase 1 foundation: salary/tax, phone, geo, address, calendar. Each tool is a thin adapter that wraps an existing `src/lib/angola/*.ts` function — no business logic is reimplemented. No external HTTP, no binary output (those are Phases 3–4). Covers requirements SAL-01, LOC-01, LOC-02, LOC-03, CAL-01.

</domain>

<decisions>
## Implementation Decisions

### Tool Granularity — full HTTP-API parity (~14 tools)
- **D-01:** Expose **one MCP tool per existing operation**, not one per domain. This matches the project goal ("expose all utilities") and LLMs select better by distinct tool name than by an `operation` enum. The full tool set (14):
  - **salary** (3): `salary_net` → `calculateNetSalary`, `salary_gross` → `calculateGrossSalary`, `salary_employer_cost` → `calculateEmployerCost`
  - **phone** (3): `phone_parse` → `parseAngolanPhoneNumber`, `phone_validate` → `validateAngolanPhoneNumber`, `phone_operator` → `detectAngolanOperator`
  - **geo** (3): `geo_provinces` → `listAngolaProvinces`, `geo_municipalities` → `listAngolaMunicipalities`, `geo_communes` → `listAngolaCommunes`
  - **address** (2): `address_normalize` → `normalizeAngolanAddress`, `address_suggest` → `suggestAngolanAddressParts`
  - **calendar** (3): `calendar_holidays` → `listAngolanHolidays`, `calendar_working_days` → `calculateWorkingDays`, `calendar_add_working_days` → `addWorkingDays`
- Internal helpers (`calculateIrtForTaxableIncome`, `findProvince`, `findMunicipality`, `getGeoSearchIndex`, `normalizeProvinceName`, `parseCalendarYear`) are NOT exposed as tools — they back the public functions above.

### Naming Convention
- **D-02:** Tool names follow **`domain_operation` snake_case** (e.g., `salary_net`, `phone_validate`, `geo_municipalities`, `calendar_add_working_days`). Domain prefix groups siblings and aids discovery. This supersedes the roadmap success-criteria names, which were representative (see Success-Criteria Mapping below).

### Tool Descriptions — anti-collision
- **D-03:** Sibling tools within a domain MUST carry **"use this when / do not use this when"** guidance in their `description`, naming the sibling for the opposite case (e.g., `salary_net`: "Use when you have a gross amount and want take-home pay. For the reverse — target net to required gross — use `salary_gross`."). Mitigates LLM tool-selection collision (research Pitfall 6).

### File & Plan Organization
- **D-04:** One tool module per domain: `src/lib/mcp/tools/{salary,phone,geo,address,calendar}.ts`, each exporting a `register<Domain>Tools(server)` function (mirrors `tools/health.ts` → `registerHealthTool`).
- **D-05:** Plan as **parallel per-domain plans** (one plan per domain file, disjoint `files_modified`), with `src/lib/mcp/registry.ts` wired to call all five `register*Tools` in a **single final integration step/plan** — so the shared `registry.ts` edit does not create a files_modified overlap that would force the domain plans to serialize.

### Claude's Discretion
- Exact Zod `inputSchema` per tool — derive from the existing HTTP route query/body parsers (`app/salary/shared.ts`, and the per-route parsing in `app/<domain>/<action>/route.ts`). Reuse the same field names, types, and validation as the HTTP API so MCP and HTTP stay consistent.
- Exact wording of each tool description (beyond the anti-collision requirement).
- Whether `register*Tools` are wired into `registry.ts` via individual imports or an array — planner's call.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 foundation (the patterns to follow)
- `.planning/phases/01-mcp-foundation/01-CONTEXT.md` — locked MCP decisions (D-04 rate-limit caveat, D-07 health pattern, D-08 disableSse)
- `src/lib/mcp/tools/health.ts` — canonical tool-registration pattern (`registerHealthTool`, `mcpToolHandler` wrapping, Zod inputSchema)
- `src/lib/mcp/tool-error.ts` — `mcpToolHandler` HOF; every tool callback wraps through it so RouteError → `{ isError: true }`
- `src/lib/mcp/registry.ts` — aggregator; add `register*Tools(server)` calls here
- `src/lib/route-error.ts` — `RouteError`; domain functions throw it on bad input, surfaces as MCP isError

### Domain logic to wrap (do NOT modify — wrap only)
- `src/lib/angola/salary.ts`, `phone.ts`, `geo.ts`, `address.ts`, `calendar.ts`
- Existing HTTP parsers to mirror for Zod schemas: `app/salary/shared.ts`, `app/salary/*/route.ts`, `app/phone/*/route.ts`, `app/geo/*/route.ts`, `app/address/*/route.ts`, `app/calendar/*/route.ts`

### Project / requirements
- `.planning/REQUIREMENTS.md` — SAL-01, LOC-01, LOC-02, LOC-03, CAL-01
- `.planning/ROADMAP.md` §"Phase 2: Core Utility Tools"

## Success-Criteria Mapping (representative names → actual tools)

The ROADMAP success criteria name one representative tool per domain; map them to the `domain_operation` names so the verifier checks the right tools:
- `calculate_net_salary` → **`salary_net`** (plus `salary_gross`, `salary_employer_cost`)
- `validate_phone` → **`phone_validate`** (plus `phone_parse`, `phone_operator`)
- `resolve_geolocation` → **`geo_provinces` / `geo_municipalities` / `geo_communes`**
- `parse_address` → **`address_normalize`** (plus `address_suggest`)
- `query_calendar` → **`calendar_holidays`** (plus `calendar_working_days`, `calendar_add_working_days`)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `mcpToolHandler` (`src/lib/mcp/tool-error.ts`): wrap every tool callback — already proven in Phase 1.
- `registerHealthTool` (`src/lib/mcp/tools/health.ts`): exact template for a `register<Domain>Tools` function (server.registerTool with title/description/inputSchema + mcpToolHandler).
- HTTP route parsers (`app/<domain>/<action>/route.ts`, `app/salary/shared.ts`): the input parsing/validation to mirror in Zod schemas so MCP inputs match HTTP inputs.
- All 5 domain libs are pure and already unit-tested (existing `src/lib/angola/__tests__` / route tests) — tools just adapt them.

### Established Patterns
- Tool result shape: `{ content: [{ type: 'text', text: JSON.stringify(result) }] }` (Phase 1 convention).
- Errors: throw/propagate `RouteError`; `mcpToolHandler` maps to `{ isError: true, content }`. Never throw raw.
- `@/lib/...` path alias, `node:` prefix for builtins, named exports, single quotes, 2-space (CLAUDE.md).

### Integration Points
- New: `src/lib/mcp/tools/{salary,phone,geo,address,calendar}.ts`.
- Modified (integration step only): `src/lib/mcp/registry.ts` (add 5 `register*Tools` calls).
- Tests: per-domain tool tests under `src/lib/__tests__/` following the Phase 1 `mcp-registry`/`mcp-tool-error` test style; assert `tools/list` includes each tool and a sample call returns expected JSON / isError on bad input.

</code_context>

<specifics>
## Specific Ideas

- Tool count is exactly 14 (3 salary + 3 phone + 3 geo + 2 address + 3 calendar). If a domain function doesn't map to an existing HTTP endpoint, it stays internal.
- MCP input schemas should mirror the HTTP API field names/types so the two surfaces stay consistent and a future docs page can describe both together.
- Anti-collision descriptions are a hard requirement for sibling tools, not a nicety.

</specifics>

<deferred>
## Deferred Ideas

- External-HTTP tools (finance, currency, NIF, translation) — Phase 3.
- Document/PDF tools — Phase 4.
- `structuredContent` / `outputSchema` on salary/currency — v2 (REQUIREMENTS.md STRUCT-01).
- MCP `resources` for static geo/holiday tables — v2 (CAP-01).

None of the discussion strayed outside the phase scope.

</deferred>

---

*Phase: 2-Core Utility Tools*
*Context gathered: 2026-06-18*
