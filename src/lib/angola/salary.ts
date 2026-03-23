import { RouteError } from '@/lib/route-error';
import { formatCurrency } from '@/lib/angola/shared';

type TaxBracket = {
  upTo: number | null;
  rate: number;
  deduction: number;
};

const SOCIAL_SECURITY = {
  employeeRate: 3,
  employerRate: 8,
};

const IRT_TABLES: Record<number, TaxBracket[]> = {
  2025: [
    { upTo: 100_000, rate: 0, deduction: 0 },
    { upTo: 150_000, rate: 13, deduction: 13_000 },
    { upTo: 200_000, rate: 16, deduction: 17_500 },
    { upTo: 300_000, rate: 18, deduction: 21_500 },
    { upTo: 500_000, rate: 19, deduction: 24_500 },
    { upTo: 1_000_000, rate: 20, deduction: 29_500 },
    { upTo: 1_500_000, rate: 21, deduction: 39_500 },
    { upTo: 2_000_000, rate: 22, deduction: 54_500 },
    { upTo: 2_500_000, rate: 23, deduction: 74_500 },
    { upTo: 5_000_000, rate: 24, deduction: 99_500 },
    { upTo: null, rate: 25, deduction: 149_500 },
  ],
  2026: [
    { upTo: 150_000, rate: 0, deduction: 0 },
    { upTo: 200_000, rate: 13, deduction: 19_500 },
    { upTo: 500_000, rate: 16, deduction: 25_500 },
    { upTo: 1_000_000, rate: 18, deduction: 35_500 },
    { upTo: 1_500_000, rate: 19, deduction: 45_500 },
    { upTo: 2_000_000, rate: 20, deduction: 60_500 },
    { upTo: 2_500_000, rate: 21, deduction: 80_500 },
    { upTo: 5_000_000, rate: 22.5, deduction: 118_000 },
    { upTo: 10_000_000, rate: 23.5, deduction: 168_000 },
    { upTo: null, rate: 25, deduction: 318_000 },
  ],
};

export function calculateNetSalary({
  grossSalary,
  year = 2026,
}: {
  grossSalary: number;
  year?: number;
}) {
  ensureSupportedYear(year);

  const socialSecurityEmployee = grossSalary * SOCIAL_SECURITY.employeeRate / 100;
  const taxableIncome = Math.max(0, grossSalary - socialSecurityEmployee);
  const irt = calculateIrt(taxableIncome, year);
  const netSalary = grossSalary - socialSecurityEmployee - irt.taxAmount;
  const employerContribution = grossSalary * SOCIAL_SECURITY.employerRate / 100;

  return {
    currency: 'AOA',
    year,
    grossSalary: formatCurrency(grossSalary),
    taxableIncome: formatCurrency(taxableIncome),
    employeeSocialSecurityRate: SOCIAL_SECURITY.employeeRate,
    employerSocialSecurityRate: SOCIAL_SECURITY.employerRate,
    employeeSocialSecurity: formatCurrency(socialSecurityEmployee),
    irtRate: irt.rate,
    irtTaxAmount: formatCurrency(irt.taxAmount),
    netSalary: formatCurrency(netSalary),
    employerContribution: formatCurrency(employerContribution),
    assumptions: [
      'Applies monthly employment-income withholding for Angola.',
      'Assumes no dependants, exemptions, allowances, or non-cash adjustments.',
      'Uses employee social security deduction as part of the taxable-income base.',
    ],
  };
}

export function calculateGrossSalary({
  targetNetSalary,
  year = 2026,
}: {
  targetNetSalary: number;
  year?: number;
}) {
  ensureSupportedYear(year);

  let low = targetNetSalary;
  let high = targetNetSalary * 2 + 500_000;

  while (calculateNetSalary({ grossSalary: high, year }).netSalary < targetNetSalary) {
    high *= 1.5;
  }

  for (let iteration = 0; iteration < 50; iteration += 1) {
    const midpoint = (low + high) / 2;
    const net = calculateNetSalary({ grossSalary: midpoint, year }).netSalary;

    if (net < targetNetSalary) {
      low = midpoint;
    } else {
      high = midpoint;
    }
  }

  const estimate = calculateNetSalary({ grossSalary: high, year });

  return {
    ...estimate,
    targetNetSalary: formatCurrency(targetNetSalary),
    grossSalary: formatCurrency(high),
  };
}

export function calculateEmployerCost({
  grossSalary,
  year = 2026,
}: {
  grossSalary: number;
  year?: number;
}) {
  const salary = calculateNetSalary({ grossSalary, year });
  const totalEmployerCost = grossSalary + salary.employerContribution;

  return {
    ...salary,
    totalEmployerCost: formatCurrency(totalEmployerCost),
  };
}

function calculateIrt(taxableIncome: number, year: number) {
  const brackets = IRT_TABLES[year];
  const bracket =
    brackets.find((candidate) => candidate.upTo === null || taxableIncome <= candidate.upTo) ??
    brackets[brackets.length - 1];

  if (bracket.rate === 0) {
    return {
      rate: 0,
      taxAmount: 0,
    };
  }

  return {
    rate: bracket.rate,
    taxAmount: Math.max(0, taxableIncome * (bracket.rate / 100) - bracket.deduction),
  };
}

function ensureSupportedYear(year: number) {
  if (!(year in IRT_TABLES)) {
    throw new RouteError('UNSUPPORTED_TAX_YEAR', 'Supported salary-tax years are 2025 and 2026.', 400, {
      year,
    });
  }
}
