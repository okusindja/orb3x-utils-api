import { mcpToolHandler } from '@/lib/mcp/tool-error';
import { RouteError } from '@/lib/route-error';

describe('mcpToolHandler', () => {
  it('returns content array with JSON-stringified result on success', async () => {
    const handler = mcpToolHandler(async () => ({ status: 'ok', value: 42 }));
    const result = await handler({});

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(JSON.parse(result.content[0].text)).toEqual({ status: 'ok', value: 42 });
    expect(result.isError).toBeUndefined();
  });

  it('returns isError:true with code and message when RouteError is thrown', async () => {
    const handler = mcpToolHandler(async () => {
      throw new RouteError('NOT_FOUND', 'Resource not found', 404);
    });
    const result = await handler({});

    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('NOT_FOUND');
    expect(parsed.message).toBe('Resource not found');
  });

  it('returns INTERNAL_SERVER_ERROR for non-RouteError Error throws', async () => {
    const handler = mcpToolHandler(async () => {
      throw new Error('Something unexpected happened');
    });
    const result = await handler({});

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('INTERNAL_SERVER_ERROR');
    expect(parsed.message).toBe('Something unexpected happened');
  });

  it('returns INTERNAL_SERVER_ERROR for non-Error throws', async () => {
    const handler = mcpToolHandler(async () => {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw 'just a string error';
    });
    const result = await handler({});

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('INTERNAL_SERVER_ERROR');
    expect(typeof parsed.message).toBe('string');
  });
});
