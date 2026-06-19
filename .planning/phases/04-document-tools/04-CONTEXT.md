# Phase 4: Document Tools - Context

**Gathered:** 2026-06-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Expose the 3 PDF generators as MCP tools returning **base64 PDF as an embedded resource block + a text metadata fallback**, with a size guard that fails cleanly before Vercel's 4.5 MB body ceiling. Also confirm the v1 document shims (already restored). This is the first binary-output phase — all prior tools returned text-JSON. Covers DOC-01..DOC-05. Wraps existing `generate{Invoice,Receipt,Contract}Pdf` (each takes a JSON payload, returns `Uint8Array`). PDFs do NOT embed bank logos (verified — PERF-01 is irrelevant here).

**Tools (3):** `generate_invoice_pdf` → `generateInvoicePdf`, `generate_receipt_pdf` → `generateReceiptPdf`, `generate_contract_pdf` → `generateContractPdf`.

</domain>

<decisions>
## Implementation Decisions

### PDF Content Shape (DOC-01/02/03)
- **D-01:** Each tool returns **two content blocks**: (1) an embedded resource `{ type: 'resource', resource: { uri, mimeType: 'application/pdf', blob: <base64> } }` and (2) a `{ type: 'text', text: ... }` fallback. The resource `uri` is a **synthetic descriptive URI** (e.g. `mcp://orb3x/documents/invoice.pdf`). The text fallback carries **human-readable metadata**: document type, filename, byte size (and a note that the base64 PDF is in the resource block) — so clients that don't render embedded resources still get useful info.
- **D-02:** Tool result shape differs from prior phases (which used a single `text` JSON block). The MCP success result is `{ content: [resourceBlock, textBlock] }` (no `isError`). On failure, the standard `mcpToolHandler` path applies.

### Tool Naming
- **D-03:** Use the descriptive **`generate_invoice_pdf` / `generate_receipt_pdf` / `generate_contract_pdf`** names (from the roadmap success criteria). This is a deliberate exception to the `domain_operation` convention (Phases 2-3) — `generate_*_pdf` reads clearly as an action that produces a file, and matches the criteria verbatim. Record the exception so the verifier doesn't flag it.

