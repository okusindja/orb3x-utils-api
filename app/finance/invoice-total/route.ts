import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { calculateInvoiceTotals, parseInvoiceLines } from '@/lib/angola/finance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);

  try {
    return noStoreJson(
      calculateInvoiceTotals({
        lines: parseInvoiceLines(url.searchParams.get('lines')),
        discount: url.searchParams.get('discount')
          ? Number(url.searchParams.get('discount'))
          : 0,
        discountType: url.searchParams.get('discountType') === 'percent' ? 'percent' : 'amount',
      }),
    );
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while computing invoice totals.');
  }
}
