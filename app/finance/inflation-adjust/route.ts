import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { adjustForInflation, parseAmountParam } from '@/lib/angola/finance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);

  try {
    return noStoreJson(
      adjustForInflation({
        amount: parseAmountParam(url.searchParams.get('amount')),
        from: url.searchParams.get('from') ?? '',
        to: url.searchParams.get('to') ?? '',
      }),
    );
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while adjusting for inflation.');
  }
}
