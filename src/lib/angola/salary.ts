import { RouteError } from '@/lib/route-error';
import { formatCurrency } from '@/lib/angola/shared';

type TaxBracket = {
  bracket: number;
  upTo: number | null;
  rate: number;
  fixedPart: number;
  excessOver: number;
};

type CalculatedIrt = {
  bracket: number;
  rate: number;
  fixedPart: number;
  excessOver: number;
  taxAmount: number;
};

export const SALARY_SUBSIDY_PERIODS = ['month', 'day'] as const;
export type SalarySubsidyPeriod = (typeof SALARY_SUBSIDY_PERIODS)[number];

export const SALARY_WORKING_DAYS_PER_MONTH = 22;

const SOCIAL_SECURITY = {
  employeeRate: 3,
  employerRate: 8,
};

const IRT_EXEMPTION_LIMITS = {
  mealSubsidy: 30_000,
  transportSubsidy: 30_000,
} as const;

const AGT_COMPATIBLE_IRT_TABLE: TaxBracket[] = [
  { bracket: 1, upTo: 100_000, rate: 0, fixedPart: 0, excessOver: 0 },
  { bracket: 2, upTo: 150_000, rate: 13, fixedPart: 0, excessOver: 100_001 },
  { bracket: 3, upTo: 200_000, rate: 16, fixedPart: 12_500, excessOver: 150_001 },
  { bracket: 4, upTo: 300_000, rate: 18, fixedPart: 31_250, excessOver: 200_001 },
  { bracket: 5, upTo: 500_000, rate: 19, fixedPart: 49_250, excessOver: 300_001 },
  { bracket: 6, upTo: 1_000_000, rate: 20, fixedPart: 87_250, excessOver: 500_001 },
  { bracket: 7, upTo: 1_500_000, rate: 21, fixedPart: 187_249, excessOver: 1_000_001 },
  { bracket: 8, upTo: 2_000_000, rate: 22, fixedPart: 292_249, excessOver: 1_500_001 },
  { bracket: 9, upTo: 2_500_000, rate: 23, fixedPart: 402_249, excessOver: 2_000_001 },
  { bracket: 10, upTo: 5_000_000, rate: 24, fixedPart: 517_249, excessOver: 2_500_001 },
  { bracket: 11, upTo: 10_000_000, rate: 24.5, fixedPart: 1_117_249, excessOver: 5_000_001 },
  { bracket: 12, upTo: null, rate: 25, fixedPart: 2_342_248, excessOver: 10_000_001 },
];

const IRT_TABLES: Record<number, TaxBracket[]> = {
  2025: AGT_COMPATIBLE_IRT_TABLE,
  2026: AGT_COMPATIBLE_IRT_TABLE,
};

type SalarySharedInput = {
  year?: number;
  mealSubsidy?: number;
  transportSubsidy?: number;
  subsidyPeriod?: SalarySubsidyPeriod;
};

export type NetSalaryInput = SalarySharedInput & {
  grossSalary: number;
};

export type GrossSalaryInput = SalarySharedInput & {
  targetNetSalary: number;
};

type SubsidyBreakdown = {
  inputAmount: number;
  monthlyAmount: number;
  exemptAmount: number;
  taxableAmount: number;
};

type SubsidySummary = {
  subsidyPeriod: SalarySubsidyPeriod;
  workingDaysApplied: number | null;
  mealSubsidy: SubsidyBreakdown;
  transportSubsidy: SubsidyBreakdown;
  totalMonthlyAmount: number;
  totalExemptAmount: number;
  totalTaxableAmount: number;
};

