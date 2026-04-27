import { GET as getIban } from '@/../app/api/v1/validate/iban/route';
import { GET as getVat } from '@/../app/api/v1/finance/vat/route';
import { POST as postInvoice } from '@/../app/api/v1/documents/invoice/route';
import { GET as getSalaryNet } from '@/../app/api/v1/salary/net/route';
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

  it('returns salary output with normalized subsidies from the route layer', async () => {
    const response = getSalaryNet(
      new Request(
        'http://localhost/api/v1/salary/net?gross=1500000&year=2026&mealSubsidy=4747.77&transportSubsidy=3160&subsidyPeriod=day',
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.subsidies.workingDaysApplied).toBe(22);
    expect(body.subsidies.totalMonthlyAmount).toBe(173_970.94);
    expect(body.irtBracket).toBe(8);
    expect(body.irtTaxAmount).toBe(306_274.18);
    expect(body.netSalary).toBe(1_317_477.63);
  });

  it('returns a validation error for unsupported salary subsidy periods', async () => {
    const response = getSalaryNet(
      new Request('http://localhost/api/v1/salary/net?gross=500000&subsidyPeriod=weekly'),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('INVALID_ENUM');
    expect(body.error.field).toBe('subsidyPeriod');
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
