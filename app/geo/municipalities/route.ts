import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { listAngolaMunicipalities } from '@/lib/angola/geo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);

  try {
    return noStoreJson({
      province: url.searchParams.get('province'),
      municipalities: listAngolaMunicipalities(url.searchParams.get('province') ?? undefined),
    });
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while listing municipalities.');
  }
}
