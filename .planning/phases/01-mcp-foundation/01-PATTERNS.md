# Phase 1: MCP Foundation - Pattern Map

**Mapped:** 2026-06-18
**Files analyzed:** 9 new/modified files
**Analogs found:** 7 / 9

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `app/api/[transport]/route.ts` | route | request-response | `app/documents/invoice/route.ts` | role-match (runtime/dynamic/maxDuration exports identical; handler export shape differs) |
| `middleware.ts` | middleware | request-response | none — no middleware exists yet | no analog |
| `src/lib/mcp/registry.ts` | utility | request-response | `src/lib/angola/banks.ts` (module that composes and exports domain functions) | partial (composition pattern) |
| `src/lib/mcp/tool-error.ts` | utility | request-response | `src/lib/http.ts` (`routeErrorResponse` — same error-catching HOF shape) | role-match |
| `src/lib/mcp/tools/health.ts` | utility | request-response | `src/lib/angola/documents.ts` (typed async function exported from domain module) | partial |
| `src/lib/angola/bank-images.ts` (modified) | utility | file-I/O | self (is the file being changed; existing import pattern in `banks.ts` is the consumer) | self-refactor |
| `src/lib/angola/banks.ts` (modified) | service | file-I/O | self (adding `getAngolaBankLogoBytes`; rest of file unchanged) | self-modification |
| `public/bank-logos/*.png` | static asset | file-I/O | `public/` (no existing PNG assets; extraction from base64 in `bank-images.ts`) | no analog |
| `src/lib/__tests__/mcp-tool-error.test.ts` | test | — | `src/lib/__tests__/angola-banks.test.ts` | role-match |

---

## Pattern Assignments

### `app/api/[transport]/route.ts` (route, request-response)

**Analog:** `app/documents/invoice/route.ts` + versioned shim `app/api/v1/documents/invoice/route.ts`

**Runtime/config export pattern** (`app/documents/invoice/route.ts` lines 1–10 and shim lines 1–7):
```typescript
// Real handler — copy these three exports verbatim; only maxDuration value changes (60 not 30)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;   // MCP route uses 60
```

**Shim re-export pattern** (`app/api/v1/documents/invoice/route.ts` lines 1–7):
```typescript
import { POST as handler } from '../../../../documents/invoice/route';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;
export const POST = handler;
```

**MCP route divergence — handler export shape (from RESEARCH.md Pattern 1):**
```typescript
// app/api/[transport]/route.ts — NOT a shim; direct createMcpHandler call
import { createMcpHandler } from 'mcp-handler';
import { registerAllTools } from '@/lib/mcp/registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const handler = createMcpHandler(
  (server) => { registerAllTools(server); },
  { serverInfo: { name: 'orb3x-utils-mcp', version: '1.0.0' }, capabilities: { tools: {} } },
  { basePath: '/api', maxDuration: 60, verboseLogs: process.env.NODE_ENV === 'development' },
  // redisUrl intentionally omitted — stateless mode
);

export { handler as GET, handler as POST, handler as DELETE };
// Note: three exports required (GET/POST/DELETE) — unlike existing routes that export only POST
```

**Key differences from existing route pattern:**
- Exports `GET`, `POST`, `DELETE` (not just `POST`)
- `maxDuration: 60` (existing routes use 30)
- Handler is a `const` assigned from `createMcpHandler`, not an `async function`
- No `try/catch` in the route file itself — error boundary lives in `src/lib/mcp/tool-error.ts`

---

### `middleware.ts` (middleware, request-response)

**Analog:** None — no `middleware.ts` exists in the project.

**Pattern source:** RESEARCH.md Pattern 4 (fully specified).

**Concrete implementation (place at project root, same level as `next.config.ts`):**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

type WindowEntry = { count: number; resetAt: number };
const store = new Map<string, WindowEntry>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
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
      JSON.stringify({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please wait before retrying.' } }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Retry-After': String(retryAfterSecs) } },
    );
  }
  return NextResponse.next();
}

