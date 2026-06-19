// Mock agt-nif to avoid loading cheerio (ESM) in Jest's jsdom environment.
// The registry test verifies tool registration only; agt-nif runtime behaviour is covered elsewhere.
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

  it('registers all 22 core utility tools', () => {
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

    const expectedTools = [
      'salary_net',
      'salary_gross',
      'salary_employer_cost',
      'phone_parse',
      'phone_validate',
      'phone_operator',
      'geo_provinces',
      'geo_municipalities',
      'geo_communes',
      'address_normalize',
      'address_suggest',
      'calendar_holidays',
      'calendar_working_days',
      'calendar_add_working_days',
      'finance_vat',
      'finance_invoice_total',
      'finance_inflation_adjust',
      'currency_rates',
      'currency_convert',
      'nif_lookup',
      'translate_text',
    ];

    for (const name of expectedTools) {
      expect(registeredTools[name]).toBeDefined();
      expect(typeof registeredTools[name].description).toBe('string');
      expect((registeredTools[name].description ?? '').length).toBeGreaterThan(0);
    }

    expect(Object.keys(registeredTools).length).toBeGreaterThanOrEqual(22);
  });
});
