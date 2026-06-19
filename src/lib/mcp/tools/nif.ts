import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import { PortalLookupError, lookupTaxpayerByNif } from '@/lib/agt-nif';

export function registerNifTools(server: McpServer): void {
  server.registerTool(
    'nif_lookup',
    {
      title: 'Angola NIF Lookup',
      description:
        'Look up an Angola taxpayer by NIF (Número de Identificação Fiscal) using the AGT contributor portal. ' +
        'Returns verified taxpayer data: NIF, name, entity type, tax status, VAT regime, and tax-residency flag. ' +
        'The AGT portal is frequently slow (up to 25s) — on timeout the tool returns a retryable structured error with retry guidance. ' +
        'This is the sole NIF tool in the server. ' +
        'For currency conversion use `currency_rates` or `currency_convert`. ' +
        'For text translation use `translate_text`.',
      inputSchema: z.object({
        nif: z.string().min(1)
          .describe(
            'Angola taxpayer NIF (Número de Identificação Fiscal). Letters and digits only. ' +
            'Case-insensitive — normalized to uppercase internally.',
          ),
      }),
    },
    mcpToolHandler(async (input) => {
      try {
        return await lookupTaxpayerByNif((input as { nif: string }).nif);
      } catch (error) {
        if (error instanceof PortalLookupError) {
          const retryableMap: Record<string, number | undefined> = {
            UPSTREAM_TIMEOUT: 10,
            UPSTREAM_UNAVAILABLE: 15,
            UPSTREAM_BAD_RESPONSE: 10,
          };
          const retryAfterSeconds = retryableMap[error.code];
          const retryable = retryAfterSeconds !== undefined;
          const enrichedMessage = retryable
            ? error.code === 'UPSTREAM_TIMEOUT'
              ? 'The AGT portal did not respond within 25s; it is frequently slow — retry in 10 seconds.'
              : `${error.message} Retry in ${retryAfterSeconds} seconds.`
            : error.message;
          const enriched = new PortalLookupError(enrichedMessage, error.statusCode, error.code);
          Object.assign(enriched, { retryable, retryAfterSeconds });
          throw enriched;
        }
        throw error;
      }
    }),
  );
}
