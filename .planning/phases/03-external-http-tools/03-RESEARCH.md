# Phase 3: External HTTP Tools — Research

**Researched:** 2026-06-18
**Domain:** MCP tool wrapping (pure-function finance + external HTTP: currency, NIF, translation)
**Confidence:** HIGH — all findings verified directly against source files in this codebase

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Extend `mcpToolHandler` (`src/lib/mcp/tool-error.ts`) with a generic duck-typed branch: after the existing `RouteError` check, if a caught `Error` has a `string` `code` and a `number` `statusCode`, map it to `{ isError: true, content: [{ type:'text', text: JSON.stringify({ code, message, ... }) }] }`. Covers `CurrencyError`, `PortalLookupError`, and `TranslationError` without importing them.
- **D-02:** The `mcpToolHandler` extension lands first (own plan/task, with its test) before the external tools rely on it. Existing Phase 1/2 RouteError mapping must remain unchanged.
- **D-03:** Tune `AbortSignal.timeout` per upstream — NIF 25s (currently 15s), currency 20s (currently 15s), translation stays 15s. Tune client timeout where hardcoded.
- **D-04:** Upstream failure `isError` payloads are structured: `{ code, message, retryable: true, retryAfterSeconds: <n> }` plus a human-readable message. LLMs can act on `retryable`/`retryAfterSeconds`.
- **D-05:** `currency_rates` uses a module-level in-memory cache keyed by base currency, ~60s TTL (per-instance). Currency only — NIF and translation NOT cached. `currency_convert` may reuse cached rates.
- **Carried forward from Phases 1–2:** Full-parity granularity, `domain_operation` snake_case naming, sibling anti-collision descriptions, one `tools/<domain>.ts` per domain, parallel per-domain plans + final registry integration, Zod inputSchema mirroring HTTP parsers, result as JSON `text` content block, `z.number()` not `z.coerce`.

### Claude's Discretion

- Exact Zod schemas per tool (mirror `app/finance/*`, `app/api/exchange`, `app/api/nif`, `app/api/translate` parsers).
- Exact `retryAfterSeconds` values and message wording.
- Cache data structure details (Map shape, timestamp check).
- Whether `currency_convert` calls `fetchCurrencyRates` internally or takes rates as input — derive from `convertCurrencyRates` signature.

### Deferred Ideas (OUT OF SCOPE)

- Document/PDF tools — Phase 4.
- MCP docs page — Phase 5.
- `structuredContent`/`outputSchema` on currency — v2 (STRUCT-01).
- Caching NIF/translation results — currency-only this phase.
- Vercel-platform CDN cache on the currency HTTP route — out of MCP scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FIN-01 | Client can run Angola finance utilities (`src/lib/angola/finance.ts`) via MCP tool | `calculateVat`, `calculateInvoiceTotals`, `adjustForInflation` signatures verified; all pure (no HTTP). Zod schemas derived from HTTP route parsers. |
| FIN-02 | Client can fetch currency exchange rates via MCP tool, with upstream timeout guard and structured error on failure | `fetchCurrencyRates` + `convertCurrencyRates` signatures verified; `CurrencyError` codes catalogued; 15s→20s timeout change location identified; D-05 cache design specified. |
| NIF-01 | Client can look up a NIF on AGT portal via MCP tool, with upstream timeout ~25s and structured retry-guidance error | `lookupTaxpayerByNif` + `sanitizeNif` signatures verified; `PortalLookupError` codes catalogued; 15s→25s timeout change locations (two: fetch + insecure-TLS fallback) identified. |
| TRN-01 | Client can translate text via MCP tool, with structured error on upstream failure | `translateText` signature verified; `TranslationError` codes catalogued; timeout stays 15s. |
</phase_requirements>

---

## Summary

Phase 3 adds 7 MCP tools across four domains. Three domains (`currency`, `nif`, `translation`) wrap external HTTP clients that can fail; one domain (`finance`) is pure computation. The central engineering challenge is extending `mcpToolHandler` to catch the three domain error classes — `CurrencyError`, `PortalLookupError`, and `TranslationError` — which all share the same duck-typed shape (`code: string`, `statusCode: number`) but are not `RouteError` subclasses. A single duck-typed branch added after the existing `RouteError` check handles all three without importing them.

Two timeout bumps are required at the client level: `src/lib/currency.ts` line 48 (`AbortSignal.timeout(15000)` → `20000`) and `src/lib/agt-nif.ts` lines 222 and 280 (both `15000` → `25000` — the second is in the insecure-TLS fallback path). Translation stays at 15s.

The currency cache is a module-level `Map<string, { data: CurrencyLookupResult; expiresAt: number }>` keyed by normalized base currency code, with a ~60s TTL. `currency_convert` calls `fetchCurrencyRates` internally (since `convertCurrencyRates` takes a pre-fetched `CurrencyLookupResult` as its first argument), so the cache is naturally shared.

**Primary recommendation:** Land the `mcpToolHandler` extension as wave 1, the four domain tool modules in parallel as wave 2, then the registry integration as wave 3.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `mcpToolHandler` duck-typed error extension | API / MCP infra | — | Shared catch boundary; must be domain-agnostic |
| Finance tool wrappers (VAT, invoice, inflation) | API / MCP tool layer | Angola domain logic | Pure delegation; no new HTTP |
| Currency tool wrappers + cache | API / MCP tool layer | External HTTP client (`src/lib/currency.ts`) | Cache lives in tool module; client owns fetch |
| NIF tool wrapper | API / MCP tool layer | External HTTP client (`src/lib/agt-nif.ts`) | Tool delegates to `lookupTaxpayerByNif` |
| Translation tool wrapper | API / MCP tool layer | External HTTP client (`src/lib/translate.ts`) | Tool delegates to `translateText` |
| Timeout tuning | External HTTP clients | — | Timeouts are set at client level via `AbortSignal.timeout` |
| Registry wiring | MCP registry (`src/lib/mcp/registry.ts`) | — | Integration step; must be last (wave safety) |