export const config = { matcher: ['/api/mcp', '/api/sse'] };
```

**Response body shape** must match `routeErrorResponse()` output (`src/lib/http.ts` lines 41–52):
```typescript
// routeErrorResponse emits: { error: { code, message, ...details } }
// 429 body must be:         { error: { code: 'RATE_LIMIT_EXCEEDED', message: '...' } }
// Cache-Control: no-store (same as noStoreJson in http.ts line 8)
```

---

### `src/lib/mcp/tool-error.ts` (utility, request-response)

**Analog:** `src/lib/http.ts` — `routeErrorResponse()` is the same structural pattern (catches `RouteError`, emits structured error, catches unknown errors with fallback).

**Error-catch pattern to mirror** (`src/lib/http.ts` lines 36–64):
```typescript
export function routeErrorResponse(error: unknown, fallbackMessage: string, ...) {
  if (error instanceof RouteError) {
    return noStoreJson({ error: { code: error.code, message: error.message, ...(error.details ?? {}) } }, { status: error.status });
  }
  return noStoreJson({ error: { code: 'INTERNAL_SERVER_ERROR', message: fallbackMessage, ... } }, { status: 500 });
}
```

**`mcpToolHandler` translation of that pattern:**
```typescript
// src/lib/mcp/tool-error.ts
import { RouteError } from '@/lib/route-error';

type McpResult = { content: Array<{ type: 'text'; text: string }>; isError?: true };

export function mcpToolHandler<TInput>(
  fn: (input: TInput) => unknown | Promise<unknown>,
): (input: TInput) => Promise<McpResult> {
  return async (input) => {
    try {
      const result = await fn(input);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    } catch (error) {
      if (error instanceof RouteError) {
        return {
          isError: true,
          content: [{ type: 'text', text: JSON.stringify({ code: error.code, message: error.message, ...(error.details ?? {}) }) }],
        };
      }
      const msg = error instanceof Error ? error.message : 'Unexpected error';
      return {
        isError: true,
        content: [{ type: 'text', text: JSON.stringify({ code: 'INTERNAL_SERVER_ERROR', message: msg }) }],
      };
    }
  };
}
```

**Differences from `routeErrorResponse`:**
- Returns `{ content, isError? }` (MCP shape), NOT `NextResponse`
- `status` field from `RouteError` is dropped — no HTTP concept in MCP content
- HOF wrapping (returns function), not a direct call
- Import path: `@/lib/route-error` (same as `http.ts` line 2)

---

### `src/lib/mcp/registry.ts` (utility, request-response)

**Analog:** `src/lib/angola/banks.ts` (module-level composition of exported domain functions with a single public aggregator).

**Composition pattern** (`src/lib/angola/banks.ts` lines 68–73 — `getAngolaBanks` composes `getAngolaBankImage`):
```typescript
export function getAngolaBanks() {
  return BANKS.map((bank) => ({
    ...bank,
    image: getAngolaBankImage(bank),
  }));
}
```

**`registry.ts` applies the same aggregator pattern:**
```typescript
// src/lib/mcp/registry.ts
import { registerHealthTool } from './tools/health';
// Phase 2+: import registerSalaryTools, etc.

export function registerAllTools(server: import('mcp-handler').McpServer) {
  registerHealthTool(server);
  // Phase 2+ registrations follow in order here
}
```

**Conventions to copy from `banks.ts`:**
- Named exports only, no default export
- Single-responsibility: registry only composes; each `register*Tool` handles its own schema and callback
- `@/lib/angola/` prefix for domain imports — MCP layer uses `@/lib/mcp/` as sibling

---

### `src/lib/mcp/tools/health.ts` (utility, request-response)

**Analog:** `src/lib/angola/documents.ts` (typed async function with structured return, isolated in domain module).

**Async function export pattern** (`src/lib/angola/documents.ts` lines 1–5, 46–50):
```typescript
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { RouteError } from '@/lib/route-error';
import { calculateInvoiceTotals } from '@/lib/angola/finance';

