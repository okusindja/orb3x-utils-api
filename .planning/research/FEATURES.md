# Feature Research

**Domain:** Public MCP server exposing utility functions as MCP tools (Angola utilities over Streamable HTTP)
**Researched:** 2026-06-18
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features that any functional MCP server must have. Missing these means MCP clients cannot connect, discover, or invoke tools at all.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `tools/list` endpoint responding with all registered tools | MCP clients call this on connect to discover what a server can do; no list = no usable server | LOW | `mcp-handler` provides this automatically; declare `capabilities: { tools: {} }` |
| Tool `name` — unique, stable, snake_case identifier | Clients invoke tools by name; name changes are breaking changes | LOW | Follow `{domain}_{action}` pattern, e.g. `salary_calculate_net`, `nif_lookup`; never abbreviate ambiguously |
| Tool `description` — 1-2 sentence, action-oriented, front-loaded | LLMs read this to decide which tool to call; vague descriptions cause hallucinated calls or missed invocations | LOW | Start with verb+resource: "Calculate net salary after Angolan income tax (IRT) and social security (INSS) deductions." Specify what it does NOT handle in the description when ambiguity is likely. |
| `inputSchema` — Zod shape defining every parameter with per-field `.describe()` | Clients and LLMs use schema to construct valid calls; missing descriptions mean agents guess at field semantics | LOW | Use `z.string().describe("Angola NIF (9-digit taxpayer ID)")` — every field needs a `.describe()`. Use `.enum()` and `.min()/.max()` to constrain inputs rather than leaving them open. |
| Structured `content` array in tool result | Every tool result must return `{ content: [{ type: "text", text: "..." }] }`; this is the only valid response shape for unstructured results | LOW | Utility functions returning JSON objects: `JSON.stringify(result, null, 2)` inside a `type: "text"` block is the safe, universal approach |
| Tool execution errors via `{ content: [...], isError: true }` | Protocol-level errors (unknown tool, bad JSON-RPC) vs. business logic failures must be handled differently; `isError: true` signals the LLM a recoverable error occurred, enabling self-correction | LOW | Return `{ content: [{ type: "text", text: "NIF not found in AGT registry." }], isError: true }` rather than throwing. Map existing `RouteError` shape to this. |
| POST + GET on single `/api/[transport]` endpoint | Streamable HTTP requires both methods; `mcp-handler` handles this via `export { handler as GET, handler as POST }` | LOW | Route must be at `app/api/[transport]/route.ts`; `basePath: "/api"` in handler config |
| `serverInfo` declaration (`name`, `version`) | Required in `InitializeResult`; clients display this for debugging; missing causes protocol handshake warnings | LOW | `{ serverInfo: { name: "orb3x-angola-utils", version: "1.0.0" } }` |
| Valid JSON-RPC over HTTP with correct `Accept` header handling | Streamable HTTP clients send `Accept: application/json, text/event-stream`; server must handle both response modes | LOW | `mcp-handler` handles protocol framing; implementer only provides tool logic |
| Input validation with actionable error messages | Invalid inputs must produce helpful `isError: true` responses, not silent failures or thrown exceptions | LOW | Zod parse errors can be caught and surfaced as `isError: true` content blocks with the exact field that failed |

### Differentiators (Competitive Advantage)

Features that improve LLM usability, discoverability, and developer experience beyond the minimum viable MCP server.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| `title` field on every tool (human-readable display name) | MCP 2025-06-18 spec adds optional `title`; clients like Claude Desktop render this in UI; `name` is machine-readable, `title` is human-readable | LOW | `title: "Net Salary Calculator"` alongside `name: "salary_calculate_net"` |
| `structuredContent` + `outputSchema` on tools returning JSON | Clients and LLMs that support it can parse structured results directly without parsing JSON text; provides schema-level guarantees on output shape | MEDIUM | Return both `content: [{ type: "text", text: JSON.stringify(result) }]` AND `structuredContent: result`; define `outputSchema` in tool registration. Backward-compatible: older clients use text, newer use structuredContent. |
| PDF/binary returned as `type: "image"` or `type: "resource"` blob content block | Document tools (invoice, receipt, contract) generate PDFs; MCP has no `type: "pdf"` but supports `type: "image"` with base64+mimeType, and embedded resource `blob` field | MEDIUM | Use embedded resource: `{ type: "resource", resource: { uri: "data:application/pdf;base64,...", mimeType: "application/pdf", blob: "<base64>" } }`. Limit: keep PDFs under 1MB in base64. Also return a `type: "text"` block stating "PDF generated successfully" for clients that don't render blobs. Always return both. |
| Workflow hints in descriptions (prerequisite tool calls) | When tool B requires results from tool A, stating this in B's description prevents LLM from calling B blind | LOW | Example: "Look up an Angolan company by NIF. For bulk lookups, call `nif_lookup` sequentially — batch endpoints are not available." |
| `annotations` on tool results (`audience`, `priority`) | Allows clients to filter content for user vs. assistant audiences; PDF blobs for user display, structured JSON for assistant context | LOW | `{ audience: ["user"], priority: 0.9 }` on PDF content blocks; `{ audience: ["assistant"] }` on JSON text blocks |
| Tool grouping via naming convention (`{domain}_{verb}_{noun}`) | When serving 15+ tools, consistent naming lets LLMs mentally group by domain (salary_, phone_, geo_, etc.) | LOW | Enforce during registration: `salary_calculate_net`, `phone_validate`, `geo_lookup_coordinates`, `currency_exchange_rate`, `calendar_list_holidays`, `document_generate_invoice` |
| Server-level description in `serverInfo` or via a `prompts/list` entry | LLM clients can use a server description prompt to understand the full scope of the server before calling `tools/list` | LOW | Optional but worth adding: a single prompt named `server_overview` describing all domains and their tool names |
| Dual client config documentation (Streamable HTTP direct + mcp-remote fallback) | Claude Desktop and Cursor support native Streamable HTTP (`"url": "https://..."`) since 2025; older clients need `mcp-remote` bridge. Documenting both reduces friction for integrators. | LOW | Direct: `{ "mcpServers": { "angola-utils": { "url": "https://orb3x-utils.vercel.app/api/mcp" } } }`. Fallback: `{ "command": "npx", "args": ["-y", "mcp-remote", "https://..."] }` |
| Consistent structured error shape matching `RouteError` | The existing HTTP API uses a structured error object; MCP errors should follow the same `{ code, message }` shape serialized into the `isError: true` text block | LOW | Reuse or import the existing error serializer; keeps error handling uniform across HTTP and MCP surfaces |

