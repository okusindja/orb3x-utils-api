---
phase: 5
slug: mcp-documentation
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-19
---

# Phase 5 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| authored content → rendered HTML | Catalog `href`s and connection-snippet strings are authored constants compiled into static pages | No user input crosses into this page |
| docs page → user clipboard | The Copy-as-Markdown button serializes the authored `DocsPage` data and writes it to the user's own clipboard | Authored docs content (no untrusted data) |
| docs page → MCP runtime | None this phase — `/api/mcp` auth posture / rate limiting owned by Phases 1–3, unmodified here | — |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-05-01 | Tampering / Info Disclosure | `DocsTableCell.href` via `next/link` | mitigate | All 25 hrefs are static internal `/docs/[slug]` literals (`en.ts`); `DataTable` renders `cell.href` through `next/link` with no template-literal/interpolated hrefs anywhere — no open-redirect/XSS. (`site-primitives.tsx:451-454`) | closed |
| T-05-02 | Info Disclosure | connection snippets | accept | The 4 snippets carry only the public endpoint `https://utils.api.orb3x.com/api/mcp`; no API key / token / Authorization header. The API is public by design (v1, no auth). | closed |
| T-05-03 | Tampering (supply chain) | `mcp-remote` referenced in snippets | accept | `mcp-remote` is NOT in `package.json` (deps/devDeps) — it appears only inside docs the end user runs via `npx`. No project dependency added. (verified npm 0.1.38) | closed |
| T-05-04 | (post-plan, added during UAT) Copy-as-Markdown clipboard feature | `docs-detail-content.tsx` + `docs-markdown.ts` | accept (assessed low) | Serialized source is authored static locale copy (`copy.docsPages[slug]` via `getSiteCopy`; `slug` gated by `isDocsPageSlug`). Single `navigator.clipboard.writeText` sink in `try/catch` (fails safe on non-secure-context / denied). `docs-markdown.ts` is pure string concatenation — no `innerHTML`/`eval`/`document.write`. No untrusted data flows in. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|

No residual unmitigated risk requiring sign-off — T-05-02/03/04 are accept-disposition threats whose rationale is verified in the register above (public-by-design endpoint, no project dep added, authored-content-only clipboard write).

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-19 | 4 | 4 | 0 | gsd-security-auditor (State B — from PLAN threat model + UAT-added T-05-04) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-19
