import { registerSalaryTools } from '@/lib/mcp/tools/salary';

describe('registerSalaryTools', () => {
  it('registers salary_net, salary_gross, salary_employer_cost', () => {
    const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};

    const mockServer = {
      registerTool: (
        name: string,
        meta: { title?: string; description?: string; inputSchema?: unknown },
      ) => {
        registeredTools[name] = meta;
      },
    };

    registerSalaryTools(mockServer as never);

    expect(registeredTools['salary_net']).toBeDefined();
    expect(registeredTools['salary_gross']).toBeDefined();
    expect(registeredTools['salary_employer_cost']).toBeDefined();
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

    registerSalaryTools(mockServer as never);

    for (const name of ['salary_net', 'salary_gross', 'salary_employer_cost']) {
      const tool = registeredTools[name];
      expect(typeof tool.title).toBe('string');
      expect((tool.title ?? '').length).toBeGreaterThan(0);
      expect(typeof tool.description).toBe('string');
      expect((tool.description ?? '').length).toBeGreaterThan(0);
      // D-03: description must name at least one sibling tool
      expect(tool.description).toMatch(/salary_net|salary_gross|salary_employer_cost/);
    }
  });

  it('salary_net happy path: { grossSalary: 500000, year: 2026 } returns netSalary and irtBracket', async () => {
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

    registerSalaryTools(mockServer as never);

    const result = await registeredTools['salary_net'].handler({ grossSalary: 500000, year: 2026 });

    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.netSalary).toBeDefined();
    expect(parsed.irtBracket).toBeDefined();
  });

  it('salary_net error path: { grossSalary: 500000, year: 2020 } returns isError:true with UNSUPPORTED_TAX_YEAR', async () => {
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

    registerSalaryTools(mockServer as never);

    const result = await registeredTools['salary_net'].handler({ grossSalary: 500000, year: 2020 });

    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('UNSUPPORTED_TAX_YEAR');
  });
});
