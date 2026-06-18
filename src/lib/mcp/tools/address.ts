import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import { normalizeAngolanAddress, suggestAngolanAddressParts } from '@/lib/angola/address';

export function registerAddressTools(server: McpServer): void {
  server.registerTool(
    'address_normalize',
    {
      title: 'Normalize Angola Address',
      description:
        'Normalize an Angolan address string: expand abbreviations, apply title case, regularize punctuation, and attempt to resolve components (province, municipality, commune, bairro) from the known geo data. Returns `{ input, normalized, components, diagnostics }`. ' +
        'Resolution is best-effort: unresolved components are returned as null (not an error) and the corresponding diagnostics flag is false. ' +
        'Use this when you have a raw address and want a cleaned form with resolved components. For an autocomplete-style prefix search over geo entries and known bairros, use `address_suggest`.',
      inputSchema: z.object({
        address: z.string().min(1).describe(
          'Raw Angolan address string to normalize. Can contain abbreviations (prov., mun., av., r., b.), mixed case, irregular spacing. Example: "av. lenine, ingombota, luanda".',
        ),
      }),
    },
    mcpToolHandler(({ address }: { address: string }) => normalizeAngolanAddress(address)),
  );

  server.registerTool(
    'address_suggest',
    {
      title: 'Suggest Angola Address Parts',
      description:
        'Autocomplete-style search over Angolan geo entries (provinces, municipalities, communes) and known Luanda bairros. Returns up to `limit` matching suggestions, each with type, label, and parent context fields. Use this for address-part autocomplete or fuzzy lookup. For cleaning and structurally parsing a complete address string, use `address_normalize`.',
      inputSchema: z.object({
        query: z.string().min(1).describe(
          'Prefix or substring to search across Angola geo entries (provinces, municipalities, communes) and known Luanda bairros. Case-insensitive, accent-insensitive.',
        ),
        type: z.enum(['province', 'municipality', 'commune', 'bairro']).optional().describe(
          'Filter results to a specific entity type. Omit to search all types.',
        ),
        province: z.string().optional().describe(
          'Filter results to a specific province name. Case-insensitive, accent-insensitive.',
        ),
        municipality: z.string().optional().describe(
          'Filter results to a specific municipality name. Case-insensitive, accent-insensitive.',
        ),
        limit: z.number().int().positive().optional().default(8).describe(
          'Maximum number of suggestions to return. Defaults to 8.',
        ),
      }),
    },
    mcpToolHandler(
      ({
        query,
        type,
        province,
        municipality,
        limit,
      }: {
        query: string;
        type?: 'province' | 'municipality' | 'commune' | 'bairro';
        province?: string;
        municipality?: string;
        limit: number;
      }) =>
        suggestAngolanAddressParts({ query, type, province, municipality, limit }),
    ),
  );
}
