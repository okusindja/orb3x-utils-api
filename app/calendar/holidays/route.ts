import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { listAngolanHolidays, parseCalendarYear } from '@/lib/angola/calendar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);

  try {
    const year = parseCalendarYear(
      url.searchParams.get('year'),
      new Date().getUTCFullYear(),
    );

    return noStoreJson({
      year,
      holidays: listAngolanHolidays(year),
      assumptions: [
        'Weekend bridge days declared ad hoc by the government are not inferred.',
        'Carnival Monday, Carnival Tuesday, and Good Friday are included as movable public holidays.',
      ],
    });
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while listing holidays.');
  }
}
