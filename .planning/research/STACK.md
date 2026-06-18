# Stack Research

**Domain:** MCP server on Vercel free tier, layered on Next.js 16 App Router
**Researched:** 2026-06-18
**Confidence:** HIGH

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `mcp-handler` | 1.1.0 | Vercel/Next.js adapter that wires `@modelcontextprotocol/sdk` into a Next.js App Router route handler | Official Vercel-maintained adapter; handles Streamable HTTP and SSE transports, session routing, and CORS without boilerplate. The `[transport]` dynamic segment pattern is the prescribed pattern in Vercel docs. |
| `@modelcontextprotocol/sdk` | 1.29.0 | MCP protocol engine — tool registration, schema validation, JSON-RPC message handling | Canonical SDK from the MCP spec authors. `mcp-handler` calls into it directly; versions < 1.26.0 have a known security vulnerability so pin at 1.29.0+ at minimum. |
| `zod` | 4.4.3 | Tool `inputSchema` definitions; validated by SDK at runtime | `mcp-handler` / SDK use Zod shapes directly in `registerTool` — not a JSON Schema string — so Zod is a hard runtime requirement, not optional. Not currently in the project; must be added. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@modelcontextprotocol/sdk/server/auth/types.js` | (bundled with SDK 1.29.0) | `AuthInfo` type for `withMcpAuth` token verification | Only if auth is added later. Out of scope for this milestone (public server, no auth). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `@modelcontextprotocol/inspector` (npx) | Local MCP server testing via browser UI | Run `npx @modelcontextprotocol/inspector`; connect to `http://localhost:3000/api/mcp` using "Streamable HTTP" transport. No install required — use via `npx` only. |

---

## Installation

```bash
# New production dependencies (none of these exist in the project yet)
pnpm add mcp-handler @modelcontextprotocol/sdk zod
```

No dev-only dependencies are required for the MCP layer itself.

---

## Route File Pattern

The standard Next.js App Router pattern for `mcp-handler` 1.1.0 uses a dynamic `[transport]` segment. For this project the route lives at:

```
app/api/[transport]/route.ts
```

This makes the public Streamable HTTP endpoint `/api/mcp`.

```typescript
// app/api/[transport]/route.ts
import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // seconds; well within Hobby plan 300s cap

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'tool_name',
      {
        title: 'Human-readable name',
        description: 'What this tool does',
        inputSchema: z.object({ param: z.string() }),
      },
      async ({ param }) => ({
        content: [{ type: 'text', text: param }],
      }),
    );
  },
  {
    serverInfo: { name: 'orb3x-utils-mcp', version: '1.0.0' },
    capabilities: { tools: {} },
  },
  {
    basePath: '/api', // must match the segment above [transport]
    maxDuration: 60,  // mirrors the export above; keep in sync
    verboseLogs: process.env.NODE_ENV === 'development',
    // redisUrl: intentionally omitted — stateless Streamable HTTP, no Redis
  },
);

export { handler as GET, handler as POST, handler as DELETE };
```

**Why `maxDuration: 60` and not 300?** The NIF lookup tool makes external HTTP requests to the AGT portal (can be slow) and PDF generation is CPU-intensive but fast. 60 s is a safe ceiling that leaves headroom below the Hobby plan maximum of 300 s, and matches the mcp-handler docs example. Increase to 300 only if NIF lookups consistently time out.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `mcp-handler` 1.1.0 | Hand-rolling `@modelcontextprotocol/sdk` `McpServer` + custom HTTP glue | Only if the project outgrows `mcp-handler` (multi-tenant routing, custom auth flows). For a public stateless server this adds ~200 lines of transport glue with no benefit. |
| Streamable HTTP transport (stateless) | SSE transport | SSE is the legacy transport; it requires Redis (`redisUrl`) for session resumability across stateless invocations. Redis is a paid Vercel add-on. Use SSE only if a client mandates it and you accept adding paid storage. |
| Zod 4.x (`zod@4.4.3`) | Zod 3.x (`zod@^3`) | The `mcp-handler` README pins the peer dep at `zod@^3` (meaning >=3 <4). Zod 4 is a major release with breaking API changes; verify SDK compatibility before using 4.x. **Use `zod@^3` (3.x) to stay within the tested peer dep range.** |

