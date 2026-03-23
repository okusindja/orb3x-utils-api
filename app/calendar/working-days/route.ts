import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { calculateWorkingDays } from '@/lib/angola/calendar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);

  try {
    return noStoreJson(
      calculateWorkingDays({
        from: url.searchParams.get('from') ?? '',
        to: url.searchParams.get('to') ?? '',
      }),
    );
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while calculating working days.');
  }
}
