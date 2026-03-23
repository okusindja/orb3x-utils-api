import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { addWorkingDays } from '@/lib/angola/calendar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);
  const days = Number.parseInt(url.searchParams.get('days') ?? '', 10);

  try {
    return noStoreJson(
      addWorkingDays({
        date: url.searchParams.get('date') ?? '',
        days,
      }),
    );
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while adding working days.');
  }
}
