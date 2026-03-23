import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { checkBusinessHours } from '@/lib/angola/time';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);

  try {
    return noStoreJson(
      checkBusinessHours({
        datetime: url.searchParams.get('datetime') ?? '',
        timezone: url.searchParams.get('timezone') ?? 'Africa/Luanda',
        startTime: url.searchParams.get('start') ?? '08:00',
        endTime: url.searchParams.get('end') ?? '17:00',
      }),
    );
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while checking business hours.');
  }
}
