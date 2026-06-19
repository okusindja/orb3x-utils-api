---
phase: 4
slug: document-tools
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-19
---

# Phase 4 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| MCP client → tool callback | Untrusted JSON payload (invoice/receipt/contract data) crosses into PDF generation | Arbitrary caller-supplied document data |
| Tool callback → Vercel response | Generated base64 PDF crosses the serverless response body limit (~4.5 MB Hobby) | base64-encoded PDF bytes |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-04-01 | Denial of Service | `pdfToolResult` / oversized output PDF | mitigate | Output size guard: `Math.ceil(bytes.length * 1.34) > 4_000_000` throws `RouteError('PDF_TOO_LARGE', …, 413, { retryable: false })` **before** base64 encoding; surfaces as `{ isError: true }`. `maxDuration = 30` on v1 shims. (`documents.ts:38-48`) | closed |
| T-04-02 | Denial of Service | base64 memory inflation | mitigate | Guard runs on `bytes.length` arithmetic first; `Buffer.from(...).toString('base64')` only after the guard passes. (`documents.ts:38,50`) | closed |
| T-04-03 | Tampering / DoS (input amplification) | malformed/**oversized** JSON input → generator | mitigate | **Input boundary bounds** (added post-audit): Zod `.max()` caps on every array — `items` ≤ 200, `parties` ≤ 50, `clauses` ≤ 200 — plus length caps on all free-text fields (`MAX_SHORT_TEXT`/`MAX_LINE_TEXT`/`MAX_LONG_TEXT`). Generator still throws `INVALID_*_PAYLOAD` on missing required fields. Caps stop unbounded O(n) pre-guard work that the output guard could not catch (PDF draw loop stops at page bottom). Regression-tested. (`documents.ts:17-33,113,172-177`; `mcp-tools-documents.test.ts`) | closed |
| T-04-04 | Tampering | injection into PDF text / synthetic resource `uri` | accept | pdf-lib draws text literally (no template/script eval); `uri` is a fixed constant descriptive string (`mcp://orb3x/documents/*.pdf`), not a filesystem path — no traversal. Rationale verified to hold in implementation. | closed |
| T-04-SC | Supply chain | npm/cargo installs | accept | No package installs this phase — pure composition of existing deps (`@modelcontextprotocol/sdk`, `pdf-lib`, `zod`, Node `Buffer`). `git diff` on `package.json`/`pnpm-lock.yaml` is empty. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|

No accepted risks — T-04-04 and T-04-SC are accepted-disposition threats whose rationale is verified in the register above (no residual unmitigated risk requiring sign-off).

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-19 | 5 | 4 | 1 | gsd-security-auditor (initial — T-04-03 OPEN, HIGH) |
| 2026-06-19 | 5 | 5 | 0 | orchestrator (re-verified after `.max()` bounds fix `cfa8141`) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-19
