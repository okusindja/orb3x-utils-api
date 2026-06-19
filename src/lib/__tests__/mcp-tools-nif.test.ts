import { registerNifTools } from '@/lib/mcp/tools/nif';
import { PortalLookupError } from '@/lib/agt-nif';

// Mock agt-nif to avoid loading cheerio (ESM) in Jest's jsdom environment.
// We test the MCP tool wrapper behaviour; agt-nif unit tests cover the parser.
jest.mock('@/lib/agt-nif', () => {
  class MockPortalLookupError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
      public readonly code: string,
    ) {
      super(message);
      this.name = 'PortalLookupError';
    }
  }

  return {
    PortalLookupError: MockPortalLookupError,
    lookupTaxpayerByNif: jest.fn(),
  };
});

// Re-import after mock so we get the mocked version
import { lookupTaxpayerByNif } from '@/lib/agt-nif';

const mockLookup = lookupTaxpayerByNif as jest.Mock;

type McpResult = { content: Array<{ type: string; text: string }>; isError?: boolean };
type MockTools = Record<string, { meta: unknown; handler: (input: unknown) => Promise<McpResult> }>;

function buildMockServer(): { mockServer: never; registeredTools: MockTools } {
  const registeredTools: MockTools = {};
  const mockServer = {
    registerTool: (
      name: string,
      meta: unknown,
      handler: (input: unknown) => Promise<McpResult>,
    ) => {
      registeredTools[name] = { meta, handler };
    },
  };
  return { mockServer: mockServer as never, registeredTools };
}

describe('registerNifTools', () => {
  beforeEach(() => {
    mockLookup.mockReset();
  });

  it('registers nif_lookup', () => {
    const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};
    const mockServer = {
      registerTool: (
        name: string,
        meta: { title?: string; description?: string; inputSchema?: unknown },
      ) => {
        registeredTools[name] = meta;
      },
    };

    registerNifTools(mockServer as never);

    expect(registeredTools['nif_lookup']).toBeDefined();
  });

  it('nif_lookup has non-empty title and description with anti-collision text', () => {
    const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};
    const mockServer = {
      registerTool: (
        name: string,
        meta: { title?: string; description?: string; inputSchema?: unknown },
      ) => {
        registeredTools[name] = meta;
      },
    };

    registerNifTools(mockServer as never);

    const tool = registeredTools['nif_lookup'];
    expect(typeof tool.title).toBe('string');
    expect((tool.title ?? '').length).toBeGreaterThan(0);
    expect(typeof tool.description).toBe('string');
    expect((tool.description ?? '').length).toBeGreaterThan(0);
    // Anti-collision: description must name at least one sibling tool
    expect(tool.description).toMatch(/`currency_rates`|`translate_text`|`currency_convert`/);
  });

  it('nif_lookup happy path: valid NIF returns taxpayer data with no isError', async () => {
    const { mockServer, registeredTools } = buildMockServer();
    registerNifTools(mockServer);

    mockLookup.mockResolvedValueOnce({
      nif: '5000000001',
      name: 'EMPRESA TESTE LDA',
      type: 'Pessoa Colectiva',
      status: 'Activo',
      defaulting: 'Não',
      vatRegime: 'Regime Geral',
      isTaxResident: true,
    });

    const result = await registeredTools['nif_lookup'].handler({ nif: '5000000001' });

    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.nif).toBe('5000000001');
    expect(parsed.name).toBeDefined();
    expect(parsed.type).toBeDefined();
    expect(parsed.status).toBeDefined();
  });

  it('nif_lookup UPSTREAM_TIMEOUT: portal timeout → isError:true, code UPSTREAM_TIMEOUT, retryable:true, retryAfterSeconds:10', async () => {
    const { mockServer, registeredTools } = buildMockServer();
    registerNifTools(mockServer);

    // PortalLookupError thrown by lookupTaxpayerByNif when AGT portal times out
    mockLookup.mockRejectedValueOnce(
      new PortalLookupError('The tax portal did not respond in time.', 504, 'UPSTREAM_TIMEOUT'),
    );

    const result = await registeredTools['nif_lookup'].handler({ nif: '5000000001' });

    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('UPSTREAM_TIMEOUT');
    expect(parsed.retryable).toBe(true);
    expect(parsed.retryAfterSeconds).toBe(10);
    expect(parsed.message).toContain('retry');
  });

  it('nif_lookup INVALID_NIF: empty string → isError:true, code INVALID_NIF, not retryable', async () => {
    const { mockServer, registeredTools } = buildMockServer();
    registerNifTools(mockServer);

    // lookupTaxpayerByNif → sanitizeNif throws INVALID_NIF for empty input
    mockLookup.mockRejectedValueOnce(
      new PortalLookupError('The NIF path parameter is required.', 400, 'INVALID_NIF'),
    );

    const result = await registeredTools['nif_lookup'].handler({ nif: '' });

    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('INVALID_NIF');
    // INVALID_NIF is not in retryableMap so retryable should be falsy
    expect(parsed.retryable).toBeFalsy();
  });
});
