import { RouteError } from '@/lib/route-error';

const TITLE_CASE_EXCEPTIONS = new Set([
  'ao',
  'da',
  'das',
  'de',
  'do',
  'dos',
  'e',
  'la',
]);

export function onlyDigits(value: string) {
  return value.replace(/\D+/g, '');
}

export function onlyAlphaNumeric(value: string) {
  return value.replace(/[^a-z0-9]+/gi, '');
}

export function normalizeLookupKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}

export function compactWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function titleCase(value: string) {
  const words = compactWhitespace(value)
    .toLowerCase()
    .split(' ')
    .filter(Boolean);

  return words
    .map((word, index) => {
      if (index > 0 && TITLE_CASE_EXCEPTIONS.has(word)) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function formatGrouped(value: string, groupSize = 4) {
  const groups: string[] = [];

  for (let index = 0; index < value.length; index += groupSize) {
    groups.push(value.slice(index, index + groupSize));
  }

  return groups.join(' ');
}

export function parsePositiveNumber(value: string | null, field: string) {
  if (value === null || value === '') {
    throw new RouteError('MISSING_QUERY_PARAMETER', `The "${field}" query parameter is required.`, 400, {
      field,
    });
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new RouteError('INVALID_NUMBER', `The "${field}" query parameter must be a non-negative number.`, 400, {
      field,
      value,
    });
  }

  return parsed;
}

export function parseInteger(value: string | null, field: string) {
  if (value === null || value === '') {
    throw new RouteError('MISSING_QUERY_PARAMETER', `The "${field}" query parameter is required.`, 400, {
      field,
    });
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed)) {
    throw new RouteError('INVALID_INTEGER', `The "${field}" query parameter must be an integer.`, 400, {
      field,
      value,
    });
  }

  return parsed;
}

export function parseIsoDate(value: string | null, field: string) {
  if (!value) {
    throw new RouteError('MISSING_QUERY_PARAMETER', `The "${field}" query parameter is required.`, 400, {
      field,
    });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RouteError('INVALID_DATE', `The "${field}" query parameter must use YYYY-MM-DD format.`, 400, {
      field,
      value,
    });
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new RouteError('INVALID_DATE', `The "${field}" query parameter is not a valid calendar date.`, 400, {
      field,
      value,
    });
  }

  return date;
}

export function formatCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function uniqueBy<T>(items: T[], keySelector: (item: T) => string) {
  const map = new Map<string, T>();

  for (const item of items) {
    map.set(keySelector(item), item);
  }

  return Array.from(map.values());
}
