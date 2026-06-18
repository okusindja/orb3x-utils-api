# Phase 2: Core Utility Tools - Research

**Researched:** 2026-06-18
**Domain:** MCP tool wrapping — Angola domain functions (salary, phone, geo, address, calendar)
**Confidence:** HIGH — all findings derived directly from reading codebase source files and confirmed installed packages; no speculative claims.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** One MCP tool per operation (14 total). Exact mapping: `salary_net`→`calculateNetSalary`, `salary_gross`→`calculateGrossSalary`, `salary_employer_cost`→`calculateEmployerCost`; `phone_parse`→`parseAngolanPhoneNumber`, `phone_validate`→`validateAngolanPhoneNumber`, `phone_operator`→`detectAngolanOperator`; `geo_provinces`→`listAngolaProvinces`, `geo_municipalities`→`listAngolaMunicipalities`, `geo_communes`→`listAngolaCommunes`; `address_normalize`→`normalizeAngolanAddress`, `address_suggest`→`suggestAngolanAddressParts`; `calendar_holidays`→`listAngolanHolidays`, `calendar_working_days`→`calculateWorkingDays`, `calendar_add_working_days`→`addWorkingDays`.
- **D-02:** Tool names follow `domain_operation` snake_case.
- **D-03:** Sibling tools MUST carry "use this when / do not use this when" anti-collision text in their `description`, naming the sibling for the opposite case.
- **D-04:** One file per domain: `src/lib/mcp/tools/{salary,phone,geo,address,calendar}.ts`, each exporting `register<Domain>Tools(server)`.
- **D-05:** Plan as parallel per-domain plans; `registry.ts` wiring in a single final integration step.

### Claude's Discretion

- Exact Zod `inputSchema` per tool — derive from existing HTTP route query parsers.
- Exact wording of each tool description (beyond the anti-collision requirement).
- Whether `register*Tools` are wired into `registry.ts` via individual imports or an array.

### Deferred Ideas (OUT OF SCOPE)

- External-HTTP tools (finance, currency, NIF, translation) — Phase 3.
- Document/PDF tools — Phase 4.
- `structuredContent` / `outputSchema` on salary/currency — v2 (STRUCT-01).
- MCP `resources` for static geo/holiday tables — v2 (CAP-01).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SAL-01 | Client can calculate Angola net salary and tax breakdown from gross input via an MCP tool (reusing `src/lib/angola/salary.ts`) | Salary domain: `calculateNetSalary`, `calculateGrossSalary`, `calculateEmployerCost` fully read; Zod schemas derived from `app/salary/shared.ts` |
| LOC-01 | Client can validate/parse an Angola phone number via an MCP tool | Phone domain: all three functions read; single string input `phone`; schemas derived from HTTP routes |
| LOC-02 | Client can resolve Angola geolocation data (provinces/municipalities) via an MCP tool | Geo domain: three functions read; optional `province` filter, required `municipality` for communes |
| LOC-03 | Client can parse/normalize an Angola address via an MCP tool | Address domain: `normalizeAngolanAddress` (single string), `suggestAngolanAddressParts` (query + filters) |
| CAL-01 | Client can query Angola calendar/holiday information via an MCP tool | Calendar domain: three functions read; `year` integer, `from`/`to` ISO dates, `date`/`days` for add-working-days |
</phase_requirements>

---

## Summary

Phase 2 wraps five existing pure-function Angola domain libraries as 14 MCP tools that follow the Phase 1 registration pattern established in `src/lib/mcp/tools/health.ts`. Every function to be wrapped has already been read in full; all throw `RouteError` on invalid input so `mcpToolHandler` handles the error boundary automatically — no additional validation logic is needed inside the tool callbacks.

The primary research task was: for each of the 14 tools, determine the exact Zod `inputSchema` that mirrors the existing HTTP API surface, and produce precise anti-collision tool descriptions. All inputs are derived from `URLSearchParams` parsing in the existing HTTP routes, which makes the mapping straightforward. The only non-trivial schema decisions are around optional fields with defaults (salary subsidies, year defaults, geo province filter, address suggest filters and limit), and the ISO-date string format for calendar tools.

No new packages are required. All five domain libraries are pure functions, already unit-tested, and throw structured `RouteError` instances — the wrapper pattern is mechanical.

**Primary recommendation:** Implement all five domain files in parallel (D-05), wire all five `register*Tools` calls into `registry.ts` in a single final integration commit, and test each domain file independently using the mock-server pattern from `mcp-registry.test.ts`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| MCP tool registration | API / Backend (`src/lib/mcp/tools/`) | — | Tool definitions live server-side, consumed by `McpServer` at startup |
| Salary/tax calculation | API / Backend (`src/lib/angola/salary.ts`) | — | Pure server-side computation; domain library owns the logic |
| Phone parsing/validation | API / Backend (`src/lib/angola/phone.ts`) | — | Pure string processing; no browser involvement |
| Geo data listing | API / Backend (`src/lib/angola/geo.ts`) | — | Static data lookup; no external service |
| Address normalization/suggestion | API / Backend (`src/lib/angola/address.ts`) | — | Pure string matching against in-memory data |
| Calendar/holiday calculation | API / Backend (`src/lib/angola/calendar.ts`) | — | Pure computation; Easter algorithm + static table |
| Error surfacing | API / Backend (`src/lib/mcp/tool-error.ts`) | — | `mcpToolHandler` maps `RouteError` → `{ isError: true }` |

---

## Standard Stack

### Core (already installed — no new dependencies)

| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| `zod` | `^3` | `inputSchema` definition per tool | `[VERIFIED: package.json]` |
| `@modelcontextprotocol/sdk` | `^1.29.0` | `McpServer` type for `register*Tools` parameter | `[VERIFIED: package.json]` |
| `mcp-handler` | `1.1.0` | MCP endpoint handler (Phase 1 — no change) | `[VERIFIED: package.json]` |

