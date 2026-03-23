import { RouteError } from '@/lib/route-error';
import { formatCurrency, parsePositiveNumber } from '@/lib/angola/shared';

type InvoiceLineInput = {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  vatRate?: number;
};

const ANGOLA_ANNUAL_CPI_INDEX: Record<number, number> = {
  2019: 81.79,
  2020: 100,
  2021: 125.79,
  2022: 152.7,
  2023: 173.47,
  2024: 221.63,
  2025: 256.42,
};

export function calculateVat({
  amount,
  rate = 14,
  inclusive = true,
}: {
  amount: number;
  rate?: number;
  inclusive?: boolean;
}) {
  ensureRate(rate);

  const divisor = 1 + rate / 100;
  const netAmount = inclusive ? amount / divisor : amount;
  const vatAmount = inclusive ? amount - netAmount : amount * (rate / 100);
  const grossAmount = inclusive ? amount : netAmount + vatAmount;

  return {
    amount: formatCurrency(amount),
    rate,
    inclusive,
    netAmount: formatCurrency(netAmount),
    vatAmount: formatCurrency(vatAmount),
    grossAmount: formatCurrency(grossAmount),
  };
}

export function calculateInvoiceTotals({
  lines,
  discount = 0,
  discountType = 'amount',
}: {
  lines: InvoiceLineInput[];
  discount?: number;
  discountType?: 'amount' | 'percent';
}) {
  if (!lines.length) {
    throw new RouteError('INVALID_INVOICE_LINES', 'At least one invoice line is required.', 400);
  }

  const normalizedLines = lines.map((line, index) => {
    const quantity = Number(line.quantity ?? 0);
    const unitPrice = Number(line.unitPrice ?? 0);
    const vatRate = Number(line.vatRate ?? 14);

    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new RouteError('INVALID_INVOICE_LINE', 'Every invoice line must include a positive quantity and a non-negative unit price.', 400, {
        line: index,
      });
    }

    ensureRate(vatRate);
    const subtotal = quantity * unitPrice;

    return {
      description: line.description?.trim() || `Item ${index + 1}`,
      quantity,
      unitPrice: formatCurrency(unitPrice),
      vatRate,
      subtotal: formatCurrency(subtotal),
    };
  });

  const subtotal = normalizedLines.reduce((sum, line) => sum + line.subtotal, 0);
  const discountAmount =
    discountType === 'percent' ? subtotal * Math.max(discount, 0) / 100 : Math.max(discount, 0);
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const vatTotal = normalizedLines.reduce((sum, line) => {
    const proportionalBase = subtotal === 0 ? 0 : taxableBase * (line.subtotal / subtotal);
    return sum + proportionalBase * (line.vatRate / 100);
  }, 0);
  const grandTotal = taxableBase + vatTotal;

  return {
    currency: 'AOA',
    discountType,
    lines: normalizedLines,
    subtotal: formatCurrency(subtotal),
    discountAmount: formatCurrency(discountAmount),
    taxableBase: formatCurrency(taxableBase),
    vatTotal: formatCurrency(vatTotal),
    grandTotal: formatCurrency(grandTotal),
  };
}

export function adjustForInflation({
  amount,
  from,
  to,
}: {
  amount: number;
  from: string;
  to: string;
}) {
  const fromYear = parseYear(from, 'from');
  const toYear = parseYear(to, 'to');
  const fromIndex = ANGOLA_ANNUAL_CPI_INDEX[fromYear];
  const toIndex = ANGOLA_ANNUAL_CPI_INDEX[toYear];

  if (!fromIndex || !toIndex) {
    throw new RouteError(
      'UNSUPPORTED_CPI_YEAR',
      'Inflation adjustment is available for Angola annual CPI years from 2019 through 2025.',
      400,
      {
        fromYear,
        toYear,
      },
    );
  }

  const adjustedAmount = amount * (toIndex / fromIndex);

  return {
    currency: 'AOA',
    amount: formatCurrency(amount),
    fromYear,
    toYear,
    fromIndex,
    toIndex,
    inflationFactor: Number((toIndex / fromIndex).toFixed(6)),
    adjustedAmount: formatCurrency(adjustedAmount),
    source: 'Curated annual Angola CPI index series.',
  };
}

export function parseAmountParam(value: string | null) {
  return parsePositiveNumber(value, 'amount');
}

export function parseInvoiceLines(value: string | null) {
  if (!value) {
    throw new RouteError('MISSING_QUERY_PARAMETER', 'The "lines" query parameter is required.', 400, {
      field: 'lines',
    });
  }

  try {
    const parsed = JSON.parse(value) as InvoiceLineInput[];

    if (!Array.isArray(parsed)) {
      throw new Error('Expected an array.');
    }

    return parsed;
  } catch {
    throw new RouteError('INVALID_JSON', 'The "lines" query parameter must be a valid JSON array.', 400, {
      field: 'lines',
    });
  }
}

function parseYear(value: string, field: string) {
  const year = Number.parseInt(value.slice(0, 4), 10);

  if (!Number.isInteger(year)) {
    throw new RouteError('INVALID_YEAR', `The "${field}" query parameter must start with a four-digit year.`, 400, {
      field,
      value,
    });
  }

  return year;
}

function ensureRate(rate: number) {
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    throw new RouteError('INVALID_RATE', 'Tax rates must be between 0 and 100.', 400, {
      field: 'rate',
      value: rate,
    });
  }
}
