// Mock agt-nif to avoid loading cheerio (ESM) in Jest's jsdom environment.
// The registry transitively imports the nif tool, which imports agt-nif/cheerio;
// without this mock, importing the registry throws under jsdom. Keep this block
// BEFORE the registry import (mock-before-import order is mandatory).
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
import { MCP_TOOL_NAMES } from '@/lib/mcp/catalog';
import { getLocalizedDocsPage } from '@/lib/site-copy';

function captureRegisteredNames(): string[] {
  const registeredTools: Record<string, unknown> = {};
  const mockServer = {
    registerTool: (name: string, meta: unknown) => {
      registeredTools[name] = meta;
    },
  };
  registerAllTools(mockServer as never);
  return Object.keys(registeredTools);
}

describe('MCP_TOOL_CATALOG ↔ registry coverage (D-01)', () => {
  it('catalog tool-name set equals the registered tool-name set (no missing, no phantom)', () => {
    const registeredNames = captureRegisteredNames();
    expect(new Set(MCP_TOOL_NAMES)).toEqual(new Set(registeredNames));
  });

  it('catalog lists exactly 25 tools', () => {
    expect(MCP_TOOL_NAMES.length).toBe(25);
  });
});

describe('mcp docs page content (DOCS-02 / D-07)', () => {
  const page = getLocalizedDocsPage('en', 'mcp');

  it('connect section has exactly 4 code snippets, each referencing the endpoint URL or mcp-remote', () => {
    const connect = page.sections.find((s) => s.id === 'connect');
    expect(connect?.codes).toHaveLength(4);
    for (const code of connect?.codes ?? []) {
      expect(
        code.content.includes('https://utils.api.orb3x.com/api/mcp') ||
          code.content.includes('mcp-remote'),
      ).toBe(true);
    }
  });

  it('discloses the NIF 5–30 s latency on both the catalog row and the latency section', () => {
    const nifRow = page.sections
      .flatMap((s) => s.table?.rows ?? [])
      .find((row) => row[0] === 'nif_lookup');
    const nifDescription = nifRow?.[1];
    expect(typeof nifDescription).toBe('string');
    expect(nifDescription as string).toContain('5–30');

    const latency = page.sections.find((s) => s.id === 'latency');
    expect(latency?.note).toContain('5–30');
  });
});
