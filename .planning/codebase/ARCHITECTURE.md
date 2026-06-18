<!-- refreshed: 2026-06-18 -->
# Architecture

**Analysis Date:** 2026-06-18

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        Next.js App Router (app/)                        │
├────────────────────────────┬────────────────────────────────────────────┤
│      UI Pages (SSR)        │           API Routes                       │
│  `app/page.tsx`            │  `app/[domain]/[action]/route.ts`          │
│  `app/docs/[slug]/page.tsx`│  (real implementation)                     │
│  `app/faq/page.tsx`        ├────────────────────────────────────────────┤
│  `app/examples/page.tsx`   │    Versioned Shims `app/api/v1/.../route.ts│
│  `app/legal/*/page.tsx`    │    (re-export + Vercel runtime config)     │
└─────────────┬──────────────┴────────────────┬───────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       src/ — Application Core                           │
├─────────────────┬──────────────────┬──────────────────┬─────────────────┤
│  Components     │  Lib (Pure Logic)│  Locales         │  Locales/site   │
│ `src/components`│ `src/lib/angola` │ `src/locales/XX` │`src/locales/site│
│  pages, ui, seo │ `src/lib/*.ts`   │ i18next JSON     │ TypeScript copy │
└─────────────────┴──────────────────┴──────────────────┴─────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      External Services                                  │
│  Google Translate API (unofficial)  |  currency-rate-exchange-api       │
│  AGT (Angola Tax Authority) Portal  |  pdf-lib (local PDF generation)   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| App Layout | Root HTML shell, providers, SEO tags | `app/layout.tsx` |
| Real Route Handlers | Business logic entry for each API endpoint | `app/[domain]/[action]/route.ts` |
| Versioned Shims | Re-export real routes with Vercel runtime config | `app/api/v1/[domain]/[action]/route.ts` |
| Legacy Shims | Re-export real routes for old URL paths | `app/api/exchange/[base]/route.ts`, `app/api/nif/[nif]/route.ts`, `app/api/translate/route.ts` |
| Angola Domain Logic | Pure business logic: salary, phone, geo, finance, calendar, address, documents | `src/lib/angola/*.ts` |
| HTTP Helpers | Response factories, error handling | `src/lib/http.ts` |
| RouteError | Typed error class for structured error responses | `src/lib/route-error.ts` |
| Currency Client | Fetches rates from external API | `src/lib/currency.ts` |
| Translation Client | Proxies to Google Translate unofficial API | `src/lib/translate.ts` |
| SEO | Metadata factories, JSON-LD builders | `src/lib/seo.ts` |
| Site Copy | Multilingual site text (7 locales) | `src/locales/site/*.ts` |
| i18n | Client-side i18next initialization | `src/lib/i18n.ts` |
| UI Components | Buttons, cards, code blocks, scroll areas | `src/components/ui/*.tsx` |
| Page Components | Full page renderers (used by Next.js pages) | `src/components/pages/*.tsx` |

## Pattern Overview

**Overall:** Feature-grouped Next.js App Router monolith with two-tier routing (real handlers + versioned shims)

**Key Characteristics:**
- API business logic lives in `app/[domain]/[action]/route.ts` (not under `app/api/`)
- `app/api/v1/` contains thin re-export shims that add Vercel-specific config (`runtime`, `dynamic`, `maxDuration`)
- All Angola-specific domain logic is isolated in `src/lib/angola/`
- External integrations (currency, translate) live as standalone modules directly under `src/lib/`
- Every API route is `force-dynamic` with no caching at the route level; Cache-Control headers are set explicitly via `src/lib/http.ts`

## Layers

**Route Layer:**
- Purpose: HTTP request parsing and response serialization
- Location: `app/[domain]/[action]/route.ts`
- Contains: GET/POST handler functions, query parsing via shared.ts files
- Depends on: `src/lib/angola/`, `src/lib/http.ts`, domain shared parsers
- Used by: Next.js framework, versioned shim re-exports

**Versioned Shim Layer:**
- Purpose: Expose versioned URLs (`/api/v1/...`) with Vercel runtime configuration
- Location: `app/api/v1/[domain]/[action]/route.ts`
- Contains: Single re-export + `runtime`, `dynamic`, `maxDuration` declarations
- Depends on: Real route handlers under `app/[domain]/`
- Used by: API consumers via `/api/v1/` URLs

**Domain Logic Layer:**
- Purpose: Pure, testable business logic for Angola-specific utilities
- Location: `src/lib/angola/`
- Contains: salary, phone, geo, address, calendar, finance, time, documents, banks, shared utilities
- Depends on: `src/lib/route-error.ts` for validation errors
- Used by: Route handlers

**External Client Layer:**
- Purpose: Wraps third-party HTTP calls with typed error classes
- Location: `src/lib/currency.ts`, `src/lib/translate.ts`, `src/lib/agt-nif.ts`
- Contains: Fetch calls, domain-specific error classes (`CurrencyError`, `TranslationError`, `PortalLookupError`)
- Depends on: Native `fetch`
- Used by: Route handlers in `app/api/exchange/`, `app/api/translate/`, `app/api/nif/`

**HTTP Utilities Layer:**
- Purpose: Shared response factories enforcing `Cache-Control: no-store` and consistent error shape
- Location: `src/lib/http.ts`
- Contains: `noStoreJson()`, `noStoreBinary()`, `routeErrorResponse()`, `parseJsonBody()`
- Depends on: `src/lib/route-error.ts`
- Used by: All route handlers

**UI / Frontend Layer:**
- Purpose: Documentation website and marketing pages
- Location: `src/components/`, `app/page.tsx`, `app/docs/`, `app/faq/`, etc.
- Contains: React components, page layouts, SEO metadata
- Depends on: `src/lib/seo.ts`, `src/lib/site-content.ts`, `src/lib/site-copy.ts`, `src/locales/`
- Used by: Next.js SSR page routes

## Data Flow

### Primary API Request Path (e.g., GET /api/v1/salary/net)

1. Request hits versioned shim (`app/api/v1/salary/net/route.ts`)
2. Shim re-exports the real handler from `app/salary/net/route.ts`
3. Real handler parses query params via shared parser (`app/salary/shared.ts`)
4. Parsed input passed to domain logic (`src/lib/angola/salary.ts` → `calculateNetSalary()`)
5. Result returned via `noStoreJson()` from `src/lib/http.ts`
6. On error, `routeErrorResponse()` produces structured JSON with `error.code` + `error.message`

### External Proxy Request Path (e.g., GET /api/v1/exchange/[base])

1. Request hits shim (`app/api/v1/exchange/[base]/route.ts`)
2. Shim re-exports from legacy handler (`app/api/exchange/[base]/route.ts`)
3. Handler calls `fetchCurrencyRates()` in `src/lib/currency.ts`
4. `currency.ts` fetches from `https://currency-rate-exchange-api.onrender.com`
5. Response shaped and returned via `NextResponse.json()` with `Cache-Control: no-store`
6. `CurrencyError` caught and returned as structured error JSON

### Document Generation Path (e.g., POST /api/v1/documents/invoice)

1. Request hits shim (`app/api/v1/documents/invoice/route.ts`)
2. Shim re-exports from `app/documents/invoice/route.ts`
3. Handler parses JSON body via `parseJsonBody()` from `src/lib/http.ts`
4. Calls `generateInvoicePdf()` in `src/lib/angola/documents.ts`
5. PDF bytes returned via `noStoreBinary()` with `Content-Type: application/pdf`

### Docs Page Render Path

1. Request hits `app/docs/[slug]/page.tsx`
2. `isDocsPageSlug()` validates slug (`src/lib/site-content.ts`)
3. `getLocalizedDocsPage()` fetches copy from locale map (`src/lib/site-copy.ts`)
4. `DocsDetailContent` component rendered (`src/components/docs-detail-content.tsx`)
5. JSON-LD structured data injected via `src/components/seo/json-ld.tsx`

**State Management:**
- No client-side global state for API logic; all API routes are stateless
- Frontend uses React context only: `LocaleProvider` (`src/components/locale-provider.tsx`) and `ThemeProvider` (`src/components/theme-provider.tsx`)
- i18n state managed by i18next singleton initialized in `src/lib/i18n.ts`

## Key Abstractions

**RouteError:**
- Purpose: Typed error thrown inside domain logic to produce structured HTTP error responses
- Examples: `src/lib/route-error.ts`, used throughout `src/lib/angola/`
- Pattern: `throw new RouteError(code, message, status, details)` → caught in handler → `routeErrorResponse()` shapes it

**Domain-specific Error Classes:**
- Purpose: Typed errors for external service failures; each has `statusCode` and `code`
- Examples: `CurrencyError` in `src/lib/currency.ts`, `TranslationError` in `src/lib/translate.ts`, `PortalLookupError` in `src/lib/agt-nif.ts`
- Pattern: Service functions throw these; legacy route handlers catch and shape manually (not via `routeErrorResponse()`)

**Versioned Shim Pattern:**
- Purpose: Decouple business logic URL from versioned public URL; allows adding Vercel config centrally
- Examples: Every file under `app/api/v1/`
- Pattern:
  ```typescript
  import { GET as handler } from '../../../../salary/net/route';
  export const runtime = 'nodejs';
  export const dynamic = 'force-dynamic';
  export const maxDuration = 30;
  export const GET = handler;
  ```

**Shared Query Parsers:**
- Purpose: Centralize URLSearchParams → typed input parsing and validation for a domain group
- Examples: `app/salary/shared.ts`, `app/phone/shared.ts` (implicit in individual routes)
- Pattern: `parsePositiveNumber()`, `parseEnum()`, `parseIsoDate()` from `src/lib/angola/shared.ts`

**Site Copy System:**
- Purpose: Multilingual static site content with deep-merge override pattern
- Examples: `src/locales/site/en.ts` (base), `src/locales/site/pt.ts` (override)
- Pattern: `mergeDeep(enSiteCopy, localeCopy)` applied per locale in `src/lib/site-copy.ts`

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every page render
- Responsibilities: HTML shell, fonts, global providers, SEO metadata, JSON-LD

**API Routes:**
- Location: `app/[domain]/[action]/route.ts` (real) and `app/api/v1/[domain]/[action]/route.ts` (shims)
- Triggers: HTTP requests to `/api/v1/...` or legacy paths
- Responsibilities: Parse request, call domain logic, return response

**Next.js Config:**
- Location: `next.config.ts`
- Responsibilities: Redirects legacy top-level paths (`/salary/*`, `/phone/*`, etc.) to `/api/v1/...`; standalone output mode

## Architectural Constraints

- **Threading:** Single-threaded Node.js serverless functions; no worker threads
- **Global state:** `src/lib/i18n.ts` holds an i18next singleton (module-level `initialized` flag); `src/lib/seo.ts` has module-level constants (`SITE_URL`, `SITE_NAME`)
- **Circular imports:** None detected
- **Runtime:** All routes export `runtime = 'nodejs'` — Edge runtime not used anywhere
- **No database:** No ORM, no database connections; all data is either computed, from static files (`src/lib/angola/`), or fetched from external APIs
- **PDF generation:** Uses `pdf-lib` for in-process PDF creation; no external PDF service

## Anti-Patterns

### Legacy Route Handlers Bypass `routeErrorResponse()`

**What happens:** `app/api/nif/[nif]/route.ts` and `app/api/exchange/[base]/route.ts` catch errors and build JSON error responses inline using `NextResponse.json()` directly.
**Why it's wrong:** Produces inconsistent error shape compared to routes that use `routeErrorResponse()` from `src/lib/http.ts`; duplication of error formatting logic.
**Do this instead:** Use `routeErrorResponse()` from `src/lib/http.ts` as done in `app/salary/net/route.ts` and all routes under `app/salary/`, `app/phone/`, etc.

### Deleted Routes Still Referenced in Versioned Shims

**What happens:** `app/api/v1/documents/contract/route.ts` and `app/api/v1/documents/receipt/route.ts` exist as shims but the corresponding real routes `app/documents/contract/route.ts` and `app/documents/receipt/route.ts` were deleted (git status shows them as deleted).
**Why it's wrong:** The shims import from files that no longer exist, causing build errors.
**Do this instead:** Either restore the real route implementations or delete the orphaned shims.

## Error Handling

**Strategy:** Throw `RouteError` (or domain-specific error class) deep in logic; catch at route handler boundary; serialize using `routeErrorResponse()`.

**Patterns:**
- Domain validation: `throw new RouteError(code, message, 400, { field })` in `src/lib/angola/*.ts`
- External service errors: Domain-specific error classes (`CurrencyError`, `TranslationError`) thrown in `src/lib/*.ts`
- Catch-all: `routeErrorResponse(error, fallbackMessage)` in every route handler's catch block
- Error response shape: `{ error: { code, message, ...details } }` with appropriate HTTP status

## Cross-Cutting Concerns

**Logging:** No structured logging framework; errors fall through to Vercel function logs via unhandled exceptions or console
**Validation:** Input validation done in `src/lib/angola/shared.ts` parser helpers; throws `RouteError` on invalid input
**Authentication:** None — all API routes are public with no authentication or rate limiting
**Cache-Control:** All responses explicitly set `Cache-Control: no-store` via `noStoreJson()`/`noStoreBinary()` or manual header on `NextResponse.json()`
**Analytics:** Vercel Analytics injected in `src/components/client-providers.tsx` via `<Analytics />` from `@vercel/analytics/next`

---

*Architecture analysis: 2026-06-18*
