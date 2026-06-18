# Codebase Concerns

**Analysis Date:** 2026-06-18

## Tech Debt

**Hardcoded Angola Annual CPI Index (inflation stops at 2025):**
- Issue: `ANGOLA_ANNUAL_CPI_INDEX` in `src/lib/angola/finance.ts` is a static `Record<number, number>` with years 2019–2025 only. The error message at line 122 says "available for Angola annual CPI years from 2019 through 2025." Each calendar year requires a manual code change and a redeploy.
- Files: `src/lib/angola/finance.ts` (lines 11–18, 116–122)
- Impact: Inflation adjustment endpoint (`/api/v1/finance/inflation-adjust`) will silently reject any `to` year ≥ 2026 with a 400 error until a developer updates the constant.
- Fix approach: Source CPI data dynamically from an authoritative Angola/INE API, or at minimum add a documented update checklist and alert when the current year is not in the table.

**IRT Tax Table only covers 2025–2026:**
- Issue: `IRT_TABLES` in `src/lib/angola/salary.ts` (lines 50–53) maps only years `2025` and `2026` to the same `AGT_COMPATIBLE_IRT_TABLE`. The error message at line 337 explicitly names both years. When 2027 arrives, all salary endpoints will 400.
- Files: `src/lib/angola/salary.ts` (lines 35–53, 335–341)
- Impact: All three salary routes (`/api/v1/salary/net`, `/api/v1/salary/gross`, `/api/v1/salary/employer-cost`) break on unsupported years without a code change.
- Fix approach: Add a yearly update process or widen the table to include future years with an explicit "last known table" fallback with documentation.

**Bank logo images baked into source (~1.4 MB TypeScript file):**
- Issue: `src/lib/angola/bank-images.ts` is a 1.4 MB file containing base64-encoded bank logo images embedded directly in TypeScript source. The file is 24 lines long but each line may be hundreds of KB.
- Files: `src/lib/angola/bank-images.ts`, `src/lib/angola/banks.ts` (line 9)
- Impact: Every module that imports `banks.ts` pulls a 1.4 MB constant into the JavaScript bundle. This inflates server cold-start time on serverless functions (Vercel), increases memory pressure, and slows TypeScript compilation. Images are served in API responses, which makes JSON payloads that embed bank data extremely large.
- Fix approach: Move bank logos to static assets in `public/`, serve via Next.js image paths, and reference URLs instead of base64 strings. Alternatively, store in an external CDN/object store.

**Dual route tree with legacy unversioned endpoints:**
- Issue: `app/api/exchange/`, `app/api/nif/`, and `app/api/translate/` are legacy entry points redirected via `next.config.ts` to their versioned `/api/v1/` counterparts (all with `permanent: false`). The legacy routes still contain full handler implementations (117- and 85-line files) rather than thin re-exports, meaning they diverge from the v1 implementations over time.
- Files: `app/api/exchange/[base]/route.ts`, `app/api/nif/[nif]/route.ts`, `app/api/translate/route.ts`, `next.config.ts`
- Impact: Logic is duplicated. A bug fix applied to the v1 handler may not be reflected in the legacy handler, leading to inconsistent behavior depending on which URL the caller uses. The `permanent: false` redirects prevent browser/CDN caching and result in double round-trips.
- Fix approach: Refactor legacy route files to re-export from v1 handlers (the same pattern already used for salary, documents, and all other v1 routes). Upgrade redirects to `permanent: true` after a deprecation window, or remove legacy routes entirely.

**i18n locale data stored in TypeScript source files:**
- Issue: All 7 locale doc files under `src/locales/site/docs/` are TypeScript source files of 1,560–2,379 lines each. The translated locales (de, es, fr, ja, zh) are all exactly 2,379 lines but appear to be machine-generated JSON wrapped in TypeScript `export default`. A script at `scripts/generate-site-locales.mjs` produces these files. The i18n runtime in `src/lib/i18n.ts` dynamically imports JSON files from `../locales/${language}/${namespace}.json`, which do not actually exist at `src/locales/en/common.json` (only `common.json` exists at `src/locales/`).
- Files: `src/lib/i18n.ts` (line 14), `src/locales/site/docs/*.ts`, `scripts/generate-site-locales.mjs`
- Impact: The dynamic import path in `i18n.ts` references `../locales/${language}/${namespace}.json` but the locale directory only contains a single `common.json` at the root and `site/` subdirectory with TypeScript files. This mismatch could cause locale loading to silently fall back to English for all translations in production.
- Fix approach: Audit the actual runtime i18n loading path against what is committed. Ensure generated JSON files are either committed or emitted at build time into the correct path.