export async function generateInvoicePdf(payload: InvoicePayload) {
  // ... pure domain logic, throws RouteError on invalid input
```

**`health.ts` applies same isolated-module pattern but with `mcpToolHandler` wrapping:**
```typescript
// src/lib/mcp/tools/health.ts
import { z } from 'zod';
import { mcpToolHandler } from '../tool-error';

export function registerHealthTool(server: import('mcp-handler').McpServer) {
  server.registerTool(
    'health',
    {
      title: 'Server Health',
      description: 'Returns the current server status and timestamp. Use this to verify the MCP connection is alive before calling other tools.',
      inputSchema: z.object({}),
    },
    mcpToolHandler(async () => ({
      status: 'ok',
      server: 'orb3x-utils-mcp',
      timestamp: new Date().toISOString(),
    })),
  );
}
```

**Conventions to copy from existing domain modules:**
- No module-level mutable state (no caches, no counters — stateless per D-04)
- Named exports only
- Import `RouteError` from `@/lib/route-error` (via `mcpToolHandler` — not directly in `health.ts`)

---

### `src/lib/angola/bank-images.ts` (modified — self-refactor, file-I/O)

**Current export consumed by `banks.ts` line 9:**
```typescript
import { ANGOLA_BANK_IMAGE_DATA } from '@/lib/angola/bank-images';
// Used at lines 65, 280: ANGOLA_BANK_IMAGE_DATA.PLACEHOLDER, ANGOLA_BANK_IMAGE_DATA[imageKey]
```

**After refactor — new export shape (replaces the entire current file):**
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

**Critical constraint:** `ANGOLA_BANK_IMAGE_DATA` export is fully removed. `banks.ts` lines 9, 65, 66, 280 must be updated in the same commit. No other file imports `bank-images.ts` (confirmed by grep — `documents.ts` does not import it).

**Node.js `fs` import style to use** (consistent with project — no existing `fs` usage found; use named import from `node:fs`):
```typescript
import { existsSync } from 'node:fs';
import { join } from 'node:path';
```

---

### `src/lib/angola/banks.ts` (modified — self-modification, file-I/O)

**Lines to remove** (depend on the old export):
```typescript
// Line 9  — remove:
import { ANGOLA_BANK_IMAGE_DATA } from '@/lib/angola/bank-images';

// Line 65 — remove:
const BANK_IMAGE_PLACEHOLDER = ANGOLA_BANK_IMAGE_DATA.PLACEHOLDER;

// Line 66 — remove:
const bankImageCache = new Map<string, string>();

// Lines 272–284 — remove `getAngolaBankImage` private function entirely
```

**Lines to add** (new imports and replacement function):
```typescript
// New import block (add after existing imports):
import { readFileSync } from 'node:fs';
import { getAngolaBankLogoPath } from '@/lib/angola/bank-images';

// BANK_IMAGE_CODE_ALIASES stays unchanged (lines 58–63)

// New public function (replaces private getAngolaBankImage):
export function getAngolaBankLogoBytes(bank: AngolaBank): Uint8Array | null {
  const imageKey = BANK_IMAGE_CODE_ALIASES[bank.code] ?? bank.code;
  const path = getAngolaBankLogoPath(imageKey);
  if (!path) return null;
  try {
    return readFileSync(path);
  } catch {
    return null;  // D-06: graceful degradation
  }
}
```

**Callers of the old `getAngolaBankImage` to update** (all within `banks.ts`):
- Line 72: `image: getAngolaBankImage(bank)` → `image: getAngolaBankLogoBytes(bank)` (or remove if `getAngolaBanks()` return shape changes)
- Lines 167–169, 225–227: inline calls in `validateAngolanBankAccount` / `validateAngolanIban` — update or remove `image` field

**Test impact** (`src/lib/__tests__/angola-banks.test.ts` lines 27–55): The four assertions matching `data:image/...;base64,` patterns will break. Tests must be updated to assert `Uint8Array | null` return type instead.

---

### `public/bank-logos/*.png` (static assets, file-I/O)

**Analog:** None — `public/` directory currently contains no PNG assets.

**Extraction approach** (run once before modifying `bank-images.ts`; the source file still has the base64 data at that point):
```bash
node -e "
const { ANGOLA_BANK_IMAGE_DATA } = require('./src/lib/angola/bank-images');
const { BANK_IMAGE_CODE_ALIASES } = require('./src/lib/angola/banks');
const fs = require('fs');
fs.mkdirSync('public/bank-logos', { recursive: true });
for (const [key, dataUri] of Object.entries(ANGOLA_BANK_IMAGE_DATA)) {
  const alias = BANK_IMAGE_CODE_ALIASES[key] ?? key;
  const base64 = dataUri.replace(/^data:image\/[^;]+;base64,/, '');
  fs.writeFileSync('public/bank-logos/' + alias + '.png', Buffer.from(base64, 'base64'));
  if (alias !== key) {
    console.log('Alias:', key, '->', alias + '.png');
  }
}
console.log('Extracted', Object.keys(ANGOLA_BANK_IMAGE_DATA).length, 'files');
"
```

**Alias mapping** (`BANK_IMAGE_CODE_ALIASES` in `banks.ts` lines 58–63 — filenames must use alias, not code):
- `BPT` → `POSTAL.png`
- `BSOL` → `SOL.png`
- `BVB` → `BV.png`
- `FNB` → `FINIBANCO.png`

**Note:** Not all images in `bank-images.ts` are PNG — some are SVG+XML or JPEG base64 (confirmed by `angola-banks.test.ts` lines 43–46). The extraction script writes them all as `.png` regardless of the original MIME type because `getAngolaBankLogoPath` always looks for `.png`. Confirm during implementation whether non-PNG data still embeds correctly via `pdf-lib`'s `embedPng`, or whether non-PNG originals should be converted or skipped.

---

### `src/lib/__tests__/mcp-tool-error.test.ts` (test)

**Analog:** `src/lib/__tests__/angola-banks.test.ts` — same Jest structure, named describes, `it()` blocks.

**Test structure to copy** (`angola-banks.test.ts` lines 1–56):
```typescript
import { functionUnderTest } from '@/lib/angola/banks';

describe('angola banks', () => {
  it('description of behavior', () => {
    const result = functionUnderTest(input);
    expect(result.field).toBe(expectedValue);
  });
});
```

**`mcp-tool-error.test.ts` required test cases:**
```typescript
import { mcpToolHandler } from '@/lib/mcp/tool-error';
import { RouteError } from '@/lib/route-error';

describe('mcpToolHandler', () => {
  it('returns content array on success', async () => { ... });
  it('returns isError:true with code+message when RouteError is thrown', async () => { ... });
  it('returns INTERNAL_SERVER_ERROR for non-RouteError throws', async () => { ... });
  it('returns INTERNAL_SERVER_ERROR for non-Error throws', async () => { ... });
});
```

---

## Shared Patterns

### RouteError Import
**Source:** `src/lib/route-error.ts` (entire file, 18 lines)
**Apply to:** `src/lib/mcp/tool-error.ts`, `src/lib/angola/banks.ts` (already imported)
```typescript
import { RouteError } from '@/lib/route-error';
// RouteError fields: code: string, status: number, details?: Record<string,unknown>, message (via Error)
```

### Error JSON Shape Consistency
**Source:** `src/lib/http.ts` lines 41–52 (`routeErrorResponse`)
**Apply to:** `middleware.ts` (429 body), `src/lib/mcp/tool-error.ts` (isError content)
```typescript
// Both surfaces must emit: { error: { code, message, ...details } }
// middleware.ts 429 → wrapped in NextResponse; tool-error.ts → JSON.stringify into content text
```

### Response No-Store Header
**Source:** `src/lib/http.ts` lines 6–14 (`noStoreJson`)
**Apply to:** `middleware.ts` (the 429 NextResponse must include `'Cache-Control': 'no-store'`)
```typescript
headers.set('Cache-Control', 'no-store');
```

### Module-Level `runtime`/`dynamic`/`maxDuration` Exports
**Source:** `app/documents/invoice/route.ts` lines 8–10
**Apply to:** `app/api/[transport]/route.ts` (copy exactly; change `maxDuration` to `60`)
```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;  // MCP route: 60; all other routes: 30
```

### Path Alias Convention
**Source:** All existing files (`@/lib/...` not relative `../../...`)
**Apply to:** All new `src/lib/mcp/*.ts` files
```typescript
import { RouteError } from '@/lib/route-error';   // correct
import { RouteError } from '../../route-error';    // wrong
```

### `node:` Protocol for Built-ins
**Apply to:** `src/lib/angola/bank-images.ts` (modified), `src/lib/angola/banks.ts` (modified)
```typescript
import { existsSync } from 'node:fs';  // use node: prefix
import { join } from 'node:path';      // consistent with modern Node.js style
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `middleware.ts` | middleware | request-response | No `middleware.ts` exists; Next.js middleware is a new pattern for this codebase |
| `public/bank-logos/*.png` | static asset | file-I/O | No PNG assets in `public/`; pure extraction task, no code pattern to copy |

---

## Build Order Note for Planner

RESEARCH.md specifies this wave order (Wave 0 before Wave 1):

1. **Before anything else:** Extract PNGs to `public/bank-logos/` (using the extraction script above while `bank-images.ts` still has base64)
2. **Wave 1:** `src/lib/mcp/tool-error.ts` → `src/lib/mcp/tools/health.ts` → `src/lib/mcp/registry.ts`
3. **Wave 2:** `app/api/[transport]/route.ts` → `middleware.ts`
4. **Wave 3:** `src/lib/angola/bank-images.ts` refactor + `src/lib/angola/banks.ts` update (atomic — same commit)

Dependencies: `pnpm add mcp-handler @modelcontextprotocol/sdk zod@^3` must run before Wave 1 (TypeScript types needed).

---

## Metadata

**Analog search scope:** `app/`, `src/lib/angola/`, `src/lib/__tests__/`
**Files scanned:** 8 existing files read directly
**Pattern extraction date:** 2026-06-18
