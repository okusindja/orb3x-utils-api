import {
  type GrossSalaryInput,
  type NetSalaryInput,
  SALARY_SUBSIDY_PERIODS,
  type SalarySubsidyPeriod,
} from '@/lib/angola/salary';
import {
  parseEnum,
  parseInteger,
  parseOptionalPositiveNumber,
  parsePositiveNumber,
} from '@/lib/angola/shared';

const DEFAULT_SALARY_YEAR = 2026;

type SalarySharedQuery = {
  year: number;
  mealSubsidy: number;
  transportSubsidy: number;
  subsidyPeriod: SalarySubsidyPeriod;
};

export function parseNetSalaryQuery(searchParams: URLSearchParams): NetSalaryInput {
  return {
    grossSalary: parsePositiveNumber(searchParams.get('gross'), 'gross'),
    ...parseSalarySharedQuery(searchParams),
  };
}

export function parseGrossSalaryQuery(searchParams: URLSearchParams): GrossSalaryInput {
  return {
    targetNetSalary: parsePositiveNumber(searchParams.get('net'), 'net'),
    ...parseSalarySharedQuery(searchParams),
  };
}

function parseSalarySharedQuery(searchParams: URLSearchParams): SalarySharedQuery {
  return {
    year: searchParams.get('year')
      ? parseInteger(searchParams.get('year'), 'year')
      : DEFAULT_SALARY_YEAR,
    mealSubsidy: parseOptionalPositiveNumber(searchParams.get('mealSubsidy'), 'mealSubsidy') ?? 0,
    transportSubsidy:
      parseOptionalPositiveNumber(searchParams.get('transportSubsidy'), 'transportSubsidy') ?? 0,
    subsidyPeriod: parseEnum(
      searchParams.get('subsidyPeriod'),
      'subsidyPeriod',
      SALARY_SUBSIDY_PERIODS,
      'month',
    ),
  };
}
