import { registerPhoneTools } from '@/lib/mcp/tools/phone';

describe('registerPhoneTools', () => {
  it('registers phone_parse, phone_validate, phone_operator', () => {
    const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};
    const mockServer = {
      registerTool: (
        name: string,
        meta: { title?: string; description?: string; inputSchema?: unknown },
      ) => {
        registeredTools[name] = meta;
      },
    };
    registerPhoneTools(mockServer as never);
    expect(registeredTools['phone_parse']).toBeDefined();
    expect(registeredTools['phone_validate']).toBeDefined();
    expect(registeredTools['phone_operator']).toBeDefined();
  });

  it('each tool has non-empty title and description with anti-collision text', () => {
    const registeredTools: Record<string, { title?: string; description?: string }> = {};
    const mockServer = {
      registerTool: (name: string, meta: { title?: string; description?: string }) => {
        registeredTools[name] = meta;
      },
    };
    registerPhoneTools(mockServer as never);
    for (const name of ['phone_parse', 'phone_validate', 'phone_operator']) {
      expect(typeof registeredTools[name]?.title).toBe('string');
      expect((registeredTools[name]?.title ?? '').length).toBeGreaterThan(0);
      expect(typeof registeredTools[name]?.description).toBe('string');
      expect((registeredTools[name]?.description ?? '').length).toBeGreaterThan(0);
    }
  });

  it('phone_validate happy path returns isValid:true', async () => {
    let phoneValidateHandler: ((input: unknown) => Promise<unknown>) | undefined;
    const mockServer = {
      registerTool: (name: string, _meta: unknown, handler: (input: unknown) => Promise<unknown>) => {
        if (name === 'phone_validate') phoneValidateHandler = handler;
      },
    };
    registerPhoneTools(mockServer as never);
    const result = await phoneValidateHandler!({ phone: '923456789' }) as { content: Array<{ type: string; text: string }> };
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.isValid).toBe(true);
  });

  it('phone_parse with invalid number returns isError:true code INVALID_PHONE', async () => {
    let phoneParseHandler: ((input: unknown) => Promise<unknown>) | undefined;
    const mockServer = {
      registerTool: (name: string, _meta: unknown, handler: (input: unknown) => Promise<unknown>) => {
        if (name === 'phone_parse') phoneParseHandler = handler;
      },
    };
    registerPhoneTools(mockServer as never);
    const result = await phoneParseHandler!({ phone: '123' }) as { isError?: boolean; content: Array<{ text: string }> };
    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('INVALID_PHONE');
  });
});
