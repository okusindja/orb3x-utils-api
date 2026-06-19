import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import { TranslationError, translateText } from '@/lib/translate';

export function registerTranslationTools(server: McpServer): void {
  server.registerTool(
    'translate_text',
    {
      title: 'Text Translator',
      description:
        'Translate text into a target language using the Google Translate API. ' +
        'Returns the translated text, detected source language, and confirmed target language. ' +
        'Upstream failures return a retryable structured error with retry guidance. ' +
        'This is the sole translation tool in the server. ' +
        'For Angola NIF taxpayer lookup use `nif_lookup`. ' +
        'For currency exchange rates use `currency_rates` or `currency_convert`.',
      inputSchema: z.object({
        text: z.string().min(1).max(5000)
          .describe('Text to translate. Must not be empty. Maximum 5000 characters.'),
        to: z.string().min(2).max(12)
          .describe('Target language code (BCP 47, e.g. "en", "pt", "fr").'),
        from: z.string().min(2).max(12).optional()
          .describe('Source language code (BCP 47). Optional — auto-detected if omitted.'),
      }),
    },
    mcpToolHandler(async (input) => {
      try {
        return await translateText(input as Parameters<typeof translateText>[0]);
      } catch (error) {
        if (error instanceof TranslationError) {
          const retryable =
            error.code === 'UPSTREAM_TIMEOUT' ||
            error.code === 'UPSTREAM_UNAVAILABLE' ||
            error.code === 'UPSTREAM_BAD_RESPONSE';
          const enrichedMessage = retryable
            ? `${error.message} retry in a few seconds.`
            : error.message;
          const enriched = new TranslationError(enrichedMessage, error.statusCode, error.code);
          Object.assign(enriched, { retryable, retryAfterSeconds: retryable ? 5 : undefined });
          throw enriched;
        }
        throw error;
      }
    }),
  );
}
