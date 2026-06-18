# External Integrations

**Analysis Date:** 2026-06-18

## APIs & External Services

**Currency Exchange:**
- Service: `currency-rate-exchange-api.onrender.com` — third-party exchange rate API hosted on Render
  - SDK/Client: Native `fetch` (no SDK)
  - Auth: None (public API)
  - Implementation: `src/lib/currency.ts` — `fetchCurrencyRates()`
  - Timeout: 15 seconds via `AbortSignal.timeout(15000)`
  - Exposed via: `app/api/exchange/[base]/route.ts` → `app/api/v1/exchange/[base]/route.ts`

**Translation:**
- Service: Google Translate unofficial endpoint (`translate.googleapis.com/translate_a/single`)
  - SDK/Client: Native `fetch` using `client=gtx` (undocumented public endpoint, no API key)
  - Auth: None
  - Implementation: `src/lib/translate.ts` — `translateText()`
  - Timeout: 15 seconds via `AbortSignal.timeout(15000)`
  - Exposed via: `app/api/translate/route.ts` → `app/api/v1/translate/route.ts`

**Angola Tax Portal (NIF Lookup):**
- Service: `portaldocontribuinte.minfin.gov.ao` — Angola Ministry of Finance taxpayer portal
  - SDK/Client: Native `https` Node module + `cheerio` HTML parser
  - Auth: None (public portal, scraped via GET request)
  - Implementation: `src/lib/agt-nif.ts` — `lookupTaxpayerByNif()`, `parseTaxpayerLookupHtml()`
  - Exposed via: `app/api/nif/[nif]/route.ts` → `app/api/v1/nif/[nif]/route.ts`

## Data Storage

**Databases:**
- None — no database integration detected

**Static/Embedded Data:**
- Angola geographic data (provinces, municipalities, communes): `src/lib/angola/geo.ts`
- Angola bank data: `src/lib/angola/banks.ts`, `src/lib/angola/bank-images.ts`
- Angola public holiday calendar: `src/lib/angola/calendar.ts`
- Angola annual CPI index: hardcoded in `src/lib/angola/finance.ts`
- Angola IRT (income tax) brackets and social security rates: hardcoded in `src/lib/angola/salary.ts`
- Angola address data: `src/lib/angola/address.ts`

**File Storage:**
- Local filesystem only — PDF documents are generated in-memory (`pdf-lib`) and streamed as HTTP responses; no cloud file storage

**Caching:**
- None — all API routes are configured with `Cache-Control: no-store` and `dynamic = 'force-dynamic'`; no Redis, CDN cache, or in-memory cache layer

## Authentication & Identity

**Auth Provider:**
- None — the API is fully public; no authentication or authorization layer detected across any route

## Monitoring & Observability

**Error Tracking:**
- None — no Sentry, Datadog, or equivalent integration detected

**Analytics:**
- Vercel Analytics (`@vercel/analytics` 2.x)
  - Injected in `app/layout.tsx` via `ClientProviders`
  - Tracks page views on the documentation/marketing frontend

**Logs:**
- Standard `console`-based logging only (no structured logger)
- Vercel provides runtime logs in the platform dashboard

## CI/CD & Deployment

**Hosting:**
- Vercel
  - Project: `orb3x-utils-api` (config: `.vercel/project.json`)
  - Framework: Next.js (auto-detected)
  - Node version: 24.x
  - Build output: `standalone` (set in `next.config.ts`)

**CI Pipeline:**
- Not detected — no GitHub Actions, CircleCI, or other CI config files in repo

## Environment Configuration

**Required env vars (inferred from source):**
- None identified as hard-coded or explicitly read via `process.env` in the application source
- `.env.local` and `.env.development.local` are present but their contents were not read; any service credentials (e.g. for future integrations) would live there

**Secrets location:**
- `.env.local` — local development secrets (gitignored)
- `.env.development.local` — development-only overrides (gitignored)
- Vercel dashboard environment variables for production secrets

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## PDF Generation

**Library:** `pdf-lib` 1.17.1
- Used to generate Angola-specific PDF documents (invoices, receipts, contracts) entirely server-side
- Implementation: `src/lib/angola/documents.ts`
- Fonts: `StandardFonts` from `pdf-lib` (no external font loading)
- Exposed via: `app/documents/invoice/route.ts`, `app/api/v1/documents/invoice/route.ts`
  - Note: `app/api/v1/documents/contract/route.ts` and `app/api/v1/documents/receipt/route.ts` were deleted (listed in git status as ` D`)

## Syntax Highlighting

**Library:** `shiki` 4.x
- Used server-side to render highlighted code examples in the documentation site
- Implementation: `src/lib/docs-code.ts`
- No external API calls — all processing is local

---

*Integration audit: 2026-06-18*