export function calculateNetSalary({
  grossSalary,
  year = 2026,
  mealSubsidy = 0,
  transportSubsidy = 0,
  subsidyPeriod = 'month',
}: NetSalaryInput) {
  ensureSupportedYear(year);

  const subsidies = summarizeSubsidies({
    mealSubsidy,
    transportSubsidy,
    subsidyPeriod,
  });
  const totalGrossCompensation = roundMoney(grossSalary + subsidies.totalMonthlyAmount);
  const employeeSocialSecurity = roundMoney(totalGrossCompensation * SOCIAL_SECURITY.employeeRate / 100);
  const employerContribution = roundMoney(totalGrossCompensation * SOCIAL_SECURITY.employerRate / 100);
  const taxableIncomeBeforeExemptions = roundMoney(
    Math.max(0, totalGrossCompensation - employeeSocialSecurity),
  );
  const taxableIncome = roundMoney(
    Math.max(0, taxableIncomeBeforeExemptions - subsidies.totalExemptAmount),
  );
  const irt = calculateIrtForTaxableIncome({
    taxableIncome,
    year,
  });
  const netSalary = roundMoney(totalGrossCompensation - employeeSocialSecurity - irt.taxAmount);

  return {
    currency: 'AOA',
    year,
    grossSalary: roundMoney(grossSalary),
    totalGrossCompensation,
    contributoryIncome: totalGrossCompensation,
    taxableIncomeBeforeExemptions,
    taxableIncome,
    employeeSocialSecurityRate: SOCIAL_SECURITY.employeeRate,
    employerSocialSecurityRate: SOCIAL_SECURITY.employerRate,
    employeeSocialSecurity,
    employerContribution,
    subsidies: formatSubsidies(subsidies),
    irtBracket: irt.bracket,
    irtRate: irt.rate,
    irtFixedPart: irt.fixedPart,
    irtExcessOver: irt.excessOver,
    irtTaxAmount: irt.taxAmount,
    netSalary,
    assumptions: buildAssumptions(subsidies, year),
  };
}

export function calculateGrossSalary({
  targetNetSalary,
  year = 2026,
  mealSubsidy = 0,
  transportSubsidy = 0,
  subsidyPeriod = 'month',
}: GrossSalaryInput) {
  ensureSupportedYear(year);

  let low = 0;
  let high = Math.max(targetNetSalary, 100_000);

  while (
    calculateNetSalary({
      grossSalary: high,
      year,
      mealSubsidy,
      transportSubsidy,
      subsidyPeriod,
    }).netSalary < targetNetSalary
  ) {
    high *= 1.5;
  }

  for (let iteration = 0; iteration < 50; iteration += 1) {
    const midpoint = (low + high) / 2;
    const net = calculateNetSalary({
      grossSalary: midpoint,
      year,
      mealSubsidy,
      transportSubsidy,
      subsidyPeriod,
    }).netSalary;

    if (net < targetNetSalary) {
      low = midpoint;
    } else {
      high = midpoint;
    }
  }

  const estimate = calculateNetSalary({
    grossSalary: high,
    year,
    mealSubsidy,
    transportSubsidy,
    subsidyPeriod,
  });

  return {
    ...estimate,
    targetNetSalary: roundMoney(targetNetSalary),
    grossSalary: roundMoney(high),
  };
}

export function calculateEmployerCost({
  grossSalary,
  year = 2026,
  mealSubsidy = 0,
  transportSubsidy = 0,
  subsidyPeriod = 'month',
}: NetSalaryInput) {
  const salary = calculateNetSalary({
    grossSalary,
    year,
    mealSubsidy,
    transportSubsidy,
    subsidyPeriod,
  });
  const totalEmployerCost = roundMoney(salary.totalGrossCompensation + salary.employerContribution);

  return {
    ...salary,
    totalEmployerCost,
  };
}

export function calculateIrtForTaxableIncome({
  taxableIncome,
  year = 2026,
}: {
  taxableIncome: number;
  year?: number;
}): CalculatedIrt {
  ensureSupportedYear(year);

  const brackets = IRT_TABLES[year];
  const bracket =
    brackets.find((candidate) => candidate.upTo === null || taxableIncome <= candidate.upTo) ??
    brackets[brackets.length - 1];

  if (bracket.rate === 0) {
    return {
      bracket: bracket.bracket,
      rate: 0,
      fixedPart: 0,
      excessOver: bracket.excessOver,
      taxAmount: 0,
    };
  }

  const taxableExcess = Math.max(0, taxableIncome - bracket.excessOver);

  return {
    bracket: bracket.bracket,
    rate: bracket.rate,
    fixedPart: roundMoney(bracket.fixedPart),
    excessOver: roundMoney(bracket.excessOver),
    taxAmount: roundMoney(bracket.fixedPart + taxableExcess * (bracket.rate / 100)),
  };
}

