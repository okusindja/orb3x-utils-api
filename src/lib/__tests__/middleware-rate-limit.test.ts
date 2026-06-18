import { middleware } from '@/../middleware';

function makeRequest(ip: string, url = 'http://localhost/api/mcp') {
  return {
    headers: {
      get: (name: string) => (name === 'x-forwarded-for' ? ip : null),
    },
    nextUrl: { pathname: '/api/mcp' },
    url,
  } as never;
}

describe('middleware rate limiter', () => {
  beforeEach(() => {
    // Jest module isolation: re-import with a fresh module to reset in-memory store
    jest.resetModules();
  });

  it('allows requests below the 60 req/min limit through', async () => {
    const { middleware: mw } = await import('@/../middleware');

    for (let i = 0; i < 60; i++) {
      const req = makeRequest('1.2.3.4');
      const response = mw(req);
      expect(response?.status).not.toBe(429);
    }
  });

  it('returns 429 on the 61st request from the same IP', async () => {
    const { middleware: mw } = await import('@/../middleware');

    for (let i = 0; i < 60; i++) {
      mw(makeRequest('5.6.7.8'));
    }

    const response = mw(makeRequest('5.6.7.8'));
    expect(response?.status).toBe(429);
  });

  it('includes a Retry-After header on the 429 response', async () => {
    const { middleware: mw } = await import('@/../middleware');

    for (let i = 0; i < 60; i++) {
      mw(makeRequest('9.10.11.12'));
    }

    const response = mw(makeRequest('9.10.11.12'));
    const retryAfter = response?.headers?.get?.('Retry-After') ?? response?.headers?.['Retry-After'];
    expect(retryAfter).toBeDefined();
    expect(Number(retryAfter)).toBeGreaterThan(0);
  });

  it('returns 429 body matching { error: { code: RATE_LIMIT_EXCEEDED, message } }', async () => {
    const { middleware: mw } = await import('@/../middleware');

    for (let i = 0; i < 60; i++) {
      mw(makeRequest('13.14.15.16'));
    }

    const response = mw(makeRequest('13.14.15.16'));
    const body = await response?.json?.();
    expect(body?.error?.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(typeof body?.error?.message).toBe('string');
  });

  it('does not throttle a different IP after the first IP is throttled', async () => {
    const { middleware: mw } = await import('@/../middleware');

    for (let i = 0; i < 61; i++) {
      mw(makeRequest('100.0.0.1'));
    }

    const response = mw(makeRequest('200.0.0.1'));
    expect(response?.status).not.toBe(429);
  });
});
