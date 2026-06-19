import { registerFinanceTools } from '@/lib/mcp/tools/finance';

describe('registerFinanceTools', () => {
  it('registers finance_vat, finance_invoice_total, finance_inflation_adjust', () => {
    const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};

    const mockServer = {
      registerTool: (
        name: string,
        meta: { title?: string; description?: string; inputSchema?: unknown },
      ) => {
        registeredTools[name] = meta;
      },
    };

    registerFinanceTools(mockServer as never);

    expect(registeredTools['finance_vat']).toBeDefined();
    expect(registeredTools['finance_invoice_total']).toBeDefined();
    expect(registeredTools['finance_inflation_adjust']).toBeDefined();
  });

  it('each registered tool has a non-empty title and description with anti-collision text', () => {
    const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};

    const mockServer = {
      registerTool: (
        name: string,
        meta: { title?: string; description?: string; inputSchema?: unknown },
      ) => {
        registeredTools[name] = meta;
      },
    };

    registerFinanceTools(mockServer as never);

    for (const name of ['finance_vat', 'finance_invoice_total', 'finance_inflation_adjust']) {
      const tool = registeredTools[name];
      expect(typeof tool.title).toBe('string');
      expect((tool.title ?? '').length).toBeGreaterThan(0);
      expect(typeof tool.description).toBe('string');
      expect((tool.description ?? '').length).toBeGreaterThan(0);
      // Anti-collision: description must name at least one sibling tool
      expect(tool.description).toMatch(/finance_vat|finance_invoice_total|finance_inflation_adjust/);
    }
  });

  it('finance_vat happy path: { amount: 114, rate: 14, inclusive: true } returns netAmount and vatAmount', async () => {
    const registeredTools: Record<
      string,
      {
        meta: unknown;
        handler: (input: unknown) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>;
      }
    > = {};

    const mockServer = {
      registerTool: (
        name: string,
        meta: unknown,
        handler: (input: unknown) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>,
      ) => {
        registeredTools[name] = { meta, handler };
      },
    };

    registerFinanceTools(mockServer as never);

    const result = await registeredTools['finance_vat'].handler({ amount: 114, rate: 14, inclusive: true });

    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.netAmount).toBeDefined();
    expect(parsed.vatAmount).toBeDefined();
  });

  it('finance_vat bad rate: { amount: 114, rate: 150 } returns isError:true with INVALID_RATE', async () => {
    const registeredTools: Record<
      string,
      {
        meta: unknown;
        handler: (input: unknown) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>;
      }
    > = {};

    const mockServer = {
      registerTool: (
        name: string,
        meta: unknown,
        handler: (input: unknown) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>,
      ) => {
        registeredTools[name] = { meta, handler };
      },
    };

    registerFinanceTools(mockServer as never);

    const result = await registeredTools['finance_vat'].handler({ amount: 114, rate: 150 });

    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('INVALID_RATE');
  });

  it('finance_invoice_total empty lines: { lines: [] } returns isError:true with INVALID_INVOICE_LINES', async () => {
    const registeredTools: Record<
      string,
      {
        meta: unknown;
        handler: (input: unknown) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>;
      }
    > = {};

    const mockServer = {
      registerTool: (
        name: string,
        meta: unknown,
        handler: (input: unknown) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>,
      ) => {
        registeredTools[name] = { meta, handler };
      },
    };

    registerFinanceTools(mockServer as never);

    const result = await registeredTools['finance_invoice_total'].handler({ lines: [] });

    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('INVALID_INVOICE_LINES');
  });

  it('finance_inflation_adjust unsupported year: { amount: 1000, from: "2010", to: "2025" } returns isError:true with UNSUPPORTED_CPI_YEAR', async () => {
    const registeredTools: Record<
      string,
      {
        meta: unknown;
        handler: (input: unknown) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>;
      }
    > = {};

    const mockServer = {
      registerTool: (
        name: string,
        meta: unknown,
        handler: (input: unknown) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>,
      ) => {
        registeredTools[name] = { meta, handler };
      },
    };

    registerFinanceTools(mockServer as never);

    const result = await registeredTools['finance_inflation_adjust'].handler({ amount: 1000, from: '2010', to: '2025' });

    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('UNSUPPORTED_CPI_YEAR');
  });
});
