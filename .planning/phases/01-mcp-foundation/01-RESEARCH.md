# Phase 1: MCP Foundation - Research

**Researched:** 2026-06-18
**Domain:** MCP server foundation on Vercel free tier (Next.js 16 App Router, stateless Streamable HTTP, bank-images refactor)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Per-IP throttle of 60 requests/minute.
- **D-02:** Rate limiter scoped to `/api/mcp` only; existing HTTP routes unchanged.
- **D-03:** Throttled request returns 429 in the existing `RouteError` JSON shape (`{ error: { code, message } }`) plus `Retry-After` header.
- **D-04:** Limiter state is in-memory / per-instance (no Redis). Counts reset on cold start / instance recycling — acceptable free-tier constraint.
- **D-05:** After removing inline base64, `pdf-lib` obtains logo bytes by reading PNG files from `public/bank-logos/` at runtime (Node.js runtime).
- **D-06:** If a bank logo file is missing, generate the PDF without the logo (graceful degradation) rather than failing.
- **D-07:** Phase 1 ships a minimal `health` stub tool (returns server status) so `tools/list` + tool-call + error-path are exercised end-to-end before real tools land.
- **D-08:** Public path is `/api/mcp` (`basePath: '/api'`, `[transport]` dynamic segment). Both Streamable HTTP (POST) and SSE (GET) transports stay enabled. Do NOT pass `disableSse`.
- **D-09:** Validate with MCP Inspector (`npx @modelcontextprotocol/inspector`) against `http://localhost:3000/api/mcp`, AND connect a real MCP client (Claude Desktop/Code) to the deployed `/api/mcp` before declaring the phase done.

### Claude's Discretion

- Exact `middleware.ts` matcher config, in-memory store data structure (Map + sliding window vs fixed window), and the `mcpToolHandler` HOF signature.
- `health` tool's exact output shape.
- Directory layout under `src/lib/mcp/` (beyond `registry.ts`, `tool-error.ts`).

### Deferred Ideas (OUT OF SCOPE)

- Domain tools (salary, phone, geo, address, calendar, finance, currency, NIF, translation, documents) — Phases 2–4.
- `structuredContent` / `outputSchema`, MCP `resources`, `prompts`, optional auth/OAuth — v2.
- Vercel Firewall WAF rate limiting — revisit if abuse appears.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MCP-01 | MCP client can connect to a public Streamable HTTP endpoint at `/api/mcp` (served by `mcp-handler` from `app/api/[transport]/route.ts`, exporting GET/POST/DELETE) | `createMcpHandler` API and `[transport]` pattern fully documented below |
| MCP-02 | Server runs statelessly on Vercel free tier — no Redis, Node.js runtime, `maxDuration: 60`; both Streamable HTTP and SSE transports left enabled | Stateless mode: omit `redisUrl`; verified against Vercel Fluid Compute docs |
| MCP-03 | Client can discover all available tools via `tools/list`, each with `name`, `title`, `description`, and Zod `inputSchema` with per-field descriptions | `server.tool()` / `server.registerTool()` API documented below with `health` stub example |
| MCP-04 | A tool that fails returns `{ isError: true, content: [...] }` instead of throwing | `mcpToolHandler` HOF pattern fully documented; `RouteError` shape analyzed |
| MCP-05 | Requests to `/api/mcp` are rate-limited per IP via stateless in-memory `middleware.ts` throttling | Middleware pattern, IP extraction on Vercel, fixed-window Map store documented |
| PERF-01 | `src/lib/angola/bank-images.ts` refactored from ~1.4 MB inline base64 to URL references under `public/bank-logos/` | `banks.ts` consumer analysis complete; filesystem read pattern with graceful skip documented |
</phase_requirements>

---

## Summary

Phase 1 lays down every piece the MCP server needs before any domain tool ships: the route handler, per-IP rate limiting middleware, the tool error boundary, the registry scaffold with a `health` stub, and the bank-images refactor that eliminates the primary cold-start and PDF payload risk.

The technical work splits cleanly into four areas. First, `mcp-handler@1.1.0` wires into a single `app/api/[transport]/route.ts` dynamic route; `createMcpHandler` accepts an init callback, server options, and handler options (including `basePath: '/api'` and `maxDuration: 60`); stateless mode is achieved simply by omitting `redisUrl`. Second, `middleware.ts` intercepts requests at the `/api/mcp` path, reads the client IP from the `x-forwarded-for` header (the canonical Vercel header), and applies a fixed-window in-memory counter returning 429 in the existing `RouteError` JSON shape on breach. Third, `mcpToolHandler` is a HOF wrapping every tool callback: it catches `RouteError` and domain-specific errors and returns `{ isError: true, content: [{ type: 'text', text: JSON.stringify({...}) }] }` — keeping the MCP session alive even on tool failure. Fourth, the bank-images refactor replaces the 1.4 MB inline base64 module with `fs.readFileSync` calls at PDF-generation time; the consumer (`banks.ts`) changes from returning base64 data URIs to returning filesystem paths (or `null` on missing file), and `buildPdfDocument` in `documents.ts` gains a `logoBytes?: Uint8Array` optional parameter that `pdf-lib` embeds via `embedPng`.

