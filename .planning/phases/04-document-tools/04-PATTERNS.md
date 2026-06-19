# Phase 4: Document Tools - Pattern Map

**Mapped:** 2026-06-19
**Files analyzed:** 4 (2 create, 2 modify) + 4 read-only analogs
**Analogs found:** 4 / 4

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/mcp/tools/documents.ts` (CREATE) | mcp-tool module | transform / binary-output (request→base64 PDF) | `src/lib/mcp/tools/salary.ts` (register pattern) + `src/lib/mcp/tools/nif.ts` (tool-local try/catch) | role-match (binary output is new) |
| `src/lib/__tests__/mcp-tools-documents.test.ts` (CREATE) | test | unit | `src/lib/__tests__/mcp-tools-nif.test.ts` (mock domain) + `mcp-tools-salary.test.ts` (multi-tool) | role-match |
| `src/lib/mcp/registry.ts` (MODIFY) | registry aggregator | wiring | self (existing pattern) | exact |
| `src/lib/__tests__/mcp-registry.test.ts` (MODIFY) | test | unit | self (existing assertions) | exact |

**Read-only analogs the implementation must mirror:**
- `src/lib/angola/documents.ts` — generator signatures + payload types (Zod source of truth)
- `app/documents/{invoice,receipt,contract}/route.ts` — `parseJsonBody<Payload>` input shape
- `src/lib/mcp/tool-error.ts` — `mcpToolHandler` error-path delegation (DO NOT MODIFY)
- `app/api/v1/documents/{invoice,contract,receipt}/route.ts` — DOC-05 verify-only shims (confirmed present + correct)

---

## Pattern Assignments

### `src/lib/mcp/tools/documents.ts` (mcp-tool module, binary-output)

**Analogs:** `src/lib/mcp/tools/salary.ts` (register shape + multi-tool module), `src/lib/mcp/tools/nif.ts` (tool-local try/catch wrapping a domain call).

**CRITICAL DEVIATION (D-01/D-02, RESEARCH §"THE critical decision"):** Unlike every prior tool, the SUCCESS path must NOT pass through `mcpToolHandler` (it JSON-stringifies into a single text block and its `McpResult` type is text-only — cannot carry a `resource` block). Build the 2-block result directly; route ONLY errors through `mcpToolHandler`.

**Imports pattern** (mirror `salary.ts` lines 1-8, add `node:buffer` + `RouteError`):
```typescript
import { Buffer } from 'node:buffer';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import { RouteError } from '@/lib/route-error';
import {
  generateInvoicePdf,
  generateReceiptPdf,
  generateContractPdf,
  type InvoicePayload,
  type ReceiptPayload,
  type ContractPayload,
} from '@/lib/angola/documents';
```

**register shape** (copy from `salary.ts` lines 11-34 — `server.registerTool(name, { title, description, inputSchema: z.object({...}) }, handler)`):
```typescript
server.registerTool(
  'generate_invoice_pdf',
  {
    title: 'Generate Angola Invoice PDF',
    description:
      'Generate an Angola invoice PDF ... ' +
      // D-03 anti-collision: name siblings generate_receipt_pdf / generate_contract_pdf
      'For a payment acknowledgement use `generate_receipt_pdf`. For an agreement use `generate_contract_pdf`.',
    inputSchema: z.object({ /* mirror InvoicePayload — see Zod mirroring below */ }),
  },
  handler, // NOT mcpToolHandler(...) on success — see error-delegation pattern below
);
```
Note D-03: tool names `generate_invoice_pdf` / `generate_receipt_pdf` / `generate_contract_pdf` intentionally break the `domain_operation` convention. Anti-collision sibling-name regex for tests is `generate_invoice_pdf|generate_receipt_pdf|generate_contract_pdf`.

**Shared `pdfToolResult` helper** (D-04 size guard + 2-block assembly; RESEARCH lines 116-134). Guard FIRST (cheap arithmetic), then encode:
```typescript
const BASE64_INFLATION = 1.34;
const MAX_BASE64_BYTES = 4_000_000;

type PdfToolResultMeta = { docType: string; filename: string; uri: string };

