import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { normalizeAngolanAddress } from '@/lib/angola/address';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);

  try {
    return noStoreJson(
      normalizeAngolanAddress(url.searchParams.get('address') ?? ''),
    );
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while normalizing the address.');
  }
}
