import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { calculateNetSalary } from '@/lib/angola/salary';
import { parsePositiveNumber } from '@/lib/angola/shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);

  try {
    return noStoreJson(
      calculateNetSalary({
        grossSalary: parsePositiveNumber(url.searchParams.get('gross'), 'gross'),
        year: url.searchParams.get('year')
          ? Number.parseInt(url.searchParams.get('year') ?? '', 10)
          : 2026,
      }),
    );
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while calculating net salary.');
  }
}
