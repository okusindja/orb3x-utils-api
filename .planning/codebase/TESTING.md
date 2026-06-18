# Testing Patterns

**Analysis Date:** 2026-06-18

## Test Framework

**Runner:**
- Jest 30 (configured at `jest.config.js`)
- Next.js Jest adapter via `next/jest.js` (`createJestConfig`)
- Config: `jest.config.js`

**Assertion Library:**
- Jest built-in (`expect`) + `@testing-library/jest-dom` 6 (extended matchers)

**Run Commands:**
```bash
pnpm test              # Run all tests (watchman disabled)
pnpm test:watch        # Interactive watch mode
```

Coverage command not defined in `package.json`; can be invoked manually:
```bash
pnpm jest --coverage   # Uses v8 coverage provider
```

## Test File Organization

**Location:** Separate `__tests__/` subdirectory co-located with the module group being tested

**Pattern:**
```
src/lib/__tests__/
├── angola-banks.test.ts
├── angola-calendar.test.ts
├── angola-finance-salary.test.ts
├── angola-geo-address.test.ts
├── angola-phone.test.ts
├── angola-routes.test.ts
├── angola-time-documents.test.ts
├── currency.test.ts
└── translate.test.ts
```

**Naming:** `<domain>.test.ts` — domain name reflects the module group under test (e.g., `angola-finance-salary.test.ts` covers `src/lib/angola/finance.ts` and `src/lib/angola/salary.ts`)

## Test Structure

**Suite Organization:**
```typescript
describe('<domain> <category> utilities', () => {
  it('<plain English description of the behaviour>', () => {
    // arrange + act inline
    const result = functionUnderTest({ input });
    expect(result.field).toBe(expectedValue);
  });
});
```

- One `describe` block per file, named after the domain group
- `it()` used exclusively (not `test()`)
- No nested `describe` blocks observed
- Descriptions written as behaviour sentences, not implementation names

**Patterns:**
- Arrange-Act-Assert inlined — no separate setup variables for simple cases
- Complex fixture data (e.g., IRT bracket table in `angola-finance-salary.test.ts`) stored as a local `cases` array and iterated with `for...of`
- `beforeEach(() => jest.clearAllMocks())` used in files that mock `global.fetch`
- No `afterEach` / `afterAll` cleanup observed

## Mocking

**Framework:** Jest built-in (`jest.fn()`, `jest.Mock`)

**Patterns for `fetch` mocks:**
```typescript
// At module level
global.fetch = jest.fn();

// In beforeEach
beforeEach(() => {
  jest.clearAllMocks();
});

// Per test
(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: true,
  json: () => Promise.resolve(mockPayload),
});
```

Used in `src/lib/__tests__/currency.test.ts` and `src/lib/__tests__/translate.test.ts`.

**Route handler tests — no mocking:** `angola-routes.test.ts` invokes route handlers directly with real `Request` objects. No HTTP server is started; no Next.js server-side mocking is needed because handlers are synchronous/async functions.

```typescript
import { GET as getIban } from '@/../app/api/v1/validate/iban/route';

const response = getIban(new Request(`http://localhost/api/v1/validate/iban?iban=${iban}`));
const body = await response.json();
expect(response.status).toBe(200);
```

**What to Mock:**
- External HTTP calls (`global.fetch`) when the unit under test makes outbound requests
- No database, no auth provider, no third-party SDKs requiring mocking for the current test surface

**What NOT to Mock:**
- Business logic library functions — they are tested directly without mocks
- Route handlers — tested with real `Request` objects, not mocked

## Fixtures and Factories

**Test Data:** Inline object literals passed directly to the function under test.

Large fixture sets (tax brackets) use a local `cases` array:
```typescript
const cases = [
  { taxableIncome: 100_000, bracket: 1, rate: 0, ... },
  { taxableIncome: 120_000, bracket: 2, rate: 13, ... },
  // ... 12 entries
];

for (const testCase of cases) {
  const irt = calculateIrtForTaxableIncome({ taxableIncome: testCase.taxableIncome, year: 2026 });
  expect(irt.bracket).toBe(testCase.bracket);
}
```

**Location:** All fixture data lives inline in the test files. No shared fixture files or factory modules.

## Coverage

**Requirements:** No minimum coverage thresholds configured.

**Coverage provider:** `v8` (set in `jest.config.js`)

**View Coverage:**
```bash
pnpm jest --coverage
```

## Test Types

**Unit Tests:**
- Scope: individual library functions in `src/lib/angola/`
- Tests for pure calculation functions (salary, VAT, IRT brackets, IBAN, calendar, geo, phone)
- Files: `src/lib/__tests__/angola-*.test.ts`, `src/lib/__tests__/currency.test.ts`, `src/lib/__tests__/translate.test.ts`

**Integration Tests:**
- Scope: full Next.js route handler stack — query parsing → library call → JSON response
- Tests that query parameter parsing, validation errors, and response shape are wired correctly end-to-end
- File: `src/lib/__tests__/angola-routes.test.ts`
- Also covers binary (PDF) response routes (`Content-Type: application/pdf`, `%PDF` magic bytes check)

**E2E Tests:**
- Not used — no Playwright, Cypress, or similar framework detected

## Common Patterns

**Async Testing:**
```typescript
it('returns a PDF from the invoice document route', async () => {
  const response = await postInvoice(new Request('http://localhost/…', { method: 'POST', body: … }));
  const bytes = Buffer.from(await response.arrayBuffer());
  expect(response.status).toBe(200);
  expect(bytes.subarray(0, 4).toString()).toBe('%PDF');
});
```

**Error/Validation Testing:**
```typescript
it('returns a validation error for unsupported salary subsidy periods', async () => {
  const response = getSalaryNet(
    new Request('http://localhost/api/v1/salary/net?gross=500000&subsidyPeriod=weekly'),
  );
  const body = await response.json();
  expect(response.status).toBe(400);
  expect(body.error.code).toBe('INVALID_ENUM');
  expect(body.error.field).toBe('subsidyPeriod');
});
```

**Rejected promise testing:**
```typescript
await expect(translateText({ text: '', to: 'es' })).rejects.toThrow('The text field is required.');
```

## Test Environment Setup

`jest.setup.ts` polyfills several Node.js globals so that Next.js route handlers can be evaluated in the jsdom environment:
- `TextEncoder` / `TextDecoder` from `util`
- `ReadableStream` / `TransformStream` / `WritableStream` from `stream/web`
- `MessageChannel` / `MessagePort` from `worker_threads`
- `fetch` / `Headers` / `Request` / `Response` from `undici`

The module name mapper in `jest.config.js` resolves `@/` to `<rootDir>/src/`, matching the `tsconfig.json` path alias.

---

*Testing analysis: 2026-06-18*