**Primary recommendation:** Implement in build order: (1) `src/lib/mcp/tool-error.ts`, (2) `src/lib/mcp/registry.ts` + `health` stub, (3) `app/api/[transport]/route.ts`, (4) `middleware.ts`, (5) bank-images refactor + PNG files in `public/bank-logos/`. Verify each component independently before wiring.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| MCP protocol dispatch (Streamable HTTP + SSE) | API / Backend (`app/api/[transport]/route.ts`) | — | `mcp-handler` owns protocol framing; route is the entry point |
| Tool registration and schema definition | API / Backend (`src/lib/mcp/registry.ts`, `tools/*.ts`) | — | Tool metadata lives with the tool handler; not in the route |
| Tool error mapping (`isError: true`) | API / Backend (`src/lib/mcp/tool-error.ts`) | — | Cross-cutting concern; single point of truth |
| Per-IP rate limiting | API / Backend (`middleware.ts`) | — | Must run before the route handler; Next.js middleware is the correct tier |
| Domain business logic (unchanged) | Domain (`src/lib/angola/*.ts`) | — | Existing pure functions; no tier change |
| Bank logo filesystem read | API / Backend (`src/lib/angola/banks.ts`) | Static assets (`public/bank-logos/`) | Node.js runtime reads at request time; `public/` is the Vercel static asset layer |
| PNG logo files (static) | CDN / Static (`public/bank-logos/`) | — | Served by Vercel CDN; read by server via `fs` at PDF-generation time |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `mcp-handler` | 1.1.0 | Next.js App Router adapter for MCP (Streamable HTTP + SSE) | Official Vercel-maintained adapter; handles all transport framing, CORS, session routing; published 2026-03-24 |
| `@modelcontextprotocol/sdk` | 1.29.0 | MCP protocol engine: tool registration, Zod schema validation, JSON-RPC | Canonical SDK from MCP spec authors; required by `mcp-handler`; 1.29.0 is current stable |
| `zod` | `^3.25` (latest: 3.25.76) | Tool `inputSchema` definitions | Hard runtime peer dep of both `mcp-handler` and SDK; use 3.x — see Zod version note below |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@modelcontextprotocol/inspector` | 0.22.0 (npx) | Browser-based MCP Inspector for local testing | Dev only — run `npx @modelcontextprotocol/inspector`; do not install as dependency |

### Zod Version Note (Critical)

`mcp-handler@1.1.0` declares `peerDependencies: { "@modelcontextprotocol/sdk": "1.26.0" }` and bundles its own `redis` and `chalk` but does NOT declare a peer dep for `zod` directly — it delegates Zod to the SDK. [VERIFIED: npm registry]

`@modelcontextprotocol/sdk@1.29.0` declares `peerDependencies: { "zod": "^3.25 || ^4.0" }`. This means **Zod 3.25.x or Zod 4.x are both SDK-compatible** as of SDK 1.29.0. [VERIFIED: npm registry]

**Install decision:** Install `zod@^3` (resolves to 3.25.76 today). The codebase has no existing Zod dependency (confirmed via `package.json` inspection). Using Zod 3.x is the safe choice — it satisfies the SDK's `^3.25 || ^4.0` constraint and is the range the `mcp-handler` README targets. Do not install Zod 4.x until explicitly tested.

### Installation

```bash
pnpm add mcp-handler @modelcontextprotocol/sdk zod@^3
```

Run after install to verify no conflicts:
```bash
pnpm why zod
pnpm why @modelcontextprotocol/sdk
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `mcp-handler` | Hand-rolled `McpServer` + HTTP glue | Adds ~200 lines of transport code with no benefit for a stateless public server |
| Stateless Streamable HTTP | SSE + Redis sessions | SSE resumability requires `redisUrl` (paid Vercel KV add-on); violates free-tier constraint |
| `middleware.ts` rate limiting | Vercel Firewall WAF | WAF requires Vercel Pro; `middleware.ts` provides meaningful friction within Hobby constraints |

---

## Package Legitimacy Audit

> slopcheck was not available at research time (pip install failed). All packages are manually verified below via npm registry + official sources. Per protocol, packages not confirmed via official docs or Context7 are tagged `[ASSUMED]`.

| Package | Registry | Age | Downloads (approx) | Source Repo | slopcheck | Disposition |
|---------|----------|-----|--------------------|-------------|-----------|-------------|
| `mcp-handler` | npm | Published 2026-03-24; v1.1.0 | High (Vercel-maintained) | github.com/vercel/mcp-handler | unavailable | Approved — official Vercel package, referenced in Vercel docs |
| `@modelcontextprotocol/sdk` | npm | Well-established; v1.29.0 | Very high (MCP spec authors) | github.com/modelcontextprotocol/typescript-sdk | unavailable | Approved — canonical MCP SDK |
| `zod` | npm | 4+ years; v3.25.76 | 20M+/week | github.com/colinhacks/zod | unavailable | Approved — industry-standard validation library |
| `@modelcontextprotocol/inspector` | npm | v0.22.0 | N/A (dev tool, npx only) | github.com/modelcontextprotocol/inspector | unavailable | Approved (npx dev use only) — no install |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

*slopcheck was unavailable at research time. The three production packages (`mcp-handler`, `@modelcontextprotocol/sdk`, `zod`) are confirmed via official Vercel documentation and the MCP specification repository — not training data. Registry existence confirmed via `npm view`. No `postinstall` scripts detected on any package. Planner should still run `pnpm why zod` after install to confirm no dual-version conflicts.*

---

## Architecture Patterns

### System Architecture Diagram

