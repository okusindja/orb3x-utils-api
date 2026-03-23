import { RouteError } from '@/lib/route-error';

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number;
};

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function getCurrentTimeInZone(timezone: string) {
  ensureTimeZone(timezone);
  const now = new Date();
  return buildTimePayload(now, timezone);
}

export function convertTimeBetweenZones({
  datetime,
  fromTimezone,
  toTimezone,
}: {
  datetime: string;
  fromTimezone: string;
  toTimezone: string;
}) {
  ensureTimeZone(fromTimezone);
  ensureTimeZone(toTimezone);

  const sourceDate = parseZonedDateTime(datetime, fromTimezone);

  return {
    input: {
      datetime,
      timezone: fromTimezone,
    },
    source: buildTimePayload(sourceDate, fromTimezone),
    target: buildTimePayload(sourceDate, toTimezone),
  };
}

export function checkBusinessHours({
  datetime,
  timezone,
  startTime = '08:00',
  endTime = '17:00',
}: {
  datetime: string;
  timezone: string;
  startTime?: string;
  endTime?: string;
}) {
  ensureTimeZone(timezone);
  const date = parseZonedDateTime(datetime, timezone);
  const parts = getZonedParts(date, timezone);
  const startMinutes = parseClockMinutes(startTime, 'start');
  const endMinutes = parseClockMinutes(endTime, 'end');
  const currentMinutes = parts.hour * 60 + parts.minute;
  const isWeekday = parts.weekday >= 1 && parts.weekday <= 5;
  const withinWindow = currentMinutes >= startMinutes && currentMinutes <= endMinutes;

  return {
    timezone,
    evaluatedAt: buildTimePayload(date, timezone),
    businessHours: {
      start: startTime,
      end: endTime,
      timezone,
    },
    isBusinessDay: isWeekday,
    isWithinBusinessHours: isWeekday && withinWindow,
  };
}

function buildTimePayload(date: Date, timezone: string) {
  const parts = getZonedParts(date, timezone);
  const offsetLabel = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value ?? 'UTC';

  return {
    iso: `${pad(parts.year, 4)}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`,
    timezone,
    weekday: parts.weekday,
    offset: offsetLabel,
    components: parts,
  };
}

function parseZonedDateTime(value: string, timezone: string) {
  if (!value) {
    throw new RouteError('MISSING_QUERY_PARAMETER', 'The "datetime" query parameter is required.', 400, {
      field: 'datetime',
    });
  }

  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) {
    const absolute = new Date(value);

    if (Number.isNaN(absolute.getTime())) {
      throw new RouteError('INVALID_DATETIME', 'The "datetime" query parameter must be a valid ISO date-time string.', 400, {
        field: 'datetime',
        value,
      });
    }

    return absolute;
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    throw new RouteError('INVALID_DATETIME', 'Date-times without an offset must use YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss format.', 400, {
      field: 'datetime',
      value,
    });
  }

  const [, year, month, day, hour, minute, second = '00'] = match;
  let utcGuess = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    ),
  );

  for (let iteration = 0; iteration < 2; iteration += 1) {
    const current = getZonedParts(utcGuess, timezone);
    const currentMinutes = Date.UTC(
      current.year,
      current.month - 1,
      current.day,
      current.hour,
      current.minute,
      current.second,
    ) / 60000;
    const targetMinutes =
      Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)) /
      60000;
    utcGuess = new Date(utcGuess.getTime() - (currentMinutes - targetMinutes) * 60000);
  }

  return utcGuess;
}

function getZonedParts(date: Date, timezone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hour12: false,
  });

  const formatted = formatter.formatToParts(date);

  const get = (type: string) => formatted.find((part) => part.type === type)?.value ?? '';

  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    second: Number(get('second')),
    weekday: WEEKDAY_TO_INDEX[get('weekday')] ?? 0,
  };
}

function parseClockMinutes(value: string, field: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    throw new RouteError('INVALID_TIME', `The "${field}" query parameter must use HH:mm format.`, 400, {
      field,
      value,
    });
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) {
    throw new RouteError('INVALID_TIME', `The "${field}" query parameter must be a valid clock time.`, 400, {
      field,
      value,
    });
  }

  return hours * 60 + minutes;
}

function ensureTimeZone(timezone: string) {
  if (!timezone) {
    throw new RouteError('MISSING_QUERY_PARAMETER', 'The "timezone" query parameter is required.', 400, {
      field: 'timezone',
    });
  }

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
  } catch {
    throw new RouteError('INVALID_TIMEZONE', 'The supplied timezone is not supported by the runtime.', 400, {
      field: 'timezone',
      value: timezone,
    });
  }
}

function pad(value: number, width = 2) {
  return String(value).padStart(width, '0');
}