**`parseJsonBody` does not validate input shape:**
- Issue: `src/lib/http.ts` line 67 casts `request.json()` directly to the generic type parameter `T` via `as Promise<T>`. The document routes pass `InvoicePayload`, `ReceiptPayload`, and `ContractPayload` but these types have all optional fields. A caller sending an empty `{}` body passes the type check silently; validation only fires when the service layer checks fields like `payload.seller?.name`.
- Files: `src/lib/http.ts` (line 67), `app/documents/invoice/route.ts`, `app/documents/receipt/route.ts`, `app/documents/contract/route.ts`
- Impact: Malformed input can propagate deep into PDF generation before producing an error, making error messages harder to trace. There is no schema validation at the HTTP boundary.
- Fix approach: Add a lightweight schema validation step (e.g., Zod) at the route boundary before passing payloads to the domain layer.

**Translate API uses unofficial Google Translate endpoint:**
- Issue: `src/lib/translate.ts` (line 1) hardcodes `https://translate.googleapis.com/translate_a/single` with `client=gtx` — an undocumented, unofficial Google API endpoint. No API key is used.
- Files: `src/lib/translate.ts` (lines 1, 38–39)
- Impact: This endpoint is not covered by any SLA, may be rate-limited or blocked by Google without notice, and could break silently. Using `client=gtx` identifies the app as a browser-based GTX client, which could be flagged.
- Fix approach: Migrate to the official Google Cloud Translation API with a proper API key, or use an alternative provider (LibreTranslate, DeepL).

**Currency rates fetched from third-party unauthenticated service:**
- Issue: `src/lib/currency.ts` line 1 fetches from `https://currency-rate-exchange-api.onrender.com`, a public third-party service with no authentication or SLA.
- Files: `src/lib/currency.ts` (lines 1, 41–49)
- Impact: Rate limits, uptime issues, or API changes on the third-party service propagate directly as 502/504 errors to API consumers. There is no caching layer; every request hits the upstream service.
- Fix approach: Add response caching (e.g., `Cache-Control` or in-memory/KV store on Vercel) with a configurable TTL. Consider switching to a more reliable provider (e.g., Open Exchange Rates, exchangeratesapi.io) with proper API key authentication.

## Known Bugs

**Staged deletion of `app/api/v1/documents/contract/route.ts` and `app/api/v1/documents/receipt/route.ts`:**
- Symptoms: Git status shows these two files as staged for deletion (`D app/api/v1/documents/contract/route.ts`, `D app/api/v1/documents/receipt/route.ts`). The v1 re-export wrappers for contract and receipt document generation are being removed, but the actual implementation files at `app/documents/contract/route.ts` and `app/documents/receipt/route.ts` still exist. Documentation in all 7 locale files (`src/locales/site/docs/*.ts`) still references `/api/v1/documents/receipt` and `/api/v1/documents/contract` endpoints.
- Files: `app/api/v1/documents/contract/route.ts` (staged deletion), `app/api/v1/documents/receipt/route.ts` (staged deletion), `src/locales/site/docs/en.ts` (lines 1170, 1194), all other locale docs files
- Trigger: Any API call to `POST /api/v1/documents/contract` or `POST /api/v1/documents/receipt` after these staged deletions are committed will return 404.
- Workaround: Restore the deleted files, or remove their documentation references and update the redirect in `next.config.ts`.

## Security Considerations

**No API authentication or rate limiting:**
- Risk: All API endpoints are publicly accessible with no API key, token, OAuth, or any other authentication mechanism. There is also no rate limiting middleware.
- Files: All files under `app/api/v1/`, `next.config.ts` — no `middleware.ts` exists
- Current mitigation: None. Vercel platform-level DDoS protection may apply at the edge.
- Recommendations: Add a Next.js `middleware.ts` file to implement per-IP or per-key rate limiting. For revenue-generating or resource-intensive endpoints (NIF lookup, currency exchange, PDF generation, translation), add authentication requirements.

**NIF lookup scrapes an Angolan government portal:**
- Risk: `src/lib/agt-nif.ts` scrapes `https://portaldocontribuinte.minfin.gov.ao` by sending taxpayer NIF values as GET parameters. Any NIF passed to the API is forwarded to the Angolan tax authority portal without the API caller's knowledge, which may have privacy/legal implications depending on the use context.
- Files: `src/lib/agt-nif.ts` (lines 4–5, 54–70)
- Current mitigation: NIF is validated and sanitized before use (`sanitizeNif`).
- Recommendations: Add explicit terms of service documentation stating that NIF lookups are relayed to the Angola tax portal. Consider caching results with a short TTL (e.g., 24 hours) to reduce repeated disclosure of taxpayer queries.

