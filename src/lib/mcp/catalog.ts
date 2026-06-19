import type { DocsPageSlug } from '@/lib/site-content';

export type McpToolCatalogEntry = {
  name: string;
  docsSlug: DocsPageSlug | null;
};

/**
 * Canonical, ordered catalog of the 25 MCP tools exposed by the public server.
 *
 * This is the single source of truth for the catalog's tool-name set. Both the
 * `/docs/mcp` page (table rows) and the registry-coverage test
 * (`src/lib/__tests__/mcp-catalog.test.ts`) read from this list so the docs can
 * never silently drift from `registerAllTools` (D-01).
 *
 * `docsSlug` links each tool to its existing `/docs/[slug]` HTTP page (D-02).
 * The `health` tool has no dedicated HTTP doc page; it links to `'api-reference'`
 * (the platform-level target) per the phase discretion (D-discretion resolved).
 */
export const MCP_TOOL_CATALOG = [
  { name: 'health', docsSlug: 'api-reference' },
  { name: 'salary_net', docsSlug: 'salary' },
  { name: 'salary_gross', docsSlug: 'salary' },
  { name: 'salary_employer_cost', docsSlug: 'salary' },
  { name: 'phone_parse', docsSlug: 'phone' },
  { name: 'phone_validate', docsSlug: 'phone' },
  { name: 'phone_operator', docsSlug: 'phone' },
  { name: 'geo_provinces', docsSlug: 'address-geo' },
  { name: 'geo_municipalities', docsSlug: 'address-geo' },
  { name: 'geo_communes', docsSlug: 'address-geo' },
  { name: 'address_normalize', docsSlug: 'address-geo' },
  { name: 'address_suggest', docsSlug: 'address-geo' },
  { name: 'calendar_holidays', docsSlug: 'calendar' },
  { name: 'calendar_working_days', docsSlug: 'calendar' },
  { name: 'calendar_add_working_days', docsSlug: 'calendar' },
  { name: 'finance_vat', docsSlug: 'finance' },
  { name: 'finance_invoice_total', docsSlug: 'finance' },
  { name: 'finance_inflation_adjust', docsSlug: 'finance' },
  { name: 'currency_rates', docsSlug: 'currency-exchange' },
  { name: 'currency_convert', docsSlug: 'currency-exchange' },
  { name: 'nif_lookup', docsSlug: 'nif-verification' },
  { name: 'translate_text', docsSlug: 'translation' },
  { name: 'generate_invoice_pdf', docsSlug: 'documents' },
  { name: 'generate_receipt_pdf', docsSlug: 'documents' },
  { name: 'generate_contract_pdf', docsSlug: 'documents' },
] as const satisfies readonly McpToolCatalogEntry[];

export const MCP_TOOL_NAMES = MCP_TOOL_CATALOG.map((t) => t.name);