### Anti-Features (Deliberately NOT Built)

Features that seem reasonable but conflict with the project's constraints and access model.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Authentication / API keys on MCP endpoint | Many MCP servers gate access; seems professional | The HTTP API is already fully public; adding auth here creates an inconsistency and blocks zero-friction adoption. Project explicitly chose public access. | Document rate limiting at Vercel infrastructure level if needed; do not add app-level auth |
| SSE with persistent session state (Redis-backed) | Enables server-to-client push notifications and resumable streams | Requires Redis (paid add-on); violates free-tier constraint. Stateless Streamable HTTP satisfies all tool-call use cases. | Use stateless Streamable HTTP mode (no `redisUrl` in handler config); each request is self-contained |
| MCP `resources` capability exposing Angola data as subscribable resources | Resources are a valid MCP primitive; could expose holiday lists, tax tables as resources | Resources are application-driven (user selects them in UI); tools are model-driven (LLM calls them). For Angola utilities, all interactions are request/response — tools are the right primitive. Resources add complexity without benefit here. | Expose everything as tools; return data directly in tool results |
| Streaming tool results (SSE mid-response) | Long-running tools could stream progress | NIF lookup (AGT scrape) is the longest operation but still completes in one shot; no tool needs mid-result streaming. Adds complexity, incompatible with stateless mode. | Set `maxDuration: 60` for long-running tools (NIF scrape); return single complete result |
| `tools/list_changed` notifications | Dynamic tool lists are a valid MCP feature | Tool list is static (all tools registered at startup); no dynamic tools exist in this server | Declare `capabilities: { tools: {} }` without `listChanged: true` |
| Tool batching (one tool call for multiple NIF lookups) | Seems efficient | Adds schema complexity; LLMs can already call `nif_lookup` in a loop; description should state this | Document sequential calling pattern in tool description |
| Edge runtime for the MCP route | Edge is fast | Existing routes use Node.js runtime; `mcp-handler` requires Node.js (no Edge support); AGT scraping requires Node.js HTTP. Moving to Edge would break all tools. | Node.js runtime only (`export const runtime = "nodejs"`) |

## Feature Dependencies

```
[PDF document tools: invoice, receipt, contract]
    └──requires──> [generateInvoicePdf / generateReceiptPdf / generateContractPdf in src/lib/angola/documents.ts]
                       └──already exists, no new work──> [existing lib functions]

[structuredContent on tool results]
    └──enhances──> [type: "text" JSON content block]
    └──requires──> [outputSchema declaration in tool registration]

[PDF as embedded resource blob]
    └──requires──> [type: "text" fallback content block] (backward compat)
    └──requires──> [PDF size < 1MB in base64]

[mcp-remote fallback client config]
    └──enhances──> [Streamable HTTP native client config]
    └──independent of server implementation]

[Streamable HTTP endpoint at /api/[transport]]
    └──requires──> [mcp-handler createMcpHandler]
    └──requires──> [export { handler as GET, handler as POST }]
    └──requires──> [basePath: "/api" matching route location]
```

### Dependency Notes

- **PDF blob requires text fallback:** Claude Desktop and older clients may not render embedded resource blobs. Always include a `type: "text"` block stating the PDF was generated alongside the blob block.
- **structuredContent requires outputSchema:** If `outputSchema` is declared, the server MUST return `structuredContent` conforming to it. Only add `outputSchema` when the output shape is fully stable.
- **All tool features require mcp-handler:** The `createMcpHandler` abstraction handles protocol framing, `tools/list`, JSON-RPC dispatch. Do not implement raw MCP protocol manually.