**HTML scraping in NIF lookup is fragile to portal layout changes:**
- Risk: `parseTaxpayerLookupHtml` in `src/lib/agt-nif.ts` uses text slicing and regex matching against human-readable Portuguese labels (`"NIF"`, `"Nome"`, `"Tipo"`, etc.) extracted from the portal's rendered HTML. Any redesign of the government portal will break parsing silently or return an `UNPARSEABLE_RESPONSE` error.
- Files: `src/lib/agt-nif.ts` (lines 73–112, 145–170)
- Current mitigation: Returns `UNPARSEABLE_RESPONSE` with a 502 when expected fields are missing.
- Recommendations: Add monitoring/alerting for elevated `UNPARSEABLE_RESPONSE` rates. Consider a fallback mode that returns the raw scraped text for debugging.

## Performance Bottlenecks

**1.4 MB `bank-images.ts` imported at module load:**
- Problem: Every import of `src/lib/angola/banks.ts` causes Node.js to parse and evaluate 1.4 MB of TypeScript/JavaScript containing base64 strings. On Vercel serverless functions this happens on every cold start.
- Files: `src/lib/angola/bank-images.ts`, `src/lib/angola/banks.ts` (line 9)
- Cause: Bank logos are stored as inline base64 data URIs in a TypeScript export rather than as static assets.
- Improvement path: Move logos to `public/bank-logos/` or an external CDN and replace the `image` field with a URL string. This reduces the module size from 1.4 MB to ~5 KB.

**Gross salary calculation uses iterative binary search (50 iterations):**
- Problem: `calculateGrossSalary` in `src/lib/angola/salary.ts` (lines 139–193) solves for gross salary by running 50 iterations of binary search, each iteration calling `calculateNetSalary` which itself performs floating-point payroll steps.
- Files: `src/lib/angola/salary.ts` (lines 139–193)
- Cause: The inverse salary problem (net → gross) has no closed-form solution due to the piecewise IRT bracket structure, so binary search is used.
- Improvement path: Analytically solve the bracket boundaries directly to produce an exact result in O(1) arithmetic instead of O(50) recursive calls. Alternatively, add caching for common net salary inputs.

**No response caching on currency exchange endpoint:**
- Problem: Every call to `/api/v1/exchange/:base` fetches fresh data from the upstream third-party service with `cache: "no-store"`. Exchange rates change infrequently (typically once per day).
- Files: `app/api/v1/exchange/[base]/route.ts`, `src/lib/currency.ts` (line 42)
- Cause: The `Cache-Control: no-store` header is applied to all exchange rate responses.
- Improvement path: Cache upstream rates responses for a short TTL (5–60 minutes) using Vercel KV or Next.js `unstable_cache`. Return a cached `ratesDate` field to callers so they know the data freshness.

## Fragile Areas

**Address normalization silences lookup errors:**
- Files: `src/lib/angola/address.ts` (lines 65–75)
- Why fragile: Two bare `catch {}` blocks silently swallow province and municipality lookup failures during address parsing. If the geo data changes structure, the address normalizer will produce incomplete output (missing province or municipality) with no error surfaced.
- Safe modification: Replace bare `catch {}` with typed catch blocks that log or count misses, and add test coverage for partial-match scenarios.
- Test coverage: `src/lib/__tests__/angola-geo-address.test.ts` exists but coverage of the silent-failure paths is unknown.

**NIF portal HTML parsing relies on label ordering:**
- Files: `src/lib/agt-nif.ts` (lines 145–170)
- Why fragile: `extractField` builds regex lookaheads from the ordered list of subsequent label names to bound field extraction. If the portal reorders fields or adds new ones between existing labels, extraction will return incorrect or null values.
- Safe modification: Add regression test fixtures using saved portal HTML snapshots. Run these on a schedule to detect portal changes early.
- Test coverage: Not covered in `src/lib/__tests__/` — no test file exists for `agt-nif.ts`.

**i18n dynamic import path may not resolve at build time:**
- Files: `src/lib/i18n.ts` (line 14)
- Why fragile: The import `import(\`../locales/${language}/${namespace}.json\`)` is a dynamic import that webpack/turbopack must statically analyze. If the JSON files are not pre-generated before the Next.js build runs, locale loading will fail silently at runtime (falling back to English).
- Safe modification: Verify that `scripts/generate-site-locales.mjs` is called as a pre-build step in `package.json` before the `next build` command.
- Test coverage: No i18n loading tests exist.

## Scaling Limits

