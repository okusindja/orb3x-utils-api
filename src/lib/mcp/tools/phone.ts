import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import {
  parseAngolanPhoneNumber,
  validateAngolanPhoneNumber,
  detectAngolanOperator,
} from '@/lib/angola/phone';

const phoneInput = z.object({
  phone: z.string().min(1)
    .describe('Angolan phone number. Accepts any common format: national (9-digit: 923456789), international (+244923456789 or 244923456789), with or without spaces/dashes.'),
});

export function registerPhoneTools(server: McpServer): void {
  server.registerTool(
    'phone_parse',
    {
      title: 'Parse Angola Phone Number',
      description:
        'Parse an Angolan phone number and return its components: normalized E.164 form, national number, ' +
        'international/national formatted strings, type (mobile/fixed-line), two-digit prefix, subscriber number, and operator info. ' +
        'Use this when you need the parsed components. ' +
        'For a simple validity check plus availability metadata, use `phone_validate`. ' +
        'For operator lookup only without full parsing, use `phone_operator`.',
      inputSchema: phoneInput,
    },
    mcpToolHandler(async ({ phone }) => parseAngolanPhoneNumber(phone)),
  );

  server.registerTool(
    'phone_validate',
    {
      title: 'Validate Angola Phone Number',
      description:
        'Validate an Angolan phone number and return the parsed components plus an `isValid` flag and `availability` block ' +
        '(numbering-plan status, whether the range is allocated to a known operator). ' +
        'Use this when you need a validity signal alongside the number components. ' +
        'For components only without the validity/availability envelope, use `phone_parse`. ' +
        'For operator identity only, use `phone_operator`.',
      inputSchema: phoneInput,
    },
    mcpToolHandler(async ({ phone }) => validateAngolanPhoneNumber(phone)),
  );

  server.registerTool(
    'phone_operator',
    {
      title: 'Detect Angola Phone Operator',
      description:
        'Detect the mobile network operator (Unitel, Movicel, Africell) from an Angolan phone number\'s two-digit prefix. ' +
        'Returns `{ code, name, prefix, prefixes }`. ' +
        'Returns `code: \'UNKNOWN\'` for unrecognized prefixes (e.g. fixed-line numbers) without throwing an error. ' +
        'Use this for operator-only lookups. ' +
        'For full number parsing with type/format fields, use `phone_parse`. ' +
        'For a validity signal, use `phone_validate`.',
      inputSchema: phoneInput,
    },
    mcpToolHandler(async ({ phone }) => detectAngolanOperator(phone)),
  );
}