> **Zod version correction:** npm currently resolves `zod@4.4.3` but `mcp-handler@1.1.0` declares `zod@^3` as a peer dependency. Install `zod@^3` to be safe until `mcp-handler` explicitly supports Zod 4.

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| SSE transport + `redisUrl` | SSE requires a Redis-backed session store for resumability. Vercel's Redis (KV) is a paid add-on — violates the free-tier constraint. | Streamable HTTP transport (omit `redisUrl`). Stateless; works with Fluid Compute instance recycling. |
| Edge runtime (`export const runtime = 'edge'`) | `mcp-handler` and `@modelcontextprotocol/sdk` use Node.js APIs incompatible with the V8-only Edge runtime. The existing codebase already pins all routes to `nodejs`. | `export const runtime = 'nodejs'` — already the project convention. |
| `@vercel/mcp-adapter` (old package name) | This was the pre-release name; the package was renamed to `mcp-handler` before stable release. The old name no longer receives updates. | `mcp-handler` |
| Separate MCP-specific route at `/mcp/route.ts` (no `[transport]` segment) | Without the `[transport]` dynamic segment, the handler cannot dispatch between `mcp` (Streamable HTTP) and `sse` paths, breaking SDK protocol negotiation. | `app/api/[transport]/route.ts` with `basePath: '/api'` |
| `@modelcontextprotocol/sdk` < 1.26.0 | Known security vulnerability in versions prior to 1.26.0. | Pin to `@modelcontextprotocol/sdk@^1.26.0` (current: 1.29.0). |

---

## Stack Patterns by Variant

**For stateless public tools (this project's case):**
- Omit `redisUrl` entirely from handler options
- Set `basePath: '/api'`, place route at `app/api/[transport]/route.ts`
- Export `GET`, `POST`, `DELETE`
- `maxDuration: 60` is sufficient for all current utility domains

**If auth is added in a future milestone:**
- Wrap `handler` with `withMcpAuth(handler, verifyToken, { required: true, requiredScopes: [...] })`
- Add `app/.well-known/oauth-protected-resource/route.ts` for MCP spec compliance
- Both utilities are exported from `mcp-handler` — no additional packages needed

**If a tool returns binary (PDF) data:**
- Return base64 string in a `text` content item — no binary content type in MCP
- Example: `content: [{ type: 'text', text: Buffer.from(pdfBytes).toString('base64') }]`
- Client is responsible for decoding. This matches the PROJECT.md decision for document tools.

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| `mcp-handler@1.1.0` | — | `@modelcontextprotocol/sdk@>=1.26.0`, `zod@^3`, Next.js 15+ | Tested with App Router. Works on Next.js 16.2.1. |
| `@modelcontextprotocol/sdk@1.29.0` | — | `zod@^3` | 1.29.0 is on the v1.x branch; v2 alpha exists but is not production-ready. |
| `zod@3.x` | 3.24.x | Node.js 20+, TypeScript 5.x | Peer dep range from `mcp-handler`. Do not install Zod 4.x until `mcp-handler` explicitly supports it. |

---

## Vercel Free Tier Compatibility

All constraints verified against official Vercel documentation (last updated 2026-06-02 and 2026-05-14):

| Constraint | Hobby Plan Limit | This Project's Usage | Compatible? |
|------------|-----------------|---------------------|-------------|
| Max function duration (Fluid Compute) | 300 s | `maxDuration: 60` | YES |
| Redis / KV storage | Paid add-on only | Not used (stateless Streamable HTTP) | YES |
| Node.js runtime | Supported | `runtime = 'nodejs'` (existing convention) | YES |
| Fluid Compute | Enabled by default (new projects post Apr 2025) | Used implicitly | YES |
| Function invocations | 1,000,000 / month | Public but low-traffic utility API | YES |
| Max memory | 2 GB | MCP + Angola lib logic is well under 2 GB | YES |

> Fluid Compute on the Hobby plan defaults to 300 s max duration as of April 2025. Some older community articles cite a 10 s or 60 s limit — these predate Fluid Compute GA and are stale.

---

## Sources

- `/vercel/mcp-handler` (Context7 library ID) — route pattern, `createMcpHandler` API, `basePath`/`maxDuration` options, `redisUrl` optionality, stateless mode
- `/modelcontextprotocol/typescript-sdk` (Context7 library ID) — `registerTool` API, Zod `inputSchema`, v1→v2 migration notes
- [Vercel: Deploy MCP servers to Vercel](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel) — official route example (`app/api/mcp/route.ts`), Streamable HTTP client config, auth pattern (last updated 2026-03-19)
- [Vercel: Fluid Compute](https://vercel.com/docs/fluid-compute) — Hobby plan max duration 300 s confirmed, Fluid Compute enabled by default post Apr 2025 (last updated 2026-05-14)
- [Vercel: Functions Limits](https://vercel.com/docs/functions/limitations) — Hobby 300 s max/default confirmed, memory 2 GB (last updated 2026-06-02)
- [npm: mcp-handler](https://www.npmjs.com/package/mcp-handler) — version 1.1.0, peer deps `@modelcontextprotocol/sdk@1.26.0+`, `zod@^3`
- [npm: @modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) — version 1.29.0 confirmed

---

*Stack research for: MCP server on Vercel free tier (Next.js 16 App Router)*
*Researched: 2026-06-18*