---

## Standard Stack

### Core (no new packages — all already installed)

| Library | Version in use | Purpose |
|---------|---------------|---------|
| `zod` | 3.25.76 (verified: `node_modules/.pnpm/zod@3.25.76`) | Zod `inputSchema` for all 7 tools |
| `@modelcontextprotocol/sdk` | already used by Phase 1/2 | `McpServer` type for `register*Tools` functions |

No new packages are required for Phase 3. All domain clients (`currency.ts`, `agt-nif.ts`, `translate.ts`, `angola/finance.ts`) are already in the codebase. [VERIFIED: codebase read]

### No Package Legitimacy Audit Required

Phase 3 installs zero new packages.

---

## Architecture Patterns

### Recommended Project Structure (new files only)

```
src/lib/mcp/
├── tool-error.ts          # MODIFIED — add duck-typed branch (D-01)
├── tools/
│   ├── finance.ts         # NEW — registerFinanceTools (FIN-01)
│   ├── currency.ts        # NEW — registerCurrencyTools (FIN-02)
│   ├── nif.ts             # NEW — registerNifTools (NIF-01)
│   └── translation.ts     # NEW — registerTranslationTools (TRN-01)
├── registry.ts            # MODIFIED — wire 4 new register*Tools
src/lib/
├── currency.ts            # MODIFIED — AbortSignal.timeout 15000→20000
└── agt-nif.ts             # MODIFIED — AbortSignal.timeout 15000→25000 (two locations)
src/lib/__tests__/
├── mcp-tool-error.test.ts # MODIFIED — add duck-typed branch tests
├── mcp-tools-finance.test.ts   # NEW
├── mcp-tools-currency.test.ts  # NEW
├── mcp-tools-nif.test.ts       # NEW
└── mcp-tools-translation.test.ts # NEW
```

### Pattern 1: Duck-Typed Error Branch in `mcpToolHandler`

**What:** After the `instanceof RouteError` check, add a branch that matches any `Error` with `code: string` + `statusCode: number`. This catches `CurrencyError`, `PortalLookupError`, and `TranslationError` without importing them.

**Critical ordering:** `RouteError` check MUST remain first. `RouteError` has `.code` and `.status` (NOT `.statusCode`) — it does NOT satisfy the duck-typed check. The two checks are disjoint.

**Verification:**
- `RouteError` fields: `code: string`, `status: number`, `details?: Record<string, unknown>` — no `statusCode` property. [VERIFIED: `src/lib/route-error.ts` line 3]
- `CurrencyError` fields: `statusCode: number` (public readonly), `code: string` (public readonly). Constructor: `(message, statusCode, code)`. [VERIFIED: `src/lib/currency.ts` lines 23–32]
- `PortalLookupError` fields: `statusCode: number` (public readonly), `code: string` (public readonly). Constructor: `(message, statusCode, code)`. [VERIFIED: `src/lib/agt-nif.ts` lines 25–34]
- `TranslationError` fields: `statusCode: number` (public readonly), `code: string` (public readonly). Constructor: `(message, statusCode, code)`. [VERIFIED: `src/lib/translate.ts` lines 15–24]

**Exact new branch to insert** (between the `instanceof RouteError` block and the final fallback):

```typescript
// Source: verified against src/lib/route-error.ts (no statusCode), currency.ts, agt-nif.ts, translate.ts
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
        }),
      },
    ],
  };
}
```

The D-04 structured retry fields (`retryable`, `retryAfterSeconds`, human message) are injected in the tool callback, NOT in `mcpToolHandler`. The tool catches the upstream error and re-throws a transformed payload, or — per the Phase 3 design — the tool wraps the upstream call and augments the returned `isError` payload. See Pattern 4 for the external tool callback design.

**Why NOT in `mcpToolHandler`:** The handler has no knowledge of which error codes are retryable. Retryability is domain-specific (e.g., `UPSTREAM_TIMEOUT` is retryable for NIF and currency but `INVALID_NIF` is not). The tool callback is the correct layer to add this context.

### Pattern 2: Finance Tool Module (pure — exact template from `salary.ts`)

Finance tools follow the exact same pattern as Phase 2 salary tools. No timeout, no retryable error, no cache.

