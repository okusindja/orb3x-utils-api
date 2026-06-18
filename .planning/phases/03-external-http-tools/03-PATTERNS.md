# Phase 3: External HTTP Tools - Pattern Map

**Mapped:** 2026-06-18
**Files analyzed:** 13 (4 new tool modules, 4 new test files, 2 modified domain clients, 1 modified handler, 1 modified registry, 1 extended test)
**Analogs found:** 13 / 13

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/lib/mcp/tool-error.ts` (modify) | middleware | request-response | `src/lib/mcp/tool-error.ts` itself (current state) | self-extension |
| `src/lib/__tests__/mcp-tool-error.test.ts` (extend) | test | — | `src/lib/__tests__/mcp-tool-error.test.ts` itself | self-extension |
| `src/lib/mcp/tools/finance.ts` (new) | tool module | request-response (pure) | `src/lib/mcp/tools/salary.ts` | exact |
| `src/lib/__tests__/mcp-tools-finance.test.ts` (new) | test | — | `src/lib/__tests__/mcp-tools-salary.test.ts` | exact |
| `src/lib/mcp/tools/currency.ts` (new) | tool module | request-response + CRUD (cache) | `src/lib/mcp/tools/salary.ts` | role-match |
| `src/lib/__tests__/mcp-tools-currency.test.ts` (new) | test | — | `src/lib/__tests__/mcp-tools-salary.test.ts` | role-match |
| `src/lib/mcp/tools/nif.ts` (new) | tool module | request-response | `src/lib/mcp/tools/salary.ts` | role-match |
| `src/lib/__tests__/mcp-tools-nif.test.ts` (new) | test | — | `src/lib/__tests__/mcp-tools-salary.test.ts` | role-match |
| `src/lib/mcp/tools/translation.ts` (new) | tool module | request-response | `src/lib/mcp/tools/salary.ts` | role-match |
| `src/lib/__tests__/mcp-tools-translation.test.ts` (new) | test | — | `src/lib/__tests__/mcp-tools-salary.test.ts` | role-match |
| `src/lib/currency.ts` (modify timeout) | external client | request-response | self (line 48 only) | self-edit |
| `src/lib/agt-nif.ts` (modify timeouts) | external client | request-response | self (lines 222, 280) | self-edit |
| `src/lib/mcp/registry.ts` (extend) | registry | — | `src/lib/mcp/registry.ts` itself | self-extension |

---

## Pattern Assignments

### `src/lib/mcp/tool-error.ts` — MODIFY (add duck-typed branch, D-01)

**Analog:** Current file is the extension point. Read the existing 45-line file in full before editing.

**Current implementation** (`src/lib/mcp/tool-error.ts` lines 1–45):
```typescript
import { RouteError } from '@/lib/route-error';

type McpResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: true;
};

export function mcpToolHandler<TInput>(
  fn: (input: TInput) => unknown | Promise<unknown>,
): (input: TInput) => Promise<McpResult> {
  return async (input) => {
    try {
      const result = await fn(input);
      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
      };
    } catch (error) {
      if (error instanceof RouteError) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                code: error.code,
                message: error.message,
                ...(error.details ?? {}),
              }),
            },
          ],
        };
      }
      const msg = error instanceof Error ? error.message : 'Unexpected error';
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify({ code: 'INTERNAL_SERVER_ERROR', message: msg }),
          },
        ],
      };
    }
  };
}
```

**New duck-typed branch to INSERT** — place between the `instanceof RouteError` block (line 32) and the final fallback (line 33). No imports added (domain-agnostic by design per D-01):
```typescript
// Duck-typed branch: catches CurrencyError, PortalLookupError, TranslationError
// All three share code:string + statusCode:number but are NOT RouteError subclasses.
// RouteError has .status (not .statusCode) so this check is disjoint.
if (
  error instanceof Error &&
  typeof (error as { code?: unknown }).code === 'string' &&
  typeof (error as { statusCode?: unknown }).statusCode === 'number'
) {
  const domainError = error as Error & { code: string; statusCode: number };
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          code: domainError.code,
          message: domainError.message,
          statusCode: domainError.statusCode,
          // Spreads additional enumerable properties (retryable, retryAfterSeconds)
          // set via Object.assign in tool callbacks. Still domain-agnostic.
          ...(Object.fromEntries(
            Object.entries(domainError as Record<string, unknown>).filter(
              ([k]) => !['name', 'stack', 'message', 'code', 'statusCode'].includes(k),
            ),
          )),
        }),
      },
    ],
  };
}
```

**Critical constraint:** `instanceof RouteError` check MUST stay first. `RouteError` uses `.status` (not `.statusCode`) — verified at `src/lib/route-error.ts` lines 2–4 — so it would NOT match the duck-typed check anyway, but ordering preserves explicit intent and test baseline.

---

### `src/lib/__tests__/mcp-tool-error.test.ts` — EXTEND (add duck-typed branch tests)

**Analog:** The existing 4 test cases in the same file (lines 1–52) are the baseline pattern. All 4 must remain green after D-01.

**Existing test structure pattern** (lines 1–52 — copy the describe wrapper and `it` shape):
```typescript
import { mcpToolHandler } from '@/lib/mcp/tool-error';
import { RouteError } from '@/lib/route-error';

