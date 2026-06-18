# Phase 2: Core Utility Tools - Pattern Map

**Mapped:** 2026-06-18
**Files analyzed:** 11 (5 new tool modules + 5 new test files + 1 modified registry)
**Analogs found:** 11 / 11

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/mcp/tools/salary.ts` | tool-module | request-response | `src/lib/mcp/tools/health.ts` | exact |
| `src/lib/mcp/tools/phone.ts` | tool-module | request-response | `src/lib/mcp/tools/health.ts` | exact |
| `src/lib/mcp/tools/geo.ts` | tool-module | request-response | `src/lib/mcp/tools/health.ts` | exact |
| `src/lib/mcp/tools/address.ts` | tool-module | request-response | `src/lib/mcp/tools/health.ts` | exact |
| `src/lib/mcp/tools/calendar.ts` | tool-module | request-response | `src/lib/mcp/tools/health.ts` | exact |
| `src/lib/__tests__/mcp-tools-salary.test.ts` | test | request-response | `src/lib/__tests__/mcp-registry.test.ts` | exact |
| `src/lib/__tests__/mcp-tools-phone.test.ts` | test | request-response | `src/lib/__tests__/mcp-registry.test.ts` | exact |
| `src/lib/__tests__/mcp-tools-geo.test.ts` | test | request-response | `src/lib/__tests__/mcp-registry.test.ts` | exact |
| `src/lib/__tests__/mcp-tools-address.test.ts` | test | request-response | `src/lib/__tests__/mcp-registry.test.ts` | exact |
| `src/lib/__tests__/mcp-tools-calendar.test.ts` | test | request-response | `src/lib/__tests__/mcp-registry.test.ts` | exact |
| `src/lib/mcp/registry.ts` (modified) | aggregator | request-response | `src/lib/mcp/registry.ts` | self |

---

## Pattern Assignments

### `src/lib/mcp/tools/salary.ts` (tool-module, request-response)

**Analog:** `src/lib/mcp/tools/health.ts`

**Imports pattern** (`health.ts` lines 1-3 — copy exactly, swap domain function import):
```typescript
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import {
  calculateNetSalary,
  calculateGrossSalary,
  calculateEmployerCost,
} from '@/lib/angola/salary';
```

**Registration pattern** (`health.ts` lines 5-21 — canonical shape):
```typescript
export function registerSalaryTools(server: McpServer): void {
  server.registerTool(
    'salary_net',
    {
      title: 'Angola Net Salary',
      description: '...',  // anti-collision text — see RESEARCH.md §salary_net
      inputSchema: z.object({
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
      }),
    },
    mcpToolHandler(async (input) => calculateNetSalary(input)),
  );

  server.registerTool(
    'salary_gross',
    { /* identical inputSchema shape with targetNetSalary replacing grossSalary */ },
    mcpToolHandler(async (input) => calculateGrossSalary(input)),
  );

  server.registerTool(
    'salary_employer_cost',
    { /* identical inputSchema to salary_net */ },
    mcpToolHandler(async (input) => calculateEmployerCost(input)),
  );
}
```

**Key rules for salary tools:**
- Use `z.number()` — NOT `z.coerce.number()`. MCP sends typed JSON, not URL strings.
- `salary_net` key field: `grossSalary`. `salary_gross` key field: `targetNetSalary`. These are the only schema differences between the three.
- HTTP analog field mapping: `gross` (HTTP query param) → `grossSalary` (MCP), `net` (HTTP) → `targetNetSalary` (MCP). See `app/salary/shared.ts` lines 23-28.
- Do NOT `try/catch` inside the callback passed to `mcpToolHandler` — it handles `RouteError` already.

---

### `src/lib/mcp/tools/phone.ts` (tool-module, request-response)

**Analog:** `src/lib/mcp/tools/health.ts`

**Imports pattern:**
```typescript
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import {
  parseAngolanPhoneNumber,
  validateAngolanPhoneNumber,
  detectAngolanOperator,
} from '@/lib/angola/phone';
```

**Common inputSchema (all three phone tools share this):**
```typescript
const phoneInput = z.object({
  phone: z.string().min(1)
    .describe('Angolan phone number. Accepts any common format: national (9-digit: 923456789), international (+244923456789 or 244923456789), with or without spaces/dashes.'),
});
```

**Registration pattern:**
```typescript
export function registerPhoneTools(server: McpServer): void {
  server.registerTool(
    'phone_parse',
    { title: 'Parse Angola Phone Number', description: '...', inputSchema: phoneInput },
    mcpToolHandler(async ({ phone }) => parseAngolanPhoneNumber(phone)),
  );

  server.registerTool(
    'phone_validate',
    { title: 'Validate Angola Phone Number', description: '...', inputSchema: phoneInput },
    mcpToolHandler(async ({ phone }) => validateAngolanPhoneNumber(phone)),
  );

  server.registerTool(
    'phone_operator',
    { title: 'Detect Angola Phone Operator', description: '...', inputSchema: phoneInput },
    mcpToolHandler(async ({ phone }) => detectAngolanOperator(phone)),
  );
}
```

**Key rules for phone tools:**
- HTTP routes at `app/phone/*/route.ts` pass `url.searchParams.get('phone') ?? ''` directly to the function — MCP tool does the same but the Zod `min(1)` rejects empty at schema level.
- `detectAngolanOperator` returns `{ code: 'UNKNOWN' }` for unrecognized prefixes — this is NOT an error; do not convert to `isError`.
- The shared `phoneInput` schema can be declared once at module top level and reused across all three `registerTool` calls.

---

### `src/lib/mcp/tools/geo.ts` (tool-module, request-response)

**Analog:** `src/lib/mcp/tools/health.ts`

**Imports pattern:**
```typescript
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import {
  listAngolaProvinces,
  listAngolaMunicipalities,
  listAngolaCommunes,
} from '@/lib/angola/geo';
```

**Registration pattern:**
```typescript
export function registerGeoTools(server: McpServer): void {
  server.registerTool(
    'geo_provinces',
    {
      title: 'List Angola Provinces',
      description: '...',
      inputSchema: z.object({}),           // no inputs — mirrors health.ts pattern exactly
    },
    mcpToolHandler(async () => ({          // mirrors HTTP envelope from app/geo/provinces/route.ts lines 10-13
      country: 'AO',
      countryName: 'Angola',
      provinces: listAngolaProvinces(),
    })),
  );

  server.registerTool(
    'geo_municipalities',
    {
      title: 'List Angola Municipalities',
      description: '...',
      inputSchema: z.object({
        province: z.string().optional()
          .describe('Optional province name to filter results (e.g., "Luanda", "Benguela"). Omit to list all municipalities nationwide. Case-insensitive, accent-insensitive.'),
      }),
    },
    mcpToolHandler(async ({ province }) => listAngolaMunicipalities(province)),
  );

  server.registerTool(
    'geo_communes',
    {
      title: 'List Angola Communes',
      description: '...',
      inputSchema: z.object({
        municipality: z.string().min(1)
          .describe('Municipality name (required). Case-insensitive, accent-insensitive. Example: "Ingombota", "Viana".'),
        province: z.string().optional()
          .describe('Optional province name to disambiguate when the same municipality name exists in multiple provinces. Example: "Luanda". Required when the municipality name is ambiguous.'),
      }),
    },
    mcpToolHandler(async ({ municipality, province }) =>   // mirrors app/geo/communes/route.ts lines 13-16
      listAngolaCommunes(municipality, province)),
  );
}
```

**Key rules for geo tools:**
- `geo_provinces` uses `z.object({})` — the exact same empty schema as `health.ts` line 13.
- `geo_provinces` result MUST be wrapped in `{ country: 'AO', countryName: 'Angola', provinces: [...] }` to mirror the HTTP envelope (confirmed from `app/geo/provinces/route.ts` lines 10-13).
- `listAngolaCommunes` second arg is `provinceName?: string` — pass `province` directly; `undefined` is correct when omitted.

---

### `src/lib/mcp/tools/address.ts` (tool-module, request-response)

**Analog:** `src/lib/mcp/tools/health.ts`

**Imports pattern:**
```typescript
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import { normalizeAngolanAddress, suggestAngolanAddressParts } from '@/lib/angola/address';
```

**Registration pattern:**
```typescript
export function registerAddressTools(server: McpServer): void {
  server.registerTool(
    'address_normalize',
    {
      title: 'Normalize Angola Address',
      description: '...',
      inputSchema: z.object({
        address: z.string().min(1)
          .describe('Raw Angolan address string to normalize. Can contain abbreviations (prov., mun., av., r., b.), mixed case, irregular spacing. Example: "av. lenine, ingombota, luanda".'),
      }),
    },
    mcpToolHandler(async ({ address }) => normalizeAngolanAddress(address)),
  );

  server.registerTool(
    'address_suggest',
    {
      title: 'Suggest Angola Address Parts',
      description: '...',
      inputSchema: z.object({
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
      }),
    },
    // HTTP route (app/address/suggest/route.ts lines 14-22) wraps result in { query, suggestions }
    // MCP tool passes args directly — no envelope needed; domain function returns the suggestions array
    mcpToolHandler(async ({ query, type, province, municipality, limit }) =>
      suggestAngolanAddressParts({ query, type, province, municipality, limit })),
  );
}
```

**Key rules for address tools:**
- HTTP route `app/address/suggest/route.ts` uses `q` as the query param name (line 16); MCP uses `query` as the field name — these are already aligned by RESEARCH.md decision (derive from function signature, not HTTP param name).
- `type` in HTTP is an untyped string passed to the function; in MCP, Zod `z.enum` enforces the valid values.
- `limit` Zod default of `8` mirrors `suggestAngolanAddressParts` own default parameter.

---

### `src/lib/mcp/tools/calendar.ts` (tool-module, request-response)

**Analog:** `src/lib/mcp/tools/health.ts`

**Imports pattern:**
```typescript
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import {
  listAngolanHolidays,
  calculateWorkingDays,
  addWorkingDays,
} from '@/lib/angola/calendar';
```

**Registration pattern:**
```typescript
export function registerCalendarTools(server: McpServer): void {
  server.registerTool(
    'calendar_holidays',
    {
      title: 'Angola Public Holidays',
      description: '...',
      inputSchema: z.object({
        year: z.number().int().min(2000).max(2100).optional()
          .describe('Calendar year to list holidays for (2000–2100). Defaults to the current year when omitted.'),
      }),
    },
    // CRITICAL: do NOT use z.default() for year — evaluate at callback invocation time
    // mirrors app/calendar/holidays/route.ts lines 12-20
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
    }),
  );

  server.registerTool(
    'calendar_working_days',
    {
      title: 'Angola Working Days Count',
      description: '...',
      inputSchema: z.object({
        from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe('Start date in YYYY-MM-DD format (ISO 8601, e.g., "2026-01-01"). Inclusive.'),
        to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe('End date in YYYY-MM-DD format (ISO 8601, e.g., "2026-12-31"). Inclusive. Must be on or after the from date.'),
      }),
    },
    mcpToolHandler(async ({ from, to }) => calculateWorkingDays({ from, to })),
  );

  server.registerTool(
    'calendar_add_working_days',
    {
      title: 'Angola Add Working Days',
      description: '...',
      inputSchema: z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe('Start date in YYYY-MM-DD format (ISO 8601, e.g., "2026-06-18").'),
        days: z.number().int()
          .describe('Number of working days to add. Positive to advance forward, negative to go backward. Zero is allowed and returns the same date with direction "none".'),
      }),
    },
    // mirrors app/calendar/add-working-days/route.ts lines 10-12
    mcpToolHandler(async ({ date, days }) => addWorkingDays({ date, days })),
  );
}
```

**Key rules for calendar tools:**
- `calendar_holidays` year default MUST be `year ?? new Date().getUTCFullYear()` in the callback body, NOT a Zod `.default()` — a Zod default evaluates at module load time and would freeze the year.
- HTTP route `app/calendar/holidays/route.ts` wraps result in `{ year, holidays, assumptions }` (lines 17-22) — MCP tool mirrors this envelope exactly.
- `days: z.number().int()` (no `.nonnegative()`) — negative values are valid (go backward).

---

### `src/lib/mcp/registry.ts` (modified aggregator)

**Analog:** `src/lib/mcp/registry.ts` (self — extend the existing pattern)

**Current file** (lines 1-6):
```typescript
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerHealthTool } from './tools/health';

export function registerAllTools(server: McpServer): void {
  registerHealthTool(server);
}
```

**After modification** — add 5 imports and 5 call sites in alphabetical order after `registerHealthTool`:
```typescript
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerHealthTool } from './tools/health';
import { registerAddressTools } from './tools/address';
import { registerCalendarTools } from './tools/calendar';
import { registerGeoTools } from './tools/geo';
import { registerPhoneTools } from './tools/phone';
import { registerSalaryTools } from './tools/salary';

export function registerAllTools(server: McpServer): void {
  registerHealthTool(server);
  registerAddressTools(server);
  registerCalendarTools(server);
  registerGeoTools(server);
  registerPhoneTools(server);
  registerSalaryTools(server);
}
```

**Key rules:**
- This file is modified only in the final integration step (D-05) — the 5 domain tool files are implemented first in parallel.
- Import paths are relative (`'./tools/address'` etc.) — the existing `registerHealthTool` import on line 2 is the model.

---

### Test files: `src/lib/__tests__/mcp-tools-{salary,phone,geo,address,calendar}.test.ts`

**Analog:** `src/lib/__tests__/mcp-registry.test.ts` (lines 1-42)

**Mock server pattern** (`mcp-registry.test.ts` lines 6-16):
```typescript
const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};

const mockServer = {
  registerTool: (
    name: string,
    meta: { title?: string; description?: string; inputSchema?: unknown },
  ) => {
    registeredTools[name] = meta;
  },
};
```

**Tool registration assertion pattern** (`mcp-registry.test.ts` lines 18-23):
```typescript
registerAllTools(mockServer as never);

expect(registeredTools['health']).toBeDefined();
expect(typeof registeredTools['health'].title).toBe('string');
expect((registeredTools['health'].title ?? '').length).toBeGreaterThan(0);
expect(typeof registeredTools['health'].description).toBe('string');
expect((registeredTools['health'].description ?? '').length).toBeGreaterThan(0);
```

**Error path assertion pattern** (`mcp-tool-error.test.ts` lines 15-25):
```typescript
const handler = mcpToolHandler(async () => {
  throw new RouteError('NOT_FOUND', 'Resource not found', 404);
});
const result = await handler({});

expect(result.isError).toBe(true);
expect(result.content).toHaveLength(1);
const parsed = JSON.parse(result.content[0].text);
expect(parsed.code).toBe('NOT_FOUND');
expect(parsed.message).toBe('Resource not found');
```

**Full test file template** (copy for each domain — example for salary):
```typescript
import { registerSalaryTools } from '@/lib/mcp/tools/salary';
import { RouteError } from '@/lib/route-error';

describe('registerSalaryTools', () => {
  it('registers salary_net, salary_gross, salary_employer_cost', () => {
    const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};
    const mockServer = {
      registerTool: (
        name: string,
        meta: { title?: string; description?: string; inputSchema?: unknown },
      ) => {
        registeredTools[name] = meta;
      },
    };
    registerSalaryTools(mockServer as never);
    expect(registeredTools['salary_net']).toBeDefined();
    expect(registeredTools['salary_gross']).toBeDefined();
    expect(registeredTools['salary_employer_cost']).toBeDefined();
  });

  it('each tool has non-empty title and description with anti-collision text', () => {
    const registeredTools: Record<string, { title?: string; description?: string }> = {};
    const mockServer = {
      registerTool: (name: string, meta: { title?: string; description?: string }) => {
        registeredTools[name] = meta;
      },
    };
    registerSalaryTools(mockServer as never);
    for (const name of ['salary_net', 'salary_gross', 'salary_employer_cost']) {
      expect((registeredTools[name]?.description ?? '').length).toBeGreaterThan(0);
    }
  });

  it('salary_net happy path returns netSalary and irtBracket fields', async () => {
    // Call the registered handler directly via mcpToolHandler wrapping
    // by invoking the tool callback captured from mockServer.registerTool
    let salaryNetHandler: ((input: unknown) => Promise<unknown>) | undefined;
    const mockServer = {
      registerTool: (name: string, _meta: unknown, handler: (input: unknown) => Promise<unknown>) => {
        if (name === 'salary_net') salaryNetHandler = handler;
      },
    };
    registerSalaryTools(mockServer as never);
    const result = await salaryNetHandler!({ grossSalary: 500000, year: 2026 }) as { content: Array<{ type: string; text: string }> };
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.netSalary).toBeDefined();
    expect(parsed.irtBracket).toBeDefined();
  });

  it('salary_net with unsupported year returns isError:true code UNSUPPORTED_TAX_YEAR', async () => {
    let salaryNetHandler: ((input: unknown) => Promise<unknown>) | undefined;
    const mockServer = {
      registerTool: (name: string, _meta: unknown, handler: (input: unknown) => Promise<unknown>) => {
        if (name === 'salary_net') salaryNetHandler = handler;
      },
    };
    registerSalaryTools(mockServer as never);
    const result = await salaryNetHandler!({ grossSalary: 500000, year: 2020 }) as { isError?: boolean; content: Array<{ text: string }> };
    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('UNSUPPORTED_TAX_YEAR');
  });
});
```

**Adaptation guide per domain:**

| Domain | Import | Tool names to assert | Happy-path input | Error input + expected code |
|--------|--------|---------------------|------------------|-----------------------------|
| salary | `registerSalaryTools` | `salary_net`, `salary_gross`, `salary_employer_cost` | `{ grossSalary: 500000, year: 2026 }` → check `netSalary` | `{ year: 2020 }` → `UNSUPPORTED_TAX_YEAR` |
| phone | `registerPhoneTools` | `phone_parse`, `phone_validate`, `phone_operator` | `{ phone: '923456789' }` via `phone_validate` → check `isValid: true` | `{ phone: '123' }` → `INVALID_PHONE` |
| geo | `registerGeoTools` | `geo_provinces`, `geo_municipalities`, `geo_communes` | `geo_provinces({})` → array in `provinces` field; `geo_municipalities({ province: 'Luanda' })` → filtered list | `geo_municipalities({ province: 'Unknown' })` → `PROVINCE_NOT_FOUND`; `geo_communes({ municipality: 'Calumbo' })` → `AMBIGUOUS_MUNICIPALITY` |
| address | `registerAddressTools` | `address_normalize`, `address_suggest` | `address_normalize({ address: 'av. lenine luanda' })` → check `components` field | `address_suggest({ query: '' })` blocked by Zod `min(1)` before reaching handler |
| calendar | `registerCalendarTools` | `calendar_holidays`, `calendar_working_days`, `calendar_add_working_days` | `calendar_holidays({})` → array length 13; `calendar_add_working_days({ date: '2026-01-01', days: 0 })` → `direction: 'none'` | `calendar_holidays({ year: 1990 })` → `INVALID_YEAR` |

---

## Shared Patterns

### Tool Registration (core shape)
**Source:** `src/lib/mcp/tools/health.ts` lines 5-21
**Apply to:** All 5 domain tool modules
```typescript
export function register<Domain>Tools(server: McpServer): void {
  server.registerTool(
    'tool_name',
    {
      title: 'Human Readable Title',
      description: '...',   // D-03 anti-collision text required for sibling tools
      inputSchema: z.object({ /* ... */ }),
    },
    mcpToolHandler(async (input) => domainFunction(input)),
  );
  // repeat for each tool in the domain
}
```

### Error Handling (mcpToolHandler HOF)
**Source:** `src/lib/mcp/tool-error.ts` lines 8-45
**Apply to:** Every tool callback in all 5 domain files
- Wrap every callback: `mcpToolHandler(async (input) => ...)` — never pass a bare async function.
- Do NOT `try/catch` inside the callback; `mcpToolHandler` handles `RouteError` → `{ isError: true }` and unknown errors → `INTERNAL_SERVER_ERROR`.
- Success return shape: `{ content: [{ type: 'text', text: JSON.stringify(result) }] }` (produced automatically by `mcpToolHandler`).

### Input Schema Conventions
**Source:** `src/lib/mcp/tools/health.ts` line 13 + RESEARCH.md §Anti-Patterns
**Apply to:** All new tool `inputSchema` definitions
- Use `z.number()` not `z.coerce.number()` — MCP sends typed JSON.
- Use `z.string().min(1)` for all required string inputs (phone, address, municipality, date strings).
- Use `z.object({})` for zero-argument tools (mirrors `health.ts`).
- Add `.describe(...)` on every field — LLMs use these for tool invocation guidance.

### Mock Server Test Pattern
**Source:** `src/lib/__tests__/mcp-registry.test.ts` lines 6-16
**Apply to:** All 5 domain test files
```typescript
const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};
const mockServer = {
  registerTool: (
    name: string,
    meta: { title?: string; description?: string; inputSchema?: unknown },
  ) => {
    registeredTools[name] = meta;
  },
};
```

### Registry Aggregator Pattern
**Source:** `src/lib/mcp/registry.ts` lines 1-6
**Apply to:** The integration step modifying `registry.ts`
- Named imports, one import per domain module.
- One `register<Domain>Tools(server)` call per domain inside `registerAllTools`.
- No conditional logic, no arrays — plain sequential calls.

### HTTP Envelope Mirroring
**Source:** `app/geo/provinces/route.ts` lines 9-18
**Apply to:** `geo_provinces` tool callback only
```typescript
// HTTP route wraps in { country, countryName, provinces } — MCP tool must mirror this
return {
  country: 'AO',
  countryName: 'Angola',
  provinces: listAngolaProvinces(),
};
```

**Source:** `app/calendar/holidays/route.ts` lines 17-22
**Apply to:** `calendar_holidays` tool callback
```typescript
// HTTP route wraps in { year, holidays, assumptions } — MCP tool must mirror this
return {
  year: resolvedYear,
  holidays: listAngolanHolidays(resolvedYear),
  assumptions: [
    'Weekend bridge days declared ad hoc by the government are not inferred.',
    'Carnival Monday, Carnival Tuesday, and Good Friday are included as movable public holidays.',
  ],
};
```

---

## No Analog Found

All files have strong analogs. No entries in this section.

---

## Metadata

**Analog search scope:** `src/lib/mcp/`, `src/lib/__tests__/`, `app/*/route.ts`, `app/api/v1/*/route.ts`
**Files read (primary):** `health.ts`, `tool-error.ts`, `registry.ts`, `mcp-registry.test.ts`, `mcp-tool-error.test.ts`, `route-error.ts`, `app/salary/shared.ts`, `app/geo/provinces/route.ts`, `app/geo/communes/route.ts`, `app/calendar/holidays/route.ts`, `app/address/suggest/route.ts`, `app/calendar/add-working-days/route.ts`
**Pattern extraction date:** 2026-06-18
