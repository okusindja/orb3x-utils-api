import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

import { RouteError } from '@/lib/route-error';
import { calculateInvoiceTotals } from '@/lib/angola/finance';

type Party = {
  name: string;
  nif?: string;
  address?: string;
};

export type InvoicePayload = {
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  seller?: Party;
  buyer?: Party;
  items?: Array<{
    description?: string;
    quantity?: number;
    unitPrice?: number;
    vatRate?: number;
  }>;
  notes?: string;
};

export type ReceiptPayload = {
  receiptNumber?: string;
  issueDate?: string;
  receivedFrom?: Party;
  amount?: number;
  reason?: string;
  paymentMethod?: string;
  notes?: string;
};

export type ContractPayload = {
  title?: string;
  contractNumber?: string;
  issueDate?: string;
  parties?: Party[];
  clauses?: string[];
  notes?: string;
};

export async function generateInvoicePdf(payload: InvoicePayload) {
  const items = payload.items ?? [];

  if (!payload.seller?.name || !payload.buyer?.name || !items.length) {
    throw new RouteError('INVALID_INVOICE_PAYLOAD', 'Invoice payload must include seller, buyer, and at least one item.', 400);
  }

  const totals = calculateInvoiceTotals({
    lines: items,
  });

  return buildPdfDocument({
    title: 'Invoice',
    subtitle: payload.invoiceNumber ? `Invoice ${payload.invoiceNumber}` : 'Invoice document',
    sections: [
      ['Issue date', payload.issueDate ?? new Date().toISOString().slice(0, 10)],
      ['Due date', payload.dueDate ?? payload.issueDate ?? new Date().toISOString().slice(0, 10)],
      ['Seller', formatParty(payload.seller)],
      ['Buyer', formatParty(payload.buyer)],
      ['Lines', totals.lines.map((line) => `${line.description}: ${line.quantity} x ${line.unitPrice.toFixed(2)} Kz (+${line.vatRate}% VAT)`).join('\n')],
      ['Totals', `Subtotal: ${totals.subtotal.toFixed(2)} Kz\nVAT: ${totals.vatTotal.toFixed(2)} Kz\nGrand total: ${totals.grandTotal.toFixed(2)} Kz`],
      ['Notes', payload.notes?.trim() || 'No additional notes.'],
    ],
  });
}

export async function generateReceiptPdf(payload: ReceiptPayload) {
  if (!payload.receivedFrom?.name || typeof payload.amount !== 'number') {
    throw new RouteError('INVALID_RECEIPT_PAYLOAD', 'Receipt payload must include receivedFrom and amount.', 400);
  }

  return buildPdfDocument({
    title: 'Receipt',
    subtitle: payload.receiptNumber ? `Receipt ${payload.receiptNumber}` : 'Receipt document',
    sections: [
      ['Issue date', payload.issueDate ?? new Date().toISOString().slice(0, 10)],
      ['Received from', formatParty(payload.receivedFrom)],
      ['Amount', `${payload.amount.toFixed(2)} Kz`],
      ['Reason', payload.reason?.trim() || 'Payment acknowledgement'],
      ['Payment method', payload.paymentMethod?.trim() || 'Unspecified'],
      ['Notes', payload.notes?.trim() || 'No additional notes.'],
    ],
  });
}

export async function generateContractPdf(payload: ContractPayload) {
  const parties = payload.parties ?? [];

  if (parties.length < 2 || !payload.clauses?.length) {
    throw new RouteError('INVALID_CONTRACT_PAYLOAD', 'Contract payload must include at least two parties and one clause.', 400);
  }

  return buildPdfDocument({
    title: payload.title?.trim() || 'Contract',
    subtitle: payload.contractNumber ? `Contract ${payload.contractNumber}` : 'Contract document',
    sections: [
      ['Issue date', payload.issueDate ?? new Date().toISOString().slice(0, 10)],
      ['Parties', parties.map((party, index) => `${index + 1}. ${formatParty(party)}`).join('\n')],
      ['Clauses', payload.clauses.map((clause, index) => `${index + 1}. ${clause}`).join('\n')],
      ['Notes', payload.notes?.trim() || 'No additional notes.'],
    ],
  });
}

async function buildPdfDocument({
  title,
  subtitle,
  sections,
}: {
  title: string;
  subtitle: string;
  sections: Array<[label: string, body: string]>;
}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
  const primary = rgb(0.09, 0.27, 0.69);
  const text = rgb(0.12, 0.16, 0.26);
  const muted = rgb(0.4, 0.46, 0.59);

  page.drawText(title, {
    x: 48,
    y: 790,
    size: 22,
    font: titleFont,
    color: primary,
  });
  page.drawText(subtitle, {
    x: 48,
    y: 765,
    size: 10,
    font: bodyFont,
    color: muted,
  });

  let y = 730;

  for (const [label, body] of sections) {
    page.drawText(label.toUpperCase(), {
      x: 48,
      y,
      size: 9,
      font: titleFont,
      color: primary,
    });
    y -= 16;

    for (const line of wrapText(body, 78)) {
      page.drawText(line, {
        x: 48,
        y,
        size: 11,
        font: bodyFont,
        color: text,
      });
      y -= 15;
    }

    y -= 14;

    if (y < 80) {
      break;
    }
  }

  return pdf.save();
}

function wrapText(value: string, maxLength: number) {
  const lines: string[] = [];

  for (const paragraph of value.split('\n')) {
    let current = '';

    for (const word of paragraph.split(' ')) {
      const candidate = current ? `${current} ${word}` : word;

      if (candidate.length > maxLength && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }

    if (current) {
      lines.push(current);
    }
  }

  return lines.length ? lines : [''];
}

function formatParty(party: Party) {
  return [party.name, party.nif ? `NIF: ${party.nif}` : null, party.address ?? null]
    .filter(Boolean)
    .join(' | ');
}
