import {
  adjustForInflation,
  calculateInvoiceTotals,
  calculateVat,
} from '@/lib/angola/finance';
import {
  calculateEmployerCost,
  calculateGrossSalary,
  calculateIrtForTaxableIncome,
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

  it('matches the AGT-compatible 2026 output for a base salary without subsidies', () => {
    const net = calculateNetSalary({ grossSalary: 500_000, year: 2026 });

    expect(net.taxableIncome).toBe(485_000);
    expect(net.irtBracket).toBe(5);
    expect(net.irtRate).toBe(19);
    expect(net.irtTaxAmount).toBe(84_399.81);
    expect(net.netSalary).toBe(400_600.19);
  });

  it('matches the AGT-compatible 2026 output for the reported subsidy scenario', () => {
    const net = calculateNetSalary({
      grossSalary: 1_500_000,
      year: 2026,
      mealSubsidy: 4_747.77,
      transportSubsidy: 3_160,
      subsidyPeriod: 'day',
    });

    expect(net.totalGrossCompensation).toBe(1_673_970.94);
    expect(net.employeeSocialSecurity).toBe(50_219.13);
    expect(net.subsidies.workingDaysApplied).toBe(22);
    expect(net.subsidies.mealSubsidy.monthlyAmount).toBe(104_450.94);
    expect(net.subsidies.mealSubsidy.exemptAmount).toBe(30_000);
    expect(net.subsidies.mealSubsidy.taxableAmount).toBe(74_450.94);
    expect(net.subsidies.transportSubsidy.monthlyAmount).toBe(69_520);
    expect(net.subsidies.transportSubsidy.exemptAmount).toBe(30_000);
    expect(net.subsidies.transportSubsidy.taxableAmount).toBe(39_520);
    expect(net.subsidies.totalExemptAmount).toBe(60_000);
    expect(net.taxableIncomeBeforeExemptions).toBe(1_623_751.81);
    expect(net.taxableIncome).toBe(1_563_751.81);
    expect(net.irtBracket).toBe(8);
    expect(net.irtFixedPart).toBe(292_249);
    expect(net.irtExcessOver).toBe(1_500_001);
    expect(net.irtTaxAmount).toBe(306_274.18);
    expect(net.netSalary).toBe(1_317_477.63);
  });

  it('computes IRT details across all 2026 brackets', () => {
    const cases = [
      { taxableIncome: 100_000, bracket: 1, rate: 0, fixedPart: 0, excessOver: 0, taxAmount: 0 },
      { taxableIncome: 120_000, bracket: 2, rate: 13, fixedPart: 0, excessOver: 100_001, taxAmount: 2_599.87 },
      { taxableIncome: 180_000, bracket: 3, rate: 16, fixedPart: 12_500, excessOver: 150_001, taxAmount: 17_299.84 },
      { taxableIncome: 250_000, bracket: 4, rate: 18, fixedPart: 31_250, excessOver: 200_001, taxAmount: 40_249.82 },
      { taxableIncome: 400_000, bracket: 5, rate: 19, fixedPart: 49_250, excessOver: 300_001, taxAmount: 68_249.81 },
      { taxableIncome: 800_000, bracket: 6, rate: 20, fixedPart: 87_250, excessOver: 500_001, taxAmount: 147_249.8 },
      { taxableIncome: 1_200_000, bracket: 7, rate: 21, fixedPart: 187_249, excessOver: 1_000_001, taxAmount: 229_248.79 },
      { taxableIncome: 1_700_000, bracket: 8, rate: 22, fixedPart: 292_249, excessOver: 1_500_001, taxAmount: 336_248.78 },
      { taxableIncome: 2_200_000, bracket: 9, rate: 23, fixedPart: 402_249, excessOver: 2_000_001, taxAmount: 448_248.77 },
      { taxableIncome: 3_000_000, bracket: 10, rate: 24, fixedPart: 517_249, excessOver: 2_500_001, taxAmount: 637_248.76 },
      { taxableIncome: 6_000_000, bracket: 11, rate: 24.5, fixedPart: 1_117_249, excessOver: 5_000_001, taxAmount: 1_362_248.76 },
      { taxableIncome: 11_000_000, bracket: 12, rate: 25, fixedPart: 2_342_248, excessOver: 10_000_001, taxAmount: 2_592_247.75 },
    ];

    for (const testCase of cases) {
      const irt = calculateIrtForTaxableIncome({
        taxableIncome: testCase.taxableIncome,
        year: 2026,
      });

      expect(irt.bracket).toBe(testCase.bracket);
      expect(irt.rate).toBe(testCase.rate);
      expect(irt.fixedPart).toBe(testCase.fixedPart);
      expect(irt.excessOver).toBe(testCase.excessOver);
      expect(irt.taxAmount).toBe(testCase.taxAmount);
    }
  });

  it('solves gross salary against a target net with subsidies', () => {
    const gross = calculateGrossSalary({
      targetNetSalary: 450_000,
      year: 2026,
      mealSubsidy: 25_000,
      transportSubsidy: 15_000,
      subsidyPeriod: 'month',
    });

    expect(gross.netSalary).toBe(450_000);
    expect(gross.grossSalary).toBeCloseTo(513_200.72, 2);
    expect(gross.subsidies.totalExemptAmount).toBe(40_000);
    expect(gross.irtTaxAmount).toBeCloseTo(86_604.7, 2);
  });

  it('computes employer cost from contributory remuneration including subsidies', () => {
    const employer = calculateEmployerCost({
      grossSalary: 500_000,
      year: 2026,
      mealSubsidy: 25_000,
      transportSubsidy: 15_000,
      subsidyPeriod: 'month',
    });

    expect(employer.totalGrossCompensation).toBe(540_000);
    expect(employer.employerContribution).toBe(43_200);
    expect(employer.totalEmployerCost).toBe(583_200);
  });
});
