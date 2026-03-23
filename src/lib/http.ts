import { NextResponse } from 'next/server';
import { RouteError } from '@/lib/route-error';

type JsonBody = Record<string, unknown> | Array<unknown>;

export function noStoreJson(body: JsonBody, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', 'no-store');

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

export function noStoreBinary(
  body: BodyInit | Uint8Array,
  init?: ResponseInit & {
    filename?: string;
  },
) {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', 'no-store');

  if (init?.filename) {
    headers.set('Content-Disposition', `attachment; filename="${init.filename}"`);
  }

  return new Response(body as BodyInit, {
    // Response accepts Uint8Array at runtime even though the ambient type can be narrower.
    ...init,
    headers,
  });
}

export function routeErrorResponse(
  error: unknown,
  fallbackMessage: string,
  fallbackDetails?: Record<string, unknown>,
) {
  if (error instanceof RouteError) {
    return noStoreJson(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ?? {}),
        },
      },
      { status: error.status },
    );
  }

  return noStoreJson(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: fallbackMessage,
        ...(fallbackDetails ?? {}),
      },
    },
    { status: 500 },
  );
}

export function parseJsonBody<T>(request: Request) {
  return request.json() as Promise<T>;
}
