import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';

export function registerHealthTool(server: McpServer): void {
  server.registerTool(
    'health',
    {
      title: 'Server Health',
      description:
        'Returns the current server status and timestamp. ' +
        'Use this to verify the MCP connection is alive before calling other tools.',
      inputSchema: z.object({}),
    },
    mcpToolHandler(async () => ({
      status: 'ok',
      server: 'orb3x-utils-mcp',
      timestamp: new Date().toISOString(),
    })),
  );
}