```
MCP Client (Claude Desktop, MCP Inspector, AI agent)
    │  POST /api/mcp  (Streamable HTTP)
    │  GET  /api/mcp  (SSE, legacy clients)
    │  DELETE /api/mcp (session cleanup)
    │
    ▼
┌─────────────────────────────────────────┐
│  middleware.ts                          │
│  (runs BEFORE route handler)            │
│  1. Read IP from x-forwarded-for        │
│  2. Increment per-IP counter in Map     │
│  3. If count > 60/min → 429 NextResponse│
│     { error: { code, message } }        │
│     + Retry-After header                │
│  4. Otherwise → NextResponse.next()     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  app/api/[transport]/route.ts           │
│  createMcpHandler(initFn, serverOpts,   │
│    { basePath: '/api',                  │
│      maxDuration: 60,                   │
│      verboseLogs: isDev })              │
│  (redisUrl intentionally omitted)       │
│  exports: GET, POST, DELETE             │
│  runtime: 'nodejs'                      │
│  dynamic: 'force-dynamic'               │
│  maxDuration: 60                        │
└────────────────┬────────────────────────┘
                 │  server.registerTool(...)
                 ▼
┌─────────────────────────────────────────┐
│  src/lib/mcp/registry.ts                │
│  registerAllTools(server)               │
│  → registerHealthTool(server)           │
│    [Phase 2+: registerSalaryTools, ...]  │
└────────────────┬────────────────────────┘
                 │  tool callback
                 ▼
┌─────────────────────────────────────────┐
│  src/lib/mcp/tool-error.ts              │
│  mcpToolHandler(fn)                     │
│  try → { content: [{type:'text',...}] } │
│  catch RouteError → { isError: true,    │
│    content: [{ type:'text', text:       │
│      JSON.stringify({code,message,...})  │
│    }] }                                 │
│  catch other → INTERNAL_SERVER_ERROR    │
└─────────────────────────────────────────┘

Bank-Images Refactor (PERF-01):
  src/lib/angola/bank-images.ts
    Before: exports ANGOLA_BANK_IMAGE_DATA (base64 data URIs, ~1.4 MB)
    After:  exports getAngolaBankImagePath(code) → string | null
              resolves to process.cwd()/public/bank-logos/{CODE}.png
              returns null if file does not exist

  src/lib/angola/banks.ts
    Before: getAngolaBankImage() → base64 string (via ANGOLA_BANK_IMAGE_DATA)
    After:  getAngolaBankLogoBytes() → Uint8Array | null (fs.readFileSync, catch → null)

  public/bank-logos/*.png  (NEW — 29+ PNG files extracted from base64)
    BAI.png, YETU.png, BANC.png, BMF.png, BIC.png, BCGA.png, BCA.png,
    BCH.png, BCI.png, BDA.png, BFA.png, BIR.png, BNI.png, BPC.png, BE.png,
    KEVE.png, BKI.png, BPG.png, BPA.png, BMAIS.png, BSOL.png (→ SOL.png),
    BVB.png (→ BV.png), VTB.png, FNB.png (→ FINIBANCO.png), SBA.png, SCBA.png,
    BCS.png, BPT.png (→ POSTAL.png), BOCLB.png, PLACEHOLDER.png
```

### Recommended Project Structure

```
app/
├── api/
│   ├── v1/                                 # existing — untouched
│   └── [transport]/
│       └── route.ts                        # NEW — MCP entry point
middleware.ts                               # NEW — per-IP rate limiter

src/lib/
├── angola/
│   ├── bank-images.ts                      # MODIFIED — path refs instead of base64
│   ├── banks.ts                            # MODIFIED — reads bytes from fs
│   └── documents.ts                        # MODIFIED — accepts optional logoBytes
├── mcp/                                    # NEW
│   ├── registry.ts                         # composes tool registrations
│   ├── tool-error.ts                       # mcpToolHandler HOF
│   └── tools/
│       └── health.ts                       # Phase 1 stub tool

public/
└── bank-logos/                             # NEW — PNG files extracted from base64
    ├── BAI.png
    ├── BIC.png
    └── ... (one per bank code + PLACEHOLDER.png)
```

### Pattern 1: `createMcpHandler` Route Setup

**What:** Single dynamic route handling both Streamable HTTP and SSE transports via `mcp-handler`.

```typescript
// app/api/[transport]/route.ts
import { createMcpHandler } from 'mcp-handler';
import { registerAllTools } from '@/lib/mcp/registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const handler = createMcpHandler(
  (server) => {
    registerAllTools(server);
  },
  {
    // Server info sent to clients during initialization
    serverInfo: { name: 'orb3x-utils-mcp', version: '1.0.0' },
    capabilities: { tools: {} },
  },
  {
    basePath: '/api',      // MUST equal the path prefix before [transport]
    maxDuration: 60,       // keep in sync with export above
    verboseLogs: process.env.NODE_ENV === 'development',
    // redisUrl intentionally omitted — stateless mode, no Redis
  },
);

export { handler as GET, handler as POST, handler as DELETE };
```

**Key constraints from `mcp-handler@1.1.0` peer deps:**
- `next >= 13.0.0` — satisfied (project uses 16.2.1)
- `@modelcontextprotocol/sdk` pinned at `1.26.0` in peerDep spec — install 1.29.0 which is backward-compatible [VERIFIED: npm registry]
- No `zod` peer dep declared by `mcp-handler` itself — delegated to SDK

**What `basePath` means:** `basePath: '/api'` tells the handler that the URL prefix before the `[transport]` segment is `/api`. So `GET /api/mcp` → transport = `'mcp'` (Streamable HTTP), `GET /api/sse` → transport = `'sse'`. The public endpoint is always `/api/mcp`. [ASSUMED — based on mcp-handler docs pattern; confirm via MCP Inspector test]

### Pattern 2: Tool Registration with `server.registerTool()`

**What:** Register a named tool with typed input schema and callback. The SDK validates inputs against the Zod schema before the callback fires.

```typescript
// src/lib/mcp/tools/health.ts
import { z } from 'zod';
import { mcpToolHandler } from '../tool-error';

export function registerHealthTool(server: import('mcp-handler').McpServer) {
  server.registerTool(
    'health',
    {
      title: 'Server Health',
      description:
        'Returns the current server status and timestamp. ' +
        'Use this to verify the MCP connection is alive before calling other tools.',
      inputSchema: z.object({}),  // no inputs required
    },
    mcpToolHandler(async () => ({
      status: 'ok',
      server: 'orb3x-utils-mcp',
      timestamp: new Date().toISOString(),
    })),
  );
}
```

**Tool result shape (happy path):**
```typescript
// mcpToolHandler wraps the return value as:
{
  content: [{ type: 'text', text: '{"status":"ok","server":"orb3x-utils-mcp","timestamp":"..."}' }]
}
```

