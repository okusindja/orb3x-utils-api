import {
  adjustForInflation,
  calculateInvoiceTotals,
  calculateVat,
} from '@/lib/angola/finance';
import {
  calculateEmployerCost,
  calculateGrossSalary,
  calculateNetSalary,
} from '@/lib/angola/salary';

describe('angola finance and salary utilities', () => {
  it('calculates VAT for inclusive and exclusive amounts', () => {
    const inclusive = calculateVat({ amount: 114, rate: 14, inclusive: true });
    const exclusive = calculateVat({ amount: 100, rate: 14, inclusive: false });

    expect(inclusive.netAmount).toBe(100);
    expect(exclusive.grossAmount).toBe(114);
  });

  it('computes invoice totals', () => {
    const result = calculateInvoiceTotals({
      lines: [
        { description: 'Service', quantity: 2, unitPrice: 1000, vatRate: 14 },
        { description: 'Support', quantity: 1, unitPrice: 500, vatRate: 14 },
      ],
      discount: 10,
      discountType: 'percent',
    });

    expect(result.subtotal).toBe(2500);
    expect(result.grandTotal).toBeGreaterThan(result.taxableBase);
  });

  it('adjusts values for inflation', () => {
    const result = adjustForInflation({
      amount: 100_000,
      from: '2020-01-01',
      to: '2025-01-01',
    });

    expect(result.adjustedAmount).toBeGreaterThan(100_000);
  });

  it('calculates net salary and inverses to gross salary', () => {
    const net = calculateNetSalary({ grossSalary: 500_000, year: 2026 });
    const gross = calculateGrossSalary({ targetNetSalary: net.netSalary, year: 2026 });
    const employer = calculateEmployerCost({ grossSalary: 500_000, year: 2026 });

    expect(net.netSalary).toBeLessThan(500_000);
    expect(gross.grossSalary).toBeGreaterThan(490_000);
    expect(employer.totalEmployerCost).toBeGreaterThan(500_000);
  });
});
