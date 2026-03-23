import {
  noStoreBinary,
  parseJsonBody,
  routeErrorResponse,
} from '@/lib/http';
import { generateReceiptPdf, type ReceiptPayload } from '@/lib/angola/documents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<ReceiptPayload>(request);
    const pdf = await generateReceiptPdf(body);

    return noStoreBinary(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
      },
      filename: 'receipt.pdf',
    });
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while generating the receipt PDF.');
  }
}
