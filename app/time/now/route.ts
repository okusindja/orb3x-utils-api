import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { getCurrentTimeInZone } from '@/lib/angola/time';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);
  const timezone = url.searchParams.get('timezone') ?? 'Africa/Luanda';

  try {
    return noStoreJson(getCurrentTimeInZone(timezone));
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while getting the current time.');
  }
}