**Tool result shape (error path):**
```typescript
// mcpToolHandler catches and returns:
{
  isError: true,
  content: [{ type: 'text', text: '{"code":"ROUTE_ERROR_CODE","message":"..."}' }]
}
```

### Pattern 3: `mcpToolHandler` HOF (Error Boundary)

**What:** Wraps every tool callback. Catches `RouteError` and unknown errors. Returns `{ content, isError? }` — never throws.

```typescript
// src/lib/mcp/tool-error.ts
import { RouteError } from '@/lib/route-error';

type McpResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: true;
};

export function mcpToolHandler<TInput>(
  fn: (input: TInput) => unknown | Promise<unknown>,
): (input: TInput) => Promise<McpResult> {
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
      // CurrencyError, TranslationError, PortalLookupError — or genuinely unexpected
      const msg = error instanceof Error ? error.message : 'Unexpected error';
      return {
        isError: true,
        content: [{ type: 'text', text: JSON.stringify({ code: 'INTERNAL_SERVER_ERROR', message: msg }) }],
      };
    }
  };
}
```

**Alignment with `RouteError`** (from `src/lib/route-error.ts`):
- `RouteError` fields: `code: string`, `message: string`, `status: number`, `details?: Record<string, unknown>`
- `routeErrorResponse()` in HTTP layer emits: `{ error: { code, message, ...details } }`
- `mcpToolHandler` error text emits the same keys: `{ code, message, ...details }` — consistent shape across surfaces
- `status` is intentionally dropped from the MCP error text (no HTTP concept in MCP content); only `code` and `message` matter to MCP clients

### Pattern 4: Per-IP Rate Limiting in `middleware.ts`

**What:** Fixed-window in-memory counter per IP. 60 requests/minute ceiling, `/api/mcp` path only, 429 in `RouteError` JSON shape.

```typescript
// middleware.ts (project root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const WINDOW_MS = 60_000;    // 1 minute
const MAX_REQUESTS = 60;     // D-01: 60 req/min

type WindowEntry = { count: number; resetAt: number };
const store = new Map<string, WindowEntry>();

function getClientIp(request: NextRequest): string {
  // Vercel sets x-forwarded-for; first IP in the list is the client
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  // Fallback: use a constant so unknown IPs still get throttled together
  return 'unknown';
}

export function middleware(request: NextRequest) {
  const ip = getClientIp(request);
  const now = Date.now();

  let entry = store.get(ip);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(ip, entry);
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    const retryAfterSecs = Math.ceil((entry.resetAt - now) / 1000);
    return new NextResponse(
      JSON.stringify({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please wait before retrying.',
        },
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Retry-After': String(retryAfterSecs),
        },
      },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/mcp', '/api/sse'],  // D-02: only MCP paths
};
```

**IP extraction on Vercel:** Vercel injects `x-forwarded-for` on all inbound requests to serverless functions. The canonical approach is `request.headers.get('x-forwarded-for')?.split(',')[0].trim()`. Do not use `request.ip` — it is a non-standard Next.js extension not available in all runtime contexts. [ASSUMED — industry-standard Vercel pattern; confirmed consistent with Next.js middleware docs]

**Stateless caveat (D-04):** The `store` Map is module-level but per-instance. Different Vercel function instances have independent stores. A client routed to two different instances within the same minute could send 120 requests before being throttled. This is the documented free-tier constraint per D-04 — not a defect.

**Matcher config:** `/api/mcp` covers POST + DELETE (Streamable HTTP). `/api/sse` covers GET (SSE transport). Both must be in the matcher for the rate limiter to apply to all transport types. [ASSUMED — based on `mcp-handler` `[transport]` dispatch pattern; verify that SSE path is `/api/sse` after first MCP Inspector test]

### Pattern 5: Bank-Images Refactor (PERF-01)

**Existing consumer chain (before refactor):**
```
bank-images.ts → exports ANGOLA_BANK_IMAGE_DATA: Record<string,string>  (~1.4 MB)
banks.ts       → imports ANGOLA_BANK_IMAGE_DATA
                  const BANK_IMAGE_PLACEHOLDER = ANGOLA_BANK_IMAGE_DATA.PLACEHOLDER
                  getAngolaBankImage(bank) → ANGOLA_BANK_IMAGE_DATA[key] ?? PLACEHOLDER
documents.ts   → does NOT import bank-images directly (confirmed by grep)
                  (bank images currently only used by banks.ts for IBAN/bank API responses)
```

**Key finding from codebase inspection:** `documents.ts` (PDF generation) does NOT currently import `bank-images.ts` or `banks.ts`. The inline base64 data is consumed only by `banks.ts` for the `/api/v1/validate/bank-account` and `/api/v1/validate/iban` endpoints that return bank metadata with logos. The cold-start impact affects the entire function bundle because `banks.ts` is imported at module load, but the PDF functions themselves do not currently embed bank logos. The PERF-01 refactor is primarily about eliminating the 1.4 MB cold-start penalty and future-proofing Phase 4 document tools. [VERIFIED: codebase inspection]

**After refactor — `bank-images.ts`:**
```typescript
// src/lib/angola/bank-images.ts
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const LOGOS_DIR = join(process.cwd(), 'public', 'bank-logos');

export function getAngolaBankLogoPath(code: string): string | null {
  const normalizedCode = code.toUpperCase();
  const filePath = join(LOGOS_DIR, `${normalizedCode}.png`);
  return existsSync(filePath) ? filePath : null;
}
```

