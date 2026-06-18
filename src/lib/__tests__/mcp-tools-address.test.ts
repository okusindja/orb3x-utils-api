import { registerAddressTools } from '@/lib/mcp/tools/address';

describe('registerAddressTools', () => {
  it('registers address_normalize and address_suggest', () => {
    const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};
    const mockServer = {
      registerTool: (
        name: string,
        meta: { title?: string; description?: string; inputSchema?: unknown },
      ) => {
        registeredTools[name] = meta;
      },
    };
    registerAddressTools(mockServer as never);
    expect(registeredTools['address_normalize']).toBeDefined();
    expect(registeredTools['address_suggest']).toBeDefined();
  });

  it('each tool has non-empty title and description', () => {
    const registeredTools: Record<string, { title?: string; description?: string }> = {};
    const mockServer = {
      registerTool: (name: string, meta: { title?: string; description?: string }) => {
        registeredTools[name] = meta;
      },
    };
    registerAddressTools(mockServer as never);
    for (const name of ['address_normalize', 'address_suggest']) {
      expect(typeof registeredTools[name]?.title).toBe('string');
      expect((registeredTools[name]?.title ?? '').length).toBeGreaterThan(0);
      expect(typeof registeredTools[name]?.description).toBe('string');
      expect((registeredTools[name]?.description ?? '').length).toBeGreaterThan(0);
    }
  });

  it('address_normalize happy path returns result with components field', async () => {
    let normalizeHandler: ((input: unknown) => Promise<unknown>) | undefined;
    const mockServer = {
      registerTool: (name: string, _meta: unknown, handler: (input: unknown) => Promise<unknown>) => {
        if (name === 'address_normalize') normalizeHandler = handler;
      },
    };
    registerAddressTools(mockServer as never);
    const result = await normalizeHandler!({ address: 'av. lenine, ingombota, luanda' }) as { content: Array<{ type: string; text: string }> };
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.components).toBeDefined();
  });

  it('address_suggest happy path returns an array of suggestions', async () => {
    let suggestHandler: ((input: unknown) => Promise<unknown>) | undefined;
    const mockServer = {
      registerTool: (name: string, _meta: unknown, handler: (input: unknown) => Promise<unknown>) => {
        if (name === 'address_suggest') suggestHandler = handler;
      },
    };
    registerAddressTools(mockServer as never);
    const result = await suggestHandler!({ query: 'lua' }) as { content: Array<{ type: string; text: string }> };
    const parsed = JSON.parse(result.content[0].text);
    expect(Array.isArray(parsed)).toBe(true);
  });
});
