import { routeErrorResponse, noStoreJson } from '@/lib/http';
import { validateAngolanBankAccount } from '@/lib/angola/banks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export function GET(request: Request) {
  const url = new URL(request.url);

  try {
    return noStoreJson(
      validateAngolanBankAccount(url.searchParams.get('account') ?? ''),
    );
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while validating the bank account.');
  }
}