```typescript
// Source: verified against src/lib/angola/finance.ts and app/finance/*/route.ts
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import { calculateVat, calculateInvoiceTotals, adjustForInflation } from '@/lib/angola/finance';

export function registerFinanceTools(server: McpServer): void {
  server.registerTool(
    'finance_vat',
    {
      title: 'Angola VAT Calculator',
      description:
        'Calculate Angola VAT (IVA) breakdown — net amount, VAT amount, and gross — for a given amount and rate. ' +
        'Use this to split VAT from an inclusive price or add VAT to an exclusive price. ' +
        'For full invoice totals across multiple line items, use `finance_invoice_total`. ' +
        'For inflation adjustment, use `finance_inflation_adjust`.',
      inputSchema: z.object({
        amount: z.number().positive()
          .describe('The monetary amount in AOA. Must be positive.'),
        rate: z.number().min(0).max(100).optional().default(14)
          .describe('VAT rate as a percentage (0–100). Defaults to Angola standard rate of 14%.'),
        inclusive: z.boolean().optional().default(true)
          .describe('Whether the amount already includes VAT (true = extract VAT, false = add VAT). Defaults to true.'),
      }),
    },
    mcpToolHandler(async (input) => calculateVat(input)),
  );

  server.registerTool(
    'finance_invoice_total',
    {
      title: 'Angola Invoice Totals',
      description:
        'Calculate Angola invoice totals — subtotal, discount, taxable base, VAT per line, and grand total — ' +
        'for a list of invoice line items with optional discount. ' +
        'Use this when you have a multi-line invoice and need a full breakdown. ' +
        'For a simple single-amount VAT split, use `finance_vat`. ' +
        'For inflation adjustment, use `finance_inflation_adjust`.',
      inputSchema: z.object({
        lines: z.array(z.object({
          description: z.string().optional()
            .describe('Human-readable line item description (optional).'),
          quantity: z.number().positive()
            .describe('Quantity. Must be positive.'),
          unitPrice: z.number().nonnegative()
            .describe('Unit price in AOA. Must be zero or positive.'),
          vatRate: z.number().min(0).max(100).optional().default(14)
            .describe('VAT rate for this line item as a percentage. Defaults to 14%.'),
        })).min(1)
          .describe('Invoice line items. At least one line is required.'),
        discount: z.number().nonnegative().optional().default(0)
          .describe('Discount to apply before VAT. Interpreted as AOA amount or percent depending on discountType.'),
        discountType: z.enum(['amount', 'percent']).optional().default('amount')
          .describe('Whether the discount is an absolute AOA amount or a percentage of subtotal. Defaults to "amount".'),
      }),
    },
    mcpToolHandler(async (input) => calculateInvoiceTotals(input)),
  );

  server.registerTool(
    'finance_inflation_adjust',
    {
      title: 'Angola Inflation Adjustment',
      description:
        'Adjust a monetary amount for Angola inflation between two years using the Angola annual CPI index (2019–2025). ' +
        'Use this to express a historical amount in today\'s kwanza or to compare values across years. ' +
        'For VAT calculations, use `finance_vat`. ' +
        'For invoice totals, use `finance_invoice_total`.',
      inputSchema: z.object({
        amount: z.number().positive()
          .describe('Monetary amount in AOA to adjust. Must be positive.'),
        from: z.string()
          .describe('Source year as a 4-digit string (e.g., "2020"). Supported range: 2019–2025.'),
        to: z.string()
          .describe('Target year as a 4-digit string (e.g., "2025"). Supported range: 2019–2025.'),
      }),
    },
    mcpToolHandler(async (input) => adjustForInflation(input)),
  );
}
```

**Schema notes verified against source:**
- `calculateVat({ amount, rate?, inclusive? })` — `rate` defaults to `14` inside the function, `inclusive` defaults to `true`. [VERIFIED: `src/lib/angola/finance.ts` lines 21–24]
- The HTTP route uses `url.searchParams.get('rate') ? Number(...) : 14` and `url.searchParams.get('inclusive') !== 'false'`. [VERIFIED: `app/finance/vat/route.ts` lines 10–20]
- `calculateInvoiceTotals({ lines, discount?, discountType? })` — `discount` defaults to `0`, `discountType` defaults to `'amount'`. [VERIFIED: `src/lib/angola/finance.ts` lines 47–51]
- `adjustForInflation({ amount, from, to })` — `from`/`to` are strings; function calls `parseYear(from, 'from')` which slices first 4 chars and parses as int. [VERIFIED: `src/lib/angola/finance.ts` lines 105–113, 172–178]
- Finance errors are `RouteError` (not domain error classes): `INVALID_INVOICE_LINES`, `INVALID_INVOICE_LINE`, `INVALID_RATE`, `UNSUPPORTED_CPI_YEAR`, `INVALID_YEAR`. [VERIFIED: `src/lib/angola/finance.ts`] These are caught by the existing `RouteError` branch in `mcpToolHandler` — no changes needed for finance.

### Pattern 3: Currency Tool Module (external HTTP + cache)

**Key architectural fact:** `convertCurrencyRates` takes a pre-fetched `CurrencyLookupResult` as its first argument — it is a pure transformation. [VERIFIED: `src/lib/currency.ts` lines 93–110]. Therefore, `currency_convert` MUST call `fetchCurrencyRates` internally (which is where the cache applies) before calling `convertCurrencyRates`.

**Cache design (D-05):**