### No New Packages

Phase 2 introduces zero new npm dependencies. All domain logic is pure TypeScript in `src/lib/angola/`; the MCP adapter layer uses only the packages already installed in Phase 1.

**Package Legitimacy Audit:** Not applicable — no new packages installed in this phase.

---

## Architecture Patterns

### System Architecture Diagram

```
MCP Client (Claude Desktop / mcp-remote)
        |
        | POST /api/mcp  (Streamable HTTP)
        v
app/api/[transport]/route.ts  (Phase 1 — unchanged)
        |
        v
McpServer (mcp-handler)
        |
   registerAllTools(server)   ← registry.ts
        |
   ┌────┼────┬─────┬─────┐
   ▼    ▼    ▼     ▼     ▼
salary phone geo address calendar
tools  tools tools tools  tools
   |    |    |     |      |
   └────┴────┴─────┴──────┘
        |
  mcpToolHandler(fn)  ← wraps every callback
        |
        ├── success → { content: [{ type:'text', text: JSON.stringify(result) }] }
        └── RouteError → { isError: true, content: [{ type:'text', text: JSON.stringify({code,message,...details}) }] }
```

### Recommended File Structure

```
src/lib/mcp/
├── registry.ts          (MODIFIED — add 5 register*Tools calls)
├── tool-error.ts        (Phase 1 — unchanged)
└── tools/
    ├── health.ts        (Phase 1 — unchanged)
    ├── salary.ts        (NEW — registerSalaryTools)
    ├── phone.ts         (NEW — registerPhoneTools)
    ├── geo.ts           (NEW — registerGeoTools)
    ├── address.ts       (NEW — registerAddressTools)
    └── calendar.ts      (NEW — registerCalendarTools)
```

### Pattern: Tool Registration (canonical — from `health.ts`)

```typescript
// Source: src/lib/mcp/tools/health.ts (verified)
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';

export function registerHealthTool(server: McpServer): void {
  server.registerTool(
    'health',
    {
      title: 'Server Health',
      description: '...',
      inputSchema: z.object({}),
    },
    mcpToolHandler(async () => ({ ... })),
  );
}
```

Every new `register<Domain>Tools(server: McpServer): void` follows this exact shape. The tool callback is always wrapped with `mcpToolHandler`. Return value is always `{ content: [{ type: 'text', text: JSON.stringify(result) }] }` (handled automatically by `mcpToolHandler`).

### Anti-Patterns to Avoid

- **Duplicating validation in the tool callback:** Do NOT re-validate inputs before calling the domain function. Domain functions throw `RouteError` which `mcpToolHandler` catches and formats correctly. A Zod schema on `inputSchema` ensures LLMs pass well-typed inputs; the domain function handles semantic validation.
- **Exposing internal helpers as tools:** `calculateIrtForTaxableIncome`, `findProvince`, `findMunicipality`, `getGeoSearchIndex`, `normalizeProvinceName`, `parseCalendarYear` are explicitly NOT tools (CONTEXT D-01).
- **Catching errors inside the tool callback:** Let `mcpToolHandler` handle all error shaping. Never `try/catch` inside the function passed to `mcpToolHandler`.
- **Using `z.coerce` for numeric inputs:** MCP clients send already-typed values (not query strings). Use `z.number()` directly, not `z.coerce.number()`. The `coerce` pattern is for HTTP query strings where everything arrives as a string.

---

## Per-Tool Specification

### SALARY DOMAIN (`src/lib/mcp/tools/salary.ts`)

**Source functions:** `src/lib/angola/salary.ts`
**HTTP parsers:** `app/salary/shared.ts`

#### Supported years

`IRT_TABLES` in `salary.ts` contains keys `2025` and `2026`. The `ensureSupportedYear` function throws `RouteError('UNSUPPORTED_TAX_YEAR', ..., 400, { year })` for any other value. The Zod schema should use `z.number().int().refine(y => [2025, 2026].includes(y))` or a simpler `z.enum(['2025', '2026'])` cast — prefer `z.number().int()` with `.optional().default(2026)` and let the function throw on unsupported values rather than over-constraining in Zod (keeps schema forward-compatible when new years are added).

#### `salary_net`

**Wraps:** `calculateNetSalary(input: NetSalaryInput)`

**Signature (verified):**
```typescript
calculateNetSalary({
  grossSalary: number,       // required, non-negative
  year?: number,             // default 2026
  mealSubsidy?: number,      // default 0
  transportSubsidy?: number, // default 0
  subsidyPeriod?: 'month' | 'day',  // default 'month'
})
```

**Zod inputSchema:**
```typescript
z.object({
  grossSalary: z.number().nonnegative()
    .describe('Gross base salary in Angolan kwanza (AOA). Must be zero or positive.'),
  year: z.number().int().optional().default(2026)
    .describe('Tax year for IRT brackets. Supported: 2025, 2026. Defaults to 2026.'),
  mealSubsidy: z.number().nonnegative().optional().default(0)
    .describe('Meal allowance in AOA per the period specified by subsidyPeriod.'),
  transportSubsidy: z.number().nonnegative().optional().default(0)
    .describe('Transport allowance in AOA per the period specified by subsidyPeriod.'),
  subsidyPeriod: z.enum(['month', 'day']).optional().default('month')
    .describe('Whether subsidies are provided per month or per working day (22 days/month assumed).'),
})
```

**Description (D-03 anti-collision):**
> Calculate Angola take-home (net) salary and full IRT tax breakdown from a gross salary amount. Use this when you have the gross amount and want to know the employee's net pay and deductions. For the reverse — finding the gross that produces a target net — use `salary_gross`. To compute total employer cost including the 8% employer social-security contribution, use `salary_employer_cost`.

