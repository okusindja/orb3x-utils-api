---
phase: 04-document-tools
reviewed: 2026-06-19T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/lib/mcp/tools/documents.ts
  - src/lib/__tests__/mcp-tools-documents.test.ts
  - src/lib/mcp/registry.ts
  - src/lib/__tests__/mcp-registry.test.ts
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-06-19
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Reviewed the Phase 4 document MCP tools (`documents.ts`), its test, the central
registry, and the registry test. The intentional design decisions called out in the
review context were verified and confirmed sound:

- The 2-block success result bypassing `mcpToolHandler` works and is correct (the error
  path re-routes through `mcpToolHandler` via `runPdfTool`, confirmed by tests).
- The base64 size-guard arithmetic is **conservatively correct**: `Math.ceil(n * 1.34)`
  slightly over-estimates true base64 length (`4 * ceil(n/3)` ≈ `n * 1.3333`), so it never
  under-counts. Ordering (guard before `Buffer.from(...).toString('base64')`) is correct.
- `Buffer.from(bytes)` on a `Uint8Array` is correct Node usage; base64 encoding is sound.
- Zod `inputSchema` passed as `z.object(...)` matches the SDK's accepted `AnySchema` and is
  consistent with every other registered tool.

No critical (blocker) defects were found. The findings below are correctness/robustness
gaps (resource exhaustion, schema-vs-domain validation gaps, a stale shared URI) and minor
quality items. The most actionable is the **unbounded input array** resource-exhaustion
risk (WR-01), since untrusted JSON drives in-memory PDF construction.

## Warnings

### WR-01: Unbounded input arrays allow pre-guard memory/CPU exhaustion

**File:** `src/lib/mcp/tools/documents.ts:91-101` (invoice `items`), `:159-160` (contract `parties`/`clauses`)
**Issue:** The array schemas enforce a lower bound (`.min(1)` / `.min(2)`) but **no upper
bound**. An untrusted MCP caller can submit an arbitrarily large `items`, `parties`, or
`clauses` array. The full payload is processed in memory — `calculateInvoiceTotals` maps and
reduces every line, `formatParty`/`wrapText`/`join` run over every element, and `pdf-lib`
builds the document — *before* the `PDF_TOO_LARGE` guard runs. The size guard only inspects
the **output** byte length; it cannot prevent the upstream work. (Note: `buildPdfDocument`
breaks its draw loop at `y < 80`, so the rendered PDF stays small, which means a huge input
may never even trip the output-size guard while still forcing O(n) in-memory work and string
allocation on the serverless function.) On the free Vercel tier this is a cheap
denial-of-service / memory-pressure vector.
**Fix:** Add explicit upper bounds to the array schemas so the SDK's Zod validation rejects
oversized payloads before any domain logic runs:
```typescript
items: z.array(/* ... */).min(1).max(200).describe('At least one invoice line item (required).'),
// contract:
parties: z.array(partySchema).min(2).max(50).describe('At least two contracting parties (required).'),
clauses: z.array(z.string().max(5_000)).min(1).max(200).describe('At least one contract clause (required).'),
```
Also consider `.max()` on free-text string fields (`notes`, `description`, clause strings) to
cap per-field size.

### WR-02: Invoice schema marks quantity/unitPrice optional, weakening MCP-layer validation

**File:** `src/lib/mcp/tools/documents.ts:93-99`
**Issue:** The invoice line schema marks `description`, `quantity`, `unitPrice`, and `vatRate`
all `.optional()`. The MCP `inputSchema` is the first validation boundary AI clients see for
the tool contract. Because these are optional, a call like `{ items: [{}] }` passes Zod
validation and is forwarded to `generateInvoicePdf`. It then reaches `calculateInvoiceTotals`,
which throws `INVALID_INVOICE_LINE` ("positive quantity ... non-negative unit price") only at
the domain layer. By contrast, the sibling `finance_invoice_total` tool (`finance.ts:44-54`)
correctly declares `quantity: z.number().positive()` and `unitPrice: z.number().nonnegative()`.
The document tool's looser schema is inconsistent and surfaces validation failures deeper than
necessary, with a less specific/discoverable contract.
**Fix:** Tighten the invoice line schema to match the domain contract and the finance tool:
```typescript
z.object({
  description: z.string().optional().describe('Line item description.'),
  quantity: z.number().positive().describe('Quantity of units (required, positive).'),
  unitPrice: z.number().nonnegative().describe('Unit price in AOA (Kz) (required, >= 0).'),
  vatRate: z.number().min(0).max(100).optional().describe('VAT rate percent for the line.'),
}),
```