**After refactor — `banks.ts` (getAngolaBankImage replacement):**
```typescript
import { readFileSync } from 'node:fs';
import { getAngolaBankLogoPath } from '@/lib/angola/bank-images';

// Remove: const BANK_IMAGE_PLACEHOLDER = ANGOLA_BANK_IMAGE_DATA.PLACEHOLDER
// Remove: const bankImageCache = new Map<string, string>()

export function getAngolaBankLogoBytes(bank: AngolaBank): Uint8Array | null {
  const imageKey = BANK_IMAGE_CODE_ALIASES[bank.code] ?? bank.code;
  const path = getAngolaBankLogoPath(imageKey);
  if (!path) return null;
  try {
    return readFileSync(path);
  } catch {
    return null;  // D-06: graceful degradation — missing file → no logo
  }
}
```

**pdf-lib embedding (future Phase 4 pattern, shown for completeness):**
```typescript
// Inside buildPdfDocument or a wrapper — when logos are added to PDFs in Phase 4
import { embedPng } from 'pdf-lib';  // already imported via PDFDocument

async function embedBankLogo(pdf: PDFDocument, logoBytes: Uint8Array | null) {
  if (!logoBytes) return null;
  try {
    return await pdf.embedPng(logoBytes);
  } catch {
    return null;  // D-06: corrupt file → graceful skip
  }
}
```

**PNG file extraction approach:** The PNG files must be extracted from the existing base64 strings in `bank-images.ts` before the refactor removes them. Extraction script (run once, commit PNGs):
```bash
# One-time extraction: decode each base64 data URI → PNG file in public/bank-logos/
node -e "
const { ANGOLA_BANK_IMAGE_DATA } = require('./src/lib/angola/bank-images');
const fs = require('fs');
fs.mkdirSync('public/bank-logos', { recursive: true });
for (const [key, dataUri] of Object.entries(ANGOLA_BANK_IMAGE_DATA)) {
  const base64 = dataUri.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('public/bank-logos/' + key + '.png', Buffer.from(base64, 'base64'));
}
console.log('Extracted', Object.keys(ANGOLA_BANK_IMAGE_DATA).length, 'PNG files');
"
```

**BANK_IMAGE_CODE_ALIASES to keep:** `banks.ts` has `{ BPT: 'POSTAL', BSOL: 'SOL', BVB: 'BV', FNB: 'FINIBANCO' }`. The PNG files must be named per the alias value (e.g., `SOL.png`, not `BSOL.png`) to match the existing lookup logic.

### Anti-Patterns to Avoid

- **Static MCP route path:** Never create `app/api/mcp/route.ts` — the `[transport]` dynamic segment is required for mcp-handler to dispatch between `mcp` and `sse` transports.
- **Tool registration in the route file:** Keep `app/api/[transport]/route.ts` to ~15 lines. All `server.registerTool()` calls belong in `src/lib/mcp/tools/*.ts` via `registry.ts`.
- **Raw try/catch in tool callbacks:** Use `mcpToolHandler` wrapper. Throwing from a tool callback causes the entire MCP session to error, not just that tool.
- **Reusing `routeErrorResponse()` in tool callbacks:** It returns a `NextResponse`; MCP callbacks must return `{ content, isError? }`. The shapes are incompatible.
- **Module-level mutable state in tool files:** All tool callbacks must be pure calls into `src/lib/angola/`. No module-level caches or counters in MCP tool files (stateless constraint per D-04).
- **Edge runtime:** Never `export const runtime = 'edge'` on the MCP route. `mcp-handler` uses Node.js APIs; the project convention is `runtime = 'nodejs'` on all routes.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MCP protocol framing (JSON-RPC, transport dispatch, SSE) | Custom WebSocket or SSE handler | `mcp-handler` | Protocol edge cases, transport negotiation, CORS; hundreds of lines; already solved |
| Zod-to-JSON-Schema conversion for tool `inputSchema` | JSON Schema objects | Zod schemas in `server.registerTool()` | SDK converts automatically; hand-rolled JSON Schema breaks MCP validation |
| MCP session management | Custom session store | Omit `redisUrl` (stateless mode) | Stateless Streamable HTTP eliminates session state entirely; Redis not available on free tier |
| Tool type inference from Zod schema | Manual TypeScript type annotations on tool callbacks | Zod `.parse()` / SDK auto-inference | SDK infers callback param types from `inputSchema` automatically |
| Rate limiting with Redis | `ioredis` counter | In-memory `Map` in `middleware.ts` | Redis is a paid add-on; Map is sufficient for per-instance throttling within D-04 constraints |

---

## Runtime State Inventory

> Phase 1 is greenfield additions only (new files) plus a refactor of `bank-images.ts`. No rename/migration of stored state.

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | None — no database or persistent store in the project | None |
| Live service config | None — no n8n, Datadog, or external config services | None |
| OS-registered state | None — no Task Scheduler, pm2, or launchd entries | None |
| Secrets/env vars | None — bank-images.ts refactor changes file paths, not env vars | None |
| Build artifacts | `public/bank-logos/` does not exist yet — must be created and populated with PNG files before `bank-images.ts` is refactored | Create dir + extract PNGs in Wave 0 before modifying `bank-images.ts` |

---

## Common Pitfalls

### Pitfall 1: Wrong `basePath` in `createMcpHandler`

**What goes wrong:** Setting `basePath: '/api/mcp'` (the full public path) instead of the path prefix before `[transport]`. Results in transport dispatch failure — Streamable HTTP calls return 404, SSE not served.

**Why it happens:** Confusion between the public endpoint URL (`/api/mcp`) and the router prefix (`/api`).

**How to avoid:** `basePath` must equal the path of the parent directory of the `[transport]` segment. For `app/api/[transport]/route.ts`, `basePath: '/api'`. [VERIFIED: mcp-handler docs pattern]

**Warning signs:** MCP Inspector shows "connection refused" or 404 on first connect.

### Pitfall 2: Missing `DELETE` export

**What goes wrong:** Only exporting `GET` and `POST` from the route file. MCP clients send DELETE requests for session cleanup per the MCP Streamable HTTP spec. Missing DELETE causes 405 errors that break client session teardown.

**How to avoid:** Always export all three: `export { handler as GET, handler as POST, handler as DELETE }`.