function summarizeSubsidies({
  mealSubsidy = 0,
  transportSubsidy = 0,
  subsidyPeriod = 'month',
}: Pick<SalarySharedInput, 'mealSubsidy' | 'transportSubsidy' | 'subsidyPeriod'>): SubsidySummary {
  const multiplier = subsidyPeriod === 'day' ? SALARY_WORKING_DAYS_PER_MONTH : 1;
  const mealMonthlyAmount = roundMoney(mealSubsidy * multiplier);
  const transportMonthlyAmount = roundMoney(transportSubsidy * multiplier);
  const mealExemptAmount = roundMoney(
    Math.min(mealMonthlyAmount, IRT_EXEMPTION_LIMITS.mealSubsidy),
  );
  const transportExemptAmount = roundMoney(
    Math.min(transportMonthlyAmount, IRT_EXEMPTION_LIMITS.transportSubsidy),
  );

  return {
    subsidyPeriod,
    workingDaysApplied: subsidyPeriod === 'day' ? SALARY_WORKING_DAYS_PER_MONTH : null,
    mealSubsidy: {
      inputAmount: roundMoney(mealSubsidy),
      monthlyAmount: mealMonthlyAmount,
      exemptAmount: mealExemptAmount,
      taxableAmount: roundMoney(Math.max(0, mealMonthlyAmount - mealExemptAmount)),
    },
    transportSubsidy: {
      inputAmount: roundMoney(transportSubsidy),
      monthlyAmount: transportMonthlyAmount,
      exemptAmount: transportExemptAmount,
      taxableAmount: roundMoney(Math.max(0, transportMonthlyAmount - transportExemptAmount)),
    },
    totalMonthlyAmount: roundMoney(mealMonthlyAmount + transportMonthlyAmount),
    totalExemptAmount: roundMoney(mealExemptAmount + transportExemptAmount),
    totalTaxableAmount: roundMoney(
      Math.max(
        0,
        mealMonthlyAmount + transportMonthlyAmount - mealExemptAmount - transportExemptAmount,
      ),
    ),
  };
}

function formatSubsidies(subsidies: SubsidySummary) {
  return {
    subsidyPeriod: subsidies.subsidyPeriod,
    workingDaysApplied: subsidies.workingDaysApplied,
    mealSubsidy: formatSubsidyBreakdown(subsidies.mealSubsidy),
    transportSubsidy: formatSubsidyBreakdown(subsidies.transportSubsidy),
    totalMonthlyAmount: subsidies.totalMonthlyAmount,
    totalExemptAmount: subsidies.totalExemptAmount,
    totalTaxableAmount: subsidies.totalTaxableAmount,
  };
}

function formatSubsidyBreakdown(subsidy: SubsidyBreakdown) {
  return {
    inputAmount: subsidy.inputAmount,
    monthlyAmount: subsidy.monthlyAmount,
    exemptAmount: subsidy.exemptAmount,
    taxableAmount: subsidy.taxableAmount,
  };
}

function buildAssumptions(subsidies: SubsidySummary, year: number) {
  const assumptions = [
    `Uses the configured Angola salary-tax table for ${year}, aligned to current AGT payroll outputs.`,
    'Rounds each payroll step to two decimal places before applying the next deduction stage.',
    'Applies 3% employee and 8% employer social-security contributions to contributory remuneration.',
    'Applies IRT food and transport subsidy exemptions up to Kz 30,000 per month for each subsidy type.',
  ];

  if (subsidies.subsidyPeriod === 'day') {
    assumptions.push(
      `Daily subsidies are normalized with ${SALARY_WORKING_DAYS_PER_MONTH} working days per month.`,
    );
  }

  assumptions.push(
    'Assumes no dependants, overtime, bonuses, vacation subsidy, or other payroll adjustments.',
  );

  return assumptions;
}

function ensureSupportedYear(year: number) {
  if (!(year in IRT_TABLES)) {
    throw new RouteError('UNSUPPORTED_TAX_YEAR', 'Supported salary-tax years are 2025 and 2026.', 400, {
      year,
    });
  }
}

function roundMoney(value: number) {
  return formatCurrency(value);
}