```typescript
// Module-level cache — per-instance, resets on cold start
type CurrencyCache = {
  data: CurrencyLookupResult;
  expiresAt: number;
};

const CURRENCY_CACHE_TTL_MS = 60_000; // 60 seconds
const currencyRatesCache = new Map<string, CurrencyCache>();

async function fetchCurrencyRatesCached(baseCurrency: string): Promise<CurrencyLookupResult> {
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

**D-04 structured retry for `currency_rates` and `currency_convert`:** The tool callback should wrap the `fetchCurrencyRatesCached` call and augment `isError` payloads for retryable codes. Since `mcpToolHandler` now catches duck-typed errors and returns them as-is (with `code`, `message`, `statusCode`), the simplest approach is to let the duck-typed branch handle it and keep `retryable`/`retryAfterSeconds` as a concern of the tool's own callback. The tool callback does NOT try/catch — it lets the error propagate to `mcpToolHandler`. The D-04 structured payload (with `retryable` + `retryAfterSeconds`) is instead included in the duck-typed branch extension OR the tool callback catches and re-throws a richer payload.

**Recommended approach:** The tool callback propagates; the `mcpToolHandler` duck-typed branch includes `retryable` and `retryAfterSeconds` based on the `code` field. BUT: this means `mcpToolHandler` would need to know which codes are retryable — violating D-01's "domain-agnostic" requirement.

**Correct approach:** The tool callback wraps the call, catches `CurrencyError`/`PortalLookupError`/`TranslationError`, and re-throws a plain `Error` with the structured payload as its message, or — preferably — returns an `isError` payload directly (bypassing `mcpToolHandler`) for the retryable case. However, the pattern in Phase 2 is that callbacks never return early — they always let `mcpToolHandler` be the boundary.

**Resolution (per D-01 + D-04 combined):** The tool callback propagates the domain error as-is. The `mcpToolHandler` duck-typed branch serializes `{ code, message, statusCode }`. The tool module adds `retryable` and `retryAfterSeconds` by catching the error in the callback, augmenting the thrown error's payload, and re-throwing — or by constructing and throwing a new `Error` that carries the fuller payload in its `message` as pre-serialized JSON. The cleanest pattern: the tool callback catches the domain error and re-throws a new instance with the same `code`, `statusCode`, and an augmented `message` including the human-readable retry guidance. The duck-typed branch in `mcpToolHandler` then serializes this.

**Simplest implementation (no changes to `mcpToolHandler` serialization logic):** The tool callback catches the domain error and uses `Object.assign` to add `retryable` and `retryAfterSeconds` before re-throwing:

```typescript
mcpToolHandler(async (input) => {
  try {
    return await fetchCurrencyRatesCached(input.base);
  } catch (error) {
    if (error instanceof CurrencyError) {
      const retryable = error.code === 'UPSTREAM_TIMEOUT' || error.code === 'UPSTREAM_UNAVAILABLE';
      // Re-throw with augmented properties the duck-typed branch will serialize
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

For this to work, the `mcpToolHandler` duck-typed branch must spread additional properties beyond `code`, `message`, `statusCode`. Update the serialization to use a broader spread:

```typescript
text: JSON.stringify({
  code: domainError.code,
  message: domainError.message,
  statusCode: domainError.statusCode,
  ...(Object.fromEntries(
    Object.entries(domainError as Record<string, unknown>)
      .filter(([k]) => !['name', 'stack', 'message', 'code', 'statusCode'].includes(k))
  )),
}),
```

This is still domain-agnostic — it spreads any enumerable extra properties the error has.

**Currency tool inputSchemas:**

```typescript
// currency_rates
inputSchema: z.object({
  base: z.string().min(2).max(20)
    .describe('ISO 4217 currency code (e.g., "AOA", "USD", "EUR"). Case-insensitive. 2–20 characters.'),
}),

// currency_convert
inputSchema: z.object({
  base: z.string().min(2).max(20)
    .describe('Base currency code to fetch rates for (e.g., "AOA"). Case-insensitive.'),
  amount: z.number().nonnegative()
    .describe('Amount in the base currency to convert. Must be zero or positive.'),
}),
```

**Schema derivation rationale:**
- HTTP route: `app/api/exchange/[base]/route.ts` — `base` is a path param passed to `fetchCurrencyRates(rawBase)`, which calls `sanitizeCurrencyCode` (validates `^[a-z0-9-]{2,20}$`). [VERIFIED: `src/lib/currency.ts` lines 186–200]
- `amount` in HTTP route: query param passed as string to `convertCurrencyRates(lookup, amount)` where `sanitizeAmount` does `Number(rawAmount)` and checks `>= 0`. [VERIFIED: `src/lib/currency.ts` lines 204–219]
- MCP tools receive typed input, so `amount` is `z.number().nonnegative()` (not `z.coerce`, per carried-forward convention).

### Pattern 4: NIF Tool Module (external HTTP — two timeout locations)

**Critical:** There are TWO timeout locations in `src/lib/agt-nif.ts` that must both change 15000→25000:
1. `requestPortalLookup` function, line 222: `signal: AbortSignal.timeout(15000)` [VERIFIED: `src/lib/agt-nif.ts` line 222]
2. `requestPortalLookupWithInsecureTls` function, line 280: `request.setTimeout(15000, ...)` [VERIFIED: `src/lib/agt-nif.ts` line 280]

Missing the insecure-TLS fallback timeout would mean NIF lookups via the TLS fallback path still cut off at 15s despite the 25s intent.

```typescript
// nif tool inputSchema
inputSchema: z.object({
  nif: z.string().min(1)
    .describe('Angola taxpayer NIF (Número de Identificação Fiscal). Letters and digits only. Case-insensitive — normalized to uppercase internally.'),
}),
```

**Schema derivation:** HTTP route uses path param `rawNif` passed directly to `lookupTaxpayerByNif(rawNif)`, which calls `sanitizeNif` (validates `^[0-9A-Z]+$` after uppercase/trim). [VERIFIED: `src/lib/agt-nif.ts` lines 36–52]

**D-04 retry design for NIF:**
- `UPSTREAM_TIMEOUT` (statusCode 504): retryable — `retryAfterSeconds: 10`, message: "The AGT portal did not respond within 25s; it is frequently slow — retry in 10 seconds."
- `UPSTREAM_UNAVAILABLE` (statusCode 502): retryable — `retryAfterSeconds: 15`, message: "The AGT portal could not be reached — retry in 15 seconds."
- `UPSTREAM_BAD_RESPONSE` (statusCode 502): retryable — `retryAfterSeconds: 10`
- `UNPARSEABLE_RESPONSE` (statusCode 502): not retryable (portal returned something unexpected)
- `NIF_NOT_FOUND` (statusCode 404): not retryable (NIF does not exist or returned no result)
- `INVALID_NIF` (statusCode 400): not retryable (input validation)

### Pattern 5: Translation Tool Module

```typescript
// translate_text inputSchema
inputSchema: z.object({
  text: z.string().min(1)
    .describe('Text to translate. Must not be empty.'),
  to: z.string().min(2).max(12)
    .describe('Target language code (BCP 47, e.g., "en", "pt", "fr"). 2–12 lowercase letters and hyphens.'),
  from: z.string().min(2).max(12).optional()
    .describe('Source language code (BCP 47). Optional — if omitted, auto-detection is used.'),
}),
```

**Schema derivation:** HTTP route reads `body.text`, `body.to`, `body.from` as strings; `translateText` calls `sanitizeLanguageCode` which validates `^[a-z-]{2,12}$`. [VERIFIED: `src/lib/translate.ts` lines 108–128, `app/api/translate/route.ts` lines 29–33]

**D-04 retry design for translation:**
- `UPSTREAM_TIMEOUT` (statusCode 504): retryable — `retryAfterSeconds: 5`
- `UPSTREAM_UNAVAILABLE` (statusCode 502): retryable — `retryAfterSeconds: 5`
- `UPSTREAM_BAD_RESPONSE` (statusCode 502): retryable — `retryAfterSeconds: 5`
- `UNPARSEABLE_RESPONSE` (statusCode 502): not retryable
- `INVALID_TEXT` (statusCode 400): not retryable
- `INVALID_LANGUAGE` (statusCode 400): not retryable

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Error class duck-typing | Custom type guard per class | `typeof (err as any).code === 'string' && typeof (err as any).statusCode === 'number'` | Single guard works for all three domain error classes without imports |
| Currency cache | Redis, shared KV, or Vercel KV | Module-level `Map` with TTL | Free-tier lock; per-instance is sufficient for reducing cold-start hits within a session |
| Zod coercion | `z.coerce.number()` | `z.number()` | Carried-forward convention from Phases 1–2; inputs are already typed |
| Language code validation | Regex refinement in Zod schema | `z.string().min(2).max(12)` + let `translateText` validate via `sanitizeLanguageCode` | Domain function already validates and throws `TranslationError` with proper code |
| NIF validation | Regex in Zod schema | `z.string().min(1)` + let `lookupTaxpayerByNif` validate via `sanitizeNif` | Same principle; `INVALID_NIF` PortalLookupError is caught by duck-typed branch |

---

## Error Code Catalogue (verified against source)

### `CurrencyError` — `src/lib/currency.ts`

| Code | statusCode | When | Retryable |
|------|-----------|------|-----------|
| `UPSTREAM_TIMEOUT` | 504 | `AbortSignal` fires | Yes |
| `UPSTREAM_UNAVAILABLE` | 502 | fetch network error (non-TLS) | Yes |
| `CURRENCY_NOT_FOUND` | 404 | API returns 404 | No |
| `UPSTREAM_BAD_RESPONSE` | 502 | API returns non-OK, non-404 | Yes |
| `UNPARSEABLE_RESPONSE` | 502 | JSON parse fail or malformed payload | No |
| `INVALID_CURRENCY` | 400 | empty or bad currency code | No |
| `INVALID_AMOUNT` | 400 | non-finite or negative amount | No |

[VERIFIED: `src/lib/currency.ts` — all throw sites read]

### `PortalLookupError` — `src/lib/agt-nif.ts`

| Code | statusCode | When | Retryable |
|------|-----------|------|-----------|
| `UPSTREAM_TIMEOUT` | 504 | `AbortSignal` fires OR `request.setTimeout` fires | Yes |
| `UPSTREAM_UNAVAILABLE` | 502 | fetch network error | Yes |
| `UPSTREAM_BAD_RESPONSE` | 502 | portal returns non-2xx | Yes |
| `UNPARSEABLE_RESPONSE` | 502 | no result section found or missing fields | No |
| `NIF_NOT_FOUND` | 404 | portal returns known "not found" text | No |
| `INVALID_NIF` | 400 | empty or non-alphanumeric NIF | No |

[VERIFIED: `src/lib/agt-nif.ts` — all throw sites read]

### `TranslationError` — `src/lib/translate.ts`

| Code | statusCode | When | Retryable |
|------|-----------|------|-----------|
| `UPSTREAM_TIMEOUT` | 504 | `AbortSignal` fires | Yes |
| `UPSTREAM_UNAVAILABLE` | 502 | fetch network error | Yes |
| `UPSTREAM_BAD_RESPONSE` | 502 | Google returns non-OK | Yes |
| `UNPARSEABLE_RESPONSE` | 502 | JSON parse fail or empty translation | No |
| `INVALID_TEXT` | 400 | text is empty after trim | No |
| `INVALID_LANGUAGE` | 400 | empty or bad language code | No |

[VERIFIED: `src/lib/translate.ts` — all throw sites read]

### `RouteError` — `src/lib/angola/finance.ts` (finance tools only)

| Code | status | When |
|------|--------|------|
| `INVALID_INVOICE_LINES` | 400 | lines array is empty |
| `INVALID_INVOICE_LINE` | 400 | quantity ≤ 0 or unitPrice < 0 |
| `INVALID_RATE` | 400 | rate not in [0, 100] |
| `UNSUPPORTED_CPI_YEAR` | 400 | from/to year not in CPI index (2019–2025) |
| `INVALID_YEAR` | 400 | from/to does not start with a 4-digit year |

[VERIFIED: `src/lib/angola/finance.ts` — all throw sites read]

---

## Timeout Locations (exact lines, verified)

### `src/lib/currency.ts` — Change `15000` → `20000`

Line 48: `signal: AbortSignal.timeout(15000),` inside `fetchCurrencyRates`. [VERIFIED: `src/lib/currency.ts` line 48]
This is the only timeout in `currency.ts`. `convertCurrencyRates` is synchronous — no timeout needed.

### `src/lib/agt-nif.ts` — Change `15000` → `25000` in TWO locations

Line 222: `signal: AbortSignal.timeout(15000),` inside `requestPortalLookup` (primary fetch path). [VERIFIED: `src/lib/agt-nif.ts` line 222]
Line 280: `request.setTimeout(15000, () => {` inside `requestPortalLookupWithInsecureTls` (TLS fallback path). [VERIFIED: `src/lib/agt-nif.ts` line 280]

### `src/lib/translate.ts` — No change (stays 15000)

Line 46: `signal: AbortSignal.timeout(15000),` inside `translateText`. Stays as-is per D-03. [VERIFIED: `src/lib/translate.ts` line 46]

---

## Anti-Patterns to Avoid

- **Importing domain error classes into `tool-error.ts`:** D-01 is explicit — the duck-typed branch must not import `CurrencyError`, `PortalLookupError`, or `TranslationError`. This keeps the MCP infra layer domain-agnostic.
- **Swapping the RouteError/duck-typed check order:** `RouteError` has `.code` and `.status` (not `.statusCode`). If the duck-typed check came first, a `RouteError` would NOT match it (because `.statusCode` is undefined), so the ordering actually doesn't matter for correctness — but keeping `RouteError` first preserves the existing explicit intent and test baseline.
- **Changing only one timeout in `agt-nif.ts`:** The `requestPortalLookupWithInsecureTls` path bypasses `fetch` entirely and uses Node.js `https.request` — it has its own `setTimeout`. Missing it means the TLS-fallback path still cuts off at 15s.
- **Putting the D-05 cache in `src/lib/currency.ts`:** The cache belongs in the MCP tool module (`src/lib/mcp/tools/currency.ts`). Modifying `currency.ts` for MCP-specific caching would leak MCP concerns into the domain client, which the existing HTTP routes import.
- **Using `z.coerce.number()` for any input:** Carried-forward convention — always `z.number()`.
- **Trying to make `currency_convert` take rates as direct input:** `convertCurrencyRates` signature is `(lookup: CurrencyLookupResult, rawAmount: string) => CurrencyConversionResult`. The `CurrencyLookupResult` type is a large object (6 currency metadata fields + `ratesDate`, `baseCurrency`, `unitRates`). MCP clients should not construct this. The tool must call `fetchCurrencyRates` internally.

---

## Common Pitfalls

### Pitfall 1: `mcpToolHandler` regression — RouteError behavior broken
**What goes wrong:** The new duck-typed branch accidentally catches `RouteError` because `RouteError` has `code: string` but NOT `statusCode: number`. If someone adds `statusCode` to `RouteError` in the future, it would be matched by the duck-typed branch before the `instanceof RouteError` check.
**Why it happens:** Ordering or shape misread.
**How to avoid:** Keep `instanceof RouteError` first. Verify the existing `mcp-tool-error.test.ts` passes unchanged — it checks `RouteError` → `NOT_FOUND` code (not `INTERNAL_SERVER_ERROR`).
**Warning signs:** Test `'returns isError:true with code and message when RouteError is thrown'` failing.

### Pitfall 2: TLS-fallback timeout not bumped in `agt-nif.ts`
**What goes wrong:** NIF lookups that hit the TLS fallback path (`requestPortalLookupWithInsecureTls`) cut off at 15s instead of 25s. AGT portal has a self-signed or expired cert — this path is exercised in production.
**Why it happens:** Only the `requestPortalLookup` timeout is updated; the second `setTimeout(15000, ...)` in `requestPortalLookupWithInsecureTls` is missed.
**How to avoid:** Update both locations. `agt-nif.ts` line 222 AND line 280.

### Pitfall 3: Cache key normalization mismatch
**What goes wrong:** `fetchCurrencyRates("AOA")` caches under `"aoa"` but `"aoa"` from a second call is a cache hit while `"AOA"` on a third call misses (or vice versa).
**Why it happens:** `sanitizeCurrencyCode` lowercases the input, but if the cache key is computed before or after sanitization inconsistently, keys diverge.
**How to avoid:** Cache key = `baseCurrency.trim().toLowerCase()` before any sanitization call. The actual data from `fetchCurrencyRates` is already normalized (it calls `sanitizeCurrencyCode` internally).

### Pitfall 4: Spreading non-enumerable Error properties
**What goes wrong:** `Object.entries(domainError)` does not include `message`, `name`, `stack` because they're defined on `Error.prototype` as non-enumerable. The `code` and `statusCode` fields ARE enumerable (declared as `public readonly` in the constructor via TypeScript) — they will appear in `Object.entries`.
**Why it happens:** Misunderstanding of `Error` property enumerability.
**How to avoid:** Explicitly serialize `code`, `message`, `statusCode` from named accessors. Use the spread for additional enumerable properties like `retryable` and `retryAfterSeconds` (which ARE enumerable when assigned via `Object.assign`).

### Pitfall 5: `finance_inflation_adjust` — string year vs number
**What goes wrong:** Implementer uses `z.number().int()` for `from`/`to` (matching how "year" fields look), but `adjustForInflation` expects `string` arguments and calls `parseYear(from, 'from')` internally which does `value.slice(0, 4)` — a string operation.
**Why it happens:** The `from`/`to` params look like years but the function signature uses `string`.
**How to avoid:** Use `z.string()` for `from` and `to`. Pass them as strings to `adjustForInflation`. [VERIFIED: `src/lib/angola/finance.ts` lines 105–113]

---

## Validation Architecture

nyquist_validation is enabled in `.planning/config.json`. Tests follow the project convention: `src/lib/__tests__/<domain>.test.ts`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30.x |
| Config file | `jest.config.js` (present) |
| Quick run command | `pnpm test --testPathPattern=mcp-tool-error` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| D-01 | duck-typed error branch catches `CurrencyError`-shaped error | unit | `pnpm test --testPathPattern=mcp-tool-error` | ✅ (extend existing) |
| D-01 | `RouteError` still maps correctly after extension (regression) | unit | `pnpm test --testPathPattern=mcp-tool-error` | ✅ (existing tests pass) |
| D-01 | `INTERNAL_SERVER_ERROR` fallback still works for unknown errors | unit | `pnpm test --testPathPattern=mcp-tool-error` | ✅ (existing tests pass) |
| FIN-01 | `finance_vat`, `finance_invoice_total`, `finance_inflation_adjust` registered | unit | `pnpm test --testPathPattern=mcp-tools-finance` | ❌ Wave 0 |
| FIN-01 | `finance_vat` happy path returns VAT breakdown | unit | `pnpm test --testPathPattern=mcp-tools-finance` | ❌ Wave 0 |
| FIN-01 | `finance_vat` bad rate returns `isError:true` with `INVALID_RATE` | unit | `pnpm test --testPathPattern=mcp-tools-finance` | ❌ Wave 0 |
| FIN-01 | `finance_invoice_total` empty lines returns `INVALID_INVOICE_LINES` | unit | `pnpm test --testPathPattern=mcp-tools-finance` | ❌ Wave 0 |
| FIN-01 | `finance_inflation_adjust` unsupported year returns `UNSUPPORTED_CPI_YEAR` | unit | `pnpm test --testPathPattern=mcp-tools-finance` | ❌ Wave 0 |
| FIN-02 | `currency_rates`, `currency_convert` registered | unit | `pnpm test --testPathPattern=mcp-tools-currency` | ❌ Wave 0 |
| FIN-02 | `currency_rates` happy path returns `CurrencyLookupResult` JSON | unit (mock fetch) | `pnpm test --testPathPattern=mcp-tools-currency` | ❌ Wave 0 |
| FIN-02 | `currency_rates` `UPSTREAM_TIMEOUT` returns `isError:true` with `retryable:true` | unit (mock fetch) | `pnpm test --testPathPattern=mcp-tools-currency` | ❌ Wave 0 |
| FIN-02 | `currency_rates` cache hit skips fetch on second call within TTL | unit (mock fetch) | `pnpm test --testPathPattern=mcp-tools-currency` | ❌ Wave 0 |
| FIN-02 | `currency_convert` happy path returns `CurrencyConversionResult` JSON | unit (mock fetch) | `pnpm test --testPathPattern=mcp-tools-currency` | ❌ Wave 0 |
| NIF-01 | `nif_lookup` registered | unit | `pnpm test --testPathPattern=mcp-tools-nif` | ❌ Wave 0 |
| NIF-01 | `nif_lookup` happy path returns `TaxVerificationResult` JSON | unit (mock fetch) | `pnpm test --testPathPattern=mcp-tools-nif` | ❌ Wave 0 |
| NIF-01 | `nif_lookup` `UPSTREAM_TIMEOUT` returns `isError:true` with `retryable:true` and `retryAfterSeconds:10` | unit (mock fetch) | `pnpm test --testPathPattern=mcp-tools-nif` | ❌ Wave 0 |
| NIF-01 | `nif_lookup` `INVALID_NIF` returns `isError:true` with `retryable:false` | unit | `pnpm test --testPathPattern=mcp-tools-nif` | ❌ Wave 0 |
| TRN-01 | `translate_text` registered | unit | `pnpm test --testPathPattern=mcp-tools-translation` | ❌ Wave 0 |
| TRN-01 | `translate_text` happy path returns `translatedText`, `sourceLanguage`, `targetLanguage` | unit (mock fetch) | `pnpm test --testPathPattern=mcp-tools-translation` | ❌ Wave 0 |
| TRN-01 | `translate_text` `UPSTREAM_TIMEOUT` returns `isError:true` with `retryable:true` | unit (mock fetch) | `pnpm test --testPathPattern=mcp-tools-translation` | ❌ Wave 0 |
| — | registry includes `registerFinanceTools`, `registerCurrencyTools`, `registerNifTools`, `registerTranslationTools` | unit | `pnpm test --testPathPattern=mcp-registry` | ✅ (extend existing) |

### Wave 0 Gaps

- [ ] `src/lib/__tests__/mcp-tools-finance.test.ts` — covers FIN-01 (all 5 cases)
- [ ] `src/lib/__tests__/mcp-tools-currency.test.ts` — covers FIN-02 (all 5 cases including cache hit)
- [ ] `src/lib/__tests__/mcp-tools-nif.test.ts` — covers NIF-01 (all 4 cases)
- [ ] `src/lib/__tests__/mcp-tools-translation.test.ts` — covers TRN-01 (all 3 cases)

### Existing tests that must remain green

- `src/lib/__tests__/mcp-tool-error.test.ts` — all 4 existing cases must pass unchanged after D-01 extension
- `src/lib/__tests__/mcp-registry.test.ts` — will need updating in the registry integration step to verify the 4 new `register*Tools` calls

### Mock pattern for external HTTP tests

Jest's `global.fetch` mock (already used in `src/lib/__tests__/currency.test.ts`) is the established pattern:

```typescript
// Source: pattern verified in src/lib/__tests__/currency.test.ts
const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

beforeEach(() => { mockFetch.mockReset(); });
```

For `PortalLookupError` with `UPSTREAM_TIMEOUT`, simulate via `AbortSignal` by rejecting with a `DOMException` named `'TimeoutError'`:

```typescript
mockFetch.mockRejectedValueOnce(Object.assign(new DOMException('Timeout', 'TimeoutError'), { name: 'TimeoutError' }));
```

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `retryAfterSeconds: 5` for currency timeout/unavailable errors | Pattern 3 / D-04 | Planner can adjust the value — the field is discretionary (D context: "Exact retryAfterSeconds values ... Claude's Discretion") |
| A2 | `retryAfterSeconds: 10` for NIF `UPSTREAM_TIMEOUT`, `15` for `UPSTREAM_UNAVAILABLE` | Pattern 4 / D-04 | Same — discretionary per CONTEXT.md |
| A3 | `retryAfterSeconds: 5` for translation timeout/unavailable | Pattern 5 / D-04 | Same — discretionary |
| A4 | Cache key normalization before `sanitizeCurrencyCode` call | Pattern 3 | Wrong normalization → cache misses; easy to fix |

All code-level claims (signatures, error codes, timeout locations, line numbers) are `[VERIFIED]` from direct source file reads.

---

## Open Questions (RESOLVED)

1. **D-01 `mcpToolHandler` extra-property spread:** Should the duck-typed branch spread ALL additional enumerable error properties (enabling `retryable`, `retryAfterSeconds` set via `Object.assign` in tool callbacks), or should those fields be serialized explicitly? The spread approach is cleaner (domain-agnostic) but relies on `Object.assign` side-effects. **Recommendation:** Use the spread — it's still domain-agnostic and avoids the handler needing any per-field knowledge.

2. **Cache invalidation on currency data staleness:** A 60s TTL is correct for reducing Render cold-start hits. However, if the Render API returns stale rates data (its own caching), the MCP tool may return rates that are up to 60s + API cache delay old. This is acceptable per D-05 ("per-instance") but worth noting in the tool description.

3. **`mcp-registry.test.ts` update scope:** The existing registry test verifies the current 6 `register*Tools` calls. The integration step must extend it to verify 10 calls (adding finance, currency, nif, translation). The existing test file should be confirmed before the integration plan is written.

---

## Environment Availability

Step 2.6 SKIPPED for Phase 3 core tools — no new CLIs or services are required. The currency Render API, AGT portal, and Google Translate API are external services accessed via `fetch`; no local service setup is needed. All required Node.js built-ins (`https`, `AbortSignal`) are available in Node.js 22.x+. [VERIFIED: CLAUDE.md stack section]

---

## Security Domain

security_enforcement not explicitly set in `.planning/config.json` — treated as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | MCP server is public (no auth, by design — matches existing HTTP API) |
| V3 Session Management | No | Stateless; no sessions |
| V4 Access Control | No | Public endpoint |
| V5 Input Validation | Yes | Zod inputSchema + domain function sanitizers (`sanitizeCurrencyCode`, `sanitizeNif`, `sanitizeLanguageCode`) — double-validated |
| V6 Cryptography | No | No crypto in this phase |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| NIF enumeration via MCP tool | Information Disclosure | AGT portal is public; no mitigation beyond rate-limiting (MCP-05, already present) |
| Oversized translation input | Denial of Service | `translateText` passes text directly to Google API — consider `z.string().max(5000)` to guard |
| Currency code injection | Tampering | `sanitizeCurrencyCode` validates `^[a-z0-9-]{2,20}$` before constructing URL — safe |
| Module-level cache poisoning | Tampering | Cache is populated only from successful API responses; no external write path |

**Recommendation for translate_text schema:** Add `.max(5000)` to the `text` field to prevent runaway requests to Google's unofficial API.

---

## Sources

### Primary (HIGH confidence)
- `src/lib/mcp/tool-error.ts` — current `mcpToolHandler` implementation; RouteError branch read directly
- `src/lib/mcp/tools/salary.ts` — Phase 2 canonical tool pattern
- `src/lib/mcp/registry.ts` — current registry wiring
- `src/lib/route-error.ts` — `RouteError` field shape (no `statusCode`)
- `src/lib/angola/finance.ts` — all three finance function signatures + throw codes
- `src/lib/currency.ts` — `CurrencyError` class, all error codes, `fetchCurrencyRates` / `convertCurrencyRates` signatures, timeout at line 48
- `src/lib/agt-nif.ts` — `PortalLookupError` class, all error codes, `lookupTaxpayerByNif` / `sanitizeNif` signatures, timeouts at lines 222 and 280
- `src/lib/translate.ts` — `TranslationError` class, all error codes, `translateText` signature, timeout at line 46
- `app/finance/vat/route.ts`, `app/finance/invoice-total/route.ts`, `app/finance/inflation-adjust/route.ts` — HTTP parser shapes for schema derivation
- `app/api/exchange/[base]/route.ts`, `app/api/nif/[nif]/route.ts`, `app/api/translate/route.ts` — HTTP parser shapes + existing domain error class catch patterns
- `src/lib/__tests__/mcp-tool-error.test.ts` — existing test baseline (4 cases)
- `src/lib/__tests__/mcp-tools-salary.test.ts` — test pattern template
- `.planning/phases/03-external-http-tools/03-CONTEXT.md` — locked decisions D-01 through D-05
- `.planning/REQUIREMENTS.md` — FIN-01, FIN-02, NIF-01, TRN-01
- `CLAUDE.md` — stack, conventions, naming rules

### Secondary (MEDIUM confidence)
- None — all relevant facts were verified from codebase source files.

### Tertiary (LOW confidence)
- None — no training-data-only claims in this research.

---

## Metadata

**Confidence breakdown:**
- `mcpToolHandler` extension (D-01): HIGH — source read directly; duck-typed condition derived from verified class definitions
- Finance tool schemas: HIGH — signatures and HTTP route parsers both read
- Currency tool schemas + cache design: HIGH — `convertCurrencyRates` signature confirms it needs pre-fetched data
- NIF timeout (two locations): HIGH — both `requestPortalLookup` and `requestPortalLookupWithInsecureTls` read
- Error codes (all three classes): HIGH — all throw sites read in each file
- `retryAfterSeconds` values: ASSUMED — discretionary per CONTEXT.md; planner can adjust

**Research date:** 2026-06-18
**Valid until:** 2026-07-18 (stable codebase; only invalidated by changes to `currency.ts`, `agt-nif.ts`, `translate.ts`, or `finance.ts`)
