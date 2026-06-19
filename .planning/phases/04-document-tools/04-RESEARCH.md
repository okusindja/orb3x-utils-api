# Phase 4: Document Tools - Research

**Researched:** 2026-06-19
**Domain:** MCP binary output (base64 PDF as embedded resource), `@modelcontextprotocol/sdk` content shapes, pdf-lib output, Vercel body-limit guard
**Confidence:** HIGH (all critical claims verified directly against installed SDK source, project code, and a runtime base64 measurement)

## Summary

This phase wraps the three existing PDF generators (`generateInvoicePdf`, `generateReceiptPdf`, `generateContractPdf` — each returns `Promise<Uint8Array>`) as MCP tools that emit a custom **2-block** content array: an embedded `resource` block carrying the base64 PDF, plus a `text` metadata fallback. The single most important question — how to emit a non-standard content array while keeping error mapping — resolves cleanly: the installed SDK types the `registerTool` callback return as `CallToolResult`, whose `content` is an array of `ContentBlock` (text | image | audio | resource | resource_link). So a tool callback **may return the full `{ content: [...] }` result directly**. The shared `mcpToolHandler` cannot be reused on the success path because it (a) is typed `content: Array<{ type:'text'; text:string }>` — too narrow to hold a resource block — and (b) unconditionally `JSON.stringify`s the return value into a single text block.

**Recommendation:** Do NOT modify `src/lib/mcp/tool-error.ts`. Build a small **tool-local result builder** (`pdfToolResult`) that: runs the size guard, base64-encodes via `Buffer.from(bytes).toString('base64')`, and returns the 2-block `CallToolResult`. Wrap each tool's body in a tool-local try/catch that returns the success result on the happy path and **delegates error formatting to `mcpToolHandler`** so `RouteError` (validation: `INVALID_INVOICE_PAYLOAD`, etc.) and the duck-typed branch stay intact. The size-guard breach is a `RouteError('PDF_TOO_LARGE', …, 413)` thrown before encoding, so it flows through the existing error path as `{ isError: true }` automatically.

**Primary recommendation:** One module `src/lib/mcp/tools/documents.ts` with `registerDocumentTools` + a private `pdfToolResult(bytes, { docType, filename, uri })` helper; wire into `registry.ts`; add `mcp-tools-documents.test.ts`; verify (not recreate) the 3 v1 shims.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| PDF byte generation | Angola Domain Logic (`src/lib/angola/documents.ts`) | — | Already exists; reused unchanged (DOC-01/02/03) |
| base64 encode + 2-block content assembly | MCP tool layer (`src/lib/mcp/tools/documents.ts`) | — | MCP-specific output shaping; HTTP route uses `noStoreBinary` instead |
| Size guard (pre-413) | MCP tool layer (`pdfToolResult` helper) | — | Must run before encoding/return; throws `RouteError` (DOC-04) |
| Error → `{ isError }` mapping | Shared `mcpToolHandler` (unchanged) | — | RouteError + duck-typed branch already correct |
| Tool registration | `registry.ts` (`registerDocumentTools`) | — | Integration wiring, same as Phases 2-3 |
| v1 URL resolution | App Router shims (`app/api/v1/documents/*`) | — | DOC-05 verify-only (already present + clean) |

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Two content blocks per tool: (1) `{ type: 'resource', resource: { uri, mimeType: 'application/pdf', blob: <base64> } }`, (2) `{ type: 'text', text: <human-readable metadata> }`. `uri` is synthetic/descriptive (e.g. `mcp://orb3x/documents/invoice.pdf`). Text fallback carries doc type, filename, byte size, and a note that the base64 PDF is in the resource block.
- **D-02:** Success result is `{ content: [resourceBlock, textBlock] }` with **no** `isError`. On failure the standard `mcpToolHandler` path applies.
- **D-03:** Tool names `generate_invoice_pdf` / `generate_receipt_pdf` / `generate_contract_pdf` — deliberate exception to the `domain_operation` convention. Record so the verifier doesn't flag it.
- **D-04:** After generating bytes, guard `pdfBytes.length * 1.34 > 4_000_000`. On breach return `{ isError: true }` with `{ code: 'PDF_TOO_LARGE', message: <estimated base64 size vs ~4MB + suggestion to reduce line items/content>, retryable: false }` BEFORE returning any response — never let it become a Vercel 413. Non-retryable.
- **D-05:** One module `src/lib/mcp/tools/documents.ts` exporting `registerDocumentTools` (all 3 tools) + a shared helper for resource+text blocks + size guard. Single domain — no parallel waves. One plan: tools + tests, verify v1 shims, wire `registerDocumentTools` into `registry.ts` (registry edit fine in same plan — no parallel siblings).
- **D-06:** v1 shims `app/api/v1/documents/{contract,receipt,invoice}/route.ts` already exist, git-tracked, correct re-export content, working tree clean. DOC-05 is **verification-only**: confirm build passes (no import errors) + versioned URLs resolve. No recreation unless the build reveals a problem.

