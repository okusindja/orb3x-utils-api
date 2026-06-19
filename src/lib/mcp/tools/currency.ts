import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import { CurrencyError, fetchCurrencyRates, convertCurrencyRates } from '@/lib/currency';

// Module-level cache — per-instance, resets on cold start. D-05.
type CurrencyCache = {
  data: Awaited<ReturnType<typeof fetchCurrencyRates>>;
  expiresAt: number;
};

const CURRENCY_CACHE_TTL_MS = 60_000;
const currencyRatesCache = new Map<string, CurrencyCache>();

/** Clear the module-level cache. Exported for test isolation. */
export function __clearCurrencyCache(): void {
  currencyRatesCache.clear();
}

/**
 * Fetch currency rates with a 60s module-level cache keyed by normalized base currency.
 * Cache key is computed BEFORE sanitizeCurrencyCode to avoid key divergence (Pitfall 3).
 */
async function fetchCurrencyRatesCached(
  baseCurrency: string,
): Promise<Awaited<ReturnType<typeof fetchCurrencyRates>>> {
  const normalizedBase = baseCurrency.trim().toLowerCase();
  const cached = currencyRatesCache.get(normalizedBase);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const data = await fetchCurrencyRates(baseCurrency);
  currencyRatesCache.set(normalizedBase, { data, expiresAt: Date.now() + CURRENCY_CACHE_TTL_MS });
  return data;
}

/**
 * Enrich a CurrencyError with retryable + retryAfterSeconds and re-throw.
 * The duck-typed branch in mcpToolHandler serializes enumerable properties.
 */
function enrichAndRethrow(error: unknown): never {
  if (error instanceof CurrencyError) {
    const retryable =
      error.code === 'UPSTREAM_TIMEOUT' || error.code === 'UPSTREAM_UNAVAILABLE';
    const enriched = new CurrencyError(
      retryable
        ? `${error.message} The service may be warming up — retry in a few seconds.`
        : error.message,
      error.statusCode,
      error.code,
    );
    Object.assign(enriched, { retryable, retryAfterSeconds: retryable ? 5 : undefined });
    throw enriched;
  }
  throw error;
}

export function registerCurrencyTools(server: McpServer): void {
  server.registerTool(
    'currency_rates',
    {
      title: 'Currency Exchange Rates',
      description:
        'Fetch live exchange rates for a given base currency from the Orb3x exchange API. ' +
        'Returns unit rates for all supported currencies along with metadata (currency name, symbol, country, flag). ' +
        'Results are cached for ~60 seconds per instance to survive Render cold-starts. ' +
        'Use this when you only need rates — not a converted amount. ' +
        'To also apply an amount and get converted values for every currency, use `currency_convert`.',
      inputSchema: z.object({
        base: z.string().min(2).max(20)
          .describe('ISO 4217 currency code (e.g., "AOA", "USD", "EUR"). Case-insensitive. 2–20 characters.'),
      }),
    },
    mcpToolHandler(async (input) => {
      try {
        return await fetchCurrencyRatesCached(input.base);
      } catch (error) {
        enrichAndRethrow(error);
      }
    }),
  );

  server.registerTool(
    'currency_convert',
    {
      title: 'Currency Conversion',
      description:
        'Convert a monetary amount from a base currency to all supported currencies. ' +
        'Fetches live rates internally (with a ~60s cache) and applies the amount to each unit rate. ' +
        'Returns the full conversion result including metadata and `convertedRates` for every currency. ' +
        'If you only need the raw rates without applying an amount, use `currency_rates`.',
      inputSchema: z.object({
        base: z.string().min(2).max(20)
          .describe('Base currency code to fetch rates for (e.g., "AOA"). Case-insensitive.'),
        amount: z.number().nonnegative()
          .describe('Amount in the base currency to convert. Must be zero or positive.'),
      }),
    },
    mcpToolHandler(async (input) => {
      try {
        const lookup = await fetchCurrencyRatesCached(input.base);
        return convertCurrencyRates(lookup, String(input.amount));
      } catch (error) {
        enrichAndRethrow(error);
      }
    }),
  );
}