### WR-03: Static, shared resource `uri` collides across concurrent generations

**File:** `src/lib/mcp/tools/documents.ts:110,141,169` (`uri: 'mcp://orb3x/documents/invoice.pdf'`, etc.)
**Issue:** Every invocation of a given tool emits the identical hardcoded resource `uri`
(`mcp://orb3x/documents/invoice.pdf`). MCP resource URIs are intended to identify a specific
resource instance; reusing one constant URI for every generated document means an MCP client
that caches or dereferences resources by URI cannot distinguish two different generated
invoices, and a later result may appear to overwrite/alias an earlier one in client-side
resource stores. Because the document content is delivered inline as a base64 `blob`, this is
not data loss, but it is a contract smell that can cause client-side caching bugs.
**Fix:** Make the URI unique per generation, e.g. append a random/UUID or content hash:
```typescript
import { randomUUID } from 'node:crypto';
// ...
uri: `mcp://orb3x/documents/invoice-${randomUUID()}.pdf`,
```

### WR-04: `runPdfTool` invokes the error formatter with `undefined as never`, relying on undocumented handler tolerance

**File:** `src/lib/mcp/tools/documents.ts:64-72`
**Issue:** On the error path, `runPdfTool` calls
`mcpToolHandler(() => { throw error; })(undefined as never)`. This works only because the inner
callback ignores its `input` argument and immediately throws — the `undefined as never`
argument is never used. The `as never` cast suppresses the type system entirely; if
`mcpToolHandler` ever changed to touch its input before invoking the callback (e.g. logging or
pre-validation), this would pass `undefined` into code expecting a real input and the compiler
would not catch it. It is a fragile coupling to the current internal behavior of
`tool-error.ts`.
**Fix:** Re-route the error through `mcpToolHandler` without the synthetic input by having the
thrown error be the callback's payload directly. A clearer form:
```typescript
async function runPdfTool<T extends { content: unknown[] }>(produce: () => Promise<T>) {
  try {
    return await produce();
  } catch (error) {
    // Reuse the shared formatter; the callback ignores input by design.
    return mcpToolHandler<void>(() => {
      throw error;
    })();
  }
}
```
At minimum, add a comment pinning the contract ("mcpToolHandler must not read input before
invoking the callback") so the dependency is explicit.

## Info

### IN-01: Magic numbers `1.34` / `4_000_000` lack derivation context at point of use

**File:** `src/lib/mcp/tools/documents.ts:17-18`
**Issue:** `BASE64_INFLATION = 1.34` and `MAX_BASE64_BYTES = 4_000_000` are named constants
(good), and the header comment explains the inflation factor. However the `4_000_000` limit
is asserted without tying it to the actual Vercel response-body limit, and it does not account
for the JSON envelope / resource-block wrapper overhead that surrounds the base64 blob in the
final serialized MCP response. The effective limit for the *whole* response is lower than 4 MB
for the blob alone.
**Fix:** Document the source of `4_000_000` (which Vercel limit, and that it is the blob budget
not the full-response budget), and consider lowering it to leave headroom for the JSON/resource
wrapper, e.g. `3_800_000`.

### IN-02: Test asserts base64 charset but never decodes/validates PDF bytes round-trip

**File:** `src/lib/__tests__/mcp-tools-documents.test.ts:100-101`
**Issue:** The success test checks `blob` matches a base64 charset regex and is non-empty, but
never decodes the blob back to verify it equals the original `Uint8Array(64)` bytes. A bug that
corrupted/truncated the encoding (or swapped to a wrong encoding) could still pass. Since the
mock returns a known 64-byte buffer, a round-trip assertion is cheap and strengthens the test.
**Fix:**
```typescript
const decoded = Buffer.from(resourceBlock.resource!.blob, 'base64');
expect(decoded).toHaveLength(64);
```

### IN-03: Registry test hardcodes "25 core tools" count and an explicit list — brittle on tool additions

**File:** `src/lib/__tests__/mcp-registry.test.ts:63,110`
**Issue:** The test name says "all 25 core utility tools" but the `expectedTools` list contains
24 names, and the only count assertion is `toBeGreaterThanOrEqual(25)`. The mismatch between the
test title, the list length, and the threshold is confusing and will mislead the next person
adding a tool. (Not a correctness bug — the `>= 25` assertion still passes if the registry has
24+ tools, but the comment/name is inaccurate.)
**Fix:** Align the test name, the explicit list, and the count assertion; prefer asserting the
exact expected count or deriving the count from the list length:
```typescript
expect(Object.keys(registeredTools).length).toBe(expectedTools.length);
```

---

_Reviewed: 2026-06-19_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
