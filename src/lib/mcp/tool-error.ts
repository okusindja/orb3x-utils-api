import { RouteError } from '@/lib/route-error';

type McpResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: true;
};

export function mcpToolHandler<TInput>(
  fn: (input: TInput) => unknown | Promise<unknown>,
): (input: TInput) => Promise<McpResult> {
  return async (input) => {
    try {
      const result = await fn(input);
      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
      };
    } catch (error) {
      if (error instanceof RouteError) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                code: error.code,
                message: error.message,
                ...(error.details ?? {}),
              }),
            },
          ],
        };
      }
      // Duck-typed branch: catches CurrencyError, PortalLookupError, TranslationError.
      // All three share code:string + statusCode:number but are NOT RouteError subclasses.
      // RouteError has .status (not .statusCode) so this check is disjoint from the branch above.
      if (
        error instanceof Error &&
        typeof (error as { code?: unknown }).code === 'string' &&
        typeof (error as { statusCode?: unknown }).statusCode === 'number'
      ) {
        const domainError = error as Error & { code: string; statusCode: number };
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                code: domainError.code,
                message: domainError.message,
                statusCode: domainError.statusCode,
                // Spreads additional enumerable properties (retryable, retryAfterSeconds)
                // set via Object.assign in tool callbacks. Still domain-agnostic (D-04).
                ...(Object.fromEntries(
                  Object.entries(domainError as unknown as Record<string, unknown>).filter(
                    ([k]) => !['name', 'stack', 'message', 'code', 'statusCode'].includes(k),
                  ),
                )),
              }),
            },
          ],
        };
      }
      const msg = error instanceof Error ? error.message : 'Unexpected error';
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify({ code: 'INTERNAL_SERVER_ERROR', message: msg }),
          },
        ],
      };
    }
  };
}
