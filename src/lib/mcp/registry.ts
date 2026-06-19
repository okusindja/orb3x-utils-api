import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerHealthTool } from './tools/health';
import { registerAddressTools } from './tools/address';
import { registerCalendarTools } from './tools/calendar';
import { registerGeoTools } from './tools/geo';
import { registerPhoneTools } from './tools/phone';
import { registerSalaryTools } from './tools/salary';
import { registerFinanceTools } from './tools/finance';
import { registerCurrencyTools } from './tools/currency';
import { registerNifTools } from './tools/nif';
import { registerTranslationTools } from './tools/translation';

export function registerAllTools(server: McpServer): void {
  registerHealthTool(server);
  registerAddressTools(server);
  registerCalendarTools(server);
  registerGeoTools(server);
  registerPhoneTools(server);
  registerSalaryTools(server);
  registerFinanceTools(server);
  registerCurrencyTools(server);
  registerNifTools(server);
  registerTranslationTools(server);
}
