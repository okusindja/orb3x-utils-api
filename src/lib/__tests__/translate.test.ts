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

  it('should fall back to another endpoint when the first is rate limited', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([[["Hola", "Hello", null, null, 0]], null, 'en']),
      });

    const result = await translateText({ text: 'Hello', to: 'es' });

    expect(result.translatedText).toBe('Hola');
  });

  it('should fall back to MyMemory when Google keeps returning 429', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: URL) =>
      String(url).includes('mymemory')
        ? Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ responseData: { translatedText: 'Hola' } }),
          })
        : Promise.resolve({ ok: false, status: 429 }),
    );

    const result = await translateText({ text: 'Hello', to: 'es', from: 'en' });

    expect(result.translatedText).toBe('Hola');
    expect(result.sourceLanguage).toBe('en');
    (global.fetch as jest.Mock).mockReset();
  });
});
