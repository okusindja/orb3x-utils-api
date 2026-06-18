import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import {
  listAngolanHolidays,
  calculateWorkingDays,
  addWorkingDays,
} from '@/lib/angola/calendar';

export function registerCalendarTools(server: McpServer): void {
  server.registerTool(
    'calendar_holidays',
    {
      title: 'Angola Public Holidays',
      description:
        'List all Angolan public holidays for a given year, including fixed holidays and movable ones ' +
        '(Carnival Monday, Carnival Tuesday, Good Friday computed via Easter). ' +
        'Returns { year, holidays: [{ date, name, localName, category }], assumptions }. ' +
        'Use this to enumerate holidays. ' +
        'To count working days between two dates, use calendar_working_days. ' +
        'To find a date N working days from a start date, use calendar_add_working_days.',
      inputSchema: z.object({
        year: z.number().int().min(2000).max(2100).optional()
          .describe('Calendar year to list holidays for (2000–2100). Defaults to the current year when omitted.'),
      }),
    },
    mcpToolHandler(async ({ year }) => {
      const resolvedYear = year ?? new Date().getUTCFullYear();
      return {
        year: resolvedYear,
        holidays: listAngolanHolidays(resolvedYear),
        assumptions: [
          'Weekend bridge days declared ad hoc by the government are not inferred.',
          'Carnival Monday, Carnival Tuesday, and Good Friday are included as movable public holidays.',
        ],
      };
    }),
  );

  server.registerTool(
    'calendar_working_days',
    {
      title: 'Angola Working Days Count',
      description:
        'Count working days between two dates in Angola, excluding weekends and Angolan public holidays. ' +
        'Returns { from, to, workingDays, excludedWeekendDays, excludedHolidayDays }. ' +
        'Both dates are inclusive. ' +
        'Use this when you have a range and want the count. ' +
        'To get a list of holidays for a year, use calendar_holidays. ' +
        'To find a date that is N working days away, use calendar_add_working_days.',
      inputSchema: z.object({
        from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe('Start date in YYYY-MM-DD format (ISO 8601, e.g., "2026-01-01"). Inclusive.'),
        to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe('End date in YYYY-MM-DD format (ISO 8601, e.g., "2026-12-31"). Inclusive. Must be on or after the from date.'),
      }),
    },
    mcpToolHandler(async ({ from, to }) => calculateWorkingDays({ from, to })),
  );

  server.registerTool(
    'calendar_add_working_days',
    {
      title: 'Angola Add Working Days',
      description:
        'Add (or subtract) N working days to a date in Angola, skipping weekends and Angolan public holidays. ' +
        'Returns { inputDate, days, resultDate, direction }. ' +
        'Use this when you need to compute a deadline or offset date. ' +
        'To count working days between two known dates, use calendar_working_days. ' +
        'To list all holidays for a year, use calendar_holidays.',
      inputSchema: z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe('Start date in YYYY-MM-DD format (ISO 8601, e.g., "2026-06-18").'),
        days: z.number().int()
          .describe('Number of working days to add. Positive to advance forward, negative to go backward. Zero is allowed and returns the same date with direction "none".'),
      }),
    },
    mcpToolHandler(async ({ date, days }) => addWorkingDays({ date, days })),
  );
}