describe('mcpToolHandler', () => {
  it('<case>', async () => {
    const handler = mcpToolHandler(async () => { /* throw or return */ });
    const result = await handler({});

    expect(result.isError).toBe(true); // or .toBeUndefined()
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('...');
  });
});
```

**New test cases to add** — these mirror the existing `it` shape; use a plain `Error` with `Object.assign` to simulate the duck-typed shape (no need to import domain error classes into the test):
```typescript
it('returns isError:true with code, message, statusCode for duck-typed domain error', async () => {
  const handler = mcpToolHandler(async () => {
    const err = Object.assign(new Error('The service timed out.'), {
      code: 'UPSTREAM_TIMEOUT',
      statusCode: 504,
    });
    throw err;
  });
  const result = await handler({});

  expect(result.isError).toBe(true);
  const parsed = JSON.parse(result.content[0].text);
  expect(parsed.code).toBe('UPSTREAM_TIMEOUT');
  expect(parsed.statusCode).toBe(504);
  expect(parsed.message).toBe('The service timed out.');
});

it('spreads extra enumerable properties (retryable, retryAfterSeconds) from duck-typed error', async () => {
  const handler = mcpToolHandler(async () => {
    const err = Object.assign(new Error('Timeout'), {
      code: 'UPSTREAM_TIMEOUT',
      statusCode: 504,
      retryable: true,
      retryAfterSeconds: 5,
    });
    throw err;
  });
  const result = await handler({});

  expect(result.isError).toBe(true);
  const parsed = JSON.parse(result.content[0].text);
  expect(parsed.retryable).toBe(true);
  expect(parsed.retryAfterSeconds).toBe(5);
});

