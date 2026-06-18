import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import {
  listAngolaProvinces,
  listAngolaMunicipalities,
  listAngolaCommunes,
} from '@/lib/angola/geo';

export function registerGeoTools(server: McpServer): void {
  server.registerTool(
    'geo_provinces',
    {
      title: 'List Angola Provinces',
      description:
        'List all 21 Angolan provinces with their name, URL slug, capital city, and municipality count. ' +
        'Returns the complete national list with no filtering. ' +
        'Use this to enumerate provinces. ' +
        'To list municipalities within a province, use `geo_municipalities` with the `province` filter. ' +
        'To list communes within a municipality, use `geo_communes`.',
      inputSchema: z.object({}),
    },
    mcpToolHandler(async () => ({
      country: 'AO',
      countryName: 'Angola',
      provinces: listAngolaProvinces(),
    })),
  );

  server.registerTool(
    'geo_municipalities',
    {
      title: 'List Angola Municipalities',
      description:
        'List Angolan municipalities, optionally filtered to a single province. ' +
        'Returns name, slug, province name, and commune count per municipality. ' +
        'Use this to list municipalities. ' +
        'To list all provinces, use `geo_provinces`. ' +
        'To list communes within a specific municipality, use `geo_communes`.',
      inputSchema: z.object({
        province: z.string().optional()
          .describe('Optional province name to filter results (e.g., "Luanda", "Benguela"). Omit to list all municipalities nationwide. Case-insensitive, accent-insensitive.'),
      }),
    },
    mcpToolHandler(async ({ province }) => listAngolaMunicipalities(province)),
  );

  server.registerTool(
    'geo_communes',
    {
      title: 'List Angola Communes',
      description:
        'List communes (comunas) within an Angolan municipality. ' +
        'Returns the municipality name, province, coverage type (curated or seat-only), and an array of communes with names and slugs. ' +
        'The `municipality` parameter is required. ' +
        'Supply `province` to disambiguate when the municipality name appears in more than one province. ' +
        'Use this for commune-level data. ' +
        'For municipalities, use `geo_municipalities`. ' +
        'For provinces, use `geo_provinces`.',
      inputSchema: z.object({
        municipality: z.string().min(1)
          .describe('Municipality name (required). Case-insensitive, accent-insensitive. Example: "Ingombota", "Viana".'),
        province: z.string().optional()
          .describe('Optional province name to disambiguate when the same municipality name exists in multiple provinces. Example: "Luanda". Required when the municipality name is ambiguous.'),
      }),
    },
    mcpToolHandler(async ({ municipality, province }) =>
      listAngolaCommunes(municipality, province)),
  );
}
