import { RouteError } from '@/lib/route-error';
import { compactWhitespace, onlyDigits } from '@/lib/angola/shared';

type PhoneOperatorCode = 'UNITEL' | 'AFRICELL' | 'MOVICEL' | 'UNKNOWN';

type OperatorInfo = {
  code: PhoneOperatorCode;
  name: string;
  prefixes: string[];
};

const PHONE_OPERATORS: OperatorInfo[] = [
  { code: 'MOVICEL', name: 'Movicel', prefixes: ['91', '99'] },
  { code: 'UNITEL', name: 'Unitel', prefixes: ['92', '93', '94'] },
  { code: 'AFRICELL', name: 'Africell', prefixes: ['95'] },
];

const COUNTRY_CODE = '244';

export function parseAngolanPhoneNumber(rawPhone: string) {
  const phone = compactWhitespace(rawPhone);

  if (!phone) {
    throw new RouteError('INVALID_PHONE', 'The "phone" query parameter is required.', 400, {
      field: 'phone',
    });
  }

  const digits = onlyDigits(phone);
  let nationalNumber = digits;

  if (digits.startsWith(COUNTRY_CODE) && digits.length === 12) {
    nationalNumber = digits.slice(3);
  }

  if (nationalNumber.length !== 9) {
    throw new RouteError('INVALID_PHONE', 'Angolan phone numbers must contain 9 national digits.', 400, {
      field: 'phone',
      length: nationalNumber.length,
    });
  }

  const isMobile = nationalNumber.startsWith('9');
  const operator = isMobile ? detectAngolanOperator(nationalNumber) : null;
  const areaOrPrefix = nationalNumber.slice(0, 2);

  return {
    input: rawPhone,
    normalized: `+${COUNTRY_CODE}${nationalNumber}`,
    countryCode: `+${COUNTRY_CODE}`,
    nationalNumber,
    internationalFormat: `+${COUNTRY_CODE} ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6)}`,
    nationalFormat: `${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6)}`,
    isMobile,
    type: isMobile ? 'mobile' : 'fixed-line',
    prefix: areaOrPrefix,
    subscriberNumber: nationalNumber.slice(2),
    operator,
  };
}

export function validateAngolanPhoneNumber(rawPhone: string) {
  const parsed = parseAngolanPhoneNumber(rawPhone);
  const assignedToOperator = Boolean(parsed.operator && parsed.operator.code !== 'UNKNOWN');

  return {
    ...parsed,
    isValid: true,
    availability: {
      type: 'numbering-plan',
      status: parsed.isMobile ? (assignedToOperator ? 'allocated-range' : 'unassigned-range') : 'format-only',
      canConfirmLiveSubscriber: false,
    },
  };
}

export function detectAngolanOperator(rawPhone: string) {
  const digits = onlyDigits(rawPhone);
  const nationalNumber =
    digits.startsWith(COUNTRY_CODE) && digits.length === 12 ? digits.slice(3) : digits;
  const prefix = nationalNumber.slice(0, 2);

  const operator =
    PHONE_OPERATORS.find((candidate) => candidate.prefixes.includes(prefix)) ??
    ({
      code: 'UNKNOWN',
      name: 'Unknown',
      prefixes: [],
    } satisfies OperatorInfo);

  return {
    code: operator.code,
    name: operator.name,
    prefix,
    prefixes: operator.prefixes,
  };
}
