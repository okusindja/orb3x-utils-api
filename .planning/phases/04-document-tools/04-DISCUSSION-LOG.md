# Phase 4: Document Tools - Discussion Log

> **Audit trail only.** Decisions are in CONTEXT.md — this preserves alternatives considered.

**Date:** 2026-06-19
**Phase:** 4-Document Tools
**Areas discussed:** PDF content shape, Tool naming, Size-guard UX, File/plan organization

---

## PDF content shape

| Option | Description | Selected |
|--------|-------------|----------|
| resource{uri,mimeType,blob} + text metadata | Embedded resource + text fallback with filename/size/note | ✓ |
| resource + minimal text | Resource block + one-line text | |
| text-only base64 | base64 in a text block, no resource | |

**User's choice:** Embedded resource (synthetic uri, application/pdf, base64 blob) + text metadata fallback.

---

## Tool naming

| Option | Description | Selected |
|--------|-------------|----------|
| generate_invoice_pdf / _receipt_pdf / _contract_pdf | Roadmap criteria names; verb+_pdf; deliberate exception to domain_operation | ✓ |
| documents_invoice / _receipt / _contract | Keep domain_operation convention | |

**User's choice:** generate_*_pdf (matches criteria; reads as a file-producing action).

---

## Size-guard UX

| Option | Description | Selected |
|--------|-------------|----------|
| isError + estimated size + suggestion, non-retryable | { code: PDF_TOO_LARGE, message w/ size vs ~4MB + reduce-content suggestion, retryable:false } | ✓ |
| Simple isError | code + short message | |

**User's choice:** Structured PDF_TOO_LARGE with estimated size + suggestion; non-retryable; fails before 413.

---

## File/plan organization

| Option | Description | Selected |
|--------|-------------|----------|
| 1 file + 1 plan (3 tools + shim verify + registry) | tools/documents.ts with shared helper; one plan; verify existing v1 shims; wire registry | ✓ |
| Tools plan + separate shim/registry plan | Split into two plans/waves | |

**User's choice:** Single module + single plan; shims already exist (verify-only); no parallel waves.

---

## Claude's Discretion

- Exact Zod schemas (mirror payload types); synthetic uri strings; text-fallback + PDF_TOO_LARGE wording; shared-helper signature.

## Deferred Ideas

- Phase 5 docs page; v2 annotations; PDF streaming bypass (out of scope); bank-logo embedding (not done by generators).
