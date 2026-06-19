---
phase: 03-external-http-tools
verified: 2026-06-19T00:00:00Z
status: passed
score: 7/7 must-haves verified
overrides_applied: 0
re_verification: false
---

# Phase 3: External HTTP Tools — Verification Report

**Phase Goal:** MCP clients can invoke finance, currency, NIF, and translation tools — all (except finance) make upstream HTTP calls — and receive results or structured timeout/failure errors without the tool ever throwing.
**Verified:** 2026-06-19
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                                  | Status     | Evidence                                                                                                       |
|----|--------------------------------------------------------------------------------------------------------|------------|----------------------------------------------------------------------------------------------------------------|
| 1  | `finance_vat`, `finance_invoice_total`, `finance_inflation_adjust` exist and are wired to domain fns   | VERIFIED   | `src/lib/mcp/tools/finance.ts` exports `registerFinanceTools`; 3 `server.registerTool` calls; calls `calculateVat`, `calculateInvoiceTotals`, `adjustForInflation` from `@/lib/angola/finance` |
| 2  | `currency_rates` and `currency_convert` exist, call upstream, return structured errors on failure       | VERIFIED   | `src/lib/mcp/tools/currency.ts` exports `registerCurrencyTools`; 2 tools registered; calls `fetchCurrencyRates`/`convertCurrencyRates` from `@/lib/currency`; `enrichAndRethrow` maps `CurrencyError` to retryable structured payload |
| 3  | `nif_lookup` exists, calls upstream, returns structured retryable error on portal timeout/failure       | VERIFIED   | `src/lib/mcp/tools/nif.ts` exports `registerNifTools`; 1 tool registered; calls `lookupTaxpayerByNif`; enriches `PortalLookupError` with `retryable`/`retryAfterSeconds` via `Object.assign` before re-throwing |
| 4  | `translate_text` exists, calls upstream, returns structured errors; validation errors are NOT retryable | VERIFIED   | `src/lib/mcp/tools/translation.ts` exports `registerTranslationTools`; 1 tool; calls `translateText`; only `UPSTREAM_TIMEOUT`, `UPSTREAM_UNAVAILABLE`, `UPSTREAM_BAD_RESPONSE` set `retryable:true`; `INVALID_TEXT`/`INVALID_LANGUAGE` never enter the retryable set |
| 5  | `mcpToolHandler` duck-typed branch catches `CurrencyError`/`PortalLookupError`/`TranslationError` without importing them; `RouteError` branch stays intact and disjoint | VERIFIED   | `src/lib/mcp/tool-error.ts` lines 18–62: RouteError branch checks `instanceof RouteError` first; duck-typed branch checks `error instanceof Error && typeof code === 'string' && typeof statusCode === 'number'`; `RouteError` has `.status` (not `.statusCode`), confirmed by `src/lib/route-error.ts` having zero `statusCode` occurrences — branch is disjoint |
| 6  | Upstream timeouts: currency=20s, NIF both paths=25s, translation=15s (D-03)                            | VERIFIED   | `src/lib/currency.ts:48` → `AbortSignal.timeout(20000)`; `src/lib/agt-nif.ts:222` → `AbortSignal.timeout(25000)`, `src/lib/agt-nif.ts:280` → `request.setTimeout(25000,…)`; `src/lib/translate.ts:52` → `AbortSignal.timeout(15000)` |
| 7  | Currency cache is module-level Map in `tools/currency.ts`, NOT in `src/lib/currency.ts` (D-05); translate_text has DoS guard `max(5000)` | VERIFIED   | `src/lib/mcp/tools/currency.ts` lines 7–36: `currencyRatesCache = new Map<string, CurrencyCache>()`, TTL `60_000`ms, `__clearCurrencyCache` export for test isolation; `src/lib/currency.ts` has zero Map/cache lines; `translation.ts:19` → `z.string().min(1).max(5000)` |

**Score:** 7/7 truths verified

---

### Required Artifacts

