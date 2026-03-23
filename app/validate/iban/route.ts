import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { validateAngolanIban } from '@/lib/angola/banks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);

  try {
    return noStoreJson(validateAngolanIban(url.searchParams.get('iban') ?? ''));
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while validating the IBAN.');
  }
}
