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
