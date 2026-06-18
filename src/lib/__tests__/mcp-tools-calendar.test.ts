import { registerCalendarTools } from '@/lib/mcp/tools/calendar';

describe('registerCalendarTools', () => {
  it('registers calendar_holidays, calendar_working_days, calendar_add_working_days', () => {
    const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};
    const mockServer = {
      registerTool: (
        name: string,
        meta: { title?: string; description?: string; inputSchema?: unknown },
      ) => {
        registeredTools[name] = meta;
      },
    };
    registerCalendarTools(mockServer as never);
    expect(registeredTools['calendar_holidays']).toBeDefined();
    expect(registeredTools['calendar_working_days']).toBeDefined();
    expect(registeredTools['calendar_add_working_days']).toBeDefined();
  });

  it('each tool has non-empty title and description', () => {
    const registeredTools: Record<string, { title?: string; description?: string }> = {};
    const mockServer = {
      registerTool: (name: string, meta: { title?: string; description?: string }) => {
        registeredTools[name] = meta;
      },
    };
    registerCalendarTools(mockServer as never);
    for (const name of ['calendar_holidays', 'calendar_working_days', 'calendar_add_working_days']) {
      expect(typeof registeredTools[name]?.title).toBe('string');
      expect((registeredTools[name]?.title ?? '').length).toBeGreaterThan(0);
      expect(typeof registeredTools[name]?.description).toBe('string');
      expect((registeredTools[name]?.description ?? '').length).toBeGreaterThan(0);
    }
  });

  it('calendar_holidays happy path: year 2026 returns 13 holidays with correct year', async () => {
    let holidaysHandler: ((input: unknown) => Promise<unknown>) | undefined;
    const mockServer = {
      registerTool: (name: string, _meta: unknown, handler: (input: unknown) => Promise<unknown>) => {
        if (name === 'calendar_holidays') holidaysHandler = handler;
      },
    };
    registerCalendarTools(mockServer as never);
    const result = await holidaysHandler!({ year: 2026 }) as { content: Array<{ type: string; text: string }> };
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.year).toBe(2026);
    expect(Array.isArray(parsed.holidays)).toBe(true);
    expect(parsed.holidays).toHaveLength(13);
  });

  it('calendar_add_working_days: days:0 returns direction "none"', async () => {
    let addWorkingDaysHandler: ((input: unknown) => Promise<unknown>) | undefined;
    const mockServer = {
      registerTool: (name: string, _meta: unknown, handler: (input: unknown) => Promise<unknown>) => {
        if (name === 'calendar_add_working_days') addWorkingDaysHandler = handler;
      },
    };
    registerCalendarTools(mockServer as never);
    const result = await addWorkingDaysHandler!({ date: '2026-01-01', days: 0 }) as { content: Array<{ type: string; text: string }> };
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.direction).toBe('none');
  });

  it('calendar_holidays with out-of-range year returns isError:true code INVALID_YEAR', async () => {
    let holidaysHandler: ((input: unknown) => Promise<unknown>) | undefined;
    const mockServer = {
      registerTool: (name: string, _meta: unknown, handler: (input: unknown) => Promise<unknown>) => {
        if (name === 'calendar_holidays') holidaysHandler = handler;
      },
    };
    registerCalendarTools(mockServer as never);
    const result = await holidaysHandler!({ year: 1990 }) as { isError?: boolean; content: Array<{ text: string }> };
    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('INVALID_YEAR');
  });
});
