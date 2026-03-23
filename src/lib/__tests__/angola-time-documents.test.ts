import {
  checkBusinessHours,
  convertTimeBetweenZones,
} from '@/lib/angola/time';
import {
  generateContractPdf,
  generateInvoicePdf,
  generateReceiptPdf,
} from '@/lib/angola/documents';

describe('angola time and document utilities', () => {
  it('converts time between Luanda and UTC', () => {
    const result = convertTimeBetweenZones({
      datetime: '2026-03-23T10:00:00',
      fromTimezone: 'Africa/Luanda',
      toTimezone: 'UTC',
    });

    expect(result.source.timezone).toBe('Africa/Luanda');
    expect(result.target.timezone).toBe('UTC');
  });

  it('checks business hours in Luanda', () => {
    const result = checkBusinessHours({
      datetime: '2026-03-23T09:30:00',
      timezone: 'Africa/Luanda',
    });

    expect(result.isBusinessDay).toBe(true);
    expect(result.isWithinBusinessHours).toBe(true);
  });

  it('generates invoice, receipt, and contract PDFs', async () => {
    const [invoice, receipt, contract] = await Promise.all([
      generateInvoicePdf({
        seller: { name: 'Orb3x, Lda', nif: '5000000000' },
        buyer: { name: 'Cliente Exemplo', nif: '6000000000' },
        items: [{ description: 'Consultoria', quantity: 1, unitPrice: 100_000, vatRate: 14 }],
      }),
      generateReceiptPdf({
        receivedFrom: { name: 'Cliente Exemplo' },
        amount: 100_000,
      }),
      generateContractPdf({
        parties: [{ name: 'Orb3x, Lda' }, { name: 'Cliente Exemplo' }],
        clauses: ['The provider delivers the service.', 'The client settles the invoice within 15 days.'],
      }),
    ]);

    expect(Buffer.from(invoice).subarray(0, 4).toString()).toBe('%PDF');
    expect(Buffer.from(receipt).subarray(0, 4).toString()).toBe('%PDF');
    expect(Buffer.from(contract).subarray(0, 4).toString()).toBe('%PDF');
  });
});