it('RouteError is still caught by instanceof branch (not duck-typed branch) after extension', async () => {
  const handler = mcpToolHandler(async () => {
    throw new RouteError('NOT_FOUND', 'Resource not found', 404);
  });
  const result = await handler({});

  expect(result.isError).toBe(true);
  const parsed = JSON.parse(result.content[0].text);
  expect(parsed.code).toBe('NOT_FOUND');
  // RouteError serializes via its own branch — no statusCode field in output
  expect(parsed.statusCode).toBeUndefined();
});
```

---

### `src/lib/mcp/tools/finance.ts` — NEW (pure, no cache, no retry)

**Analog:** `src/lib/mcp/tools/salary.ts` (exact template — same pure delegation pattern).

**Imports pattern** (copy from `src/lib/mcp/tools/salary.ts` lines 1–8):
```typescript
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import { calculateVat, calculateInvoiceTotals, adjustForInflation } from '@/lib/angola/finance';
```

**Register function signature** (copy from `salary.ts` line 10):
```typescript
export function registerFinanceTools(server: McpServer): void {
```

**Core delegation pattern** (copy from `salary.ts` lines 11–34 — single `server.registerTool` call per tool):
```typescript
  server.registerTool(
    'finance_vat',
    {
      title: '...',
      description: '... Use `finance_invoice_total`. Use `finance_inflation_adjust`.',
      inputSchema: z.object({
        amount: z.number().positive()
          .describe('The monetary amount in AOA. Must be positive.'),
        rate: z.number().min(0).max(100).optional().default(14)
          .describe('VAT rate as a percentage (0–100). Defaults to Angola standard rate of 14%.'),
        inclusive: z.boolean().optional().default(true)
          .describe('Whether the amount already includes VAT. Defaults to true.'),
      }),
    },
    mcpToolHandler(async (input) => calculateVat(input)),
  );
```

**Schema notes (verified against `src/lib/angola/finance.ts` lines 21–24):**
- `calculateVat` signature: `({ amount, rate = 14, inclusive = true })` — `rate` and `inclusive` have defaults, use `.optional().default(...)` in Zod.
- `calculateInvoiceTotals` signature: `({ lines, discount = 0, discountType = 'amount' })` — `lines` is required array, min 1.
- `adjustForInflation` takes `{ amount, from, to }` where `from`/`to` are `string` (NOT numbers) — use `z.string()` (verified: `src/lib/angola/finance.ts` lines 105–113 call `from.slice(0, 4)` — a string operation).
- Finance errors are `RouteError` — already caught by the existing first branch in `mcpToolHandler`. No changes needed for finance errors.

**Anti-collision description requirement** (from `salary.ts` lines 16–19): each description must name at least one sibling tool (e.g. `finance_vat` description mentions `` `finance_invoice_total` `` and `` `finance_inflation_adjust` ``).

---

### `src/lib/__tests__/mcp-tools-finance.test.ts` — NEW

**Analog:** `src/lib/__tests__/mcp-tools-salary.test.ts` (lines 1–109 — full template).

**Test file structure** (copy from `mcp-tools-salary.test.ts`):
```typescript
import { registerFinanceTools } from '@/lib/mcp/tools/finance';

describe('registerFinanceTools', () => {
  it('registers finance_vat, finance_invoice_total, finance_inflation_adjust', () => {
    const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};
    const mockServer = {
      registerTool: (name: string, meta: { title?: string; description?: string; inputSchema?: unknown }) => {
        registeredTools[name] = meta;
      },
    };
    registerFinanceTools(mockServer as never);
    expect(registeredTools['finance_vat']).toBeDefined();
    expect(registeredTools['finance_invoice_total']).toBeDefined();
    expect(registeredTools['finance_inflation_adjust']).toBeDefined();
  });
  // ... anti-collision description test (copy pattern from salary test lines 23–46)
  // ... happy path test (copy handler invocation pattern from salary test lines 48–78)
  // ... error path tests (INVALID_RATE, INVALID_INVOICE_LINES, UNSUPPORTED_CPI_YEAR)
});
```

**Handler invocation pattern** (copy from `mcp-tools-salary.test.ts` lines 48–78):
```typescript
const registeredTools: Record<string, {
  meta: unknown;
  handler: (input: unknown) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>;
}> = {};
const mockServer = {
  registerTool: (name: string, meta: unknown, handler: (input: unknown) => Promise<...>) => {
    registeredTools[name] = { meta, handler };
  },
};
registerFinanceTools(mockServer as never);
const result = await registeredTools['finance_vat'].handler({ amount: 114, rate: 14, inclusive: true });
expect(result.isError).toBeUndefined();
const parsed = JSON.parse(result.content[0].text);
expect(parsed.netAmount).toBeDefined();
expect(parsed.vatAmount).toBeDefined();
```

**Finance error test pattern** (copy from `mcp-tools-salary.test.ts` lines 80–108):
```typescript
// finance_vat: bad rate → INVALID_RATE
const result = await registeredTools['finance_vat'].handler({ amount: 114, rate: 150 });
expect(result.isError).toBe(true);
const parsed = JSON.parse(result.content[0].text);
expect(parsed.code).toBe('INVALID_RATE');

