import {
  noStoreBinary,
  parseJsonBody,
  routeErrorResponse,
} from '@/lib/http';
import { generateInvoicePdf, type InvoicePayload } from '@/lib/angola/documents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<InvoicePayload>(request);
    const pdf = await generateInvoicePdf(body);

    return noStoreBinary(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
      },
      filename: 'invoice.pdf',
    });
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while generating the invoice PDF.');
  }
}
