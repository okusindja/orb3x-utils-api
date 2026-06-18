# Architecture Research

**Domain:** MCP server as a Next.js App Router route handler adapting existing Angola utility domain logic
**Researched:** 2026-06-18
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
MCP Client (Claude Desktop, AI agent, etc.)
    │  Streamable HTTP (POST) or SSE (GET)
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  app/api/[transport]/route.ts                                   │
│  MCP Route Handler (createMcpHandler from mcp-handler)          │
│  - Protocol framing, session-less Streamable HTTP               │
│  - Delegates to Tool Registry on each tool call                 │
│  exports: GET, POST                                             │
│  runtime: 'nodejs'  dynamic: 'force-dynamic'  maxDuration: 60  │
└────────────────────────┬────────────────────────────────────────┘
                         │  server.registerTool(name, schema, fn)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  src/lib/mcp/tools/                                             │
│  Per-Domain Tool Modules (one file per Angola domain)           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ salary.ts│ │ phone.ts │ │  geo.ts  │ │  documents.ts    │  │
│  │ finance  │ │ address  │ │ calendar │ │  nif / translate │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘  │
└───────┼────────────┼────────────┼────────────────┼─────────────┘
        │            │  callDomainFn()             │
        ▼            ▼            ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│  src/lib/angola/*.ts  (existing, unchanged)                     │
│  Pure domain logic: salary, phone, geo, address, calendar,      │
│  finance, documents, banks, shared                              │
│  + src/lib/{currency,translate,agt-nif}.ts                      │
└─────────────────────────────────────────────────────────────────┘
        │ throws RouteError / domain-specific Error
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  src/lib/mcp/tool-error.ts                                      │
│  mapToMcpError(error) → { content: [{type:'text',text:'...'}],  │
│                            isError: true }                      │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Location |
|-----------|----------------|----------|
| MCP Route Handler | Protocol entry point; `createMcpHandler` setup; exports GET + POST | `app/api/[transport]/route.ts` |
| Tool Registry Module | Calls `server.registerTool()` for every domain group; composes per-domain modules | `src/lib/mcp/registry.ts` |
| Per-Domain Tool Modules | Define Zod input schemas; call domain functions; return MCP content objects | `src/lib/mcp/tools/{salary,phone,geo,address,calendar,finance,documents,nif,translate}.ts` |
| MCP Error Adapter | Maps `RouteError` and domain-specific errors to MCP `{ isError: true, content }` shape | `src/lib/mcp/tool-error.ts` |
| Angola Domain Logic | Existing pure functions — unchanged | `src/lib/angola/*.ts` |
| External Clients | Existing — unchanged | `src/lib/{currency,translate,agt-nif}.ts` |

## Recommended Project Structure

The MCP layer is a thin adapter that lives entirely inside `src/lib/mcp/`. The `app/` tree gains a single new directory `app/api/[transport]/`.

```
app/
└── api/
    ├── v1/                          # existing versioned shims — untouched
    │   └── [domain]/[action]/route.ts
    └── [transport]/
        └── route.ts                 # NEW — MCP entry point

src/lib/
├── angola/                          # existing domain logic — untouched
│   ├── salary.ts
│   ├── phone.ts
│   ├── geo.ts
│   ├── address.ts
│   ├── calendar.ts
│   ├── finance.ts
│   ├── documents.ts
│   ├── banks.ts
│   └── shared.ts
├── currency.ts                      # existing external client — untouched
├── translate.ts                     # existing external client — untouched
├── agt-nif.ts                       # existing external client — untouched
├── route-error.ts                   # existing RouteError — untouched
├── http.ts                          # existing HTTP helpers — untouched
└── mcp/                             # NEW — all MCP adapter code
    ├── registry.ts                  # composes per-domain modules, called by route handler
    ├── tool-error.ts                # RouteError → MCP error shape adapter
    └── tools/
        ├── salary.ts                # MCP tools for salary domain
        ├── phone.ts                 # MCP tools for phone domain
        ├── geo.ts                   # MCP tools for geo domain
        ├── address.ts               # MCP tools for address domain
        ├── calendar.ts              # MCP tools for calendar/holidays domain
        ├── finance.ts               # MCP tools for finance domain
        ├── documents.ts             # MCP tools for PDF generation
        ├── nif.ts                   # MCP tool for NIF lookup
        └── translate.ts             # MCP tool for translation
```

### Structure Rationale

- **`app/api/[transport]/route.ts`:** The `[transport]` dynamic segment is required by `mcp-handler` — it handles both `streamable-http` and `sse` transport negotiation internally. `basePath` in the handler config must be set to `"/api"` to match this location.
- **`src/lib/mcp/`:** Keeps all MCP adapter code colocated, cleanly separated from domain logic. The boundary is explicit: everything in `src/lib/angola/` and external clients is never touched.
- **`src/lib/mcp/tools/`:** One file per domain mirrors the one-file-per-domain pattern in `src/lib/angola/`. Each file exports a `register*Tools(server)` function, keeping `registry.ts` trivially thin.
- **`src/lib/mcp/tool-error.ts`:** Centralizes error mapping so each tool module does not repeat try/catch logic.

## Architectural Patterns

### Pattern 1: Tool Module with `register*Tools(server)`

Each domain tool file exports a single `register*Tools` function. `createMcpHandler` passes its `server` object down; the registry calls every `register*Tools(server)` in sequence. No global state, no side effects.

**What:** Domain-scoped registration function composing one or more `server.registerTool()` calls.
**When to use:** For every Angola domain — keeps handler thin, tools testable.

```typescript
// src/lib/mcp/tools/salary.ts
import { z } from 'zod';
import { calculateNetSalary, calculateGrossSalary } from '@/lib/angola/salary';
import { mcpToolHandler } from '../tool-error';
import type { McpServer } from 'mcp-handler';

export function registerSalaryTools(server: McpServer) {
  server.registerTool(
    'angola_salary_net',
    {
      title: 'Calculate Net Salary',
      description: 'Calculate take-home pay after IRT and INSS deductions for an Angolan gross salary.',
      inputSchema: {
        gross: z.number().positive().describe('Gross monthly salary in AOA'),
        dependants: z.number().int().min(0).default(0).describe('Number of dependants'),
      },
    },
    mcpToolHandler(({ gross, dependants }) =>
      calculateNetSalary({ gross, dependants })
    )
  );
}
```

### Pattern 2: `mcpToolHandler` — Error Boundary Wrapper

A higher-order function in `src/lib/mcp/tool-error.ts` wraps every tool callback. It catches `RouteError` and the three domain-specific error classes (`CurrencyError`, `TranslationError`, `PortalLookupError`) and converts them to MCP's `{ isError: true, content: [{ type: 'text', text: '...' }] }` shape. Uncaught errors become a generic `INTERNAL_SERVER_ERROR` message, matching how `routeErrorResponse()` behaves in the HTTP layer.

**What:** Single try/catch boundary that adapts any domain error to MCP protocol error format.
**When to use:** Wrap every tool callback — never write raw try/catch inside a tool module.

```typescript
// src/lib/mcp/tool-error.ts
import { RouteError } from '@/lib/route-error';

type McpContent = { content: { type: 'text'; text: string }[]; isError?: boolean };

export function mcpToolHandler<TInput>(
  fn: (input: TInput) => unknown | Promise<unknown>
): (input: TInput) => Promise<McpContent> {
  return async (input) => {
    try {
      const result = await fn(input);
      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
      };
    } catch (error) {
      if (error instanceof RouteError) {
        return {
          isError: true,
          content: [{
            type: 'text',
            text: JSON.stringify({
              code: error.code,
              message: error.message,
              ...(error.details ?? {}),
            }),
          }],
        };
      }
      // CurrencyError, TranslationError, PortalLookupError
      const msg = error instanceof Error ? error.message : 'Unexpected error';
      return {
        isError: true,
        content: [{ type: 'text', text: JSON.stringify({ code: 'INTERNAL_SERVER_ERROR', message: msg }) }],
      };
    }
  };
}
```

**Why not reuse `routeErrorResponse()`:** `routeErrorResponse()` produces a `NextResponse` object, which is an HTTP response. MCP tools must return the MCP content/isError shape; the two are structurally incompatible. The mapping logic is thin enough that a dedicated `tool-error.ts` is correct, not duplication.

### Pattern 3: Zod Schemas Over `shared.ts` Parsers

`src/lib/angola/shared.ts` provides imperative parsers (`parsePositiveNumber`, `parseEnum`, etc.) that throw `RouteError` on bad input. `mcp-handler` takes Zod schemas in `inputSchema` and validates them before the tool callback fires — so Zod validation errors surface at the protocol level before your code runs.

**Strategy:** Use Zod schemas in the tool `inputSchema` that express the same constraints already enforced by `shared.ts`. This means:
- Required fields: use `.describe()` with same field names
- Positive numbers: `z.number().positive()`
- Enums: `z.enum([...])` with the same values
- ISO dates: `z.string().regex(/^\d{4}-\d{2}-\d{2}$/)` or `z.string().date()`

The domain function (`calculateNetSalary`, etc.) still calls through `shared.ts` parsers internally, but for MCP inputs the Zod schema pre-validates so the parser helpers become a backstop rather than the first line of defense. Do **not** strip the `shared.ts` parsers from domain functions — the HTTP routes still depend on them.

### Pattern 4: Documents Return Base64 Content

`generateInvoicePdf`, `generateReceiptPdf`, `generateContractPdf` return `Uint8Array` (PDF bytes). MCP has no file-download concept; return the bytes as a base64 string inside a `text` content block. The tool description must state that the result is a base64-encoded PDF.

```typescript
// inside src/lib/mcp/tools/documents.ts tool callback
const pdfBytes = await generateInvoicePdf(payload);
const base64 = Buffer.from(pdfBytes).toString('base64');
return {
  content: [{ type: 'text', text: base64 }],
};
```

### Pattern 5: Registry Module Composes All Domain Registrations

`src/lib/mcp/registry.ts` imports every `register*Tools` and calls them in one place. The route handler's `(server) => { ... }` callback just calls `registerAllTools(server)`. This keeps `app/api/[transport]/route.ts` entirely boilerplate.

```typescript
// src/lib/mcp/registry.ts
import { registerSalaryTools } from './tools/salary';
import { registerPhoneTools } from './tools/phone';
// ... all others
import type { McpServer } from 'mcp-handler';

export function registerAllTools(server: McpServer) {
  registerSalaryTools(server);
  registerPhoneTools(server);
  // ...
}
```

## Data Flow

### MCP Tool Call (Happy Path)

```
MCP Client
  │  POST /api/mcp  (Streamable HTTP, JSON-RPC tools/call)
  ▼
app/api/[transport]/route.ts
  │  createMcpHandler routes the request
  ▼
mcp-handler internals
  │  validates transport, parses JSON-RPC envelope
  ▼
registerAllTools callback (src/lib/mcp/registry.ts)
  │  already registered — handler already holds tool map
  ▼
Per-domain tool callback via mcpToolHandler wrapper
  │  Zod validates inputSchema fields
  ▼
src/lib/angola/[domain].ts domain function
  │  e.g. calculateNetSalary({ gross, dependants })
  ▼
mcpToolHandler wraps result → { content: [{ type:'text', text: JSON.stringify(result) }] }
  ▼
mcp-handler serializes to JSON-RPC response
  ▼
MCP Client receives tool result
```

### MCP Tool Call (Error Path)

```
src/lib/angola/[domain].ts throws RouteError
  ▼
mcpToolHandler catch block
  │  detects instanceof RouteError
  ▼
returns { isError: true, content: [{ type:'text', text: JSON.stringify({ code, message, ...details }) }] }
  ▼
mcp-handler serializes — client sees structured error, not protocol failure
```

The key principle: tool errors are returned as MCP content with `isError: true`, NOT raised as protocol-level exceptions. This lets the LLM see and reason about the error (e.g., "MISSING_QUERY_PARAMETER, field: gross") rather than getting a bare transport error.

### Relationship to Existing HTTP Data Flow

The MCP layer is a **parallel adapter**, not a replacement. Both paths call the same domain functions:

```
HTTP: POST /api/v1/documents/invoice
  → app/api/v1/documents/invoice/route.ts (shim)
  → app/documents/invoice/route.ts (real handler)
  → src/lib/angola/documents.ts generateInvoicePdf()

MCP: tools/call angola_documents_invoice
  → src/lib/mcp/tools/documents.ts
  → src/lib/angola/documents.ts generateInvoicePdf()  (same call)
```

`src/lib/angola/` is the single source of truth. The MCP layer and the HTTP layer are two independent thin adapters over it.

## Build Order

Dependencies between components determine the order:

| Step | What to Build | Why This Order |
|------|---------------|----------------|
| 1 | `src/lib/mcp/tool-error.ts` | Zero dependencies; everything else imports it |
| 2 | `src/lib/mcp/tools/*.ts` (one domain at a time, start with salary) | Imports domain lib + tool-error; buildable per domain |
| 3 | `src/lib/mcp/registry.ts` | Imports all tool modules; final assembly |
| 4 | `app/api/[transport]/route.ts` | Imports registry; the only `app/` file needed |
| 5 | `app/api/v1/documents/contract/route.ts` + `receipt/route.ts` | Restore deleted shims (independent of MCP; unblock build) |
| 6 | Docs locale content for MCP | Independent of all above; can parallelize with steps 2-4 |

**Restore deleted shims first** (step 5) if the build is currently broken due to the missing `app/api/v1/documents/contract/` and `receipt/` shims — those are blocking unrelated CI, not MCP work itself.

**Domain build order within step 2:** salary → phone → geo → address → calendar → finance → nif → translate → documents. Documents last because it involves the base64 encoding pattern, which benefits from earlier simpler tools being proven first.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–1k req/day | Stateless Streamable HTTP on Fluid Compute; no changes needed |
| 1k–100k req/day | Same — Vercel auto-scales serverless functions; no Redis needed |
| 100k+ req/day | SSE transport with session resumability would require Redis; out of scope for free tier |

PDF generation (`documents.ts`) is the most compute-intensive tool — each call runs `pdf-lib` in-process. At very high volume this would exhaust function memory before rate limits matter. For the free tier this is not a concern.

## Anti-Patterns

### Anti-Pattern 1: Putting Tool Registration Directly in the Route File

**What people do:** Call `server.registerTool(...)` dozens of times inside `app/api/[transport]/route.ts`.
**Why it's wrong:** The route file grows to hundreds of lines; domain tools cannot be individually tested; the `basePath`/`maxDuration` config gets buried.
**Do this instead:** Route file calls `registerAllTools(server)` (3 lines); all tool logic lives in `src/lib/mcp/tools/`.

### Anti-Pattern 2: Re-implementing Validation in Tool Modules

**What people do:** Writing `if (!input.gross || input.gross <= 0) return { isError: true, ... }` inside each tool callback.
**Why it's wrong:** Duplicates constraints already expressed by the Zod `inputSchema` (which `mcp-handler` validates before the callback runs) AND duplicates constraints already in `src/lib/angola/shared.ts`. Three sources of truth for the same rule.
**Do this instead:** Express constraints in the Zod `inputSchema`. Let `mcp-handler` reject invalid inputs before your code runs. Trust that domain functions will throw `RouteError` for edge cases that slip through, and `mcpToolHandler` will map those errors.

### Anti-Pattern 3: Reusing `routeErrorResponse()` from `src/lib/http.ts`

**What people do:** Importing `routeErrorResponse()` in tool modules to produce consistent errors.
**Why it's wrong:** `routeErrorResponse()` returns a `NextResponse` object. MCP tool callbacks must return `{ content, isError? }`. Calling `routeErrorResponse()` inside a tool callback returns an HTTP response object that `mcp-handler` does not know how to serialize, producing a runtime error.
**Do this instead:** Use `mcpToolHandler` from `src/lib/mcp/tool-error.ts`. It applies the same error-mapping logic (same `RouteError` instanceof check, same fallback shape) but outputs the correct MCP content structure.

### Anti-Pattern 4: Placing `app/api/[transport]/route.ts` Under a Static Path

**What people do:** Creating `app/api/mcp/route.ts` instead of `app/api/[transport]/route.ts`.
**Why it's wrong:** `mcp-handler` internally handles multiple transport types by reading the `[transport]` dynamic segment. A static `mcp/route.ts` breaks the transport dispatch and will not serve SSE or Streamable HTTP correctly.
**Do this instead:** Use the dynamic segment `app/api/[transport]/route.ts` with `basePath: '/api'` in the handler config, exactly as documented by `mcp-handler`.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| `mcp-handler` (npm) | `createMcpHandler(initFn, serverOptions, handlerOptions)` | `basePath` must equal the path prefix before `[transport]` |
| `zod` (npm) | `inputSchema` in `server.registerTool()` | Must be added to dependencies; not currently in `package.json` |
| All existing external APIs | Unchanged — called via existing `src/lib/*.ts` clients | `CurrencyError`, `TranslationError`, `PortalLookupError` caught in `mcpToolHandler` |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Route handler → registry | Direct function call `registerAllTools(server)` | One call at init time |
| Registry → tool modules | Direct function call `register*Tools(server)` | Pure setup, no runtime coupling |
| Tool module → domain logic | Direct function call | Same calls as existing HTTP route handlers |
| Tool module → tool-error | Wraps callback with `mcpToolHandler(fn)` | Higher-order function, no shared state |
| MCP layer → HTTP layer | None — they are parallel, independent adapters | Both import `src/lib/angola/*.ts` directly |

## Sources

- `mcp-handler` documentation via Context7 (`/vercel/mcp-handler`): `createMcpHandler` API, `[transport]` dynamic segment requirement, `basePath` config — HIGH confidence
- MCP specification — tool result `isError` field and `content` array format: https://modelcontextprotocol.io/specification/2025-11-25/server/tools — HIGH confidence
- MCP tools conceptual docs: https://modelcontextprotocol.info/docs/concepts/tools/ — HIGH confidence
- Existing codebase analysis: `.planning/codebase/ARCHITECTURE.md`, `src/lib/route-error.ts`, `src/lib/http.ts`, `src/lib/angola/shared.ts`, `app/salary/net/route.ts` — HIGH confidence (direct inspection)

---
*Architecture research for: MCP server integration in Next.js App Router (orb3x-utils-api)*
*Researched: 2026-06-18*
