import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { calculateGrossSalary } from '@/lib/angola/salary';
import { parseGrossSalaryQuery } from '../shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);

  try {
    return noStoreJson(calculateGrossSalary(parseGrossSalaryQuery(url.searchParams)));
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while calculating gross salary.');
  }
}
