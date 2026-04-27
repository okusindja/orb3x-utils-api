import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { calculateNetSalary } from '@/lib/angola/salary';
import { parseNetSalaryQuery } from '../shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);

  try {
    return noStoreJson(calculateNetSalary(parseNetSalaryQuery(url.searchParams)));
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while calculating net salary.');
  }
}
