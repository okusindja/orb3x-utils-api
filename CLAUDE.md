<!-- GSD:project-start source:PROJECT.md -->
## Project

**orb3x-utils-api**

A Next.js 16 API and documentation site providing Angola-specific utilities — salary/tax
calculation, phone validation, geolocation, address parsing, finance, currency exchange,
NIF lookup (AGT portal), calendar/holidays, and PDF document generation (invoice, receipt,
contract). This milestone adds a **public MCP (Model Context Protocol) server**, deployed on
Vercel's free tier, that exposes every existing utility domain as MCP tools so AI agents and
MCP-compatible clients can call them directly.

**Core Value:** AI clients (and any MCP-compatible tool) can reliably invoke the Angola utility functions as
MCP tools over a single hosted endpoint — reusing the existing `src/lib/angola/` domain logic,
with zero new paid infrastructure.

### Constraints

- **Tech stack**: Must stay within Next.js 16 App Router + TypeScript; reuse `src/lib/angola/` logic.
- **Budget**: Free Vercel tier only — no Redis, no paid storage, no paid add-ons.
- **Compatibility**: MCP server runs on Node.js runtime / Fluid Compute (no Edge).
- **Consistency**: MCP tool errors should map to the existing `RouteError` structured error shape.
- **i18n**: New docs content must follow the existing 7-locale deep-merge site-copy pattern.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.x - All application code, API routes, and libraries under `app/`, `src/`
- CSS (Tailwind) - Styling via `app/globals.css` and Tailwind utility classes
- JavaScript (config files) - `jest.config.js`, `eslint.config.mjs`, `postcss.config.mjs`
## Runtime
- Node.js 22.x (local), 24.x (Vercel production — per `.vercel/project.json`)
- pnpm (primary, lockfile present)
- Lockfile: `pnpm-lock.yaml` — present and committed
## Frameworks
- Next.js 16.2.1 — Full-stack React framework, App Router, API routes
- React 19.2.4 — UI rendering (`app/layout.tsx`, `src/components/`)
- React DOM 19.2.4 — DOM bindings
- Tailwind CSS 4.x — Utility-first CSS (`app/globals.css`)
- PostCSS — via `postcss.config.mjs` using `@tailwindcss/postcss`
- tailwind-merge 3.x — Class merging utility (`src/lib/utils.ts`)
- clsx 2.x — Conditional class names
- Framer Motion 12.x — UI animations (`src/components/`)
- i18next 25.x — Core i18n engine (`src/lib/i18n.ts`)
- react-i18next 16.x — React bindings
- next-i18next 15.x — Next.js adapter
- i18next-resources-to-backend 1.x — Lazy-loads locale JSON files
- Supported languages: `en`, `pt`, `es`, `fr`, `de`, `zh`, `ja`
- Locale files: `src/locales/{language}/` and `public/locales/`
- Jest 30.x — Test runner (`jest.config.js`)
- jest-environment-jsdom 30.x — Browser-like environment
- @testing-library/react 16.x — React component testing
- @testing-library/jest-dom 6.x — DOM matchers
- SWC — Rust-based TypeScript/JSX transpiler (via Next.js, cache at `.swc/`)
- ESLint 9.x — Linting (`eslint.config.mjs` using `eslint-config-next`)
## Key Dependencies
- `next` 16.2.1 — Entire server and routing infrastructure
- `react` / `react-dom` 19.2.4 — UI framework
- `pdf-lib` 1.17.1 — PDF generation for invoice/receipt documents (`src/lib/angola/documents.ts`)
- `cheerio` 1.2.0 — HTML scraping for Angola tax portal NIF lookup (`src/lib/agt-nif.ts`)
- `shiki` 4.x — Syntax highlighting for documentation code samples (`src/lib/docs-code.ts`)
- `@radix-ui/react-scroll-area` 1.x — Accessible scroll container
- `@radix-ui/react-select` 2.x — Accessible select component
- `@radix-ui/react-use-controllable-state` 1.x — Radix state hook
- `lucide-react` 1.x — Icon library
- `@icons-pack/react-simple-icons` 13.x — Brand/tech icons
- `@vercel/analytics` 2.x — Vercel web analytics (`app/layout.tsx`)
## Configuration
- `.env.local` — Local environment overrides (present, contents not read)
- `.env.development.local` — Development-specific overrides (present, contents not read)
- No public env vars (`NEXT_PUBLIC_*`) found in source — all integrations use server-side env vars only
- `next.config.ts` — Next.js configuration; sets `output: 'standalone'`, defines URL redirect rules mapping shorthand paths to `/api/v1/` equivalents
- `tsconfig.json` — TypeScript strict mode, `ES2017` target, path alias `@/*` → `src/*`
- `postcss.config.mjs` — PostCSS with Tailwind CSS plugin
## Platform Requirements
- Node.js 22.x+
- pnpm (lockfile at root)
- Run dev: `pnpm dev` (or `npm run dev`)
- Run tests: `pnpm test`
- Deployed to Vercel (project ID: `prj_cNXrJK1P2tTUuVCuv3B4zd22AhAr`, org: `team_gTjNDevyykvdHor44NtqKegA`)
- Node.js 24.x on Vercel
- Standalone Next.js build output (`.next/standalone/`)
- No Docker or container config in repo — Vercel handles deployment
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React components: PascalCase, `.tsx` extension — e.g., `header.tsx`, `brand-lockup.tsx`
- Utility/lib modules: kebab-case, `.ts` extension — e.g., `route-error.ts`, `site-copy.ts`
- Route handlers: always named `route.ts` under Next.js App Router directory segments
- Test files: `<domain>.test.ts` inside a sibling `__tests__/` directory
- Shared route helpers: `shared.ts` co-located with their feature group (e.g., `app/salary/shared.ts`)
- camelCase for all exported functions — e.g., `calculateNetSalary`, `validateAngolanIban`, `routeErrorResponse`
- Boolean-returning functions prefixed with `validate`, `check`, or `is` — e.g., `validateAngolanPhoneNumber`, `checkBusinessHours`
- Parse functions prefixed with `parse` — e.g., `parseNetSalaryQuery`, `parsePositiveNumber`, `parseEnum`
- Builders prefixed with `build` — e.g., `buildAngolanIbanFromBban`
- Formatters prefixed with `format` — e.g., `formatCurrency`, `formatGrouped`
- camelCase for local variables and parameters
- SCREAMING_SNAKE_CASE for module-level constants — e.g., `SALARY_WORKING_DAYS_PER_MONTH`, `IRT_EXEMPTION_LIMITS`, `DEFAULT_SALARY_YEAR`
- `as const` used on tuple/object literals to derive literal types — e.g., `SALARY_SUBSIDY_PERIODS`
- PascalCase for all named types and interfaces — e.g., `TaxBracket`, `CalculatedIrt`, `SalarySubsidyPeriod`
- Types derived from `as const` arrays use `(typeof CONSTANT)[number]` — e.g., `SalarySubsidyPeriod = (typeof SALARY_SUBSIDY_PERIODS)[number]`
- Input parameter types are named with the `Input` suffix — e.g., `NetSalaryInput`, `GrossSalaryInput`
- `type` keyword preferred over `interface`
## Code Style
- No dedicated Prettier config detected; formatting is enforced through ESLint
- Single quotes for string literals in TypeScript/TSX files
- Trailing commas on multi-line structures
- 2-space indentation observed across all source files
- ESLint 9 flat config at `eslint.config.mjs`
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- `eslint-disable-next-line` used sparingly for known exceptions (e.g., `react-hooks/set-state-in-effect` in `src/components/theme-provider.tsx`, `src/components/locale-provider.tsx`)
- `eslint-disable-next-line @typescript-eslint/no-require-imports` used in `jest.setup.ts` for Node.js polyfills
- `strict: true` enabled in `tsconfig.json`
- `noEmit: true` — compilation is type-check only; bundling is done by Next.js
- `isolatedModules: true` required
- Path alias `@/*` maps to `./src/*`
## Import Organization
- `@/` → `./src/` (configured in `tsconfig.json` and mirrored in `jest.config.js` via `moduleNameMapper`)
- Test files under `src/lib/__tests__/` use `@/../app/…` to reach route handlers outside the `src/` tree
## Error Handling
- Business logic throws `RouteError` (defined at `src/lib/route-error.ts`) with a machine-readable `code`, HTTP `status`, human-readable `message`, and optional `details`
- Route handlers wrap library calls in `try/catch` and delegate to `routeErrorResponse()` from `src/lib/http.ts`
- `routeErrorResponse()` serialises `RouteError` to `{ error: { code, message, ...details } }` JSON; falls back to `INTERNAL_SERVER_ERROR` / 500 for unknown errors
- Validation helpers in `src/lib/angola/shared.ts` (`parsePositiveNumber`, `parseEnum`, `parseIsoDate`, etc.) throw `RouteError` with field-scoped codes like `MISSING_QUERY_PARAMETER`, `INVALID_ENUM`, `INVALID_DATE`
- No generic `try/catch` inside library functions — errors propagate up to the route layer
- `MISSING_QUERY_PARAMETER` — required param absent
- `INVALID_NUMBER` — non-numeric or negative value
- `INVALID_INTEGER` — non-integer value
- `INVALID_ENUM` — value not in allowed set
- `INVALID_DATE` — malformed or out-of-range date
- `INTERNAL_SERVER_ERROR` — unhandled/unexpected error (route layer only)
## Logging
- No `console.log` / `console.error` calls in production library code
- `console.error` and `process.exit(1)` appear only in auto-generated example code snippets inside `src/lib/docs-code.ts` (used to build documentation code samples, not production logic)
## Comments
- Inline `// eslint-disable-next-line` with a reason when suppressing lint rules
- Block comments explain non-obvious workarounds (e.g., the polyfill block in `jest.setup.ts` explains why Fetch API globals are patched)
- No JSDoc annotations observed on exported functions
- Not used — reliance on TypeScript types for self-documentation
## Function Design
## Module Design
- Named exports only — no default exports on library modules
- React components use named exports (`export function Header()`) except for a few older components using default export (e.g., `LanguageSelector` at `src/components/language-selector.tsx`)
- Used sparingly; `src/components/svg/index.ts` is an example
- Individual feature modules under `src/lib/angola/` are imported directly by path, not through a barrel
## Route Handler Pattern
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```text
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
- API business logic lives in `app/[domain]/[action]/route.ts` (not under `app/api/`)
- `app/api/v1/` contains thin re-export shims that add Vercel-specific config (`runtime`, `dynamic`, `maxDuration`)
- All Angola-specific domain logic is isolated in `src/lib/angola/`
- External integrations (currency, translate) live as standalone modules directly under `src/lib/`
- Every API route is `force-dynamic` with no caching at the route level; Cache-Control headers are set explicitly via `src/lib/http.ts`
## Layers
- Purpose: HTTP request parsing and response serialization
- Location: `app/[domain]/[action]/route.ts`
- Contains: GET/POST handler functions, query parsing via shared.ts files
- Depends on: `src/lib/angola/`, `src/lib/http.ts`, domain shared parsers
- Used by: Next.js framework, versioned shim re-exports
- Purpose: Expose versioned URLs (`/api/v1/...`) with Vercel runtime configuration
- Location: `app/api/v1/[domain]/[action]/route.ts`
- Contains: Single re-export + `runtime`, `dynamic`, `maxDuration` declarations
- Depends on: Real route handlers under `app/[domain]/`
- Used by: API consumers via `/api/v1/` URLs
- Purpose: Pure, testable business logic for Angola-specific utilities
- Location: `src/lib/angola/`
- Contains: salary, phone, geo, address, calendar, finance, time, documents, banks, shared utilities
- Depends on: `src/lib/route-error.ts` for validation errors
- Used by: Route handlers
- Purpose: Wraps third-party HTTP calls with typed error classes
- Location: `src/lib/currency.ts`, `src/lib/translate.ts`, `src/lib/agt-nif.ts`
- Contains: Fetch calls, domain-specific error classes (`CurrencyError`, `TranslationError`, `PortalLookupError`)
- Depends on: Native `fetch`
- Used by: Route handlers in `app/api/exchange/`, `app/api/translate/`, `app/api/nif/`
- Purpose: Shared response factories enforcing `Cache-Control: no-store` and consistent error shape
- Location: `src/lib/http.ts`
- Contains: `noStoreJson()`, `noStoreBinary()`, `routeErrorResponse()`, `parseJsonBody()`
- Depends on: `src/lib/route-error.ts`
- Used by: All route handlers
- Purpose: Documentation website and marketing pages
- Location: `src/components/`, `app/page.tsx`, `app/docs/`, `app/faq/`, etc.
- Contains: React components, page layouts, SEO metadata
- Depends on: `src/lib/seo.ts`, `src/lib/site-content.ts`, `src/lib/site-copy.ts`, `src/locales/`
- Used by: Next.js SSR page routes
## Data Flow
### Primary API Request Path (e.g., GET /api/v1/salary/net)
### External Proxy Request Path (e.g., GET /api/v1/exchange/[base])
### Document Generation Path (e.g., POST /api/v1/documents/invoice)
### Docs Page Render Path
- No client-side global state for API logic; all API routes are stateless
- Frontend uses React context only: `LocaleProvider` (`src/components/locale-provider.tsx`) and `ThemeProvider` (`src/components/theme-provider.tsx`)
- i18n state managed by i18next singleton initialized in `src/lib/i18n.ts`
## Key Abstractions
- Purpose: Typed error thrown inside domain logic to produce structured HTTP error responses
- Examples: `src/lib/route-error.ts`, used throughout `src/lib/angola/`
- Pattern: `throw new RouteError(code, message, status, details)` → caught in handler → `routeErrorResponse()` shapes it
- Purpose: Typed errors for external service failures; each has `statusCode` and `code`
- Examples: `CurrencyError` in `src/lib/currency.ts`, `TranslationError` in `src/lib/translate.ts`, `PortalLookupError` in `src/lib/agt-nif.ts`
- Pattern: Service functions throw these; legacy route handlers catch and shape manually (not via `routeErrorResponse()`)
- Purpose: Decouple business logic URL from versioned public URL; allows adding Vercel config centrally
- Examples: Every file under `app/api/v1/`
- Pattern:
- Purpose: Centralize URLSearchParams → typed input parsing and validation for a domain group
- Examples: `app/salary/shared.ts`, `app/phone/shared.ts` (implicit in individual routes)
- Pattern: `parsePositiveNumber()`, `parseEnum()`, `parseIsoDate()` from `src/lib/angola/shared.ts`
- Purpose: Multilingual static site content with deep-merge override pattern
- Examples: `src/locales/site/en.ts` (base), `src/locales/site/pt.ts` (override)
- Pattern: `mergeDeep(enSiteCopy, localeCopy)` applied per locale in `src/lib/site-copy.ts`
## Entry Points
- Location: `app/layout.tsx`
- Triggers: Every page render
- Responsibilities: HTML shell, fonts, global providers, SEO metadata, JSON-LD
- Location: `app/[domain]/[action]/route.ts` (real) and `app/api/v1/[domain]/[action]/route.ts` (shims)
- Triggers: HTTP requests to `/api/v1/...` or legacy paths
- Responsibilities: Parse request, call domain logic, return response
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
### Deleted Routes Still Referenced in Versioned Shims
## Error Handling
- Domain validation: `throw new RouteError(code, message, 400, { field })` in `src/lib/angola/*.ts`
- External service errors: Domain-specific error classes (`CurrencyError`, `TranslationError`) thrown in `src/lib/*.ts`
- Catch-all: `routeErrorResponse(error, fallbackMessage)` in every route handler's catch block
- Error response shape: `{ error: { code, message, ...details } }` with appropriate HTTP status
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
