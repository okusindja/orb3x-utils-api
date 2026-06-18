import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerHealthTool } from './tools/health';
import { registerAddressTools } from './tools/address';
import { registerCalendarTools } from './tools/calendar';
import { registerGeoTools } from './tools/geo';
import { registerPhoneTools } from './tools/phone';
import { registerSalaryTools } from './tools/salary';

export function registerAllTools(server: McpServer): void {
  registerHealthTool(server);
  registerAddressTools(server);
  registerCalendarTools(server);
  registerGeoTools(server);
  registerPhoneTools(server);
  registerSalaryTools(server);
}
