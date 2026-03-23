import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { listAngolaProvinces } from '@/lib/angola/geo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET() {
  try {
    return noStoreJson({
      country: 'AO',
      countryName: 'Angola',
      provinces: listAngolaProvinces(),
    });
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while listing provinces.');
  }
}
