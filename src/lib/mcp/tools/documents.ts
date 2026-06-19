import { Buffer } from 'node:buffer';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpToolHandler } from '../tool-error';
import { RouteError } from '@/lib/route-error';
import {
  generateInvoicePdf,
  generateReceiptPdf,
  generateContractPdf,
  type InvoicePayload,
  type ReceiptPayload,
  type ContractPayload,
} from '@/lib/angola/documents';

// Base64 inflates raw bytes by ~1.34x (measured 1.3334). Reject before encoding so
// an oversized PDF returns a structured PDF_TOO_LARGE error rather than a raw Vercel 413.
const BASE64_INFLATION = 1.34;
const MAX_BASE64_BYTES = 4_000_000;

// Upper bounds at the input boundary (T-04-03 mitigation): cap array lengths and
// free-text fields so an unauthenticated caller cannot drive unbounded O(n) work
// (finance calc, wrapText, pdf-lib) BEFORE the output size guard runs. The output
// guard alone is insufficient because the PDF draw loop stops at page bottom, so a
// huge input can produce a small PDF that never trips PDF_TOO_LARGE.
const MAX_INVOICE_ITEMS = 200;
const MAX_CONTRACT_PARTIES = 50;
const MAX_CONTRACT_CLAUSES = 200;
const MAX_SHORT_TEXT = 200;
const MAX_LINE_TEXT = 1_000;
const MAX_LONG_TEXT = 5_000;

type PdfToolResultMeta = { docType: string; filename: string; uri: string };

const partySchema = z.object({
  name: z.string().min(1).max(MAX_SHORT_TEXT).describe('Full legal name of the party.'),
  nif: z.string().max(MAX_SHORT_TEXT).optional().describe('Angola taxpayer NIF (optional).'),
  address: z.string().max(MAX_LONG_TEXT).optional().describe('Postal/registered address (optional).'),
});

// Builds the 2-block success result (embedded resource + text fallback).
// THROWS RouteError('PDF_TOO_LARGE') on the size-guard breach (DOC-04), BEFORE base64 encoding.
function pdfToolResult(bytes: Uint8Array, meta: PdfToolResultMeta) {
  const estimatedBase64 = Math.ceil(bytes.length * BASE64_INFLATION);
  if (estimatedBase64 > MAX_BASE64_BYTES) {
    throw new RouteError(
      'PDF_TOO_LARGE',
      `The generated ${meta.docType} PDF is ~${estimatedBase64} bytes once base64-encoded, ` +
        `exceeding the ~${MAX_BASE64_BYTES}-byte response limit. ` +
        'Reduce the number of line items / content and try again.',
      413,
      { retryable: false },
    );
  }

  const blob = Buffer.from(bytes).toString('base64');
  return {
    content: [
      {
        type: 'resource' as const,
        resource: { uri: meta.uri, mimeType: 'application/pdf', blob },
      },
      {
        type: 'text' as const,
        text:
          `${meta.docType} PDF generated (${meta.filename}, ${bytes.length} bytes). ` +
          'The document is base64-encoded in the resource block above (mimeType application/pdf).',
      },
    ],
  };
}

// Runs the generator + result builder. Success returns the 2-block result directly
// (it must NOT pass through mcpToolHandler, which JSON-stringifies into a single text block).
// Any throw is re-routed through the shared mcpToolHandler formatter so RouteError +
// duck-typed + INTERNAL_SERVER_ERROR mapping is identical to every other tool — zero edit to tool-error.ts.
async function runPdfTool<T extends { content: unknown[] }>(produce: () => Promise<T>) {
  try {
    return await produce();
  } catch (error) {
    return mcpToolHandler(() => {
      throw error;
    })(undefined as never);
  }
}

