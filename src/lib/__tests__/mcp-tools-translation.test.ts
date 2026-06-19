import { registerTranslationTools } from '@/lib/mcp/tools/translation';
import { TranslationError } from '@/lib/translate';

// Mock translate module to avoid real network calls.
// We test the MCP tool wrapper behaviour; translate.ts unit tests cover the HTTP client.
jest.mock('@/lib/translate', () => {
  class MockTranslationError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number,
      public readonly code: string,
    ) {
      super(message);
      this.name = 'TranslationError';
    }
  }

  return {
    TranslationError: MockTranslationError,
    translateText: jest.fn(),
  };
});

// Re-import after mock so we get the mocked version
import { translateText } from '@/lib/translate';

const mockTranslate = translateText as jest.Mock;

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

describe('registerTranslationTools', () => {
  beforeEach(() => {
    mockTranslate.mockReset();
  });

  it('registers translate_text', () => {
    const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};
    const mockServer = {
      registerTool: (
        name: string,
        meta: { title?: string; description?: string; inputSchema?: unknown },
      ) => {
        registeredTools[name] = meta;
      },
    };

    registerTranslationTools(mockServer as never);

    expect(registeredTools['translate_text']).toBeDefined();
  });

  it('translate_text has non-empty title and description with anti-collision text', () => {
    const registeredTools: Record<string, { title?: string; description?: string; inputSchema?: unknown }> = {};
    const mockServer = {
      registerTool: (
        name: string,
        meta: { title?: string; description?: string; inputSchema?: unknown },
      ) => {
        registeredTools[name] = meta;
      },
    };

    registerTranslationTools(mockServer as never);

    const tool = registeredTools['translate_text'];
    expect(typeof tool.title).toBe('string');
    expect((tool.title ?? '').length).toBeGreaterThan(0);
    expect(typeof tool.description).toBe('string');
    expect((tool.description ?? '').length).toBeGreaterThan(0);
    // Anti-collision: description must name at least one sibling tool by backtick-name
    expect(tool.description).toMatch(/`nif_lookup`|`currency_rates`|`currency_convert`/);
  });

  it('translate_text happy path: mocked success returns translatedText, sourceLanguage, targetLanguage; isError undefined', async () => {
    const { mockServer, registeredTools } = buildMockServer();
    registerTranslationTools(mockServer);

    mockTranslate.mockResolvedValueOnce({
      translatedText: 'Hello World',
      sourceLanguage: 'pt',
      targetLanguage: 'en',
    });

    const result = await registeredTools['translate_text'].handler({ text: 'Olá Mundo', to: 'en' });

    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.translatedText).toBe('Hello World');
    expect(parsed.sourceLanguage).toBe('pt');
    expect(parsed.targetLanguage).toBe('en');
  });

  it('translate_text UPSTREAM_TIMEOUT: upstream timeout → isError:true, code UPSTREAM_TIMEOUT, retryable:true, retryAfterSeconds:5', async () => {
    const { mockServer, registeredTools } = buildMockServer();
    registerTranslationTools(mockServer);

    mockTranslate.mockRejectedValueOnce(
      new TranslationError('The translation service did not respond in time.', 504, 'UPSTREAM_TIMEOUT'),
    );

    const result = await registeredTools['translate_text'].handler({ text: 'Olá', to: 'en' });

    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('UPSTREAM_TIMEOUT');
    expect(parsed.retryable).toBe(true);
    expect(parsed.retryAfterSeconds).toBe(5);
    expect(parsed.message).toContain('retry');
  });

  it('translate_text INVALID_TEXT: validation error → isError:true, code INVALID_TEXT, NOT retryable', async () => {
    const { mockServer, registeredTools } = buildMockServer();
    registerTranslationTools(mockServer);

    mockTranslate.mockRejectedValueOnce(
      new TranslationError('The text field is required.', 400, 'INVALID_TEXT'),
    );

    const result = await registeredTools['translate_text'].handler({ text: ' ', to: 'en' });

    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('INVALID_TEXT');
    // Validation errors must NOT be retryable (D-04: only upstream failures are retryable)
    expect(parsed.retryable).toBeFalsy();
    expect(parsed.retryAfterSeconds).toBeUndefined();
  });
});
