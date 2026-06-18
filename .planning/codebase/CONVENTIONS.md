# Coding Conventions

**Analysis Date:** 2026-06-18

## Naming Patterns

**Files:**
- React components: PascalCase, `.tsx` extension — e.g., `header.tsx`, `brand-lockup.tsx`
- Utility/lib modules: kebab-case, `.ts` extension — e.g., `route-error.ts`, `site-copy.ts`
- Route handlers: always named `route.ts` under Next.js App Router directory segments
- Test files: `<domain>.test.ts` inside a sibling `__tests__/` directory
- Shared route helpers: `shared.ts` co-located with their feature group (e.g., `app/salary/shared.ts`)

**Functions:**
- camelCase for all exported functions — e.g., `calculateNetSalary`, `validateAngolanIban`, `routeErrorResponse`
- Boolean-returning functions prefixed with `validate`, `check`, or `is` — e.g., `validateAngolanPhoneNumber`, `checkBusinessHours`
- Parse functions prefixed with `parse` — e.g., `parseNetSalaryQuery`, `parsePositiveNumber`, `parseEnum`
- Builders prefixed with `build` — e.g., `buildAngolanIbanFromBban`
- Formatters prefixed with `format` — e.g., `formatCurrency`, `formatGrouped`

**Variables/Constants:**
- camelCase for local variables and parameters
- SCREAMING_SNAKE_CASE for module-level constants — e.g., `SALARY_WORKING_DAYS_PER_MONTH`, `IRT_EXEMPTION_LIMITS`, `DEFAULT_SALARY_YEAR`
- `as const` used on tuple/object literals to derive literal types — e.g., `SALARY_SUBSIDY_PERIODS`

**Types:**
- PascalCase for all named types and interfaces — e.g., `TaxBracket`, `CalculatedIrt`, `SalarySubsidyPeriod`
- Types derived from `as const` arrays use `(typeof CONSTANT)[number]` — e.g., `SalarySubsidyPeriod = (typeof SALARY_SUBSIDY_PERIODS)[number]`
- Input parameter types are named with the `Input` suffix — e.g., `NetSalaryInput`, `GrossSalaryInput`
- `type` keyword preferred over `interface`

## Code Style

**Formatting:**
- No dedicated Prettier config detected; formatting is enforced through ESLint
- Single quotes for string literals in TypeScript/TSX files
- Trailing commas on multi-line structures
- 2-space indentation observed across all source files

**Linting:**
- ESLint 9 flat config at `eslint.config.mjs`
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- `eslint-disable-next-line` used sparingly for known exceptions (e.g., `react-hooks/set-state-in-effect` in `src/components/theme-provider.tsx`, `src/components/locale-provider.tsx`)
- `eslint-disable-next-line @typescript-eslint/no-require-imports` used in `jest.setup.ts` for Node.js polyfills

**TypeScript:**
- `strict: true` enabled in `tsconfig.json`
- `noEmit: true` — compilation is type-check only; bundling is done by Next.js
- `isolatedModules: true` required
- Path alias `@/*` maps to `./src/*`

## Import Organization

**Order (observed):**
1. Third-party packages (`framer-motion`, `next/*`, `react`)
2. Internal `@/` aliased imports (`@/components/…`, `@/lib/…`)
3. Relative imports (`../shared`, `./route-error`)

**Path Aliases:**
- `@/` → `./src/` (configured in `tsconfig.json` and mirrored in `jest.config.js` via `moduleNameMapper`)
- Test files under `src/lib/__tests__/` use `@/../app/…` to reach route handlers outside the `src/` tree

## Error Handling

**Strategy:** Throw-and-catch at the route boundary.

**Patterns:**
- Business logic throws `RouteError` (defined at `src/lib/route-error.ts`) with a machine-readable `code`, HTTP `status`, human-readable `message`, and optional `details`
- Route handlers wrap library calls in `try/catch` and delegate to `routeErrorResponse()` from `src/lib/http.ts`
- `routeErrorResponse()` serialises `RouteError` to `{ error: { code, message, ...details } }` JSON; falls back to `INTERNAL_SERVER_ERROR` / 500 for unknown errors
- Validation helpers in `src/lib/angola/shared.ts` (`parsePositiveNumber`, `parseEnum`, `parseIsoDate`, etc.) throw `RouteError` with field-scoped codes like `MISSING_QUERY_PARAMETER`, `INVALID_ENUM`, `INVALID_DATE`
- No generic `try/catch` inside library functions — errors propagate up to the route layer

**Error code conventions:**
- `MISSING_QUERY_PARAMETER` — required param absent
- `INVALID_NUMBER` — non-numeric or negative value
- `INVALID_INTEGER` — non-integer value
- `INVALID_ENUM` — value not in allowed set
- `INVALID_DATE` — malformed or out-of-range date
- `INTERNAL_SERVER_ERROR` — unhandled/unexpected error (route layer only)

## Logging

**Framework:** None — no logging library present.

**Patterns:**
- No `console.log` / `console.error` calls in production library code
- `console.error` and `process.exit(1)` appear only in auto-generated example code snippets inside `src/lib/docs-code.ts` (used to build documentation code samples, not production logic)

## Comments

**When to Comment:**
- Inline `// eslint-disable-next-line` with a reason when suppressing lint rules
- Block comments explain non-obvious workarounds (e.g., the polyfill block in `jest.setup.ts` explains why Fetch API globals are patched)
- No JSDoc annotations observed on exported functions

**JSDoc/TSDoc:**
- Not used — reliance on TypeScript types for self-documentation

## Function Design

**Size:** Functions are small and single-purpose; complex calculations are decomposed into private helpers (e.g., `calculateIrtForTaxableIncome` called by `calculateNetSalary` in `src/lib/angola/salary.ts`)

**Parameters:** Object destructuring with named properties preferred over positional args — e.g., `calculateVat({ amount, rate, inclusive })`, `calculateNetSalary({ grossSalary, year, mealSubsidy })`

**Return Values:** Plain objects with named fields; numeric currency values are always rounded via `formatCurrency()` from `src/lib/angola/shared.ts`

## Module Design

**Exports:**
- Named exports only — no default exports on library modules
- React components use named exports (`export function Header()`) except for a few older components using default export (e.g., `LanguageSelector` at `src/components/language-selector.tsx`)

**Barrel Files:**
- Used sparingly; `src/components/svg/index.ts` is an example
- Individual feature modules under `src/lib/angola/` are imported directly by path, not through a barrel

## Route Handler Pattern

Every API route at `app/…/route.ts` follows this structure:

```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);
  try {
    return noStoreJson(libraryFn(parseQuery(url.searchParams)));
  } catch (error) {
    return routeErrorResponse(error, 'Fallback message.');
  }
}
```

All responses set `Cache-Control: no-store` via `noStoreJson()` / `noStoreBinary()` from `src/lib/http.ts`.

---

*Convention analysis: 2026-06-18*