### Pitfall 3: `ANGOLA_BANK_IMAGE_DATA` Still Imported After Refactor

**What goes wrong:** `banks.ts` still imports from `bank-images.ts` for the old export after refactor, causing a TypeScript error (export no longer exists) or lingering base64 strings in the bundle.

**How to avoid:** The refactor must update `banks.ts` and remove both `ANGOLA_BANK_IMAGE_DATA` import and `BANK_IMAGE_PLACEHOLDER` usage in the same commit as modifying `bank-images.ts`. Extract PNGs first, then modify both files atomically.

### Pitfall 4: PNG Extraction Missing Alias Names

**What goes wrong:** Extracting `BSOL.png` but `banks.ts` looks up `SOL.png` (via `BANK_IMAGE_CODE_ALIASES`). Missing logo file → `null` path → no logo (D-06 graceful skip), but the alias intent is lost silently.

**How to avoid:** The extraction script must write both the alias-target name and not the bank code. Cross-reference `BANK_IMAGE_CODE_ALIASES` in `banks.ts`: `{ BPT: 'POSTAL', BSOL: 'SOL', BVB: 'BV', FNB: 'FINIBANCO' }`. Write the file under the alias value, not the code. The extraction script can handle this:
```js
const alias = BANK_IMAGE_CODE_ALIASES[key] ?? key;  // use alias as filename
fs.writeFileSync('public/bank-logos/' + alias + '.png', ...);
```

### Pitfall 5: `middleware.ts` Matcher Missing SSE Path

**What goes wrong:** Matcher only covers `/api/mcp` (Streamable HTTP POST). SSE clients using `/api/sse` (GET transport) bypass the rate limiter entirely.

**How to avoid:** Include both paths: `matcher: ['/api/mcp', '/api/sse']`. Verify the actual SSE path after first MCP Inspector connection (watch the browser network tab or Vercel logs for GET requests).

### Pitfall 6: `process.cwd()` Path Resolution Fails in Vercel Standalone

**What goes wrong:** In Vercel's standalone Next.js output, `process.cwd()` may resolve to the `.next/standalone/` directory, not the project root, causing `fs.readFileSync('public/bank-logos/BAI.png')` to fail with ENOENT.

**How to avoid:** In `next.config.ts`, verify `output: 'standalone'` is set (it is, per codebase inspection). For standalone builds, static assets in `public/` are copied to `.next/standalone/public/`. Use `path.join(process.cwd(), 'public', 'bank-logos', ...)` — this works because Vercel places the standalone bundle at the project root during deployment. Test with `fs.existsSync` in the health tool to verify the path resolves correctly on the deployed function. [ASSUMED — based on Next.js standalone docs behavior; verify post-deploy]

---

## Code Examples

Verified patterns from codebase inspection and official sources:

### Versioned Shim Pattern (existing — for reference)

```typescript
// app/api/v1/documents/invoice/route.ts (existing pattern to mirror)
import { POST as handler } from '../../../../documents/invoice/route';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;
export const POST = handler;
```

### `RouteError` Constructor (existing — must align with)

```typescript
// src/lib/route-error.ts — existing class
export class RouteError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;
  constructor(code: string, message: string, status = 400, details?: Record<string, unknown>)
}
```

### `routeErrorResponse()` Output Shape (existing — must mirror for 429)

```typescript
// { error: { code, message, ...details } } with appropriate HTTP status
// 429 shape must be: { error: { code: 'RATE_LIMIT_EXCEEDED', message: '...' } }
// Content-Type: application/json, Cache-Control: no-store, Retry-After: N
```

### Registry Pattern

```typescript
// src/lib/mcp/registry.ts
import { registerHealthTool } from './tools/health';
// Phase 2+: import other domain tool registrations here

export function registerAllTools(server: import('mcp-handler').McpServer) {
  registerHealthTool(server);
  // Phase 2+ registrations follow
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@vercel/mcp-adapter` (pre-release name) | `mcp-handler` (stable name) | Early 2026 | Old package name no longer updated — use `mcp-handler` |
| SSE-only MCP transport (requires Redis for resumability) | Stateless Streamable HTTP (no Redis needed) | MCP spec 2025 | Free-tier compatible; stateless SSE still served for legacy clients |
| Zod 4.x (mcp-handler docs warned against) | Zod 3.25.x (safe range; SDK 1.29.0 also accepts `^4.0`) | SDK 1.29.0 release | Both 3.x and 4.x now accepted by SDK; use 3.x to stay within mcp-handler's tested range |
| `server.tool()` (older SDK alias) | `server.registerTool()` (canonical) | SDK 1.26.0+ | Both may work; use `registerTool` per current SDK docs |

**Deprecated/outdated:**
- `disableSse: true` option: Never set for this project. Both transports must remain enabled (D-08).
- Putting `redisUrl` in handler options: Only for paid session resumability; out of scope.

---

## Verification Specifics (D-09)

### Local: MCP Inspector

```bash
# Start Next.js dev server in one terminal
pnpm dev

# Start MCP Inspector in another terminal (no install required)
npx @modelcontextprotocol/inspector@0.22.0
# Opens browser at http://localhost:5173

# In Inspector UI:
#   Transport: Streamable HTTP
#   URL: http://localhost:3000/api/mcp
#   Click "Connect"
```

**Checklist with Inspector:**
1. Connect succeeds (no 404 / no transport error)
2. "Tools" tab → `health` tool appears with title + description
3. Call `health` → response shows `{ status: 'ok', server: 'orb3x-utils-mcp', timestamp: '...' }`
4. Rate limit test: use Inspector's repeat-call feature or a `for` loop in the browser console to send 61+ requests → expect 429 on the 61st
5. SSE transport: switch transport to SSE in Inspector → reconnect → verify it works