| Artifact                                  | Expected                              | Status     | Details                                                                 |
|-------------------------------------------|---------------------------------------|------------|-------------------------------------------------------------------------|
| `src/lib/mcp/tools/finance.ts`            | `registerFinanceTools`, 3 tools       | VERIFIED   | Substantive (88 lines); imports domain fns; wired via `registerAllTools` in registry |
| `src/lib/mcp/tools/currency.ts`           | `registerCurrencyTools`, 2 tools + cache | VERIFIED | Substantive (111 lines); module-level cache; `enrichAndRethrow`; wired in registry |
| `src/lib/mcp/tools/nif.ts`               | `registerNifTools`, 1 tool            | VERIFIED   | Substantive (51 lines); enriches `PortalLookupError`; wired in registry |
| `src/lib/mcp/tools/translation.ts`        | `registerTranslationTools`, 1 tool + DoS guard | VERIFIED | Substantive (47 lines); `max(5000)` guard; retryable logic; wired in registry |
| `src/lib/mcp/tool-error.ts`              | Duck-typed branch + RouteError branch intact | VERIFIED | 75 lines; RouteError first, duck-typed second; spreads `retryable`/`retryAfterSeconds` via `Object.fromEntries` |
| `src/lib/currency.ts`                    | `AbortSignal.timeout(20000)`          | VERIFIED   | Line 48 confirmed                                                       |
| `src/lib/agt-nif.ts`                     | Both timeout lines = 25000            | VERIFIED   | Lines 222 and 280 confirmed                                             |
| `src/lib/translate.ts`                   | `AbortSignal.timeout(15000)`          | VERIFIED   | Line 52 confirmed                                                       |
| `src/lib/mcp/registry.ts`               | Imports + calls all 4 `register*Tools` | VERIFIED  | Lines 8–11 import all four; lines 21–24 call all four in `registerAllTools` |

---

### Key Link Verification

| From                          | To                              | Via                           | Status     | Details                                                                            |
|-------------------------------|---------------------------------|-------------------------------|------------|------------------------------------------------------------------------------------|
| `tools/finance.ts`            | `@/lib/angola/finance`          | named imports, direct call    | WIRED      | `calculateVat`, `calculateInvoiceTotals`, `adjustForInflation` imported and called |
| `tools/currency.ts`           | `@/lib/currency`                | `fetchCurrencyRates`, `convertCurrencyRates`, `CurrencyError` | WIRED | Imported and called inside `fetchCurrencyRatesCached` and `currency_convert` handler |
| `tools/nif.ts`                | `@/lib/agt-nif`                 | `lookupTaxpayerByNif`, `PortalLookupError` | WIRED | Imported; `lookupTaxpayerByNif` called in handler; `PortalLookupError` used in catch |
| `tools/translation.ts`        | `@/lib/translate`               | `translateText`, `TranslationError` | WIRED | Imported; `translateText` called in handler; `TranslationError` used in catch |
| `tool-error.ts` duck branch   | `CurrencyError`/`PortalLookupError`/`TranslationError` | duck-type check (no import) | WIRED | Catches any `Error` with `code:string` + `statusCode:number`; domain errors have both |
| `registry.ts`                 | `tools/{finance,currency,nif,translation}.ts` | named imports + function calls | WIRED | All four `register*Tools` imported and called unconditionally |
| Upstream errors → `isError`   | `mcpToolHandler` catch handler  | `enrichAndRethrow` + re-throw pattern | WIRED | Domain tool enriches and re-throws; `mcpToolHandler` catches via duck-typed branch; never propagates |

---

### Data-Flow Trace (Level 4)

Finance tools are pure (no upstream data source). Currency, NIF, and translation tools use mocked upstreams in unit tests with live calls deferred to post-deploy manual testing (noted in context as the explicit test boundary).

