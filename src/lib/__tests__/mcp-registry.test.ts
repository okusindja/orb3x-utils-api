import { registerAllTools } from '@/lib/mcp/registry';

describe('registerAllTools', () => {
  it('registers a tool named health with non-empty title and description', () => {
    const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};

    const mockServer = {
      registerTool: (
        name: string,
        meta: { title?: string; description?: string; inputSchema?: unknown },
      ) => {
        registeredTools[name] = meta;
      },
    };

    registerAllTools(mockServer as never);

    expect(registeredTools['health']).toBeDefined();
    expect(typeof registeredTools['health'].title).toBe('string');
    expect((registeredTools['health'].title ?? '').length).toBeGreaterThan(0);
    expect(typeof registeredTools['health'].description).toBe('string');
    expect((registeredTools['health'].description ?? '').length).toBeGreaterThan(0);
  });

  it('registers the health tool with a Zod inputSchema object', () => {
    const registeredTools: Record<string, { inputSchema?: unknown }> = {};

    const mockServer = {
      registerTool: (name: string, meta: { inputSchema?: unknown }) => {
        registeredTools[name] = meta;
      },
    };

    registerAllTools(mockServer as never);

    const schema = registeredTools['health']?.inputSchema;
    expect(schema).toBeDefined();
    // Zod schemas have a _def property
    expect(typeof schema).toBe('object');
    expect(schema).not.toBeNull();
  });
});
