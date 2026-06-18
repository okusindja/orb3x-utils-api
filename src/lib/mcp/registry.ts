import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerHealthTool } from './tools/health';

export function registerAllTools(server: McpServer): void {
  registerHealthTool(server);
}
