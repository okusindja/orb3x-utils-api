---
phase: 04-document-tools
plan: 01
subsystem: mcp-tools
tags: [mcp, documents, pdf, binary-output, size-guard]
requires:
  - "src/lib/angola/documents.ts (generate{Invoice,Receipt,Contract}Pdf)"
  - "src/lib/mcp/tool-error.ts (mcpToolHandler error formatter)"
  - "src/lib/route-error.ts (RouteError)"
provides:
  - "registerDocumentTools (generate_invoice_pdf / generate_receipt_pdf / generate_contract_pdf)"
  - "pdfToolResult helper (DOC-04 size guard + 2-block resource+text assembly)"
affects:
  - "src/lib/mcp/registry.ts (now 25 tools)"
tech-stack:
  added: []
  patterns:
    - "First binary-output MCP tools: success returns a 2-block CallToolResult (embedded resource + text fallback) directly, bypassing mcpToolHandler"
    - "Error path delegates to shared mcpToolHandler formatter (zero edit to tool-error.ts)"
    - "Generic runPdfTool<T> preserves precise success type to satisfy SDK CallToolResult"
key-files:
  created:
    - "src/lib/mcp/tools/documents.ts"
    - "src/lib/__tests__/mcp-tools-documents.test.ts"
  modified:
    - "src/lib/mcp/registry.ts"
    - "src/lib/__tests__/mcp-registry.test.ts"
decisions:
  - "Generic runPdfTool<T extends { content: unknown[] }> required so tsc accepts the success result as CallToolResult (jest/swc did not catch this; only pnpm build did)"
  - "Runtime-required fields made required in Zod (seller/buyer.name + >=1 item; receivedFrom.name + amount; >=2 parties + >=1 clause) for better tools/list schema; generator remains source of truth for INVALID_*_PAYLOAD"
metrics:
  duration: "2m"
  completed: "2026-06-19"
  tasks: 3
  files: 4
---

# Phase 4 Plan 01: Document Tools Summary

PDF generation exposed as three MCP tools (`generate_invoice_pdf` / `generate_receipt_pdf` / `generate_contract_pdf`) returning a base64 embedded-resource block plus a text metadata fallback, guarded by a pre-encode size check (DOC-04) that rejects oversized PDFs as a structured `PDF_TOO_LARGE` error instead of a raw Vercel 413. Registry now exposes 25 tools.

## What Was Built

- **`src/lib/mcp/tools/documents.ts`** — `registerDocumentTools` + private `pdfToolResult` helper and `runPdfTool` wrapper.
  - `pdfToolResult(bytes, meta)`: computes `Math.ceil(bytes.length * 1.34)`; if `> 4_000_000` throws `RouteError('PDF_TOO_LARGE', …, 413, { retryable: false })` BEFORE base64 encoding; otherwise returns the 2-block `{ content: [resourceBlock, textBlock] }` (resource = `{ type: 'resource', resource: { uri, mimeType: 'application/pdf', blob } }`; text fallback carries doc type, filename, byte size).
  - `runPdfTool<T>`: success returns the 2-block result directly; any throw re-routes through `mcpToolHandler`'s error formatter (RouteError + duck-typed + INTERNAL_SERVER_ERROR), zero edit to `tool-error.ts`.
  - Synthetic uris `mcp://orb3x/documents/{invoice,receipt,contract}.pdf`; anti-collision descriptions naming sibling `generate_*_pdf` tools (D-03).
- **`src/lib/mcp/registry.ts`** — wired `registerDocumentTools` into `registerAllTools` (25 tools total).
- **Tests** — `mcp-tools-documents.test.ts` (registration, anti-collision, 2-block success per tool, size guard, validation error) + `mcp-registry.test.ts` bumped 22→25 with the 3 new names.
- **DOC-05 (verify-only)** — confirmed the 3 v1 document shims (`app/api/v1/documents/{invoice,contract,receipt}/route.ts`) build and resolve; not recreated.

## Tasks

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Failing tests (RED) | c9e3637 | mcp-tools-documents.test.ts, mcp-registry.test.ts |
| 2 | Implement tools + wire registry (GREEN) | b9d72a8 | documents.ts, registry.ts |
| 3 | Type-fix + verify v1 shims + build gate | f949ace | documents.ts |

## Verification

- `pnpm test -- mcp-tools-documents` — 7 passed
- `pnpm test -- mcp-registry` — 3 passed
- `pnpm test` (full) — 23 suites / 107 tests passed
- `pnpm build` — compiled + type-checked successfully; `/api/v1/documents/{invoice,contract,receipt}` present in route output

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Generic `runPdfTool` to satisfy `CallToolResult`**
- **Found during:** Task 3 (`pnpm build` type-check gate)
- **Issue:** `runPdfTool(produce: () => Promise<{ content: unknown[] }>)` widened the success result to `{ content: unknown[] }`, which `tsc` rejected as not assignable to the SDK's `CallToolResult` callback return type. Jest (swc) did not catch this because it does not run full structural type checking; only `pnpm build` did.
- **Fix:** Made `runPdfTool<T extends { content: unknown[] }>(produce: () => Promise<T>)` so the precise inferred 2-block success type is preserved and flows through to `registerTool`.
- **Files modified:** `src/lib/mcp/tools/documents.ts`
- **Commit:** f949ace

## TDD Gate Compliance

RED (`test(04-01)` c9e3637) → GREEN (`feat(04-01)` b9d72a8) gates present and ordered. The Task 3 `fix(04-01)` commit (f949ace) is a type-correctness follow-up surfaced by the build gate.

## Self-Check: PASSED

- FOUND: src/lib/mcp/tools/documents.ts
- FOUND: src/lib/__tests__/mcp-tools-documents.test.ts
- FOUND commits: c9e3637, b9d72a8, f949ace
