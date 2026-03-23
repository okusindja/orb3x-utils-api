import {
  noStoreBinary,
  parseJsonBody,
  routeErrorResponse,
} from '@/lib/http';
import { generateContractPdf, type ContractPayload } from '@/lib/angola/documents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody<ContractPayload>(request);
    const pdf = await generateContractPdf(body);

    return noStoreBinary(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
      },
      filename: 'contract.pdf',
    });
  } catch (error) {
    return routeErrorResponse(error, 'Unexpected error while generating the contract document.');
  }
}