### Size Guard (DOC-04)
- **D-04:** After generating the PDF bytes, guard with `pdfBytes.length * 1.34 > 4_000_000` (base64 inflation factor ~1.34 vs the 4.5 MB Vercel body limit, with headroom). On breach, return `{ isError: true }` with `{ code: 'PDF_TOO_LARGE', message: <estimated base64 size vs ~4MB limit + suggestion to reduce line items/content>, retryable: false }` BEFORE returning any response — so the client gets a clean structured error, never a Vercel 413. Non-retryable (regenerating identical input won't shrink it).

### File & Plan Organization
- **D-05:** One module `src/lib/mcp/tools/documents.ts` exporting `registerDocumentTools` with all 3 tools, plus a **shared helper** for building the resource+text content blocks and applying the size guard (DRY across the 3 tools). Single domain — no parallel waves. Plan as: one plan creating the tools + tests, verifying the already-present v1 shims (DOC-05: build passes, `/api/v1/documents/{contract,receipt}` resolve), and wiring `registerDocumentTools` into `registry.ts`. (Registry edit is fine in the same plan since there are no parallel sibling plans to conflict with.)

### DOC-05 status
- **D-06:** The v1 shims `app/api/v1/documents/{contract,receipt}/route.ts` **already exist, are git-tracked with correct re-export content, and the working tree is clean** (verified 2026-06-19). DOC-05 is therefore a **verification-only** item this phase: confirm the build passes with no import errors and the versioned URLs resolve. No shim re-creation needed unless the build reveals a problem.

### Carried forward from Phases 1-3 (locked — not re-discussed)
- `mcpToolHandler` boundary (incl. the Phase-3 duck-typed branch), registry aggregator, Zod inputSchema mirroring HTTP parsers, anti-collision descriptions for related tools, full-parity granularity, `@/` alias / `node:` prefix / named exports / single quotes / 2-space.

### Claude's Discretion
- Exact Zod schemas — mirror `InvoicePayload`/`ReceiptPayload`/`ContractPayload` in `src/lib/angola/documents.ts` and the `parseJsonBody` usage in `app/documents/*/route.ts`.
- Exact synthetic `uri` strings, text-fallback wording, and `PDF_TOO_LARGE` message text.
- Shared-helper signature (e.g. `pdfToolResult(bytes, { docType, filename })`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Foundation + prior phases
- `src/lib/mcp/tools/salary.ts` (or any prior tool) — `register<Domain>Tools` + `server.registerTool` pattern
- `src/lib/mcp/tool-error.ts` — `mcpToolHandler` (success path returns `{ content }`; this phase's success content is resource+text, not a single JSON text block — confirm mcpToolHandler passes through a custom content array, or the tool builds the content itself)
- `src/lib/mcp/registry.ts` — wire `registerDocumentTools`
- `.planning/phases/03-external-http-tools/03-CONTEXT.md` / `02-CONTEXT.md` — carried conventions

### Domain logic + payloads to wrap
- `src/lib/angola/documents.ts` — `generateInvoicePdf`/`generateReceiptPdf`/`generateContractPdf` (return `Uint8Array`) + `InvoicePayload`/`ReceiptPayload`/`ContractPayload` types (Zod schemas mirror these)
- `app/documents/invoice/route.ts`, `app/documents/receipt/route.ts`, `app/documents/contract/route.ts` — POST handlers using `parseJsonBody` + `noStoreBinary` (input shape reference)
- `app/api/v1/documents/{invoice,contract,receipt}/route.ts` — existing v1 shims (DOC-05 verify)
- `src/lib/http.ts` — `noStoreBinary` (how PDFs are returned over HTTP; not used by MCP but informs content type)

### IMPORTANT — MCP content shape note
- The success result for these tools is a custom 2-block content array (resource + text). Confirm whether `mcpToolHandler` (which currently wraps a return value into `{ content: [{ type:'text', text: JSON.stringify(result) }] }`) supports returning a pre-built content array, OR whether the document tools should construct/return the MCP result directly (bypassing the default JSON-stringify wrap) while still routing errors through `mcpToolHandler`. This is the single most important thing for research/planning to resolve.

### Requirements / roadmap
- `.planning/REQUIREMENTS.md` — DOC-01, DOC-02, DOC-03, DOC-04, DOC-05
- `.planning/ROADMAP.md` §"Phase 4: Document Tools"

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The 3 `generate*Pdf` functions already produce `Uint8Array` — tools just base64-encode (`Buffer.from(bytes).toString('base64')`) and wrap. No PDF logic to write.
- A shared `pdfToolResult` helper (build resource+text blocks + size guard) keeps the 3 tools DRY.
- Existing v1 shims are the DOC-05 deliverable and already present.

### Established Patterns
- `mcpToolHandler` for the error boundary; but the SUCCESS content shape here is non-standard (resource+text) — research must confirm how to emit a custom content array (likely the tool callback returns the full content array and a small change/variant of the handler, or a dedicated path). Keep RouteError/duck-typed error mapping intact.
- Node.js runtime; `Buffer` available; `node:` prefix for builtins.

### Integration Points
- New: `src/lib/mcp/tools/documents.ts` + test `src/lib/__tests__/mcp-tools-documents.test.ts`.
- Modified: `src/lib/mcp/registry.ts` (add `registerDocumentTools`). Possibly `src/lib/mcp/tool-error.ts` IF a custom-content path is needed (research to decide — prefer not to disturb the shared handler; a tool-local result builder is cleaner).
- Verify-only: `app/api/v1/documents/{contract,receipt}/route.ts` (build + URL resolution).

</code_context>

<specifics>
## Specific Ideas

- The base64 size guard (D-04) is a hard requirement — a too-large invoice (many line items) must fail with PDF_TOO_LARGE, not a Vercel 413.
- Text fallback must be genuinely useful (filename + byte size + note), not just "PDF generated".
- Tool names intentionally break the domain_operation convention (D-03) — this is expected.
- registry will reach 25 tools after this phase (22 + 3).

</specifics>

<deferred>
## Deferred Ideas

- MCP docs page (all 7 locales) — Phase 5.
- `annotations` (`audience: ["user"]`) on PDF content blocks — v2 (STRUCT-02).
- Streaming large PDFs to bypass the 4.5 MB limit — research's open question; out of scope (size guard is the chosen mitigation).
- Bank-logo embedding in PDFs — not currently done by the generators; out of scope.

None of the discussion strayed outside the phase scope.

</deferred>

---

*Phase: 4-Document Tools*
*Context gathered: 2026-06-19*