export function registerDocumentTools(server: McpServer): void {
  server.registerTool(
    'generate_invoice_pdf',
    {
      title: 'Generate Angola Invoice PDF',
      description:
        'Generate an Angola invoice PDF from seller, buyer, and line-item data, ' +
        'returning the document as a base64 embedded resource (application/pdf) plus a text metadata fallback. ' +
        'Use this to produce a billing invoice with VAT-aware totals. ' +
        'For a payment acknowledgement use `generate_receipt_pdf`. ' +
        'For a written agreement use `generate_contract_pdf`.',
      inputSchema: z.object({
        invoiceNumber: z.string().max(MAX_SHORT_TEXT).optional().describe('Invoice reference number.'),
        issueDate: z.string().max(MAX_SHORT_TEXT).optional().describe('Issue date (ISO yyyy-mm-dd). Defaults to today.'),
        dueDate: z.string().max(MAX_SHORT_TEXT).optional().describe('Payment due date (ISO yyyy-mm-dd).'),
        seller: partySchema.describe('The issuing party (required).'),
        buyer: partySchema.describe('The billed party (required).'),
        items: z
          .array(
            z.object({
              description: z.string().max(MAX_LINE_TEXT).optional().describe('Line item description.'),
              quantity: z.number().optional().describe('Quantity of units.'),
              unitPrice: z.number().optional().describe('Unit price in AOA (Kz).'),
              vatRate: z.number().optional().describe('VAT rate percent for the line.'),
            }),
          )
          .min(1)
          .max(MAX_INVOICE_ITEMS)
          .describe('Invoice line items (1 to 200).'),
        notes: z.string().max(MAX_LONG_TEXT).optional().describe('Additional free-text notes.'),
      }),
    },
    async (input) =>
      runPdfTool(async () =>
        pdfToolResult(await generateInvoicePdf(input as InvoicePayload), {
          docType: 'Invoice',
          filename: 'invoice.pdf',
          uri: 'mcp://orb3x/documents/invoice.pdf',
        }),
      ),
  );

  server.registerTool(
    'generate_receipt_pdf',
    {
      title: 'Generate Angola Receipt PDF',
      description:
        'Generate an Angola payment-receipt PDF acknowledging an amount received from a payer, ' +
        'returning the document as a base64 embedded resource (application/pdf) plus a text metadata fallback. ' +
        'Use this to confirm a payment was received. ' +
        'For a billing invoice use `generate_invoice_pdf`. ' +
        'For a written agreement use `generate_contract_pdf`.',
      inputSchema: z.object({
        receiptNumber: z.string().max(MAX_SHORT_TEXT).optional().describe('Receipt reference number.'),
        issueDate: z.string().max(MAX_SHORT_TEXT).optional().describe('Issue date (ISO yyyy-mm-dd). Defaults to today.'),
        receivedFrom: partySchema.describe('The payer the amount was received from (required).'),
        amount: z.number().describe('Amount received in AOA (Kz) (required).'),
        reason: z.string().max(MAX_LINE_TEXT).optional().describe('Reason for the payment.'),
        paymentMethod: z.string().max(MAX_SHORT_TEXT).optional().describe('Payment method (e.g. cash, transfer).'),
        notes: z.string().max(MAX_LONG_TEXT).optional().describe('Additional free-text notes.'),
      }),
    },
    async (input) =>
      runPdfTool(async () =>
        pdfToolResult(await generateReceiptPdf(input as ReceiptPayload), {
          docType: 'Receipt',
          filename: 'receipt.pdf',
          uri: 'mcp://orb3x/documents/receipt.pdf',
        }),
      ),
  );

  server.registerTool(
    'generate_contract_pdf',
    {
      title: 'Generate Angola Contract PDF',
      description:
        'Generate an Angola contract PDF from at least two parties and one or more clauses, ' +
        'returning the document as a base64 embedded resource (application/pdf) plus a text metadata fallback. ' +
        'Use this to produce a written agreement between parties. ' +
        'For a billing invoice use `generate_invoice_pdf`. ' +
        'For a payment acknowledgement use `generate_receipt_pdf`.',
      inputSchema: z.object({
        title: z.string().max(MAX_SHORT_TEXT).optional().describe('Contract title. Defaults to "Contract".'),
        contractNumber: z.string().max(MAX_SHORT_TEXT).optional().describe('Contract reference number.'),
        issueDate: z.string().max(MAX_SHORT_TEXT).optional().describe('Issue date (ISO yyyy-mm-dd). Defaults to today.'),
        parties: z.array(partySchema).min(2).max(MAX_CONTRACT_PARTIES).describe('Contracting parties (2 to 50).'),
        clauses: z
          .array(z.string().max(MAX_LONG_TEXT))
          .min(1)
          .max(MAX_CONTRACT_CLAUSES)
          .describe('Contract clauses (1 to 200).'),
        notes: z.string().max(MAX_LONG_TEXT).optional().describe('Additional free-text notes.'),
      }),
    },
    async (input) =>
      runPdfTool(async () =>
        pdfToolResult(await generateContractPdf(input as ContractPayload), {
          docType: 'Contract',
          filename: 'contract.pdf',
          uri: 'mcp://orb3x/documents/contract.pdf',
        }),
      ),
  );
}
