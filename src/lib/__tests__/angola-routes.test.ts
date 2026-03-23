import { GET as getIban } from '@/../app/api/v1/validate/iban/route';
import { GET as getVat } from '@/../app/api/v1/finance/vat/route';
import { POST as postInvoice } from '@/../app/api/v1/documents/invoice/route';
import { buildAngolanIbanFromBban } from '@/lib/angola/banks';

describe('angola route handlers', () => {
  it('returns JSON for the IBAN validator route', async () => {
    const iban = buildAngolanIbanFromBban('004000010123456789012');
    const response = getIban(new Request(`http://localhost/api/v1/validate/iban?iban=${iban}`));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.validation.mod97Valid).toBe(true);
  });

  it('returns VAT totals', async () => {
    const response = getVat(
      new Request('http://localhost/api/v1/finance/vat?amount=114&rate=14&inclusive=true'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.netAmount).toBe(100);
  });

  it('returns a PDF from the invoice document route', async () => {
    const response = await postInvoice(
      new Request('http://localhost/api/v1/documents/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seller: { name: 'Orb3x, Lda' },
          buyer: { name: 'Cliente Exemplo' },
          items: [{ description: 'Servico', quantity: 1, unitPrice: 2500, vatRate: 14 }],
        }),
      }),
    );
    const bytes = Buffer.from(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(bytes.subarray(0, 4).toString()).toBe('%PDF');
  });
});