## MVP Definition

### Launch With (v1)

Minimum viable MCP server — everything needed for a client to connect, discover, and call all Angola utility tools.

- [ ] `app/api/[transport]/route.ts` — Streamable HTTP endpoint via `createMcpHandler`, Node.js runtime, `maxDuration: 60`
- [ ] All domains registered as tools with `name`, `title`, `description`, `inputSchema` (Zod with `.describe()` on every field)
- [ ] Tool results return `{ content: [{ type: "text", text: JSON.stringify(result) }] }` for JSON-returning utilities
- [ ] Tool errors return `{ content: [{ type: "text", text: "..." }], isError: true }` — never throw from tool handler
- [ ] Document tools return PDF base64 as embedded resource blob + text fallback content block
- [ ] Restore deleted `/api/v1/documents/{contract,receipt}` shims (prerequisite: versioned HTTP API fully working)
- [ ] MCP docs page on the existing docs site, all 7 locales, with client config snippets for both Streamable HTTP and mcp-remote

### Add After Validation (v1.x)

- [ ] `structuredContent` + `outputSchema` on high-value tools (salary, currency exchange) — add once output shape is confirmed stable
- [ ] `title` field on all tools — trivial to add at any point
- [ ] `annotations` on PDF content blocks (`audience: ["user"]`) — add when client rendering is tested

### Future Consideration (v2+)

- [ ] `prompts/list` with a `server_overview` prompt — only useful if clients start surfacing prompts prominently
- [ ] Resource templates for static Angola data (holiday tables, IRT tax brackets) — only if users request browsing data outside of tool calls

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Streamable HTTP endpoint (`/api/[transport]`) | HIGH | LOW | P1 |
| Tool registration with `name` + `description` + `inputSchema` | HIGH | LOW | P1 |
| `type: "text"` JSON results for all utility tools | HIGH | LOW | P1 |
| `isError: true` error responses | HIGH | LOW | P1 |
| PDF as embedded resource blob + text fallback | HIGH | MEDIUM | P1 |
| Restore contract/receipt v1 shims | HIGH | LOW | P1 |
| MCP docs page (7 locales, client config) | HIGH | MEDIUM | P1 |
| `title` field on tools | LOW | LOW | P2 |
| `annotations` on content blocks | LOW | LOW | P2 |
| `structuredContent` + `outputSchema` | MEDIUM | MEDIUM | P2 |
| `server_overview` prompt | LOW | LOW | P3 |
| Resource templates for static data | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Client Connection Reference

This is the primary integration surface for end-users.

**Native Streamable HTTP (Claude Desktop 2025+, Cursor, Claude Code):**
```json
{
  "mcpServers": {
    "angola-utils": {
      "url": "https://orb3x-utils.vercel.app/api/mcp"
    }
  }
}
```

**Fallback via mcp-remote (stdio-only clients):**
```json
{
  "mcpServers": {
    "angola-utils": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://orb3x-utils.vercel.app/api/mcp"]
    }
  }
}
```

Config file locations by client:
- Claude Desktop (macOS): `~/Library/Application Support/Claude/claude_desktop_config.json`
- Claude Code: `.claude/mcp_settings.json` or `~/.claude/mcp_settings.json`
- Cursor: `~/.cursor/mcp.json`
- VS Code (Copilot): `.vscode/mcp.json`

Note: Claude Desktop reads config once at startup — require a full restart after editing.

## Sources

- [MCP Tools Specification (2025-06-18)](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) — tool definition fields, content types, error handling, structured content, `isError`
- [MCP Transports Specification (2025-06-18)](https://modelcontextprotocol.io/specification/2025-06-18/server/transports) — Streamable HTTP protocol, POST+GET, session management
- [MCP Resources Specification (2025-06-18)](https://modelcontextprotocol.io/specification/2025-06-18/server/resources) — blob binary encoding, embedded resources
- [vercel/mcp-handler Context7 docs](https://context7.com/vercel/mcp-handler/llms.txt) — `createMcpHandler`, client config JSON, Streamable HTTP connection
- [MCP Server Best Practices — philschmid.de](https://www.philschmid.de/mcp-best-practices) — tool design, flattening arguments, graceful error messages, curation
- [MCP Tool Descriptions: Best Practices — merge.dev](https://www.merge.dev/blog/mcp-tool-description) — action-oriented naming, front-loading, workflow context
- [MCP Files and Resources Part 1 — llmindset.co.uk](https://llmindset.co.uk/posts/2025/01/mcp-files-resources-part1/) — 1MB size limit for embedded content, base64 encoding for binary
- [MCP Cheat Sheet 2026 — webfuse.com](https://www.webfuse.com/mcp-cheat-sheet) — client configuration patterns
- [MCP Config Files Guide — mcpplaygroundonline.com](https://mcpplaygroundonline.com/blog/complete-guide-mcp-config-files-claude-desktop-cursor-lovable) — config file locations per client

---
*Feature research for: MCP server wrapping Angola utility functions (orb3x-utils-api)*
*Researched: 2026-06-18*
