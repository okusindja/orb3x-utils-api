import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { convertTimeBetweenZones } from '@/lib/angola/time';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);

  try {
    return noStoreJson(
      convertTimeBetweenZones({
        datetime: url.searchParams.get('datetime') ?? '',
        fromTimezone: url.searchParams.get('from') ?? '',
        toTimezone: url.searchParams.get('to') ?? '',
      }),
    );
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while converting timezones.');
  }
}
