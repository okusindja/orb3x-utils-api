import { fetchCurrencyRates, convertCurrencyRates } from '../currency';

// Mock fetch
global.fetch = jest.fn();

describe('currency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch currency rates', async () => {
    const mockResponse = {
      currencyCode: 'USD',
      currencyName: 'US Dollar',
      currencySymbol: '$',
      countryName: 'United States',
      countryCode: 'US',
      flagImage: '🇺🇸',
      rates: {
        date: '2024-03-22',
        usd: { eur: 0.85, gbp: 0.73 }
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchCurrencyRates('usd');

    expect(result.currencyCode).toBe('USD');
    expect(result.unitRates).toBeDefined();
    expect(typeof result.unitRates.eur).toBe('number');
  });

  it('should convert currency rates', async () => {
    const mockResponse = {
      currencyCode: 'USD',
      currencyName: 'US Dollar',
      currencySymbol: '$',
      countryName: 'United States',
      countryCode: 'US',
      flagImage: '🇺🇸',
      rates: {
        date: '2024-03-22',
        usd: { eur: 0.85, gbp: 0.73 }
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const lookup = await fetchCurrencyRates('usd');
    const conversion = convertCurrencyRates(lookup, '100');

    expect(conversion.amount).toBe(100);
    expect(conversion.convertedRates).toBeDefined();
    expect(typeof conversion.convertedRates.eur).toBe('number');
  });

  it('should handle invalid currency codes', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(fetchCurrencyRates('INVALID')).rejects.toThrow();
  });
});