**Throws:** `RouteError('UNSUPPORTED_TAX_YEAR', ...)` when year is not 2025 or 2026.

---

#### `salary_gross`

**Wraps:** `calculateGrossSalary(input: GrossSalaryInput)`

**Signature (verified):**
```typescript
calculateGrossSalary({
  targetNetSalary: number,   // required, non-negative
  year?: number,             // default 2026
  mealSubsidy?: number,      // default 0
  transportSubsidy?: number, // default 0
  subsidyPeriod?: 'month' | 'day',  // default 'month'
})
```

**Zod inputSchema:**
```typescript
z.object({
  targetNetSalary: z.number().nonnegative()
    .describe('Target take-home (net) salary in AOA. The function finds the gross amount that produces this net.'),
  year: z.number().int().optional().default(2026)
    .describe('Tax year for IRT brackets. Supported: 2025, 2026. Defaults to 2026.'),
  mealSubsidy: z.number().nonnegative().optional().default(0)
    .describe('Meal allowance in AOA per the period specified by subsidyPeriod.'),
  transportSubsidy: z.number().nonnegative().optional().default(0)
    .describe('Transport allowance in AOA per the period specified by subsidyPeriod.'),
  subsidyPeriod: z.enum(['month', 'day']).optional().default('month')
    .describe('Whether subsidies are provided per month or per working day.'),
})
```

**Description (D-03 anti-collision):**
> Find the gross salary required to achieve a target take-home (net) salary in Angola using binary-search over the IRT table. Use this when you know the net you want to pay and need the gross figure to set. For the standard gross-to-net calculation, use `salary_net`. For total employer cost (gross + employer social security), use `salary_employer_cost`.

**Implementation note:** This function uses binary search (50 iterations) and delegates to `calculateNetSalary` internally. The returned object includes both `grossSalary` and `targetNetSalary` fields plus the full net salary breakdown.

---

#### `salary_employer_cost`

**Wraps:** `calculateEmployerCost(input: NetSalaryInput)` — same input type as `calculateNetSalary`

**Signature (verified):** Identical to `calculateNetSalary` (takes `grossSalary` + shared optional fields). Returns the `calculateNetSalary` result plus `totalEmployerCost`.

**Zod inputSchema:** Identical to `salary_net` schema.

**Description (D-03 anti-collision):**
> Calculate the total cost to an employer for a given gross salary in Angola, including the 8% employer social-security contribution on top of gross. Use this for total employment-cost budgeting. For the employee's take-home and IRT breakdown only, use `salary_net`. For gross-to-net reversal, use `salary_gross`.

---

### PHONE DOMAIN (`src/lib/mcp/tools/phone.ts`)

**Source functions:** `src/lib/angola/phone.ts`
**HTTP routes:** `app/phone/parse/route.ts`, `app/phone/validate/route.ts`, `app/phone/operator/route.ts`

All three functions accept a raw phone string. HTTP routes pass `url.searchParams.get('phone') ?? ''` directly. The function handles format normalization (whitespace stripping, country-code prefix stripping). An empty string throws `RouteError('INVALID_PHONE', ...)`.

**Common inputSchema for all three phone tools:**
```typescript
z.object({
  phone: z.string().min(1)
    .describe('Angolan phone number. Accepts any common format: national (9-digit: 923456789), international (+244923456789 or 244923456789), with or without spaces/dashes.'),
})
```

**Throws:** `RouteError('INVALID_PHONE', ..., 400)` — empty input or wrong digit count (must be 9 national digits). Note: `detectAngolanOperator` does NOT throw on unrecognized prefixes; it returns `{ code: 'UNKNOWN', name: 'Unknown' }`.

#### `phone_parse`

**Wraps:** `parseAngolanPhoneNumber(rawPhone: string)`

**Description (D-03 anti-collision):**
> Parse an Angolan phone number and return its components: normalized E.164 form, national number, international/national formatted strings, type (mobile/fixed-line), two-digit prefix, subscriber number, and operator info. Use this when you need the parsed components. For a simple validity check plus availability metadata, use `phone_validate`. For operator lookup only without full parsing, use `phone_operator`.

---

#### `phone_validate`

**Wraps:** `validateAngolanPhoneNumber(rawPhone: string)`

**Description (D-03 anti-collision):**
> Validate an Angolan phone number and return the parsed components plus an `isValid` flag and `availability` block (numbering-plan status, whether the range is allocated to a known operator). Use this when you need a validity signal alongside the number components. For components only without the validity/availability envelope, use `phone_parse`. For operator identity only, use `phone_operator`.

**Implementation note:** `validateAngolanPhoneNumber` calls `parseAngolanPhoneNumber` internally and augments the result. An invalid format still throws `RouteError` before returning — `isValid: true` is only present on successful parse.

---

#### `phone_operator`

**Wraps:** `detectAngolanOperator(rawPhone: string)`

**Description (D-03 anti-collision):**
> Detect the mobile network operator (Unitel, Movicel, Africell) from an Angolan phone number's two-digit prefix. Returns `{ code, name, prefix, prefixes }`. Returns `code: 'UNKNOWN'` for unrecognized prefixes without throwing. Use this for operator-only lookups. For full number parsing with type/format fields, use `phone_parse`. For a validity signal, use `phone_validate`.

**Schema note:** `detectAngolanOperator` does not throw on empty string the same way `parseAngolanPhoneNumber` does — it processes whatever digits it finds and returns UNKNOWN. However for consistency and MCP contract clarity, use the same `z.string().min(1)` schema.

---

### GEO DOMAIN (`src/lib/mcp/tools/geo.ts`)

