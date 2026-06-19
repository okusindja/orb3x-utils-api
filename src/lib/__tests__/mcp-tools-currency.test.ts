import { registerCurrencyTools, __clearCurrencyCache } from '@/lib/mcp/tools/currency';

// Valid API response fixture the mock fetch will return
const AOA_API_RESPONSE = {
  currencyCode: 'AOA',
  currencyName: 'Angolan Kwanza',
  currencySymbol: 'Kz',
  countryName: 'Angola',
  countryCode: 'AO',
  flagImage: '🇦🇴',
  rates: {
    date: '2024-03-22',
    aoa: { usd: 0.0011, eur: 0.001, gbp: 0.00087 },
  },
};

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

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

describe('registerCurrencyTools', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    __clearCurrencyCache();
  });

  it('registers currency_rates and currency_convert', () => {
    const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};
    const mockServer = {
      registerTool: (
        name: string,
        meta: { title?: string; description?: string; inputSchema?: unknown },
      ) => {
        registeredTools[name] = meta;
      },
    };

    registerCurrencyTools(mockServer as never);

    expect(registeredTools['currency_rates']).toBeDefined();
    expect(registeredTools['currency_convert']).toBeDefined();
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

    registerCurrencyTools(mockServer as never);

    for (const name of ['currency_rates', 'currency_convert']) {
      const tool = registeredTools[name];
      expect(typeof tool.title).toBe('string');
      expect((tool.title ?? '').length).toBeGreaterThan(0);
      expect(typeof tool.description).toBe('string');
      expect((tool.description ?? '').length).toBeGreaterThan(0);
      // Anti-collision: description must name at least one sibling tool
      expect(tool.description).toMatch(/`currency_rates`|`currency_convert`/);
    }
  });

  it('currency_rates happy path returns rates data with no isError', async () => {
    const { mockServer, registeredTools } = buildMockServer();
    registerCurrencyTools(mockServer as never);

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(AOA_API_RESPONSE), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await registeredTools['currency_rates'].handler({ base: 'AOA' });

    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.baseCurrency).toBeDefined();
    expect(parsed.unitRates).toBeDefined();
    expect(typeof parsed.unitRates).toBe('object');
  });

  it('currency_rates UPSTREAM_TIMEOUT returns isError:true with retryable:true and retryAfterSeconds:5', async () => {
    const { mockServer, registeredTools } = buildMockServer();
    registerCurrencyTools(mockServer as never);

    // DOMException('Timeout', 'TimeoutError') sets .name = 'TimeoutError' via the constructor;
    // currency.ts checks error.name === 'TimeoutError' to detect AbortSignal timeout.
    mockFetch.mockRejectedValueOnce(new DOMException('Timeout', 'TimeoutError'));

    const result = await registeredTools['currency_rates'].handler({ base: 'AOA' });

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('UPSTREAM_TIMEOUT');
    expect(parsed.retryable).toBe(true);
    expect(parsed.retryAfterSeconds).toBe(5);
  });

  it('currency_rates cache hit: second call within TTL does not invoke fetch again', async () => {
    const { mockServer, registeredTools } = buildMockServer();
    registerCurrencyTools(mockServer as never);

    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(AOA_API_RESPONSE), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await registeredTools['currency_rates'].handler({ base: 'AOA' });
    await registeredTools['currency_rates'].handler({ base: 'AOA' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('currency_convert happy path returns conversion result without client-supplied lookup', async () => {
    const { mockServer, registeredTools } = buildMockServer();
    registerCurrencyTools(mockServer as never);

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(AOA_API_RESPONSE), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await registeredTools['currency_convert'].handler({ base: 'AOA', amount: 1000 });

    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.amount).toBe(1000);
    expect(parsed.convertedRates).toBeDefined();
    expect(typeof parsed.convertedRates).toBe('object');
  });
});
