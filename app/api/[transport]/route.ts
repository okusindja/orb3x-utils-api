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
    serverInfo: { name: 'orb3x-utils-mcp', version: '1.0.0' },
    capabilities: { tools: {} },
  },
  {
    basePath: '/api',
    maxDuration: 60,
    // SSE transport in mcp-handler requires Redis (initializeRedis throws
    // "redisUrl is required"), which conflicts with the locked no-Redis /
    // free-tier constraint. Disable it so the SSE GET returns a clean 404
    // instead of a 500. Streamable HTTP (POST) needs no Redis and is the
    // transport all modern MCP clients use.
    disableSse: true,
    verboseLogs: process.env.NODE_ENV === 'development',
  },
);

export { handler as GET, handler as POST, handler as DELETE };