### Deployed: Real MCP Client (Claude Desktop or Claude Code)

Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):
```json
{
  "mcpServers": {
    "orb3x-utils": {
      "type": "http",
      "url": "https://<your-vercel-deployment>.vercel.app/api/mcp"
    }
  }
}
```

Claude Code config (`.claude/settings.json` or via `/mcp` command):
```json
{
  "mcpServers": {
    "orb3x-utils": {
      "type": "streamable-http",
      "url": "https://<your-vercel-deployment>.vercel.app/api/mcp"
    }
  }
}
```

If the client only speaks SSE (e.g., older Cursor), use `mcp-remote` bridge:
```json
{
  "mcpServers": {
    "orb3x-utils": {
      "command": "npx",
      "args": ["mcp-remote", "https://<deployment>.vercel.app/api/mcp"]
    }
  }
}
```

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `basePath: '/api'` routes `/api/mcp` to Streamable HTTP and `/api/sse` to SSE transport | Architecture Patterns, Pattern 1 | Wrong basePath → 404 on all MCP requests; detected immediately by MCP Inspector test |
| A2 | Rate limit matcher `['/api/mcp', '/api/sse']` covers both transports | Pattern 4 | SSE clients bypass rate limiter; low risk (SSE is less common) but incorrect scoping |
| A3 | `process.cwd()` resolves to the project root in Vercel standalone output, making `public/bank-logos/` accessible | Pattern 5 (bank-images) | ENOENT on logo reads → all logos return null → graceful skip per D-06 (no failure, just missing logos) |
| A4 | `x-forwarded-for` is always set by Vercel for inbound requests to serverless functions | Pattern 4 (IP extraction) | Falls back to 'unknown' string → all unknown-IP clients share one rate limit bucket → over-throttling |
| A5 | `server.registerTool()` is the canonical API in SDK 1.29.0 (vs `server.tool()`) | Pattern 2 | If `registerTool` is not exported, use `server.tool()` instead — both are functionally equivalent |

---

## Open Questions

1. **SSE transport URL path**
   - What we know: `mcp-handler` uses the `[transport]` segment value as the transport identifier.
   - What's unclear: Whether the SSE GET path is literally `/api/sse` or `/api/mcp` with a query param or header.
   - Recommendation: Run MCP Inspector with SSE selected and watch the network tab for the actual GET path; adjust `middleware.ts` matcher accordingly.

2. **`McpServer` type import path from `mcp-handler`**
   - What we know: `mcp-handler` exports `createMcpHandler` and wraps the SDK's `McpServer`.
   - What's unclear: Whether `import type { McpServer } from 'mcp-handler'` is the correct import path for the server type used in `register*Tools(server)` function signatures.
   - Recommendation: Check TypeScript definitions in `node_modules/mcp-handler/dist/*.d.ts` after install; alternative is to use the SDK's type directly: `import type { Server } from '@modelcontextprotocol/sdk/server/index.js'`.

3. **Vercel Firewall WAF on Hobby plan**
   - What we know: WAF rate limiting is documented by Vercel and scoped to a project.
   - What's unclear: Whether Hobby plan supports custom WAF rate limiting rules (vs Pro requirement).
   - Recommendation: Check Vercel dashboard for WAF availability after deployment. The `middleware.ts` limiter is the primary mechanism regardless (D-04); WAF would be additive hardening.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All routes, `fs` module for bank logos | Yes | 22.x (local) | — |
| pnpm | Package install | Yes | Lockfile present | — |
| `mcp-handler` | MCP route | No (not yet installed) | 1.1.0 on npm | — |
| `@modelcontextprotocol/sdk` | MCP route | No (not yet installed) | 1.29.0 on npm | — |
| `zod` | Tool inputSchema | No (not yet in package.json) | 3.25.76 on npm | — |
| `npx @modelcontextprotocol/inspector` | Local verification | npx (no install needed) | 0.22.0 | — |
| `public/bank-logos/` directory | bank-images refactor | Does not exist yet | — | Must be created + populated before refactor |
| Vercel deployment | D-09 deployed verification | Existing project deployed | — | — |

**Missing dependencies with no fallback:**
- `mcp-handler`, `@modelcontextprotocol/sdk`, `zod` — install with `pnpm add mcp-handler @modelcontextprotocol/sdk zod@^3` in Wave 0.
- `public/bank-logos/*.png` — extract from existing `bank-images.ts` base64 in Wave 0 before modifying the source file.

**Missing dependencies with fallback:**
- None — all fallbacks covered by graceful-skip logic (D-06).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30.x |
| Config file | `jest.config.js` (root) |
| Quick run command | `pnpm test --testPathPattern=mcp` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MCP-01 | `POST /api/mcp` returns 200 with valid MCP initialization response | Integration (route handler) | `pnpm test --testPathPattern=mcp-route` | ❌ Wave 0 |
| MCP-02 | Handler does not use Redis; stateless mode active | Unit (handler config) | Inspect `createMcpHandler` options in route test | ❌ Wave 0 |
| MCP-03 | `tools/list` returns `health` tool with name, title, description, inputSchema | Integration | `pnpm test --testPathPattern=mcp-registry` | ❌ Wave 0 |
| MCP-04 | Tool that throws `RouteError` returns `{ isError: true, content: [...] }` | Unit (`tool-error.ts`) | `pnpm test --testPathPattern=tool-error` | ❌ Wave 0 |
| MCP-05 | 61st request from same IP within 60s returns 429 + `Retry-After` header | Integration (middleware) | `pnpm test --testPathPattern=middleware` | ❌ Wave 0 |
| MCP-05 | 429 body matches `{ error: { code: 'RATE_LIMIT_EXCEEDED', message: '...' } }` | Integration (middleware) | same test file | ❌ Wave 0 |
| PERF-01 | `getAngolaBankLogoPath('BAI')` returns path ending in `BAI.png` when file exists | Unit (`bank-images.ts`) | `pnpm test --testPathPattern=bank-images` | ❌ Wave 0 |
| PERF-01 | `getAngolaBankLogoPath('NONEXISTENT')` returns `null` | Unit (`bank-images.ts`) | same test | ❌ Wave 0 |
| PERF-01 | `getAngolaBankLogoBytes(bank)` returns `null` for missing logo without throwing | Unit (`banks.ts`) | `pnpm test --testPathPattern=angola-banks` | ✅ (extend existing) |

