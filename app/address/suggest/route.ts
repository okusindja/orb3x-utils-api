import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { suggestAngolanAddressParts } from '@/lib/angola/address';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);
  const limitValue = url.searchParams.get('limit');
  const limit = limitValue ? Number.parseInt(limitValue, 10) : undefined;

  try {
    return noStoreJson({
      query: url.searchParams.get('q') ?? '',
      suggestions: suggestAngolanAddressParts({
        query: url.searchParams.get('q') ?? '',
        type: url.searchParams.get('type'),
        province: url.searchParams.get('province'),
        municipality: url.searchParams.get('municipality'),
        limit: Number.isInteger(limit) ? limit : undefined,
      }),
    });
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while generating address suggestions.');
  }
}
