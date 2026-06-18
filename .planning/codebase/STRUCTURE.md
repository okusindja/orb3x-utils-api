# Codebase Structure

**Analysis Date:** 2026-06-18

## Directory Layout

```
orb3x-utils-api/
├── app/                          # Next.js App Router root
│   ├── layout.tsx                # Root HTML shell, providers, global SEO
│   ├── page.tsx                  # Home page
│   ├── globals.css               # Global styles
│   ├── [domain]/                 # Real API route implementations (NOT under api/)
│   │   └── [action]/route.ts     # Actual handler logic
│   ├── api/
│   │   ├── v1/                   # Versioned shims (re-export + Vercel config)
│   │   │   └── [domain]/[action]/route.ts
│   │   ├── exchange/[base]/      # Legacy shim (pre-v1 URL)
│   │   ├── nif/[nif]/            # Legacy shim (pre-v1 URL)
│   │   └── translate/            # Legacy shim (pre-v1 URL)
│   ├── docs/
│   │   ├── page.tsx              # Docs overview page
│   │   └── [slug]/page.tsx       # Individual docs page
│   ├── examples/page.tsx
│   ├── faq/page.tsx
│   ├── legal/
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   └── api/page.tsx              # API index page
├── src/
│   ├── components/               # React UI components
│   │   ├── pages/                # Full page-level components
│   │   │   ├── home-page.tsx
│   │   │   ├── docs-overview-page.tsx
│   │   │   ├── faq-page.tsx
│   │   │   ├── privacy-policy-page.tsx
│   │   │   └── terms-of-use-page.tsx
│   │   ├── ui/                   # Primitive UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── code-block.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   └── separator.tsx
│   │   ├── seo/                  # SEO-specific components
│   │   │   └── json-ld.tsx
│   │   ├── svg/                  # SVG icon components
│   │   ├── brand-lockup.tsx
│   │   ├── client-providers.tsx  # LocaleProvider + ThemeProvider + Analytics wrapper
│   │   ├── docs-detail-content.tsx
│   │   ├── footer.tsx
│   │   ├── header.tsx
│   │   ├── icons.tsx
│   │   ├── language-selector.tsx
│   │   ├── locale-provider.tsx
│   │   ├── route-progress.tsx
│   │   ├── sidebar.tsx
│   │   ├── site-primitives.tsx   # Shared site layout primitives
│   │   └── theme-provider.tsx
│   ├── lib/                      # Application logic and utilities
│   │   ├── angola/               # Angola-specific domain logic
│   │   │   ├── address.ts
│   │   │   ├── banks.ts
│   │   │   ├── bank-images.ts    # ~1.3 MB base64 bank logo data
│   │   │   ├── calendar.ts
│   │   │   ├── documents.ts      # PDF generation via pdf-lib
│   │   │   ├── finance.ts
│   │   │   ├── geo.ts
│   │   │   ├── phone.ts
│   │   │   ├── salary.ts         # IRT tax table + salary calculations
│   │   │   ├── shared.ts         # Shared parsers, string utils, formatters
│   │   │   └── time.ts
│   │   ├── __tests__/            # Unit and integration tests
│   │   │   ├── angola-calendar.test.ts
│   │   │   ├── angola-banks.test.ts
│   │   │   ├── angola-finance-salary.test.ts
│   │   │   ├── angola-geo-address.test.ts
│   │   │   ├── angola-phone.test.ts
│   │   │   ├── angola-routes.test.ts
│   │   │   ├── angola-time-documents.test.ts
│   │   │   ├── currency.test.ts
│   │   │   └── translate.test.ts
│   │   ├── agt-nif.ts            # AGT portal scraper / NIF lookup
│   │   ├── currency.ts           # External currency rate client
│   │   ├── docs-code.ts          # Code sample utilities for docs
│   │   ├── http.ts               # Response factories + error helpers
│   │   ├── i18n.ts               # i18next client initialization
│   │   ├── og-image.tsx          # OpenGraph image generation
│   │   ├── route-error.ts        # RouteError class
│   │   ├── seo.ts                # Metadata factories, JSON-LD builders
│   │   ├── site-content.ts       # Docs page slugs, types, type guards
│   │   ├── site-copy.ts          # Multilingual site copy with deep-merge
│   │   ├── theme.ts              # Theme configuration
│   │   ├── translate.ts          # Google Translate unofficial API client
│   │   └── utils.ts              # Minimal shared utilities
│   └── locales/
│       ├── site/                 # TypeScript site copy (SSR-safe)
│       │   ├── en.ts             # Base locale (English)
│       │   ├── de.ts
│       │   ├── es.ts
│       │   ├── fr.ts
│       │   ├── ja.ts
│       │   ├── pt.ts
│       │   ├── zh.ts
│       │   ├── docs/             # Docs page locale overrides
│       │   └── types.ts
│       ├── en/common.json        # i18next JSON for client-side UI
│       ├── de/
│       ├── es/
│       ├── fr/
│       ├── ja/
│       ├── pt/
│       └── zh/
├── public/
│   ├── icons/                    # Favicon + PWA icons
│   └── locales/                  # (reserved, may be empty)
├── scripts/
│   └── generate-site-locales.mjs # Script to generate locale files
├── .planning/
│   └── codebase/                 # GSD codebase maps
├── next.config.ts                # Next.js config + legacy redirects
├── tsconfig.json                 # TypeScript config (`@/*` → `src/*`)
├── jest.config.js                # Jest config
├── jest.setup.ts                 # Jest setup
├── eslint.config.mjs
├── postcss.config.mjs
├── pnpm-workspace.yaml
└── package.json
```

## Directory Purposes

**`app/[domain]/[action]/`:**
- Purpose: Real API route handler implementations (business logic entry points)
- Contains: `route.ts` files with GET/POST handlers; `shared.ts` for domain-level query parsers
- Key files: `app/salary/net/route.ts`, `app/documents/invoice/route.ts`, `app/phone/validate/route.ts`

**`app/api/v1/[domain]/[action]/`:**
- Purpose: Versioned public API URL shims — re-export real handlers + declare Vercel runtime config
- Contains: Thin `route.ts` files, typically 7 lines each
- Key files: `app/api/v1/salary/net/route.ts`, `app/api/v1/phone/validate/route.ts`

**`app/api/` (legacy, non-v1):**
- Purpose: Backward-compatible shims for pre-versioning URLs
- Contains: `exchange/[base]/route.ts`, `nif/[nif]/route.ts`, `translate/route.ts`
- Note: These are legacy handlers with their own error-handling implementation (not using `src/lib/http.ts` helpers)

**`src/lib/angola/`:**
- Purpose: Core domain logic for Angola-specific utilities; pure functions, no HTTP concerns
- Contains: Business logic modules, each owning a domain (salary, phone, geo, etc.)
- Key files: `salary.ts` (IRT tables), `phone.ts` (operator detection), `documents.ts` (PDF generation)

**`src/lib/`:**
- Purpose: Cross-cutting infrastructure and external service clients
- Contains: HTTP helpers, error classes, SEO utilities, external API clients
- Key files: `http.ts`, `route-error.ts`, `currency.ts`, `translate.ts`, `agt-nif.ts`

**`src/components/`:**
- Purpose: React UI components for the documentation website
- Contains: Page components, reusable UI primitives, SEO/structured-data helpers
- Key files: `client-providers.tsx`, `docs-detail-content.tsx`, `site-primitives.tsx`

**`src/locales/site/`:**
- Purpose: TypeScript-typed multilingual site copy (used during SSR)
- Contains: One `.ts` per locale; `en.ts` is the base; others are `DeepPartial` overrides
- Note: Different from `src/locales/*/common.json` which is for client-side i18next

**`src/locales/[lang]/`:**
- Purpose: i18next JSON bundles loaded client-side via `i18next-resources-to-backend`
- Contains: `common.json` per supported language (en, pt, es, fr, de, zh, ja)

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root HTML layout, providers, global metadata
- `app/page.tsx`: Home page
- `app/api/v1/[domain]/[action]/route.ts`: Versioned public API endpoints

**Configuration:**
- `next.config.ts`: Redirects, standalone output mode
- `tsconfig.json`: Path alias `@/*` → `src/*`
- `jest.config.js`: Test runner configuration
- `eslint.config.mjs`: Linting rules

**Core Logic:**
- `src/lib/angola/salary.ts`: IRT tax tables and salary calculations
- `src/lib/angola/shared.ts`: Shared parsers and string utilities
- `src/lib/http.ts`: Response factories used by all new-style routes
- `src/lib/route-error.ts`: `RouteError` class used for validation errors

**Testing:**
- `src/lib/__tests__/`: All test files (co-located with lib, not with routes)

**Locales:**
- `src/locales/site/en.ts`: Base site copy (all other locales merge against this)
- `src/locales/site/docs/`: Per-locale docs page content overrides

## Naming Conventions

**Files:**
- Route handlers: `route.ts` (Next.js convention)
- Page components: `page.tsx` (Next.js convention)
- Layout files: `layout.tsx` (Next.js convention)
- Domain logic modules: kebab-case noun (`salary.ts`, `agt-nif.ts`, `docs-code.ts`)
- React components: kebab-case (`home-page.tsx`, `code-block.tsx`, `client-providers.tsx`)
- Test files: `[domain].test.ts` grouped by concern (not 1:1 with source files)

**Directories:**
- API domain groups: kebab-case (`salary/`, `phone/`, `address/`)
- Dynamic route segments: bracket notation (`[nif]/`, `[base]/`, `[slug]/`)
- Source subdirectories: lowercase (`angola/`, `pages/`, `ui/`, `seo/`)

**Functions:**
- Route handlers: `GET`, `POST` (uppercase, Next.js convention)
- Domain functions: camelCase verb-noun (`calculateNetSalary`, `validateAngolanPhoneNumber`, `generateInvoicePdf`)
- HTTP helpers: camelCase (`noStoreJson`, `routeErrorResponse`, `parseJsonBody`)
- Query parsers: camelCase prefixed with `parse` (`parseNetSalaryQuery`, `parsePositiveNumber`, `parseEnum`)

**Types:**
- Input types: PascalCase suffixed with `Input` (`NetSalaryInput`, `GrossSalaryInput`)
- Payload types: PascalCase suffixed with `Payload` (`InvoicePayload`, `ContractPayload`)
- Result types: PascalCase suffixed with `Result` or `Output` (`CurrencyLookupResult`, `TranslateResult`)
- Error classes: PascalCase suffixed with `Error` (`RouteError`, `CurrencyError`, `TranslationError`, `PortalLookupError`)

## Where to Add New Code

**New API endpoint (e.g., `/api/v1/nif/validate`):**
1. Create real handler: `app/nif/validate/route.ts` — implement GET/POST using `noStoreJson` + `routeErrorResponse`
2. Create versioned shim: `app/api/v1/nif/validate/route.ts` — re-export handler + add `runtime`, `dynamic`, `maxDuration`
3. Add domain logic (if Angola-specific): `src/lib/angola/[module].ts`
4. Add tests: `src/lib/__tests__/angola-[feature].test.ts`

**New Angola domain logic module:**
- Implementation: `src/lib/angola/[domain].ts`
- Use `RouteError` from `src/lib/route-error.ts` for validation
- Use helpers from `src/lib/angola/shared.ts` for string parsing and formatting
- Tests: `src/lib/__tests__/angola-[domain].test.ts`

**New external service client:**
- Implementation: `src/lib/[service-name].ts`
- Define a domain-specific error class extending `Error` with `statusCode` and `code`
- Tests: `src/lib/__tests__/[service-name].test.ts`

**New UI component:**
- Primitive: `src/components/ui/[component-name].tsx`
- Page-level: `src/components/pages/[page-name]-page.tsx`
- Then create page entry: `app/[path]/page.tsx` importing from the component

**New locale content:**
- Add key to `src/locales/site/en.ts` (base)
- Optionally add overrides to other locale files (`de.ts`, `pt.ts`, etc.)
- For client-side strings: add to `src/locales/[lang]/common.json` for all supported languages

**New redirect:**
- Add to `next.config.ts` inside the `redirects()` array

## Special Directories

**`.planning/codebase/`:**
- Purpose: GSD codebase map documents
- Generated: By `/gsd:map-codebase`
- Committed: Yes

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes
- Committed: No

**`.swc/`:**
- Purpose: SWC (Rust-based compiler) plugin cache
- Generated: Yes
- Committed: No

**`.vercel/`:**
- Purpose: Vercel deployment configuration and project metadata
- Generated: Yes (by `vercel` CLI)
- Committed: Partially (`.vercel/project.json` may be committed for project linking)

---

*Structure analysis: 2026-06-18*