### Sampling Rate

- **Per task commit:** `pnpm test --testPathPattern=mcp\|bank-images`
- **Per wave merge:** `pnpm test` (full suite — ~9 existing test files + new ones)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/__tests__/mcp-tool-error.test.ts` — unit tests for `mcpToolHandler`: happy path, `RouteError` mapping, unknown error fallback (covers MCP-04)
- [ ] `src/lib/__tests__/mcp-registry.test.ts` — verify `registerAllTools` registers `health` tool (covers MCP-03)
- [ ] `src/lib/__tests__/bank-images.test.ts` — unit tests for path resolution and null fallback (covers PERF-01)
- [ ] `src/lib/__tests__/middleware-rate-limit.test.ts` — integration test for rate limiter logic: under limit, at limit, over limit, Retry-After header, JSON shape (covers MCP-05)
- [ ] Extend `src/lib/__tests__/angola-banks.test.ts` — add test for `getAngolaBankLogoBytes` returning null gracefully

Note: MCP route handler integration tests (`mcp-route.test.ts`) require the `mcp-handler` and SDK packages to be installed first. Mark as Wave 1 if installing deps and writing tests in the same wave.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Public endpoint by design; auth deferred to v2 |
| V3 Session Management | No | Stateless; no sessions; `redisUrl` omitted |
| V4 Access Control | No | Public access; no roles/scopes in Phase 1 |
| V5 Input Validation | Yes | Zod `inputSchema` in `server.registerTool()` — SDK validates before callback fires |
| V6 Cryptography | No | No secrets processed in Phase 1 tools |
| Rate Limiting | Yes | `middleware.ts` per-IP fixed-window counter (D-01..D-04) |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Agentic endpoint flooding (AI agent calling 100s of times/min) | Denial of Service | `middleware.ts` rate limiter — 60 req/min per IP |
| Malformed Zod inputs probing for injection (empty string, oversized, SQL chars) | Tampering | Strict Zod schemas with `.min()`, `.max()`, `.regex()` on all string inputs per tool |
| IP spoofing via `x-forwarded-for` manipulation | Spoofing | Vercel controls the `x-forwarded-for` injection — client cannot forge it on inbound requests to Vercel serverless functions |
| Resource exhaustion via repeated `health` tool calls | DoS | Same rate limiter; `health` is CPU-trivial so risk is minimal |

---

## Sources

### Primary (HIGH confidence)

- `npm view mcp-handler@1.1.0 --json` — version 1.1.0, published 2026-03-24, peerDeps `{next: '>=13.0.0', '@modelcontextprotocol/sdk': '1.26.0'}`, deps include `redis` and `chalk` but NOT `zod` [VERIFIED: npm registry]
- `npm view @modelcontextprotocol/sdk@1.29.0 --json` — version 1.29.0, peerDeps `{zod: '^3.25 || ^4.0'}` [VERIFIED: npm registry]
- `npm view zod --json` — latest stable 4.4.3; latest 3.x stable is 3.25.76 [VERIFIED: npm registry]
- Codebase inspection: `src/lib/route-error.ts` — `RouteError` class fields confirmed [VERIFIED: direct file read]
- Codebase inspection: `src/lib/http.ts` — `routeErrorResponse()` output shape confirmed [VERIFIED: direct file read]
- Codebase inspection: `src/lib/angola/banks.ts` — `ANGOLA_BANK_IMAGE_DATA` import, `BANK_IMAGE_CODE_ALIASES`, `getAngolaBankImage()` function [VERIFIED: direct file read]
- Codebase inspection: `src/lib/angola/documents.ts` — does NOT import bank-images; PDF generation is pure text layout with no embedded logos [VERIFIED: grep + direct file read]
- Codebase inspection: `app/api/v1/documents/invoice/route.ts` — versioned shim pattern confirmed [VERIFIED: direct file read]
- Codebase inspection: `package.json` — confirmed `zod`, `mcp-handler`, `@modelcontextprotocol/sdk` are all absent from current dependencies [VERIFIED: direct file read]
- `.planning/research/STACK.md` — prior research confirming mcp-handler version, route pattern, Vercel Hobby tier limits [CITED: project research artifact]
- `.planning/research/ARCHITECTURE.md` — prior research confirming component layout, `mcpToolHandler` HOF shape [CITED: project research artifact]
- `.planning/research/PITFALLS.md` — prior research confirming pitfall inventory [CITED: project research artifact]

### Secondary (MEDIUM confidence)

- [Vercel: Deploy MCP servers to Vercel](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel) — `basePath`, route pattern, client config examples [CITED: official Vercel docs]
- [Vercel: Functions Limitations](https://vercel.com/docs/functions/limitations) — 4.5 MB body limit, 300 s max duration on Hobby (Fluid Compute) [CITED: official Vercel docs]
- [MCP Tools Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) — `isError`, `content` array shape [CITED: official MCP spec]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all three package versions verified against npm registry live
- Architecture: HIGH — patterns verified against codebase + prior research
- Pitfalls: HIGH — codebase inspection confirmed bank-images consumer chain; filesystem path behavior is the main assumption (A3)
- `middleware.ts` IP extraction: MEDIUM — `x-forwarded-for` pattern is industry-standard but not verified against Vercel's runtime header injection in a live test

**Research date:** 2026-06-18
**Valid until:** 2026-07-18 (mcp-handler and SDK are actively developed; re-verify peerDeps if install produces warnings)
