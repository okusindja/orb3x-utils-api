---
phase: 3
slug: external-http-tools
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-19
---

# Phase 3 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail. Retroactive audit (milestone v1.0). 18 threats verified across 6 plans + 1 newly-registered accepted risk (TLS cert-bypass).

---

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| MCP client → external tool input | Untrusted JSON (currency codes, NIF strings, text, language codes, finance amounts) crosses into URL/request construction and numeric computation |
| external tool → upstream service | Untrusted upstreams (Render exchange API, AGT NIF portal incl. TLS-fallback, Google unofficial translate) that may time out, be unreachable, or return malformed data |
| upstream error → mcpToolHandler | Domain error objects cross into MCP serialization (info-disclosure surface) |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Status | Evidence |
|-----------|----------|-----------|-------------|--------|----------|
| T-03-01 | Info Disclosure | mcpToolHandler error serialization | mitigate | closed | `tool-error.ts:53-57` serializes only `code`/`message`/`statusCode` + allowed enumerable props; `name`/`stack` non-enumerable, filtered — no stack-trace leak |
| T-03-02 | Tampering | duck-typed branch ordering | mitigate | closed | `tool-error.ts:18` RouteError `instanceof` first; `:36-40` `statusCode:number` check disjoint (RouteError uses `.status`) |
| T-03-F1 | Tampering | finance inputSchema | mitigate | closed | `tools/finance.ts:22-60` Zod positive/min/max/enum + `finance.ts:185` `ensureRate` RouteError (double-validated) |
| T-03-F2 | DoS | finance_invoice_total lines array | mitigate | closed | `tools/finance.ts:55` `z.array().min(1)`; pure sync reduce, no IO/unbounded loop |
| T-03-C1 | Tampering | base currency → upstream URL | mitigate | closed | `currency.ts:35-36` `sanitizeCurrencyCode` (`^[a-z0-9-]{2,20}$`) before URL + `encodeURIComponent` |
| T-03-C2 | DoS | Render upstream timeout/cold-start | mitigate | closed | `currency.ts:48` `AbortSignal.timeout(20000)`; CurrencyError → retryable isError; 60s cache |
| T-03-C3 | Info Disclosure | currency error serialization | mitigate | closed | shared `mcpToolHandler` filter |
| T-03-C4 | Tampering | currency module cache poisoning | accept | closed | cache written only from successful responses; no exposed setter / external write path |
| T-03-N1 | Tampering | NIF input → portal request | mitigate | closed | `agt-nif.ts:57-58` `sanitizeNif` (`^[0-9A-Z]+$`) after uppercase/trim, before URL + `encodeURIComponent` |
| T-03-N2 | DoS | AGT portal timeout (primary + TLS-fallback) | mitigate | closed | BOTH paths bounded: `agt-nif.ts:222` primary `timeout(25000)` AND `:280` fallback `setTimeout(25000)`; PortalLookupError → retryable isError |
| T-03-N3 | Info Disclosure | NIF enumeration via tool | accept | closed | AGT portal is public; mitigated by per-IP rate-limit (MCP-05) only |
| T-03-N4 | Info Disclosure | NIF error serialization (incl. TLS details) | mitigate | closed | shared filter; TLS codes consumed at `agt-nif.ts:317-337`, never serialized |
| **T-03-N5** | **Tampering / MITM (Info Disclosure)** | **NIF TLS-fallback `rejectUnauthorized: false` (`agt-nif.ts:262`)** | **accept** | **closed** | **See Accepted Risks Log. Cert validation disabled ONLY on the fallback, reached ONLY on specific cert errors (never on timeout/unreachable). No caller secrets transit this path; impact bounded to the integrity of a single public NIF read. Below `block_on: high`. Future hardening: cert pinning.** |
| T-03-T1 | DoS | oversized text → Google API | mitigate | closed | `tools/translation.ts:19` `z.string().max(5000)` |
| T-03-T2 | Tampering | language codes → request | mitigate | closed | `translate.ts:28-29` `sanitizeLanguageCode` (`^[a-z-]{2,12}$`) before request |
| T-03-T3 | DoS | Google upstream failure/timeout | mitigate | closed | `translate.ts:52` `AbortSignal.timeout(15000)`; TranslationError → retryable isError |
| T-03-T4 | Info Disclosure | translation error serialization | mitigate | closed | shared filter |
| T-03-R1 | Tampering | registry wiring drift | mitigate | closed | `mcp-registry.test.ts:77-110` canonical name enumeration + count floor |
| T-03-R2 | Repudiation | catalog vs docs mismatch | accept | closed | Phase 5 docs derive from registry; no runtime trust impact |
| T-03-SC | Tampering (supply chain) | npm installs | accept | closed | `git diff` across all Phase 3 commits = zero changes to `package.json` / `pnpm-lock.yaml` |

*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-03-1 | T-03-N5 | NIF AGT-portal TLS-fallback disables cert validation (`rejectUnauthorized: false`, `agt-nif.ts:262`). Accepted: bounded to the cert-error fallback path only (not timeout/unreachable), carries no caller secrets, and the data is a single public NIF lookup — MITM impact limited to read-integrity of public data, below ASVS L1 / `block_on: high`. **Hardening tracked for a future phase: replace the blanket cert-bypass with cert pinning to the AGT host.** | secure-phase audit (operator) | 2026-06-19 |

*Other `accept` threats (T-03-C4/N3/R2/SC) carry no residual unmitigated risk requiring sign-off — rationale verified in the register.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-19 | 19 | 19 | 0 | gsd-security-auditor (State B — 6-plan threat registers; +T-03-N5 registered from auditor UF-03-1) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log (incl. the TLS cert-bypass)
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-19