// finance_invoice_total: empty lines → INVALID_INVOICE_LINES
const result = await registeredTools['finance_invoice_total'].handler({ lines: [] });
expect(parsed.code).toBe('INVALID_INVOICE_LINES');

// finance_inflation_adjust: unsupported year → UNSUPPORTED_CPI_YEAR
const result = await registeredTools['finance_inflation_adjust'].handler({ amount: 1000, from: '2010', to: '2025' });
expect(parsed.code).toBe('UNSUPPORTED_CPI_YEAR');
```

No `global.fetch` mock needed — finance tools are pure computation.

---

### `src/lib/mcp/tools/currency.ts` — NEW (external HTTP + module-level cache)

**Analog:** `src/lib/mcp/tools/salary.ts` for the register pattern. No existing analog for the cache — this is a new pattern (module-level `Map` + TTL, currency tool only).

**Imports pattern:**
```typescript
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import { CurrencyError, fetchCurrencyRates, convertCurrencyRates } from '@/lib/currency';
```

**Cache pattern (new — no prior analog, per D-05):**
```typescript
// Module-level cache — per-instance, resets on Vercel cold start. D-05.
type CurrencyCache = {
  data: Awaited<ReturnType<typeof fetchCurrencyRates>>;
  expiresAt: number;
};

const CURRENCY_CACHE_TTL_MS = 60_000;
const currencyRatesCache = new Map<string, CurrencyCache>();

async function fetchCurrencyRatesCached(
  baseCurrency: string,
): Promise<Awaited<ReturnType<typeof fetchCurrencyRates>>> {
  // Key normalised BEFORE sanitizeCurrencyCode to avoid cache-key divergence (Pitfall 3)
  const normalizedBase = baseCurrency.trim().toLowerCase();
  const cached = currencyRatesCache.get(normalizedBase);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const data = await fetchCurrencyRates(baseCurrency); // throws CurrencyError on failure
  currencyRatesCache.set(normalizedBase, { data, expiresAt: Date.now() + CURRENCY_CACHE_TTL_MS });
  return data;
}
```

**External error enrichment pattern (D-04) — tool callback catches, enriches, re-throws:**
```typescript
mcpToolHandler(async (input) => {
  try {
    return await fetchCurrencyRatesCached(input.base);
  } catch (error) {
    if (error instanceof CurrencyError) {
      const retryable =
        error.code === 'UPSTREAM_TIMEOUT' || error.code === 'UPSTREAM_UNAVAILABLE';
      const enriched = new CurrencyError(
        retryable
          ? `${error.message} The service may be warming up — retry in a few seconds.`
          : error.message,
        error.statusCode,
        error.code,
      );
      Object.assign(enriched, { retryable, retryAfterSeconds: retryable ? 5 : undefined });
      throw enriched;
    }
    throw error;
  }
})
```

The duck-typed branch in `mcpToolHandler` then serializes `code`, `message`, `statusCode`, plus the enumerable `retryable` and `retryAfterSeconds` fields set via `Object.assign`.

**Schema for `currency_rates` and `currency_convert`** (derived from `app/api/exchange/[base]/route.ts` lines 20–28 and `src/lib/currency.ts` lines 186–219):
```typescript
// currency_rates
inputSchema: z.object({
  base: z.string().min(2).max(20)
    .describe('ISO 4217 currency code (e.g., "AOA", "USD", "EUR"). Case-insensitive. 2–20 characters.'),
}),

// currency_convert — note: convertCurrencyRates takes a CurrencyLookupResult as first arg (pure transform),
// so currency_convert must call fetchCurrencyRates internally. MCP clients must not construct CurrencyLookupResult.
inputSchema: z.object({
  base: z.string().min(2).max(20)
    .describe('Base currency code to fetch rates for (e.g., "AOA"). Case-insensitive.'),
  amount: z.number().nonnegative()
    .describe('Amount in the base currency to convert. Must be zero or positive.'),
}),
```

`amount` is `z.number()` not `z.coerce.number()` — carried-forward convention from Phase 2.

---

### `src/lib/__tests__/mcp-tools-currency.test.ts` — NEW

**Analog:** `src/lib/__tests__/mcp-tools-salary.test.ts` for structure. `global.fetch` mock pattern verified in `src/lib/__tests__/currency.test.ts` (not read in full — but mock pattern documented in RESEARCH.md).

**Mock fetch setup** (place at top of describe block):
```typescript
const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

