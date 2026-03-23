import { translateText } from '../translate';

// Mock fetch
global.fetch = jest.fn();

describe('translateText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should translate text successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        [["Hola mundo", "Hello world", null, null, 0]],
        null,
        "en"
      ]),
    });

    const result = await translateText({
      text: 'Hello world',
      to: 'es',
    });

    expect(result.translatedText).toBe('Hola mundo');
    expect(result.sourceLanguage).toBe('en');
    expect(result.targetLanguage).toBe('es');
  });

  it('should throw error for empty text', async () => {
    await expect(translateText({
      text: '',
      to: 'es',
    })).rejects.toThrow('The text field is required.');
  });

  it('should handle invalid language codes', async () => {
    await expect(translateText({
      text: 'Hello',
      to: 'invalid',
    })).rejects.toThrow();
  });
});