**Vercel serverless function memory and timeout:**
- Current capacity: Default Vercel hobby/pro plan limits (1–3 GB memory, 10–60 seconds max duration). All routes set `maxDuration = 30`.
- Limit: PDF generation (`pdf-lib`) and HTML scraping (`cheerio`) under the 1.4 MB bank-images module load will consume significant memory per cold start. Under concurrent load, function instances will spin up repeatedly, each loading 1.4 MB of base64 data.
- Scaling path: Reduce cold-start payload size (see bank-images concern). Consider dedicated compute for PDF generation.

## Dependencies at Risk

**`next-i18next` installed but not used:**
- Risk: `package.json` lists `next-i18next@^15.4.3` as a runtime dependency, but the actual i18n implementation uses `i18next` + `react-i18next` directly (via `src/lib/i18n.ts`). `next-i18next` is an unused production dependency adding bundle weight and a potential security surface.
- Impact: Unused dependency increases `node_modules` size and appears in lock file audits.
- Migration plan: Remove `next-i18next` from `package.json` and `pnpm-lock.yaml`.

**Unofficial Google Translate endpoint dependency:**
- Risk: `translate.googleapis.com/translate_a/single` with `client=gtx` is an undocumented API that Google may break, rate-limit, or shut down without notice.
- Impact: Translation endpoint (`/api/v1/translate`) fails completely with no fallback.
- Migration plan: Switch to Google Cloud Translation API v2/v3 with a billing account, or use DeepL/LibreTranslate.

**Unauthenticated third-party currency API:**
- Risk: `https://currency-rate-exchange-api.onrender.com` is a free, publicly hosted service on Render's free tier with no SLA. Free Render services spin down after inactivity.
- Impact: Currency exchange endpoint experiences cold-start delays of 30+ seconds when the upstream service is sleeping, likely triggering the 15-second `AbortSignal.timeout` and returning a 504 to callers.
- Migration plan: Replace with a paid, SLA-backed currency rates provider (e.g., Open Exchange Rates, Fixer.io, ExchangeRate-API) with a proper API key stored in environment variables.

## Missing Critical Features

**No API authentication or key management:**
- Problem: All endpoints are open to the public internet without any form of authentication. There is no way to identify or throttle individual callers.
- Blocks: Cannot enforce per-customer rate limits, usage analytics per client, or monetization of the API.

**No structured logging or error observability:**
- Problem: There are no console.log/error calls in application code (only in locale code-sample strings). There is no integration with an error tracking service (Sentry, Datadog, etc.).
- Blocks: Production errors are invisible unless the caller reports them. The NIF scraper fragility and upstream service failures go undetected.

**Inflation index only covers through 2025:**
- Problem: `adjustForInflation` in `src/lib/angola/finance.ts` rejects any date in 2026 or later. The CPI table must be manually updated by a developer each year.
- Blocks: The inflation adjustment endpoint is already stale as of 2026.

## Test Coverage Gaps

**NIF portal scraper (`agt-nif.ts`) has no tests:**
- What's not tested: HTML parsing logic in `parseTaxpayerLookupHtml`, `extractField`, `sliceResultSection`, `extractTaxResidentFlag`, and all error paths in `requestPortalLookup`.
- Files: `src/lib/agt-nif.ts`
- Risk: Portal HTML structure changes silently break the NIF lookup without any CI signal.
- Priority: High

**Translation library (`translate.ts`) test is minimal:**
- What's not tested: `src/lib/__tests__/translate.test.ts` exists (1.0 KB) but likely only covers happy-path scenarios. Error path handling (UPSTREAM_TIMEOUT, UNPARSEABLE_RESPONSE, empty translation) and language code sanitization edge cases are likely untested.
- Files: `src/lib/translate.ts`, `src/lib/__tests__/translate.test.ts`
- Risk: Silent regressions in error handling or language code validation.
- Priority: Medium

**Document PDF generation has no content validation tests:**
- What's not tested: `angola-routes.test.ts` verifies that a valid invoice request returns a PDF (checks first 4 bytes). There are no tests for receipt or contract PDF generation, no tests for partial/missing payload fields, and no tests for line-item edge cases (zero quantity, zero price, 0% VAT).
- Files: `src/lib/angola/documents.ts`, `src/lib/__tests__/angola-routes.test.ts`
- Risk: Malformed PDFs generated for edge-case inputs with no test catch.
- Priority: Medium

**i18n loading path not tested:**
- What's not tested: Whether locale files resolve correctly at runtime, whether the `initI18n` function loads the expected namespace, and whether language fallback works correctly.
- Files: `src/lib/i18n.ts`, `src/components/i18n-provider.tsx`
- Risk: Silent locale loading failures produce an English-only experience for all users with no error surfaced.
- Priority: Low

---

*Concerns audit: 2026-06-18*