| Artifact              | Data Variable         | Source                    | Produces Real Data | Status   |
|-----------------------|-----------------------|---------------------------|-------------------|----------|
| `tools/finance.ts`    | Return from `calculateVat` etc. | `src/lib/angola/finance` (pure computation) | Yes — domain lib | FLOWING |
| `tools/currency.ts`   | `fetchCurrencyRatesCached` result | `src/lib/currency.ts` → Render API | Yes (mocked in tests; live post-deploy) | FLOWING |
| `tools/nif.ts`        | `lookupTaxpayerByNif` result | `src/lib/agt-nif.ts` → AGT portal | Yes (mocked in tests; live post-deploy) | FLOWING |
| `tools/translation.ts`| `translateText` result | `src/lib/translate.ts` → Google Translate | Yes (mocked in tests; live post-deploy) | FLOWING |

---

### Requirements Coverage

| Requirement | Description                                     | Status    | Evidence                                                                 |
|-------------|-------------------------------------------------|-----------|--------------------------------------------------------------------------|
| FIN-01      | Finance utilities via MCP tool (pure)           | SATISFIED | `finance_vat`, `finance_invoice_total`, `finance_inflation_adjust` registered and wired to `src/lib/angola/finance` |
| FIN-02      | Currency exchange rates via MCP tool, upstream timeout + structured error | SATISFIED | `currency_rates` + `currency_convert` with 20s timeout in `currency.ts`; `UPSTREAM_TIMEOUT`/`UPSTREAM_UNAVAILABLE` → retryable `isError` |
| NIF-01      | NIF lookup via MCP tool, ~25s timeout, structured retry error            | SATISFIED | `nif_lookup` wired to `agt-nif.ts`; both timeout paths set to 25000ms; `UPSTREAM_TIMEOUT` → `retryable:true, retryAfterSeconds:10` |
| TRN-01      | Text translation via MCP tool, structured error on upstream failure      | SATISFIED | `translate_text` wired to `translate.ts` (15s timeout); upstream failures → `retryable:true, retryAfterSeconds:5`; validation errors non-retryable |

---

### Behavioral Spot-Checks

Pure-function tools are verified by unit tests. External upstreams are mocked. Live call verification is post-deploy (out of scope for this phase per CONTEXT D-03 and the known-good note in context).

| Behavior                                              | Command                                | Result                    | Status |
|-------------------------------------------------------|----------------------------------------|---------------------------|--------|
| finance_vat bad rate returns isError INVALID_RATE     | Jest (mcp-tools-finance.test.ts)       | Test exists and passes    | PASS   |
| currency_rates UPSTREAM_TIMEOUT → retryable:true, retryAfterSeconds:5 | Jest (mcp-tools-currency.test.ts) | Test exists and passes | PASS   |
| nif_lookup UPSTREAM_TIMEOUT → retryable:true, retryAfterSeconds:10   | Jest (mcp-tools-nif.test.ts)     | Test exists and passes | PASS   |
| translate_text INVALID_TEXT → isError, NOT retryable  | Jest (mcp-tools-translation.test.ts)  | Test exists and passes    | PASS   |
| RouteError still caught by instanceof branch (not duck-typed) | Jest (mcp-tool-error.test.ts) | Test verifies `statusCode` absent in RouteError output | PASS |
| Currency cache hit: second call within TTL skips fetch | Jest (mcp-tools-currency.test.ts)    | `mockFetch` called exactly once | PASS |

---

### Anti-Patterns Found

No blockers. No `TBD`, `FIXME`, or `XXX` markers found in any Phase 3 files. No placeholder returns (`return null`, `return []`, `return {}`) found in Phase 3 tool callbacks.

The `"tools 2/"` directory (iCloud sync artifact) exists on disk but is empty (0 files) and has zero git-tracked entries. It is inert and does not affect the build or runtime.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | —    | —       | —        | None   |

---

### Human Verification Required

None. All observable Phase 3 truths are verifiable programmatically. External upstream behavior under live network conditions (AGT portal latency, Render cold-start) is explicitly deferred to post-deploy manual testing and is not a phase gate.

---

## Gaps Summary

No gaps. All 7 must-have truths are fully verified at all four levels (exists, substantive, wired, data-flowing).

---

_Verified: 2026-06-19T00:00:00Z_
_Verifier: Claude (gsd-verifier)_