### Carried forward (locked — not re-discussed)
- `mcpToolHandler` boundary (incl. Phase-3 duck-typed branch), registry aggregator, Zod inputSchema mirroring HTTP parsers, anti-collision descriptions for related tools, full-parity granularity, `@/` alias, `node:` prefix, named exports, single quotes, 2-space indent.

### Claude's Discretion
- Exact Zod schemas — mirror `InvoicePayload`/`ReceiptPayload`/`ContractPayload` and `parseJsonBody` usage in `app/documents/*/route.ts`.
- Exact synthetic `uri` strings, text-fallback wording, `PDF_TOO_LARGE` message text.
- Shared-helper signature (e.g. `pdfToolResult(bytes, { docType, filename })`).

### Deferred Ideas (OUT OF SCOPE)
- MCP docs page (7 locales) — Phase 5.
- `annotations` (`audience: ["user"]`) on PDF content blocks — v2 (STRUCT-02).
- Streaming large PDFs to bypass the 4.5 MB limit — size guard is the chosen mitigation.
- Bank-logo embedding in PDFs — generators don't do this; out of scope (PERF-01 irrelevant here).

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DOC-01 | Invoice PDF MCP tool → base64 embedded resource + text fallback | `generateInvoicePdf` returns `Uint8Array`; SDK `EmbeddedResource` schema verified to be exactly `{ type:'resource', resource:{ uri, mimeType, blob } }`; `ToolCallback` returns `CallToolResult` so a tool may return this shape directly |
| DOC-02 | Receipt PDF MCP tool → base64 + text fallback | `generateReceiptPdf` returns `Uint8Array`; same content shape via shared `pdfToolResult` helper |
| DOC-03 | Contract PDF MCP tool → base64 + text fallback | `generateContractPdf` returns `Uint8Array`; same helper |
| DOC-04 | Size guard `pdfBytes.length * 1.34 > 4_000_000` → `isError:true` | Runtime measurement confirms base64 ratio = 1.3334; throw `RouteError('PDF_TOO_LARGE', …)` before encode → flows through `mcpToolHandler` as `{ isError:true }` |
| DOC-05 | v1 document shims restored so build + versioned URLs work | All 3 shims (`invoice`, `contract`, `receipt`) verified present, git-tracked, correct re-export content — verify-only |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@modelcontextprotocol/sdk` | `^1.29.0` (installed) | `McpServer.registerTool`, `CallToolResult`/`EmbeddedResource` types | Already the project's MCP SDK; types verified in `node_modules/.../types.d.ts` |
| `zod` | `^3` | `inputSchema` per tool (mirror payload types) | Same pattern as all Phase 2-3 tools |
| `pdf-lib` | `^1.17.1` | PDF generation (already used by the 3 generators) | Existing; tools do not touch PDF logic |
| `node:buffer` (`Buffer`) | Node 22/24 runtime | base64 encode `Uint8Array` | Node.js runtime guaranteed (no Edge); `Buffer.from(u8).toString('base64')` |

**No new dependencies.** This phase installs nothing — it composes existing code. **Package Legitimacy Audit is therefore N/A** (no external package installs).

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `Buffer.from(bytes).toString('base64')` | `pdfDoc.saveAsBase64()` (pdf-lib) | The generators already return `Uint8Array`, not the `PDFDocument`; changing them is out of scope. Encode the bytes the tool receives. |
| Tool-local result builder | Add a `content`-passthrough option to `mcpToolHandler` | Disturbs the shared handler (used by 22 tools) and widens its `McpResult` type. CONTEXT D-05 + the canonical-refs note both prefer NOT disturbing the shared handler. Tool-local is cleaner and isolates the binary path. |

## Architecture Patterns

### THE critical decision — how to emit a custom 2-block content array (resolves CONTEXT's #1 question)

**Finding (VERIFIED against installed SDK):**
- `ToolCallback<Args> = BaseToolCallback<CallToolResult, …>` — i.e. the callback you pass to `server.registerTool(name, config, cb)` may return a full `CallToolResult` (or a Promise of one). `CallToolResult.content` is `ContentBlock[]`, and `ContentBlock` includes the `resource` variant. *Source: `node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.d.ts:261`, `types.d.ts:8079/8089`.*
- `EmbeddedResourceSchema` is exactly `{ type: 'resource', resource: ({ uri, mimeType?, text } | { uri, mimeType?, blob }) }`. The **`blob` field is the base64 string** (`BlobResourceContentsSchema.blob: z.ZodString`). This matches D-01 verbatim. *Source: `types.d.ts:1361` (BlobResourceContents), `types.d.ts:1979` (EmbeddedResource).*
- The shared `mcpToolHandler` (`src/lib/mcp/tool-error.ts`) is typed `McpResult = { content: Array<{ type:'text'; text:string }>; isError?: true }` and on success does `return { content: [{ type:'text', text: JSON.stringify(result) }] }`. **It cannot carry a resource block and always stringifies.** So it is unusable on the document success path. *Source: `src/lib/mcp/tool-error.ts:3-15`.*

**Recommendation (option b/c hybrid — tool-local result builder, shared handler untouched):**

Each tool callback is NOT wrapped by `mcpToolHandler`. Instead it has a tool-local try/catch:
- **Success path:** build and return the 2-block `CallToolResult` via the shared `pdfToolResult` helper (no `isError`).
- **Error path:** route the caught error through the **existing** `mcpToolHandler`'s error logic so `RouteError` (validation + `PDF_TOO_LARGE`) and the duck-typed branch produce the identical `{ isError: true, content: [...] }` shape every other tool uses.

Concretely, factor the error-formatting out so it can be reused on the document error path **without modifying the success behavior of `mcpToolHandler`**. Two equally clean shapes for the planner to choose from:

**Shape 1 (no edit to `tool-error.ts` — wrap an always-throwing inner fn):** Let `mcpToolHandler` call the generator + builder; on success it would JSON-stringify (wrong). So Shape 1 does NOT work for success. Use Shape 2.

**Shape 2 (recommended — tool returns success directly, reuses handler only for errors):**
```typescript
// src/lib/mcp/tools/documents.ts
import { Buffer } from 'node:buffer';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import { RouteError } from '@/lib/route-error';
import {
  generateInvoicePdf, generateReceiptPdf, generateContractPdf,
  type InvoicePayload, type ReceiptPayload, type ContractPayload,
} from '@/lib/angola/documents';