**Source functions:** `src/lib/angola/geo.ts`
**HTTP routes:** `app/geo/provinces/route.ts`, `app/geo/municipalities/route.ts`, `app/geo/communes/route.ts`

#### `geo_provinces`

**Wraps:** `listAngolaProvinces()` — takes no arguments

HTTP route: `GET /geo/provinces` — no query parameters.

**Zod inputSchema:**
```typescript
z.object({})
```

**Description (D-03 anti-collision):**
> List all 21 Angolan provinces with their name, URL slug, capital city, and municipality count. Returns the complete national list with no filtering. Use this to enumerate provinces. To list municipalities within a province, use `geo_municipalities` with the `province` filter. To list communes within a municipality, use `geo_communes`.

**Returns:** Array of `{ name, slug, capital, municipalityCount }`.

---

#### `geo_municipalities`

**Wraps:** `listAngolaMunicipalities(provinceName?: string)`

HTTP route: `app/geo/municipalities/route.ts` passes `url.searchParams.get('province') ?? undefined`.

**Zod inputSchema:**
```typescript
z.object({
  province: z.string().optional()
    .describe('Optional province name to filter results (e.g., "Luanda", "Benguela"). Omit to list all municipalities nationwide. Case-insensitive, accent-insensitive.'),
})
```

**Description (D-03 anti-collision):**
> List Angolan municipalities, optionally filtered to a single province. Returns name, slug, province name, and commune count per municipality. Use this to list municipalities. To list all provinces, use `geo_provinces`. To list communes within a specific municipality, use `geo_communes`.

**Throws:** `RouteError('PROVINCE_NOT_FOUND', ..., 404)` if a province name is supplied but does not match.

---

#### `geo_communes`

**Wraps:** `listAngolaCommunes(municipalityName: string, provinceName?: string)`

HTTP route: `app/geo/communes/route.ts` passes `url.searchParams.get('municipality') ?? ''` and `url.searchParams.get('province') ?? undefined`.

**Zod inputSchema:**
```typescript
z.object({
  municipality: z.string().min(1)
    .describe('Municipality name (required). Case-insensitive, accent-insensitive. Example: "Ingombota", "Viana".'),
  province: z.string().optional()
    .describe('Optional province name to disambiguate when the same municipality name exists in multiple provinces. Example: "Luanda". Required when the municipality name is ambiguous.'),
})
```

**Description (D-03 anti-collision):**
> List communes (comunas) within an Angolan municipality. Returns the municipality name, province, coverage type (curated or seat-only), and an array of communes with names and slugs. The `municipality` parameter is required. Supply `province` to disambiguate when the municipality name appears in more than one province. Use this for commune-level data. For municipalities, use `geo_municipalities`. For provinces, use `geo_provinces`.

**Throws:**
- `RouteError('MISSING_QUERY_PARAMETER', ..., 400)` — empty municipality string
- `RouteError('MUNICIPALITY_NOT_FOUND', ..., 404)` — no match
- `RouteError('AMBIGUOUS_MUNICIPALITY', ..., 400)` — multiple matches; caller must supply `province`
- `RouteError('PROVINCE_NOT_FOUND', ..., 404)` — province supplied but not found

