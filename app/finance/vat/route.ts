import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { calculateVat, parseAmountParam } from '@/lib/angola/finance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);
  const inclusive = url.searchParams.get('inclusive') !== 'false';

  try {
    return noStoreJson(
      calculateVat({
        amount: parseAmountParam(url.searchParams.get('amount')),
        rate: url.searchParams.get('rate')
          ? Number(url.searchParams.get('rate'))
          : 14,
        inclusive,
      }),
    );
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while calculating VAT.');
  }
}