const BASE64_INFLATION = 1.34;
const MAX_BASE64_BYTES = 4_000_000;

type PdfToolResultMeta = { docType: string; filename: string; uri: string };

// Returns the 2-block success result; THROWS RouteError('PDF_TOO_LARGE') on breach (DOC-04).
function pdfToolResult(bytes: Uint8Array, meta: PdfToolResultMeta) {
  const estimatedBase64 = Math.ceil(bytes.length * BASE64_INFLATION);
  if (estimatedBase64 > MAX_BASE64_BYTES) {
    throw new RouteError(
      'PDF_TOO_LARGE',
      `The generated ${meta.docType} PDF is ~${estimatedBase64} bytes once base64-encoded, exceeding the ~${MAX_BASE64_BYTES}-byte response limit. Reduce the number of line items / content and try again.`,
      413,
      { retryable: false },
    );
  }
  const blob = Buffer.from(bytes).toString('base64');
  return {
    content: [
      { type: 'resource' as const, resource: { uri: meta.uri, mimeType: 'application/pdf', blob } },
      { type: 'text' as const,
        text: `${meta.docType} PDF generated (${meta.filename}, ${bytes.length} bytes). The document is base64-encoded in the resource block above (mimeType application/pdf).` },
    ],
  };
}

// Run the generator + builder, returning the success result; on ANY error,
// delegate to mcpToolHandler's formatter so RouteError + duck-typed mapping is identical to other tools.
async function runPdfTool<I>(produce: () => Promise<{ content: unknown[] }>) {
  // mcpToolHandler wraps the SUCCESS value in a text block — so we must NOT pass produce() through it on success.
  // Instead: call produce() ourselves; only route the error.
  try {
    return await produce();
  } catch (error) {
    // Reuse the shared error mapping by handing the thrown error to mcpToolHandler.
    return mcpToolHandler(() => { throw error; })(undefined as never);
  }
}
```
Then each `registerTool` callback is `(input) => runPdfTool(async () => pdfToolResult(await generateInvoicePdf(input), {...}))`.

> **Note for the planner:** `runPdfTool`'s error branch re-invokes `mcpToolHandler(() => { throw error })` purely to reuse its `RouteError`/duck-typed/`INTERNAL_SERVER_ERROR` formatting — this is a deliberate, zero-edit reuse of the shared handler. If the implementer finds this indirection awkward, the equally acceptable alternative is to **export a pure `formatMcpError(error): McpResult` function from `tool-error.ts`** and have `mcpToolHandler` call it internally — a refactor that does NOT change `mcpToolHandler`'s behavior or signature, only extracts the catch body. Either is fine; both keep success-path binary output local to `documents.ts`. The implementer's discretion (CONTEXT carries "keep RouteError/duck-typed error mapping intact").

**TypeScript note:** The success result type is wider than the shared `McpResult` (it includes a resource block). Type the callback's return as the SDK's `CallToolResult` or let inference + the `as const` literals satisfy `registerTool`. `registerTool` accepts `ToolCallback` returning `CallToolResult`, so a structurally-correct object passes. Avoid casting through the narrow `McpResult` type.

### Recommended Project Structure
```
src/lib/mcp/tools/documents.ts        # NEW: registerDocumentTools + pdfToolResult helper
src/lib/mcp/registry.ts               # MODIFIED: import + call registerDocumentTools
src/lib/__tests__/mcp-tools-documents.test.ts   # NEW: success shape, size guard, 3-tool parity
app/api/v1/documents/{invoice,contract,receipt}/route.ts  # VERIFY-ONLY (already present)
```

### Pattern: Zod inputSchema mirroring payload types
The HTTP routes use `parseJsonBody<InvoicePayload>` with **no validation** — `generate*Pdf` itself throws `RouteError` for missing required fields. The MCP Zod schema should mirror the payload TypeScript types (mostly optional fields, since the generator enforces the real requirements). Required-at-runtime fields per generator (from `documents.ts`):
- **invoice:** `seller.name`, `buyer.name`, ≥1 `items[]` (else `INVALID_INVOICE_PAYLOAD`).
- **receipt:** `receivedFrom.name`, numeric `amount` (else `INVALID_RECEIPT_PAYLOAD`).
- **contract:** ≥2 `parties[]`, ≥1 `clauses[]` (else `INVALID_CONTRACT_PAYLOAD`).

Mirror the nested `Party` shape (`{ name, nif?, address? }`), `items[]` (`{ description?, quantity?, unitPrice?, vatRate? }`), `parties[]`, `clauses: string[]`. Use `z.number()` not `z.coerce` (carried convention). You may make the runtime-required fields required in Zod for better client UX, OR keep them optional and let the generator's `RouteError` surface — discretion. Recommendation: make the clearly-required fields required in Zod (better `tools/list` schema + earlier feedback) while the generator remains the source of truth.

### Anti-Patterns to Avoid
- **Passing the PDF success value through `mcpToolHandler`:** it will `JSON.stringify` the `Uint8Array`/result into a single text block — wrong shape, no resource block.
- **Widening `McpResult` / editing `mcpToolHandler`'s success branch:** unnecessary; affects 22 other tools; contradicts D-05 preference.
- **Returning a data-URI or `text` with the base64 inline:** D-01 requires the base64 in `resource.blob`, with `text` as human-readable metadata only.
- **Encoding before the size guard:** guard first (cheap arithmetic on `bytes.length`), then encode — avoids building a huge base64 string only to reject it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| base64 encoding | manual btoa / char loops | `Buffer.from(bytes).toString('base64')` | Node runtime guaranteed; correct, fast, handles binary |
| Error → MCP shape | new error formatter | existing `mcpToolHandler` error branch | RouteError + duck-typed + INTERNAL_SERVER_ERROR already correct and tested |
| PDF generation | new pdf-lib code | existing `generate*Pdf` | DOC-01/02/03 explicitly reuse them; out of scope to touch |
| Content-block schema | hand-typed objects without validation | match SDK `EmbeddedResource` shape exactly | SDK validates the result against its Zod schema; wrong shape = runtime error |

**Key insight:** This phase is pure composition — every hard part (PDF bytes, error mapping, SDK types) already exists. The only genuinely new code is the 2-block assembly + size guard in one small helper.

## Common Pitfalls

### Pitfall 1: `mcpToolHandler` JSON-stringifies the success value
**What goes wrong:** Wrapping the PDF tool body in `mcpToolHandler` yields `{ content: [{ type:'text', text: '"<stringified bytes>"' }] }` — no resource block, garbage text.
**Why:** The handler's success branch is hard-coded to `JSON.stringify(result)`.
**How to avoid:** Return the 2-block result directly from the callback; use the handler only for the error path.
**Warning sign:** Test asserts `content[0].type === 'resource'` fails / `content.length === 1`.

### Pitfall 2: Size guard placed after encoding (or omitted)
**What goes wrong:** A 50-line-item invoice produces a PDF that base64-inflates past ~4 MB and Vercel returns a raw 413 the client can't interpret.
**Why:** The Vercel function response body limit (~4.5 MB on Hobby) is hit before your code returns.
**How to avoid:** Guard `bytes.length * 1.34 > 4_000_000` and throw `RouteError('PDF_TOO_LARGE', …, 413)` **before** `Buffer.from(...).toString('base64')`. Confirmed ratio is 1.3334 (measured), so 1.34 with a 4_000_000 ceiling (vs ~4.5 MB real limit) leaves ~0.5 MB headroom.
**Warning sign:** Client receives an HTML/empty 413 instead of `{ isError: true, content:[{... PDF_TOO_LARGE ...}] }`.

### Pitfall 3: TypeScript narrowing to `McpResult`
**What goes wrong:** Annotating the return as the shared `McpResult` type rejects the resource block (`type:'text'` only).
**Why:** `McpResult` in `tool-error.ts` is text-only by design.
**How to avoid:** Let inference + `as const` satisfy `registerTool`'s `CallToolResult` callback type; do not import/annotate `McpResult` for the success object.

### Pitfall 4: Resource block missing `mimeType` or using `text` instead of `blob`
**What goes wrong:** Using `resource: { uri, text }` (the Text variant) or omitting `mimeType` produces a non-PDF resource.
**Why:** SDK `EmbeddedResource.resource` is a union of Text vs Blob contents; PDFs must use the **Blob** variant (`blob` field).
**How to avoid:** Always `{ uri, mimeType: 'application/pdf', blob }`.

## Runtime State Inventory

> Not a rename/refactor/migration phase. No stored data, live-service config, OS-registered state, secrets/env vars, or build artifacts are mutated. Section N/A — verified by reading the phase boundary (additive: 1 new module + 1 registry line + 1 test; 3 verify-only shims).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.x + jsdom (`jest.config.js`); `@/` → `src/` moduleNameMapper |
| Config file | `jest.config.js` |
| Quick run command | `pnpm test -- mcp-tools-documents` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DOC-01 | `generate_invoice_pdf` success returns resource+text 2-block, `blob` is base64, no `isError` | unit | `pnpm test -- mcp-tools-documents` | ❌ Wave 0 |
| DOC-02 | `generate_receipt_pdf` success 2-block parity | unit | same | ❌ Wave 0 |
| DOC-03 | `generate_contract_pdf` success 2-block parity | unit | same | ❌ Wave 0 |
| DOC-04 | Oversize PDF → `{ isError:true }` with `code:'PDF_TOO_LARGE'`, `retryable:false` | unit | same | ❌ Wave 0 |
| DOC-04 | Validation failure (missing required field) → `isError` via RouteError (`INVALID_*_PAYLOAD`) | unit | same | ❌ Wave 0 |
| DOC-03/registry | All 3 tools registered; total registry count = 25 (22 + 3) | unit | `pnpm test -- mcp-registry` | ⚠️ update existing (22→25, add 3 names) |
| DOC-05 | Build passes, no import errors, v1 doc URLs resolve | build/smoke | `pnpm build` (or `pnpm tsc --noEmit`) + URL check | manual/build |

**Test patterns to mirror** (from `mcp-tools-salary.test.ts` + `mcp-tools-nif.test.ts`):
- `buildMockServer()` capturing `registerTool(name, meta, handler)` into a `registeredTools` map.
- Assert `meta.title`/`meta.description` non-empty; description names a sibling (D-03 anti-collision) — but note these tools are `generate_*_pdf`, so the sibling-name regex should match `generate_invoice_pdf|generate_receipt_pdf|generate_contract_pdf`.
- Success: `result.isError` undefined, `content[0].type === 'resource'`, `content[0].resource.mimeType === 'application/pdf'`, `content[0].resource.blob` is a non-empty base64 string (`/^[A-Za-z0-9+/]+=*$/`), `content[1].type === 'text'` containing filename + byte size.
- Size guard: monkeypatch/spy the generator to return a `Uint8Array` whose `length * 1.34 > 4_000_000` (e.g. `new Uint8Array(3_100_000)`), assert `isError === true` and `JSON.parse(content[0].text).code === 'PDF_TOO_LARGE'`. (You can `jest.mock('@/lib/angola/documents')` to avoid running pdf-lib for the oversize case, mirroring how `mcp-tools-nif.test.ts` mocks `@/lib/agt-nif`.)
- Validation error: call a tool with an empty/invalid payload, assert `isError` and the `INVALID_*_PAYLOAD` code surfaces through the same path.

### Sampling Rate
- **Per task commit:** `pnpm test -- mcp-tools-documents`
- **Per wave merge / phase gate:** `pnpm test` (full) + `pnpm build` green before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] `src/lib/__tests__/mcp-tools-documents.test.ts` — covers DOC-01..DOC-04
- [ ] Update `src/lib/__tests__/mcp-registry.test.ts` — bump 22→25 and add the 3 `generate_*_pdf` names to the `expectedTools` list and count assertion
- [ ] No framework install needed (Jest present)

## Environment Availability

> No new external runtime dependencies. `Buffer` (Node 22/24), `pdf-lib`, `zod`, `@modelcontextprotocol/sdk`, Jest all present. Section otherwise N/A.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node `Buffer` | base64 encode | ✓ | Node 22 (local) / 24 (Vercel) | — |
| `@modelcontextprotocol/sdk` | tool registration + types | ✓ | ^1.29.0 | — |
| `pdf-lib` | existing generators | ✓ | ^1.17.1 | — |
| Jest | tests | ✓ | 30.x | — |

## Security Domain

`security_enforcement` key is **absent** from `.planning/config.json` (treated as enabled). This phase processes structured JSON input and produces a PDF — relevant ASVS categories are minimal.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Public endpoint by design (Out of Scope in REQUIREMENTS) |
| V3 Session Management | no | Stateless request/response |
| V4 Access Control | no | Public, no per-user resources |
| V5 Input Validation | yes | Zod `inputSchema` on each tool + generator `RouteError` guards; **size guard (DOC-04) caps output** |
| V6 Cryptography | no | No crypto; base64 is encoding, not encryption |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Resource exhaustion via huge PDF (many line items) → oversized response | Denial of Service | DOC-04 size guard rejects before encode/413; `maxDuration` bounds runtime |
| Malformed/oversized JSON input | DoS / Tampering | Zod schema + `parseJsonBody` JSON parse; generator `RouteError` on missing fields |
| Injection into PDF text | Tampering | pdf-lib draws text literally (no template/script eval); inputs are plain strings — low risk |

No new secrets, no auth surface, no upstream calls (unlike Phase 3). Lowest-risk phase to date.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Text-JSON single block (Phases 2-3) | 2-block resource+text for binary (this phase) | Phase 4 | First binary-output tools; success path bypasses shared handler |
| MCP image/binary as base64 `image` block | `resource` embedded block with `blob` for non-image binaries (PDF) | MCP spec | PDFs use `resource` (mimeType `application/pdf`), not `image` |

**Deprecated/outdated:** The deprecated `server.tool(...)` overloads exist in the SDK (`mcp.d.ts:110+` marked `@deprecated`). Use `server.registerTool(name, config, cb)` as all existing tools do.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vercel Hobby response body limit is ~4.5 MB (the basis for the 4_000_000 ceiling) | Pitfall 2 / DOC-04 | If lower than assumed, a PDF passing the guard could still 413. Mitigation: the 4_000_000 vs ~4.5 MB gap already leaves ~0.5 MB headroom. STATE.md flags this as a pre-existing research concern; the size guard is the chosen mitigation regardless of exact limit. Tunable via the `MAX_BASE64_BYTES` constant. |
| A2 | MCP clients render an `application/pdf` embedded `resource` blob usefully | D-01 design | If a client ignores resource blocks, the `text` fallback (filename + size + note) still informs it — that's exactly why D-01 mandates the dual block. Low risk. |

> All other claims are VERIFIED against installed SDK source, project code, or a runtime measurement.

## Open Questions (RESOLVED)

1. **Exact Vercel Hobby body limit (A1).** — RESOLVED: ship the `4_000_000` ceiling (D-04 locked) exposed as a tunable `MAX_BASE64_BYTES` constant; do not block the phase.
   - What we know: 4_000_000 ceiling with 1.34 factor leaves headroom vs the assumed ~4.5 MB.
   - What's unclear: precise current Hobby-tier limit.
   - Recommendation: ship the guard as specified (D-04 locked); expose `MAX_BASE64_BYTES` as a constant so it's trivially tunable. Do NOT block the phase on this — the guard is strictly safer than no guard.

2. **Should runtime-required fields be required in Zod, or left optional (generator enforces)?** — RESOLVED: make the clearly-required fields required in Zod; generator stays source of truth (Claude's Discretion, either choice passes tests).
   - What we know: generators throw `RouteError` for missing required fields; HTTP routes do zero pre-validation.
   - Recommendation (discretion): make the clearly-required fields required in Zod for a better `tools/list` schema and earlier client feedback, while the generator stays the source of truth. Either choice passes tests.

## Sources

### Primary (HIGH confidence)
- `node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.d.ts:261` — `ToolCallback` returns `CallToolResult`
- `node_modules/@modelcontextprotocol/sdk/dist/esm/types.d.ts:1361,1979,8079,8089` — `BlobResourceContents` (`blob: ZodString`), `EmbeddedResource` (`{ type:'resource', resource:{ uri, mimeType?, blob } }`), `ContentBlock`, `CallToolResult`
- `node_modules/pdf-lib/cjs/api/PDFDocument.d.ts:754` — `save(): Promise<Uint8Array>` (and `saveAsBase64()` exists but generators return bytes)
- `src/lib/mcp/tool-error.ts` — `mcpToolHandler` success branch JSON-stringifies; `McpResult` is text-only
- `src/lib/angola/documents.ts` — generator signatures + payload types + required-field RouteErrors
- `src/lib/mcp/tools/salary.ts`, `tools/currency.ts` — `registerTool` + error patterns
- `app/documents/{invoice,receipt,contract}/route.ts` + `app/api/v1/documents/*` (all 3 shims present, clean)
- Runtime measurement: `Buffer.alloc(100000).toString('base64').length` = 133336 → ratio 1.3334 (validates `* 1.34`)
- `package.json` — `@modelcontextprotocol/sdk ^1.29.0`, `pdf-lib ^1.17.1`, `zod ^3`, Jest 30

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — Phase-4 research flag on Vercel body ceiling (informs A1)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified in installed `package.json` + node_modules
- Architecture (critical content-shape decision): HIGH — SDK callback/result/embedded-resource types read directly from installed source
- Size guard / base64: HIGH — ratio measured at runtime
- Pitfalls: HIGH — derived from the actual `mcpToolHandler`/`McpResult` source
- A1 (Vercel limit): MEDIUM/ASSUMED — exact Hobby limit not re-verified; guard is robust regardless

**Research date:** 2026-06-19
**Valid until:** 2026-07-19 (stable; SDK pinned `^1.29.0`, no fast-moving external surface)