**Coverage gotcha:** Many municipalities have `coverage: 'seat-only'` (communes array has exactly one entry equal to the municipality's own name). This is correct data, not an error — the library only has curated commune data for a subset of municipalities.

---

### ADDRESS DOMAIN (`src/lib/mcp/tools/address.ts`)

**Source functions:** `src/lib/angola/address.ts`
**HTTP routes:** `app/address/normalize/route.ts`, `app/address/suggest/route.ts`

#### `address_normalize`

**Wraps:** `normalizeAngolanAddress(rawAddress: string)`

HTTP route: passes `url.searchParams.get('address') ?? ''` directly.

**Zod inputSchema:**
```typescript
z.object({
  address: z.string().min(1)
    .describe('Raw Angolan address string to normalize. Can contain abbreviations (prov., mun., av., r., b.), mixed case, irregular spacing. Example: "av. lenine, ingombota, luanda".'),
})
```

**Description (D-03 anti-collision):**
> Normalize an Angolan address string: expand abbreviations, apply title case, regularize punctuation, and attempt to resolve components (province, municipality, commune, bairro) from the known geo data. Returns `{ input, normalized, components, diagnostics }`. Use this when you have a raw address and want a cleaned form with resolved components. For an autocomplete-style prefix search over geo entries and known bairros, use `address_suggest`.

**Throws:** `RouteError('INVALID_ADDRESS', ..., 400)` on empty input.

**Fuzzy behavior note:** This function does best-effort component extraction. It will NOT throw if a province/municipality/bairro is not recognized — it leaves the corresponding `components.*` field as `null` and sets the corresponding `diagnostics.*` flag to `false`. The planner and implementer must document this as expected behavior in the tool description.

---

#### `address_suggest`

**Wraps:** `suggestAngolanAddressParts({ query, type?, province?, municipality?, limit? })`

HTTP route (`app/address/suggest/route.ts`):
- `q` → `query` (required)
- `type` → optional filter
- `province` → optional filter
- `municipality` → optional filter
- `limit` → parsed as `parseInt(limitValue, 10)`, only passed if `Number.isInteger`

**Zod inputSchema:**
```typescript
z.object({
  query: z.string().min(1)
    .describe('Prefix or substring to search across Angola geo entries (provinces, municipalities, communes) and known Luanda bairros. Case-insensitive, accent-insensitive.'),
  type: z.enum(['province', 'municipality', 'commune', 'bairro']).optional()
    .describe('Filter results to a specific entity type. Omit to search all types.'),
  province: z.string().optional()
    .describe('Filter results to a specific province name. Case-insensitive, accent-insensitive.'),
  municipality: z.string().optional()
    .describe('Filter results to a specific municipality name. Case-insensitive, accent-insensitive.'),
  limit: z.number().int().positive().optional().default(8)
    .describe('Maximum number of suggestions to return. Defaults to 8.'),
})
```

**Description (D-03 anti-collision):**
> Autocomplete-style search over Angolan geo entries (provinces, municipalities, communes) and known Luanda bairros. Returns up to `limit` matching suggestions, each with type, label, and parent context fields. Use this for address-part autocomplete or fuzzy lookup. For cleaning and structurally parsing a complete address string, use `address_normalize`.

**Throws:** `RouteError('MISSING_QUERY_PARAMETER', ..., 400)` on empty query.

**Fuzzy behavior note:** Matching uses `normalizeLookupKey(label).includes(normalizedQuery)` — substring, not prefix-only, accent-insensitive. The HTTP route passes `limit` only when `Number.isInteger(parseInt(limitValue))` — the Zod default of 8 mirrors the function's own default parameter.

**Bairro coverage note:** `KNOWN_BAIRROS` in `address.ts` contains only 20 Luanda bairros. Results for `type: 'bairro'` are limited to this curated set.

---

### CALENDAR DOMAIN (`src/lib/mcp/tools/calendar.ts`)

**Source functions:** `src/lib/angola/calendar.ts`
**HTTP routes:** `app/calendar/holidays/route.ts`, `app/calendar/working-days/route.ts`, `app/calendar/add-working-days/route.ts`

#### `calendar_holidays`

**Wraps:** `listAngolanHolidays(year: number)`

HTTP route: `parseCalendarYear(url.searchParams.get('year'), new Date().getUTCFullYear())` — falls back to current year.

**Zod inputSchema:**
```typescript
z.object({
  year: z.number().int().min(2000).max(2100).optional()
    .describe('Calendar year to list holidays for (2000–2100). Defaults to the current year when omitted.'),
})
```

**Note on default:** The HTTP route uses `new Date().getUTCFullYear()` as a runtime default. In the MCP tool, when `year` is omitted, pass `new Date().getUTCFullYear()` to `listAngolanHolidays` — do not use a Zod `.default()` with a hardcoded year value:

```typescript
mcpToolHandler(async ({ year }) => {
  const resolvedYear = year ?? new Date().getUTCFullYear();
  return {
    year: resolvedYear,
    holidays: listAngolanHolidays(resolvedYear),
    assumptions: [
      'Weekend bridge days declared ad hoc by the government are not inferred.',
      'Carnival Monday, Carnival Tuesday, and Good Friday are included as movable public holidays.',
    ],
  };
})
```

**Description (D-03 anti-collision):**
> List all Angolan public holidays for a given year, including fixed holidays and movable ones (Carnival Monday, Carnival Tuesday, Good Friday computed via Easter). Returns `{ year, holidays: [{ date, name, localName, category }], assumptions }`. Use this to enumerate holidays. To count working days between two dates, use `calendar_working_days`. To find a date N working days from a start date, use `calendar_add_working_days`.

**Throws:** `RouteError('INVALID_YEAR', ..., 400)` for year outside 2000–2100 or non-integer.

---

#### `calendar_working_days`

**Wraps:** `calculateWorkingDays({ from: string, to: string })`

HTTP route: passes `url.searchParams.get('from') ?? ''` and `url.searchParams.get('to') ?? ''`.

**Zod inputSchema:**
```typescript
z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe('Start date in YYYY-MM-DD format (ISO 8601, e.g., "2026-01-01"). Inclusive.'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe('End date in YYYY-MM-DD format (ISO 8601, e.g., "2026-12-31"). Inclusive. Must be on or after the from date.'),
})
```

**Description (D-03 anti-collision):**
> Count working days between two dates in Angola, excluding weekends and Angolan public holidays. Returns `{ from, to, workingDays, excludedWeekendDays, excludedHolidayDays }`. Both dates are inclusive. Use this when you have a range and want the count. To get a list of holidays for a year, use `calendar_holidays`. To find a date that is N working days away, use `calendar_add_working_days`.

**Throws:**
- `RouteError('MISSING_QUERY_PARAMETER', ..., 400)` — empty from or to
- `RouteError('INVALID_DATE', ..., 400)` — malformed or invalid calendar date
- `RouteError('INVALID_DATE_RANGE', ..., 400)` — `from` is after `to`
- `RouteError('INVALID_YEAR', ..., 400)` — if the date range covers a year outside 2000–2100 (holiday lookup fails)

**Cross-year note:** `buildHolidaySet` in `calendar.ts` internally calls `listAngolanHolidays` for every year in the `from`..`to` range. If the range spans a year outside 2000–2100, this throws. The Zod regex constraint alone does not guard against this — let the function throw.

---

#### `calendar_add_working_days`

**Wraps:** `addWorkingDays({ date: string, days: number })`

HTTP route: parses days as `Number.parseInt(url.searchParams.get('days') ?? '', 10)`.

**Zod inputSchema:**
```typescript
z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe('Start date in YYYY-MM-DD format (ISO 8601, e.g., "2026-06-18").'),
  days: z.number().int()
    .describe('Number of working days to add. Positive to advance forward, negative to go backward. Zero is allowed and returns the same date with direction "none".'),
})
```

**Description (D-03 anti-collision):**
> Add (or subtract) N working days to a date in Angola, skipping weekends and Angolan public holidays. Returns `{ inputDate, days, resultDate, direction }`. Use this when you need to compute a deadline or offset date. To count working days between two known dates, use `calendar_working_days`. To list all holidays for a year, use `calendar_holidays`.

**Throws:**
- `RouteError('MISSING_QUERY_PARAMETER', ..., 400)` — empty date
- `RouteError('INVALID_DATE', ..., 400)` — malformed date
- `RouteError('INVALID_INTEGER', ..., 400)` — days is not an integer

**`days: 0` special case:** When `days === 0`, the function returns early with `{ inputDate: date, days: 0, resultDate: date, direction: 'none' }` without entering the loop — no holiday lookup occurs. This is correct behavior, not an edge-case bug.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Input validation / sanitization | Custom validators | Domain functions + `RouteError` already validate; `mcpToolHandler` converts errors | Already proven in HTTP layer |
| Error serialization | Custom error catch blocks | `mcpToolHandler` HOF | Centralized; Phase 1 pattern |
| Phone number format normalization | Strip/parse logic in tool | `parseAngolanPhoneNumber` does it via `compactWhitespace` + `onlyDigits` | Handles +244, 244, 9-digit, spaces |
| Geo lookup normalization | Accent-insensitive match | `normalizeLookupKey` + `findProvince`/`findMunicipality` | Already handles diacritics |
| Holiday computation | Easter algorithm | `listAngolanHolidays` in `calendar.ts` | Covers fixed + Easter-derived movable holidays |
| Binary-search gross-from-net | Iterative solver | `calculateGrossSalary` already implements 50-iteration bisection | Correct rounding at each step |

**Key insight:** Every domain function is pure, fully tested, and handles its own validation. The MCP tool layer is purely an adapter — any logic added to tool callbacks is untested duplication of what already exists.

---

## Common Pitfalls

### Pitfall 1: Using `z.coerce` for numeric fields

**What goes wrong:** MCP clients send typed JSON values, not URL query strings. `z.coerce.number()` is designed for query-string inputs where numbers arrive as strings. Using it in `inputSchema` will silently convert string inputs that should be rejected.
**Why it happens:** Confusion between HTTP query-param parsing (where `app/salary/shared.ts` uses `parsePositiveNumber(searchParams.get('gross'), 'gross')` against a string) and MCP tool invocation (where the client sends `{ grossSalary: 500000 }` as a JSON number).
**How to avoid:** Use `z.number()` directly. The MCP SDK serializes/deserializes tool inputs as structured JSON.
**Warning signs:** Schemas using `z.coerce` for salary, calendar year, or limit fields.

### Pitfall 2: Hardcoding the current year as a Zod `.default()`

**What goes wrong:** `z.number().int().optional().default(2026)` bakes in the year at module load time. In January 2027, the tool would default to the wrong year without a code change.
**Why it happens:** Temptation to mirror the `DEFAULT_SALARY_YEAR = 2026` constant in `app/salary/shared.ts`.
**How to avoid:** For `calendar_holidays`, use `year ?? new Date().getUTCFullYear()` inside the callback (mirrors HTTP route behavior). For salary tools, `2026` as default is acceptable because the salary schema explicitly supports only 2025 and 2026 — but note the `IRT_TABLES` lookup in `salary.ts` needs updating when 2027 data becomes available regardless.
**Warning signs:** `z.number().optional().default(new Date().getUTCFullYear())` — this evaluates once at module load, not per invocation; use a runtime value inside the callback instead.

### Pitfall 3: Ambiguous municipality names

**What goes wrong:** Calling `listAngolaCommunes('Calumbo')` without a province throws `RouteError('AMBIGUOUS_MUNICIPALITY', ...)` because 'Calumbo' exists in both 'Icolo e Bengo' and 'Luanda'. The tool description must tell LLMs to supply `province` when this error is returned.
**Why it happens:** The geo data has real duplicate municipality names across provinces.
**How to avoid:** The `geo_communes` description explicitly mentions this. When the tool returns `isError: true` with code `AMBIGUOUS_MUNICIPALITY`, a well-instructed LLM will retry with the `province` field.
**Warning signs:** `geo_communes` tool description that omits mention of the `province` disambiguation parameter.

### Pitfall 4: `phone_operator` on fixed-line numbers

**What goes wrong:** `detectAngolanOperator` returns `{ code: 'UNKNOWN' }` for fixed-line prefixes (not starting with `9`). This is not an error — it is expected behavior. Tools that wrap this must not confuse UNKNOWN with a validation failure.
**Why it happens:** The function was designed for mobile numbers; fixed-line numbers have no operator routing in the current data.
**How to avoid:** The tool description for `phone_operator` documents the `UNKNOWN` return. Do not convert it to `isError`.

### Pitfall 5: Address suggest `limit` as integer check

**What goes wrong:** HTTP route at `app/address/suggest/route.ts` uses `Number.isInteger(limit)` to guard passing limit to the function. `Number.isInteger(NaN)` is `false` so invalid strings are silently ignored and the default 8 is used. In the MCP tool, Zod's `z.number().int()` enforces this at the schema level — no special handling needed.
**Why it happens:** HTTP parsing from strings requires explicit integer checks; Zod handles this automatically.
**How to avoid:** Trust the Zod schema; no custom integer-check code needed in the callback.

### Pitfall 6: LLM tool-selection collision between `salary_net` and `salary_employer_cost`

**What goes wrong:** Both tools accept `grossSalary` and return a salary breakdown. An LLM may call the wrong one. `salary_employer_cost` returns everything `salary_net` returns PLUS `totalEmployerCost`.
**Why it happens:** The schemas are nearly identical and both return the full breakdown.
**How to avoid:** D-03 anti-collision text. `salary_net` description emphasizes employee perspective; `salary_employer_cost` emphasizes budgeting/hiring cost perspective. The key differentiator in the description: "`salary_net` — employee take-home. `salary_employer_cost` — total cost to the company."

---

## Code Examples

### Tool registration template (all domains)

```typescript
// Source: verified from src/lib/mcp/tools/health.ts pattern
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import { calculateNetSalary } from '@/lib/angola/salary';

export function registerSalaryTools(server: McpServer): void {
  server.registerTool(
    'salary_net',
    {
      title: 'Angola Net Salary',
      description: '...',  // anti-collision text
      inputSchema: z.object({
        grossSalary: z.number().nonnegative()
          .describe('Gross base salary in AOA.'),
        year: z.number().int().optional().default(2026)
          .describe('Tax year. Supported: 2025, 2026.'),
        mealSubsidy: z.number().nonnegative().optional().default(0)
          .describe('Meal allowance in AOA.'),
        transportSubsidy: z.number().nonnegative().optional().default(0)
          .describe('Transport allowance in AOA.'),
        subsidyPeriod: z.enum(['month', 'day']).optional().default('month')
          .describe('Whether subsidies are per-month or per-day (22 days/month).'),
      }),
    },
    mcpToolHandler(async (input) => calculateNetSalary(input)),
  );
  // repeat for salary_gross, salary_employer_cost
}
```

### Registry wiring (integration step)

```typescript
// Source: derived from src/lib/mcp/registry.ts pattern
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerHealthTool } from './tools/health';
import { registerSalaryTools } from './tools/salary';
import { registerPhoneTools } from './tools/phone';
import { registerGeoTools } from './tools/geo';
import { registerAddressTools } from './tools/address';
import { registerCalendarTools } from './tools/calendar';

export function registerAllTools(server: McpServer): void {
  registerHealthTool(server);
  registerSalaryTools(server);
  registerPhoneTools(server);
  registerGeoTools(server);
  registerAddressTools(server);
  registerCalendarTools(server);
}
```

### Test pattern for domain tool (mirrors mcp-registry.test.ts)

```typescript
// Source: verified pattern from src/lib/__tests__/mcp-registry.test.ts
import { registerSalaryTools } from '@/lib/mcp/tools/salary';

describe('registerSalaryTools', () => {
  it('registers salary_net, salary_gross, salary_employer_cost', () => {
    const registeredTools: Record<string, unknown> = {};
    const mockServer = {
      registerTool: (name: string, meta: unknown) => {
        registeredTools[name] = meta;
      },
    };
    registerSalaryTools(mockServer as never);
    expect(registeredTools['salary_net']).toBeDefined();
    expect(registeredTools['salary_gross']).toBeDefined();
    expect(registeredTools['salary_employer_cost']).toBeDefined();
  });
});
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest ^30.3.0 |
| Config file | `jest.config.js` (root) |
| Quick run command | `pnpm test --testPathPattern=mcp-tools` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| SAL-01 | `tools/list` includes `salary_net`, `salary_gross`, `salary_employer_cost` | unit | `pnpm test --testPathPattern=mcp-salary` | No — Wave 0 |
| SAL-01 | `salary_net` happy path returns `netSalary`, `irtBracket` etc. | unit | `pnpm test --testPathPattern=mcp-salary` | No — Wave 0 |
| SAL-01 | `salary_net` with unsupported year returns `isError: true`, code `UNSUPPORTED_TAX_YEAR` | unit | `pnpm test --testPathPattern=mcp-salary` | No — Wave 0 |
| LOC-01 | `tools/list` includes `phone_parse`, `phone_validate`, `phone_operator` | unit | `pnpm test --testPathPattern=mcp-phone` | No — Wave 0 |
| LOC-01 | `phone_validate` happy path returns `isValid: true`, `normalized` | unit | `pnpm test --testPathPattern=mcp-phone` | No — Wave 0 |
| LOC-01 | `phone_parse` with invalid number returns `isError: true`, code `INVALID_PHONE` | unit | `pnpm test --testPathPattern=mcp-phone` | No — Wave 0 |
| LOC-02 | `geo_provinces` returns array with name/capital/municipalityCount | unit | `pnpm test --testPathPattern=mcp-geo` | No — Wave 0 |
| LOC-02 | `geo_municipalities` with unknown province returns `isError: true`, code `PROVINCE_NOT_FOUND` | unit | `pnpm test --testPathPattern=mcp-geo` | No — Wave 0 |
| LOC-02 | `geo_communes` with ambiguous municipality returns `isError: true`, code `AMBIGUOUS_MUNICIPALITY` | unit | `pnpm test --testPathPattern=mcp-geo` | No — Wave 0 |
| LOC-03 | `address_normalize` happy path returns `components.province` populated | unit | `pnpm test --testPathPattern=mcp-address` | No — Wave 0 |
| LOC-03 | `address_suggest` with query returns array of suggestions | unit | `pnpm test --testPathPattern=mcp-address` | No — Wave 0 |
| CAL-01 | `calendar_holidays` returns 13 holidays for a given year | unit | `pnpm test --testPathPattern=mcp-calendar` | No — Wave 0 |
| CAL-01 | `calendar_working_days` happy path returns correct `workingDays` count | unit | `pnpm test --testPathPattern=mcp-calendar` | No — Wave 0 |
| CAL-01 | `calendar_add_working_days` with `days: 0` returns `direction: 'none'` | unit | `pnpm test --testPathPattern=mcp-calendar` | No — Wave 0 |
| CAL-01 | `calendar_holidays` with out-of-range year returns `isError: true`, code `INVALID_YEAR` | unit | `pnpm test --testPathPattern=mcp-calendar` | No — Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm test --testPathPattern=mcp-(salary|phone|geo|address|calendar)`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/__tests__/mcp-salary.test.ts` — covers SAL-01 (registration + happy path + error path)
- [ ] `src/lib/__tests__/mcp-phone.test.ts` — covers LOC-01
- [ ] `src/lib/__tests__/mcp-geo.test.ts` — covers LOC-02
- [ ] `src/lib/__tests__/mcp-address.test.ts` — covers LOC-03
- [ ] `src/lib/__tests__/mcp-calendar.test.ts` — covers CAL-01

All five test files follow the existing mock-server pattern from `mcp-registry.test.ts` and `mcp-tool-error.test.ts`. No new test infrastructure or fixtures are needed — the existing `jest.config.js` and `moduleNameMapper` cover all paths.

---

## Environment Availability

Step 2.6: All domain functions are pure TypeScript using in-memory data. No external services, databases, or CLI tools are required. No environment availability audit is needed for this phase.

---

## Security Domain

`security_enforcement` not set to false. Applicable ASVS categories for this phase:

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Public endpoint (locked in Phase 1) |
| V3 Session Management | No | Stateless tools |
| V4 Access Control | No | No ACLs |
| V5 Input Validation | Yes | Zod `inputSchema` on every tool; domain functions throw `RouteError` on invalid input |
| V6 Cryptography | No | No secrets, no encryption |

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malformed numeric inputs (negative salary, out-of-range year) | Tampering | Zod `.nonnegative()`, `.int()`, `.min()`/`.max()` + domain function `RouteError` |
| Overly large `limit` in `address_suggest` | Denial of service | `z.number().int().positive()` + function returns deduped slice; no DB query |
| Empty string bypass | Tampering | `z.string().min(1)` on all required string inputs |

---

## State of the Art

No new patterns are introduced. This phase is purely mechanical application of the Phase 1 pattern across five domains.

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HTTP query-string coercion (`parsePositiveNumber`, `parseEnum`) | Zod type schema in `inputSchema` | Phase 2 (now) | MCP clients send typed JSON; no coercion needed |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `detectAngolanOperator` with an empty string input does not throw (returns UNKNOWN without calling the empty-check that `parseAngolanPhoneNumber` has) | Per-Tool: `phone_operator` | Low — both functions use `onlyDigits()` first; worst case is UNKNOWN returned for empty. The `z.string().min(1)` schema prevents this at tool invocation. |
| A2 | `listAngolanHolidays` always returns exactly 13 holidays (10 fixed + Carnival Monday + Carnival Tuesday + Good Friday) | Validation Architecture test | Low — count is deterministic from source code constants; only changes if `calendar.ts` is modified |

**All other claims are VERIFIED from direct source file inspection.**

---

## Open Questions (RESOLVED)

1. **`salary_employer_cost` description differentiation from `salary_net`**
   - What we know: Both accept identical inputs; `salary_employer_cost` returns everything `salary_net` returns plus `totalEmployerCost`.
   - What's unclear: Whether to mention in the `salary_employer_cost` description that it internally calls `salary_net` (could confuse LLMs into thinking they need to call `salary_net` first).
   - Recommendation: Do NOT mention the internal delegation. Describe it as an independent operation from the LLM's perspective: "Returns the full salary breakdown plus the employer's 8% social-security contribution added to gross."

2. **`geo_provinces` should it wrap result in a `{ country, countryName, provinces }` envelope?**
   - What we know: The HTTP route at `app/geo/provinces/route.ts` wraps the `listAngolaProvinces()` array in `{ country: 'AO', countryName: 'Angola', provinces: [...] }`.
   - What's unclear: Whether the MCP tool should mirror this envelope (for HTTP/MCP consistency) or just return the raw array.
   - Recommendation: Mirror the HTTP envelope for consistency — wrap in `{ country: 'AO', countryName: 'Angola', provinces: listAngolaProvinces() }`. This makes it unambiguous to the LLM what country the data belongs to.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)

- `src/lib/angola/salary.ts` — `NetSalaryInput`, `GrossSalaryInput`, `calculateNetSalary`, `calculateGrossSalary`, `calculateEmployerCost`, `ensureSupportedYear`, `IRT_TABLES`
- `src/lib/angola/phone.ts` — `parseAngolanPhoneNumber`, `validateAngolanPhoneNumber`, `detectAngolanOperator`
- `src/lib/angola/geo.ts` — `listAngolaProvinces`, `listAngolaMunicipalities`, `listAngolaCommunes`, `findProvince`, `findMunicipality`
- `src/lib/angola/address.ts` — `normalizeAngolanAddress`, `suggestAngolanAddressParts`, `KNOWN_BAIRROS`
- `src/lib/angola/calendar.ts` — `listAngolanHolidays`, `calculateWorkingDays`, `addWorkingDays`, `FIXED_HOLIDAYS`
- `src/lib/angola/shared.ts` — `parsePositiveNumber`, `parseEnum`, `parseIsoDate`, `parseInteger`
- `src/lib/mcp/tools/health.ts` — canonical registration pattern
- `src/lib/mcp/tool-error.ts` — `mcpToolHandler` HOF signature and error-mapping logic
- `src/lib/mcp/registry.ts` — aggregator pattern
- `src/lib/route-error.ts` — `RouteError` class signature
- `app/salary/shared.ts` — `parseNetSalaryQuery`, `parseGrossSalaryQuery`
- All HTTP routes: `app/{salary,phone,geo,address,calendar}/*/route.ts`
- `src/lib/__tests__/mcp-registry.test.ts`, `mcp-tool-error.test.ts` — existing test patterns
- `package.json` — confirmed `zod: ^3`, `@modelcontextprotocol/sdk: ^1.29.0`, `mcp-handler: 1.1.0`
- `jest.config.js` — test configuration confirmed

### Metadata

**Confidence breakdown:**
- Per-tool Zod schemas: HIGH — derived directly from function signatures and HTTP parsers
- Tool descriptions: HIGH — derived from function behavior + D-03 constraint
- Test patterns: HIGH — mirrors existing `mcp-registry.test.ts` structure
- Package versions: HIGH — verified from `package.json`

**Research date:** 2026-06-18
**Valid until:** Stable indefinitely — all claims derived from local codebase state, not external sources
