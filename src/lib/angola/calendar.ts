import { RouteError } from '@/lib/route-error';
import { parseIsoDate, parseInteger } from '@/lib/angola/shared';

type Holiday = {
  date: string;
  name: string;
  localName: string;
  category: 'fixed' | 'movable';
};

const FIXED_HOLIDAYS = [
  { month: 1, day: 1, name: 'New Year', localName: 'Ano Novo' },
  { month: 2, day: 4, name: 'Liberation Movement Day', localName: 'Dia do Inicio da Luta Armada de Libertacao Nacional' },
  { month: 3, day: 8, name: "International Women's Day", localName: 'Dia Internacional da Mulher' },
  { month: 3, day: 23, name: 'Southern Africa Liberation Day', localName: 'Dia da Libertacao da Africa Austral' },
  { month: 4, day: 4, name: 'Peace Day', localName: 'Dia da Paz e Reconciliacao' },
  { month: 5, day: 1, name: 'Labour Day', localName: 'Dia do Trabalhador' },
  { month: 9, day: 17, name: 'National Hero Day', localName: 'Dia do Heroi Nacional' },
  { month: 11, day: 2, name: "All Souls' Day", localName: 'Dia dos Finados' },
  { month: 11, day: 11, name: 'Independence Day', localName: 'Dia da Independencia Nacional' },
  { month: 12, day: 25, name: 'Christmas Day', localName: 'Natal' },
] as const;

export function listAngolanHolidays(year: number) {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new RouteError('INVALID_YEAR', 'The "year" query parameter must be an integer between 2000 and 2100.', 400, {
      field: 'year',
      value: year,
    });
  }

  const easterSunday = getEasterSunday(year);
  const goodFriday = addDays(easterSunday, -2);
  const carnivalTuesday = addDays(easterSunday, -47);
  const carnivalMonday = addDays(carnivalTuesday, -1);

  const holidays: Holiday[] = [
    ...FIXED_HOLIDAYS.map((holiday) => ({
      date: toIsoDate(new Date(Date.UTC(year, holiday.month - 1, holiday.day))),
      name: holiday.name,
      localName: holiday.localName,
      category: 'fixed' as const,
    })),
    {
      date: toIsoDate(carnivalMonday),
      name: 'Carnival Holiday',
      localName: 'Tolerancia de Ponto de Carnaval',
      category: 'movable',
    },
    {
      date: toIsoDate(carnivalTuesday),
      name: 'Carnival',
      localName: 'Carnaval',
      category: 'movable',
    },
    {
      date: toIsoDate(goodFriday),
      name: 'Good Friday',
      localName: 'Sexta-Feira Santa',
      category: 'movable',
    },
  ];

  return holidays.sort((left, right) => left.date.localeCompare(right.date));
}

export function calculateWorkingDays({
  from,
  to,
}: {
  from: string;
  to: string;
}) {
  const fromDate = parseIsoDate(from, 'from');
  const toDate = parseIsoDate(to, 'to');

  if (fromDate.getTime() > toDate.getTime()) {
    throw new RouteError('INVALID_DATE_RANGE', 'The "from" date must be earlier than or equal to the "to" date.', 400, {
      from,
      to,
    });
  }

  const holidaySet = buildHolidaySet(fromDate.getUTCFullYear(), toDate.getUTCFullYear());
  let workingDays = 0;
  let holidayCount = 0;
  let weekendCount = 0;

  for (let cursor = new Date(fromDate); cursor <= toDate; cursor = addDays(cursor, 1)) {
    const iso = toIsoDate(cursor);

    if (isWeekend(cursor)) {
      weekendCount += 1;
      continue;
    }

    if (holidaySet.has(iso)) {
      holidayCount += 1;
      continue;
    }

    workingDays += 1;
  }

  return {
    from,
    to,
    workingDays,
    excludedWeekendDays: weekendCount,
    excludedHolidayDays: holidayCount,
  };
}

export function addWorkingDays({
  date,
  days,
}: {
  date: string;
  days: number;
}) {
  const baseDate = parseIsoDate(date, 'date');

  if (!Number.isInteger(days)) {
    throw new RouteError('INVALID_INTEGER', 'The "days" query parameter must be an integer.', 400, {
      field: 'days',
      value: days,
    });
  }

  if (days === 0) {
    return {
      inputDate: date,
      days,
      resultDate: date,
      direction: 'none',
    };
  }

  const direction = days > 0 ? 1 : -1;
  let remaining = Math.abs(days);
  let cursor = new Date(baseDate);

  while (remaining > 0) {
    cursor = addDays(cursor, direction);
    const iso = toIsoDate(cursor);
    const holidays = listAngolanHolidays(cursor.getUTCFullYear()).map((holiday) => holiday.date);

    if (isWeekend(cursor) || holidays.includes(iso)) {
      continue;
    }

    remaining -= 1;
  }

  return {
    inputDate: date,
    days,
    resultDate: toIsoDate(cursor),
    direction: direction > 0 ? 'forward' : 'backward',
  };
}

export function parseCalendarYear(value: string | null, fallbackYear: number) {
  if (value === null) {
    return fallbackYear;
  }

  return parseInteger(value, 'year');
}

function buildHolidaySet(startYear: number, endYear: number) {
  const years = Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index);

  return new Set(years.flatMap((year) => listAngolanHolidays(year).map((holiday) => holiday.date)));
}

function getEasterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

function isWeekend(date: Date) {
  const weekday = date.getUTCDay();
  return weekday === 0 || weekday === 6;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
