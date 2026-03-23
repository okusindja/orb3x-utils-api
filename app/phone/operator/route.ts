import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { detectAngolanOperator } from '@/lib/angola/phone';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);

  try {
    return noStoreJson({
      phone: url.searchParams.get('phone') ?? '',
      operator: detectAngolanOperator(url.searchParams.get('phone') ?? ''),
    });
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while detecting the phone operator.');
  }
}