function pdfToolResult(bytes: Uint8Array, meta: PdfToolResultMeta) {
  const estimatedBase64 = Math.ceil(bytes.length * BASE64_INFLATION);
  if (estimatedBase64 > MAX_BASE64_BYTES) {
    throw new RouteError(
      'PDF_TOO_LARGE',
      `The generated ${meta.docType} PDF is ~${estimatedBase64} bytes base64-encoded, exceeding the ~${MAX_BASE64_BYTES}-byte limit. Reduce line items / content and retry.`,
      413,
      { retryable: false },
    );
  }
  const blob = Buffer.from(bytes).toString('base64');
  return {
    content: [
      { type: 'resource' as const, resource: { uri: meta.uri, mimeType: 'application/pdf', blob } },
      { type: 'text' as const,
        text: `${meta.docType} PDF generated (${meta.filename}, ${bytes.length} bytes). The base64 PDF is in the resource block above (application/pdf).` },
    ],
  };
}
```

**Error-path delegation pattern** (reuse `mcpToolHandler`'s formatter WITHOUT modifying it — RESEARCH lines 138-151). Success returns directly; any throw is re-routed:
```typescript
async function runPdfTool(produce: () => Promise<unknown>) {
  try {
    return await produce(); // SUCCESS: 2-block result, no isError
  } catch (error) {
    // Reuse the shared RouteError + duck-typed + INTERNAL_SERVER_ERROR mapping. Zero edit to tool-error.ts.
    return mcpToolHandler(() => { throw error; })(undefined as never);
  }
}
```
Each callback: `async (input) => runPdfTool(async () => pdfToolResult(await generateInvoicePdf(input as InvoicePayload), { docType: 'Invoice', filename: 'invoice.pdf', uri: 'mcp://orb3x/documents/invoice.pdf' }))`.

> Acceptable alternative (implementer discretion, RESEARCH line 151): export a pure `formatMcpError(error)` from `tool-error.ts` (extract the catch body only — no behavior/signature change) and call it on the error path. Either keeps the binary success path local to `documents.ts`.

**TypeScript note** (RESEARCH lines 153, 202-205): do NOT annotate the success object as the narrow `McpResult` (text-only). Let `as const` literals + inference satisfy `registerTool`'s `CallToolResult` callback type.

**Zod inputSchema mirroring** — source of truth is `src/lib/angola/documents.ts` lines 6-44. Mirror nested `Party { name, nif?, address? }`. Recommendation (RESEARCH 169, 311-313): make the runtime-required fields required in Zod, rest optional. Use `z.number()` (NOT `z.coerce`):
- **invoice** (`InvoicePayload` lines 12-25): required `seller.name`, `buyer.name`, ≥1 `items[]` (`{ description?, quantity?, unitPrice?, vatRate? }`); optional `invoiceNumber/issueDate/dueDate/notes`. Generator throws `INVALID_INVOICE_PAYLOAD` (line 50).
- **receipt** (`ReceiptPayload` lines 27-35): required `receivedFrom.name`, `amount` (number); optional rest. Generator throws `INVALID_RECEIPT_PAYLOAD` (line 74).
- **contract** (`ContractPayload` lines 37-44): required ≥2 `parties[]`, ≥1 `clauses: string[]`; optional rest. Generator throws `INVALID_CONTRACT_PAYLOAD` (line 95).

Input shape matches the HTTP route's `parseJsonBody<InvoicePayload>(request)` body (`app/documents/invoice/route.ts` line 14) — same payload object passed straight to the generator.

---

### `src/lib/__tests__/mcp-tools-documents.test.ts` (test, unit)

**Analogs:** `mcp-tools-nif.test.ts` (mocks the domain module + `buildMockServer`), `mcp-tools-salary.test.ts` (multi-tool registration + happy/error split).

**Mock the domain module** to control byte size and skip pdf-lib for the oversize case (mirror nif test lines 6-27):
```typescript
jest.mock('@/lib/angola/documents', () => ({
  generateInvoicePdf: jest.fn(),
  generateReceiptPdf: jest.fn(),
  generateContractPdf: jest.fn(),
}));
import { generateInvoicePdf } from '@/lib/angola/documents';
const mockInvoice = generateInvoicePdf as jest.Mock;
```

**`buildMockServer` helper** capturing `registerTool(name, meta, handler)` (copy from `mcp-tools-nif.test.ts` lines 32-44):
```typescript
type McpResult = { content: Array<{ type: string; text?: string; resource?: { uri: string; mimeType: string; blob: string } }>; isError?: boolean };
function buildMockServer() {
  const registeredTools: Record<string, { meta: unknown; handler: (i: unknown) => Promise<McpResult> }> = {};
  const mockServer = { registerTool: (name, meta, handler) => { registeredTools[name] = { meta, handler }; } };
  return { mockServer: mockServer as never, registeredTools };
}
```

**Required cases** (RESEARCH lines 229-243):
- Registration: all 3 `generate_*_pdf` defined; title/description non-empty; description matches `/generate_invoice_pdf|generate_receipt_pdf|generate_contract_pdf/` (D-03 anti-collision, like salary test lines 37-45).
- DOC-01/02/03 success: mock generator resolves a small `Uint8Array` (e.g. `new Uint8Array(64)`); assert `result.isError` undefined, `content` length 2, `content[0].type === 'resource'`, `content[0].resource.mimeType === 'application/pdf'`, `content[0].resource.blob` matches `/^[A-Za-z0-9+/]+=*$/` and non-empty, `content[1].type === 'text'` containing filename + byte size.
- DOC-04 size guard: mock generator resolves `new Uint8Array(3_100_000)` (3.1M × 1.34 > 4M); assert `isError === true`, `JSON.parse(content[0].text).code === 'PDF_TOO_LARGE'`, `.retryable === false`.
- DOC-04 validation: mock generator rejects with `RouteError('INVALID_INVOICE_PAYLOAD', ..., 400)` (or call real generator with `{}` if not mocking); assert `isError`, code `INVALID_INVOICE_PAYLOAD` surfaces through the same error path (mirror salary error test lines 80-108).

`reset()` mocks in `beforeEach` (nif test line 48).

---

### `src/lib/mcp/registry.ts` (registry aggregator, MODIFY)

**Analog:** self. Add an import (after line 11) and a call (after line 23), mirroring every existing pair:
```typescript
import { registerDocumentTools } from './tools/documents';   // alongside lines 2-11
// ...
registerDocumentTools(server);                               // inside registerAllTools, alongside lines 14-23
```

---

### `src/lib/__tests__/mcp-registry.test.ts` (test, MODIFY)

**Analog:** self. Current assertion is the "registers all 22 core utility tools" block (lines 63-108). Three changes:
1. Rename the `it(...)` label `22` → `25` (line 63).
2. Append to `expectedTools` (after line 98): `'generate_invoice_pdf'`, `'generate_receipt_pdf'`, `'generate_contract_pdf'`.
3. Bump the final count assertion (line 107): `toBeGreaterThanOrEqual(22)` → `toBeGreaterThanOrEqual(25)`.

Note: the file already mocks `@/lib/agt-nif` (lines 3-19) to avoid cheerio ESM in jsdom — keep it. No new mock needed (documents uses pdf-lib which loads fine, but registration tests never invoke handlers).

---

## Shared Patterns

### Error → MCP mapping (REUSE, do not modify)
**Source:** `src/lib/mcp/tool-error.ts` (`mcpToolHandler`, lines 8-75)
**Apply to:** the error path of all 3 document tools via `runPdfTool`'s catch (or an extracted `formatMcpError`).
Handles `RouteError` (lines 18-32 → `{ code, message, ...details }`, so `PDF_TOO_LARGE` + `retryable:false` and `INVALID_*_PAYLOAD` flow through unchanged), the duck-typed external-error branch (lines 36-62), and `INTERNAL_SERVER_ERROR` fallback (lines 63-72). All emit `{ isError: true, content: [{ type:'text', text }] }`.

### Tool registration aggregation
**Source:** `src/lib/mcp/registry.ts` (import + call pairs, lines 2-23)
**Apply to:** wiring `registerDocumentTools`.

### registerTool config + Zod inputSchema + anti-collision descriptions
**Source:** `src/lib/mcp/tools/salary.ts` (lines 11-34)
**Apply to:** all 3 document tools (title, multi-sentence description naming a sibling, `z.object` schema).

### Payload input contract
**Source:** `app/documents/invoice/route.ts` line 14 (`parseJsonBody<InvoicePayload>`) + `src/lib/angola/documents.ts` payload types
**Apply to:** the Zod schemas — the MCP `input` is the same object the HTTP route passes to the generator.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | — | — | All files have a strong analog. The only genuinely new code is the 2-block resource+text assembly + size guard in `pdfToolResult`, fully specified by RESEARCH lines 116-134. |

## Metadata

**Analog search scope:** `src/lib/mcp/tools/`, `src/lib/mcp/`, `src/lib/__tests__/`, `src/lib/angola/documents.ts`, `app/documents/`, `app/api/v1/documents/`
**Files scanned:** salary.ts, nif.ts, tool-error.ts, registry.ts, mcp-registry.test.ts, mcp-tools-nif.test.ts, mcp-tools-salary.test.ts, angola/documents.ts, documents/invoice/route.ts, api/v1/documents/{invoice,contract,receipt}/route.ts
**DOC-05 status:** All 3 v1 shims confirmed present with correct re-export content (verify-only — no recreation).
**Pattern extraction date:** 2026-06-19