beforeEach(() => {
  mockFetch.mockReset();
  // Also clear the module-level cache between tests to avoid cross-test cache hits.
  // Since the cache is module-level, use jest.resetModules() or expose a clearCache()
  // helper from the module, OR use jest.isolateModules() per test.
});
```

**Cache hit test pattern (new — no prior analog):**
```typescript
it('currency_rates cache hit skips fetch on second call within TTL', async () => {
  mockFetch.mockResolvedValue(new Response(JSON.stringify(/* valid CurrencyLookupResult fixture */), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  }));

  await registeredTools['currency_rates'].handler({ base: 'AOA' });
  await registeredTools['currency_rates'].handler({ base: 'AOA' }); // second call
  expect(mockFetch).toHaveBeenCalledTimes(1); // cache hit — fetch called only once
});
```

**Upstream timeout test pattern** (simulate `AbortSignal` timeout via `DOMException`):
```typescript
it('currency_rates UPSTREAM_TIMEOUT returns isError:true with retryable:true', async () => {
  mockFetch.mockRejectedValueOnce(
    Object.assign(new DOMException('Timeout', 'TimeoutError'), { name: 'TimeoutError' }),
  );

  const result = await registeredTools['currency_rates'].handler({ base: 'AOA' });
  expect(result.isError).toBe(true);
  const parsed = JSON.parse(result.content[0].text);
  expect(parsed.code).toBe('UPSTREAM_TIMEOUT');
  expect(parsed.retryable).toBe(true);
  expect(parsed.retryAfterSeconds).toBe(5);
});
```

---

### `src/lib/mcp/tools/nif.ts` — NEW (external HTTP, two timeout locations in client)

**Analog:** `src/lib/mcp/tools/salary.ts` for the register pattern.

**Imports pattern:**
```typescript
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import { PortalLookupError, lookupTaxpayerByNif } from '@/lib/agt-nif';
```

**External error enrichment pattern for NIF** (same shape as currency, different retry values):
```typescript
mcpToolHandler(async (input) => {
  try {
    return await lookupTaxpayerByNif(input.nif);
  } catch (error) {
    if (error instanceof PortalLookupError) {
      const retryableMap: Record<string, number | undefined> = {
        UPSTREAM_TIMEOUT: 10,
        UPSTREAM_UNAVAILABLE: 15,
        UPSTREAM_BAD_RESPONSE: 10,
      };
      const retryAfterSeconds = retryableMap[error.code];
      const retryable = retryAfterSeconds !== undefined;
      const enriched = new PortalLookupError(
        retryable
          ? error.code === 'UPSTREAM_TIMEOUT'
            ? 'The AGT portal did not respond within 25s; it is frequently slow — retry in 10 seconds.'
            : `${error.message} Retry in ${retryAfterSeconds} seconds.`
          : error.message,
        error.statusCode,
        error.code,
      );
      Object.assign(enriched, { retryable, retryAfterSeconds });
      throw enriched;
    }
    throw error;
  }
})
```

**Schema for `nif_lookup`** (derived from `app/api/nif/[nif]/route.ts` line 20 and `src/lib/agt-nif.ts` lines 36–52):
```typescript
inputSchema: z.object({
  nif: z.string().min(1)
    .describe(
      'Angola taxpayer NIF (Número de Identificação Fiscal). Letters and digits only. ' +
      'Case-insensitive — normalized to uppercase internally.',
    ),
}),
```

`z.string().min(1)` only — let `lookupTaxpayerByNif` call `sanitizeNif` internally; `INVALID_NIF` `PortalLookupError` is caught by the duck-typed branch.

---

### `src/lib/__tests__/mcp-tools-nif.test.ts` — NEW

**Analog:** `src/lib/__tests__/mcp-tools-salary.test.ts` for test structure + `global.fetch` mock pattern.

**Key test cases (same `it` shape as salary/currency tests):**
- Registration: `nif_lookup` exists, has title + description with anti-collision text.
- Happy path: mock fetch returns valid AGT HTML response → result has `nif`, `name`, `type`, `status`.
- `UPSTREAM_TIMEOUT`: mock fetch rejects with `DOMException('TimeoutError')` → `isError:true`, `retryable:true`, `retryAfterSeconds:10`.
- `INVALID_NIF`: pass empty string → `isError:true`, `retryable:false` (input validation, no fetch mock needed).

---

### `src/lib/mcp/tools/translation.ts` — NEW (external HTTP, no cache)

**Analog:** `src/lib/mcp/tools/salary.ts` for the register pattern.

**Imports pattern:**
```typescript
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import { TranslationError, translateText } from '@/lib/translate';
```

**External error enrichment pattern for translation** (same shape as currency/nif):
```typescript
mcpToolHandler(async (input) => {
  try {
    return await translateText(input);
  } catch (error) {
    if (error instanceof TranslationError) {
      const retryable =
        error.code === 'UPSTREAM_TIMEOUT' ||
        error.code === 'UPSTREAM_UNAVAILABLE' ||
        error.code === 'UPSTREAM_BAD_RESPONSE';
      const enriched = new TranslationError(
        retryable
          ? `${error.message} Retry in a few seconds.`
          : error.message,
        error.statusCode,
        error.code,
      );
      Object.assign(enriched, { retryable, retryAfterSeconds: retryable ? 5 : undefined });
      throw enriched;
    }
    throw error;
  }
})
```

**Schema for `translate_text`** (derived from `app/api/translate/route.ts` lines 29–33 and `src/lib/translate.ts` lines 108–128):
```typescript
inputSchema: z.object({
  text: z.string().min(1).max(5000)
    .describe('Text to translate. Must not be empty. Maximum 5000 characters.'),
  to: z.string().min(2).max(12)
    .describe('Target language code (BCP 47, e.g., "en", "pt", "fr"). 2–12 lowercase letters and hyphens.'),
  from: z.string().min(2).max(12).optional()
    .describe('Source language code (BCP 47). Optional — if omitted, auto-detection is used.'),
}),
```

Note: `.max(5000)` on `text` is a security recommendation from RESEARCH.md (guard against DoS via Google unofficial API). Let `translateText` → `sanitizeLanguageCode` validate language codes; `INVALID_LANGUAGE` `TranslationError` flows through the duck-typed branch.

---

### `src/lib/__tests__/mcp-tools-translation.test.ts` — NEW

**Analog:** `src/lib/__tests__/mcp-tools-salary.test.ts` for test structure + `global.fetch` mock pattern.

**Key test cases:**
- Registration: `translate_text` exists, has title + description with anti-collision text.
- Happy path: mock fetch returns valid Google Translate JSON → result has `translatedText`, `sourceLanguage`, `targetLanguage`.
- `UPSTREAM_TIMEOUT`: mock fetch rejects with `DOMException('TimeoutError')` → `isError:true`, `retryable:true`, `retryAfterSeconds:5`.

---

### `src/lib/currency.ts` — MODIFY (timeout only, line 48)

**Change:** Line 48: `signal: AbortSignal.timeout(15000)` → `signal: AbortSignal.timeout(20000)`

This is the only timeout in `currency.ts`. `convertCurrencyRates` is synchronous — no timeout needed there. (Verified: RESEARCH.md sources section.)

---

### `src/lib/agt-nif.ts` — MODIFY (two timeout locations)

**Change 1:** Line 222: `signal: AbortSignal.timeout(15000)` → `signal: AbortSignal.timeout(25000)` (inside `requestPortalLookup`).

**Change 2:** Line 280: `request.setTimeout(15000, () => {` → `request.setTimeout(25000, () => {` (inside `requestPortalLookupWithInsecureTls` — TLS fallback path using `node:https`).

Both must change. Missing line 280 means TLS-fallback NIF lookups still cut off at 15s despite the 25s intent. (Verified: `src/lib/agt-nif.ts` lines 222 and 280 read directly.)

---

### `src/lib/mcp/registry.ts` — EXTEND (wire 4 new register*Tools)

**Current file** (`src/lib/mcp/registry.ts` lines 1–16):
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

**Extension pattern** — add 4 imports and 4 calls in the same style:
```typescript
import { registerFinanceTools } from './tools/finance';
import { registerCurrencyTools } from './tools/currency';
import { registerNifTools } from './tools/nif';
import { registerTranslationTools } from './tools/translation';

// Inside registerAllTools, after registerSalaryTools(server):
registerFinanceTools(server);
registerCurrencyTools(server);
registerNifTools(server);
registerTranslationTools(server);
```

**Registry test to extend** (`src/lib/__tests__/mcp-registry.test.ts` line 43): the existing test asserts `Object.keys(registeredTools).length >= 15`. After Phase 3 adds 7 tools (3 finance + 2 currency + 1 nif + 1 translation), total becomes 22. Add assertions for the 7 new tool names in the `expectedTools` array and update the count check to `>= 22`.

---

## Shared Patterns

### Import style (all new tool modules)
**Source:** `src/lib/mcp/tools/salary.ts` lines 1–8
- `@/` alias for `src/` paths.
- `node:` prefix for Node.js built-ins (only relevant if any tool module imports `node:https` directly — it should not; that stays in `src/lib/agt-nif.ts`).
- Named exports only — `export function register*Tools`.
- Single quotes, 2-space indent, trailing commas.

### `mcpToolHandler` wrapping (all tool callbacks)
**Source:** `src/lib/mcp/tools/salary.ts` lines 33, 59, 85
- Pattern: `mcpToolHandler(async (input) => domainFunction(input))`
- Never catch inside the callback for pure tools (finance). Do catch and enrich for external tools (currency/nif/translation).
- The handler serializes the successful return value as `JSON.stringify(result)` in a `text` content block.

### Anti-collision description requirement (all new tools)
**Source:** `src/lib/mcp/tools/salary.ts` lines 16–19; validated in `src/lib/__tests__/mcp-tools-salary.test.ts` lines 37–45
- Each tool's `description` must mention at least one sibling tool by backtick-name (e.g. `` `finance_vat` ``).
- Test: `expect(tool.description).toMatch(/finance_vat|finance_invoice_total|finance_inflation_adjust/)`.

### `z.number()` not `z.coerce.number()` (all new tool inputSchemas)
**Source:** `src/lib/mcp/tools/salary.ts` lines 21–31 — all numeric fields use `z.number()`.
- Carried-forward convention from Phases 1–2. MCP tool inputs are already typed by the SDK.

### Error propagation — no catch inside pure-function callbacks
**Source:** `src/lib/mcp/tools/salary.ts` lines 33, 59, 85; `src/lib/mcp/tool-error.ts` lines 17–43
- Finance tools: let `RouteError` propagate to `mcpToolHandler` → caught by `instanceof RouteError` branch.
- External tools: catch only the domain error class, enrich it, re-throw. Unknown errors fall through to `INTERNAL_SERVER_ERROR`.

---

## No Analog Found

No files in scope are without an analog. All patterns are either self-extensions of existing files or derivations of `src/lib/mcp/tools/salary.ts`. The only genuinely novel sub-pattern is the **module-level `Map` + TTL cache** in `src/lib/mcp/tools/currency.ts` — there is no prior in-module cache anywhere in the codebase. The cache design is fully specified in RESEARCH.md Pattern 3 and in the `src/lib/mcp/tools/currency.ts` section above.

---

## Metadata

**Analog search scope:** `src/lib/mcp/`, `src/lib/__tests__/mcp-*`, `src/lib/currency.ts`, `src/lib/agt-nif.ts`, `src/lib/translate.ts`, `src/lib/angola/finance.ts`, `src/lib/route-error.ts`, `app/api/exchange/`, `app/api/nif/`, `app/api/translate/`
**Files scanned (Read):** 16 source files
**Pattern extraction date:** 2026-06-18
