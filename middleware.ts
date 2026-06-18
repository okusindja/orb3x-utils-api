import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Fixed-window rate limiter: 60 requests per minute per IP (MCP-05, D-01).
// State is a module-level in-memory Map — per-instance, no Redis (D-04).
// Counts reset on serverless cold start: accepted free-tier constraint, not a defect.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

type WindowEntry = { count: number; resetAt: number };
const store = new Map<string, WindowEntry>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  // Fallback: unknown IPs share one bucket (over-throttles rather than under-throttles)
  return 'unknown';
}

export function middleware(request: NextRequest) {
  const ip = getClientIp(request);
  const now = Date.now();

  let entry = store.get(ip);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(ip, entry);
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    const retryAfterSecs = Math.ceil((entry.resetAt - now) / 1000);
    return new NextResponse(
      JSON.stringify({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please wait before retrying.',
        },
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Retry-After': String(retryAfterSecs),
        },
      },
    );
  }

  return NextResponse.next();
}

// Scoped to MCP transports only — HTTP and SSE (D-02, Pitfall 5).
// Note for plan 05: confirm the live SSE path equals /api/sse via MCP Inspector
// and adjust this matcher if the deployed path differs.
export const config = { matcher: ['/api/mcp', '/api/sse'] };
