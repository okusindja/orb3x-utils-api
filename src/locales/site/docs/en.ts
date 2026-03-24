import { makeCurlAndNodeCodeSamples } from '@/lib/docs-code';
import type { DocsPageMap, DocsSection } from '@/lib/site-content';

function routeSection({
  id,
  title,
  description,
  params,
  usage,
  success,
  error,
  successLanguage = 'json',
  errorLanguage = 'json',
  bullets,
  note,
}: {
  id: string;
  title: string;
  description: string;
  params: string[][];
  usage: string;
  success: string;
  error: string;
  successLanguage?: 'bash' | 'json' | 'js' | 'ts';
  errorLanguage?: 'bash' | 'json' | 'js' | 'ts';
  bullets?: string[];
  note?: string;
}): DocsSection {
  return {
    id,
    title,
    description,
    table: {
      columns: ['Parameter', 'Required', 'Description'],
      rows: params,
    },
    codes: [
      ...makeCurlAndNodeCodeSamples(usage, {
        curl: 'cURL usage',
        node: 'Node.js usage',
      }),
      { label: '200 response', language: successLanguage, content: success },
      { label: 'Error response', language: errorLanguage, content: error },
    ],
    bullets,
    note,
  };
}

export const enDocsPages: DocsPageMap = {
  'getting-started': {
    slug: 'getting-started',
    label: 'Getting Started',
    description: 'Overview of route families, request conventions, and deployment notes.',
    eyebrow: 'Platform Guide',
    title: 'Get started with the published ORB3X Utils API routes.',
    intro:
      'ORB3X Utils API now combines the original NIF, translation, and exchange endpoints with Angola-focused validation, phone, address, geo, calendar, finance, salary, time, and document utilities. All routes are dynamic and default to no-store caching.',
    summaryCards: [
      { label: 'Runtime', value: 'Node.js handlers' },
      { label: 'Cache policy', value: 'No-store responses' },
      { label: 'Endpoint styles', value: '24 GET, 4 POST' },
    ],
    sections: [
      {
        id: 'mental-model',
        title: 'Start with the platform model',
        paragraphs: [
          'Most of the new endpoints are local calculators, registries, or normalizers backed by typed internal datasets. The existing tax, translation, and exchange routes still call live upstream providers.',
          'That split is useful in client design: local-data endpoints are deterministic and fast, while upstream-backed routes need stronger retry, timeout, and observability handling.',
        ],
        bullets: [
          'Expect JSON for both success and failure responses.',
          'Treat NIF, translation, and exchange responses as dynamic and time-sensitive.',
          'Treat salary, VAT, and inflation outputs as assumption-driven calculators and persist the year or rate inputs you used.',
          'Read the returned error code, not just the HTTP status, when deciding retries.',
          'Normalize your own user input before calling the endpoints to reduce avoidable 400 responses.',
        ],
      },
      {
        id: 'request-conventions',
        title: 'Shared request conventions',
        table: {
          columns: ['Concern', 'Behavior'],
          rows: [
            ['Transport', 'HTTPS JSON API designed for server-side and browser-side consumers.'],
            ['Caching', 'Responses set Cache-Control to no-store across the board so integrations always read live results.'],
            ['Timeout profile', 'Handlers allow up to 30 seconds; only a subset of legacy routes depend on third-party upstream calls.'],
            ['Validation', 'Query parameters, path values, and POST bodies are sanitized before business logic runs.'],
            ['Error handling', 'Validation errors return 400-level codes with stable machine-readable error.code values.'],
          ],
        },
      },
      {
        id: 'first-calls',
        title: 'Make a first successful request',
        description: 'Run one request per route before you integrate them into application code.',
        codes: makeCurlAndNodeCodeSamples(
          `curl -s "https://utils.api.orb3x.com/api/v1/validate/iban?iban=AO06004000010123456789012"

curl -s "https://utils.api.orb3x.com/api/v1/phone/validate?phone=%2B244923456789"

curl -s "https://utils.api.orb3x.com/api/v1/finance/vat?amount=114000&inclusive=true"

curl -s -X POST https://utils.api.orb3x.com/api/v1/documents/invoice \\
  -H "Content-Type: application/json" \\
  -d '{"seller":{"name":"Orb3x, Lda"},"buyer":{"name":"Cliente Exemplo"},"items":[{"description":"Service","quantity":1,"unitPrice":100000,"vatRate":14}]}'`,
          {
            curl: 'Starter smoke tests (cURL)',
            node: 'Starter smoke tests (Node.js)',
          },
        ),
        bullets: [
          'Verify document routes from the exact runtime you deploy because PDF generation runs server-side.',
          'Log request IDs and upstream error codes for the NIF, translation, and exchange endpoints.',
          'Build response guards around assumption-driven outputs such as salary, inflation, and numbering-plan availability.',
        ],
      },
      {
        id: 'launch-checklist',
        title: 'Production launch checklist',
        bullets: [
          'Centralize base URL configuration so staging and production environments can be switched without code edits.',
          'Capture non-200 responses with structured logging that stores HTTP status, endpoint, code, and request context.',
          'Define retry policy only for upstream timeouts and availability failures; do not retry invalid input errors.',
          'Store the calculation year or rate inputs whenever financial outputs flow into invoices, payroll, or reporting.',
          'Validate POST payloads for document generation before you pass user input into persistence or delivery workflows.',
          'Keep a lightweight contract test for each endpoint in CI to catch accidental response-shape regressions.',
        ],
        note:
          'If you only implement one defensive layer, make it explicit error-code handling. That is the simplest way to distinguish retryable failures from bad requests.',
      },
    ],
    relatedSlugs: ['api-reference', 'validation', 'examples'],
  },
  'api-reference': {
    slug: 'api-reference',
    label: 'API Reference',
    description: 'Canonical request and response behavior across the full published API surface.',
    eyebrow: 'Reference',
    title: 'Reference for shared request and response behavior.',
    intro:
      'This reference summarizes the conventions shared by the current Angola utility surface, including validation, geo, finance, salary, time, and document routes alongside the original upstream-backed endpoints.',
    summaryCards: [
      { label: 'Published endpoints', value: '28' },
      { label: 'Success format', value: 'JSON only' },
      { label: 'Binary responses', value: 'PDF on POST documents' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Endpoint catalog',
        table: {
          columns: ['Route', 'Method', 'Purpose', 'Key input'],
          rows: [
            ['/api/v1/validate/*', 'GET', 'Validate Angolan IBAN and local bank-account structures.', 'iban or account query'],
            ['/api/v1/phone/*', 'GET', 'Parse phone numbers, validate format, and detect operators.', 'phone query'],
            ['/api/v1/address/* + /api/v1/geo/*', 'GET', 'Normalize addresses and read Angola location registries.', 'q, province, municipality, address'],
            ['/api/v1/calendar/*', 'GET', 'Return holidays and business-day calculations.', 'year, from/to, date/days'],
            ['/api/v1/finance/*', 'GET', 'Run VAT, invoice, and inflation calculations.', 'amount or lines query'],
            ['/api/v1/salary/*', 'GET', 'Estimate payroll net, gross, and employer-cost values.', 'gross or net query'],
            ['/api/v1/time/*', 'GET', 'Read current time, convert timezones, and check business hours.', 'timezone, datetime, start/end'],
            ['/api/v1/documents/*', 'POST', 'Generate invoice, receipt, and contract PDFs.', 'JSON body'],
            ['/api/nif/{nif}', 'GET', 'Look up Angolan taxpayer identity fields.', 'NIF path parameter'],
            ['/api/translate', 'POST', 'Translate text and return detected source language.', 'JSON body: text, to, optional from'],
            ['/api/exchange/{base}', 'GET', 'Return exchange rates, optionally multiplied by amount.', 'base path parameter, optional amount query'],
          ],
        },
      },
      {
        id: 'response-patterns',
        title: 'Response patterns',
        paragraphs: [
          'Success payloads are endpoint-specific, but they stay flat and application-oriented. Calculator endpoints surface derived values plus the assumptions or basis used to produce them.',
          'Document routes are the main exception: they return binary PDF responses with attachment headers. Most other endpoints return JSON and an error envelope when something goes wrong.',
        ],
        code: {
          label: 'Typical error response',
          language: 'json',
          content: `{
  "error": {
    "code": "UPSTREAM_TIMEOUT",
    "message": "The currency service did not respond in time.",
    "baseCurrency": "AOA",
    "amount": "1000000"
  }
}`,
        },
      },
      {
        id: 'status-codes',
        title: 'Status codes and intent',
        table: {
          columns: ['Status', 'Meaning', 'Typical action'],
          rows: [
            ['200', 'Validated request succeeded.', 'Use the payload directly.'],
            ['400', 'Input is missing, malformed, or unsupported.', 'Fix the request; no retry.'],
            ['404', 'Requested resource could not be found upstream.', 'Show a clear not-found state.'],
            ['502', 'Upstream service failed or returned malformed data.', 'Retry with backoff or degrade gracefully.'],
            ['504', 'Upstream dependency timed out.', 'Retry if the user flow can tolerate it.'],
            ['500', 'Unexpected internal failure.', 'Log, alert, and treat as retryable only if your UX allows.'],
          ],
        },
      },
      {
        id: 'operational-notes',
        title: 'Operational notes',
        bullets: [
          'All route handlers are marked dynamic, so you should not rely on build-time pre-rendered responses.',
          'User-Agent headers are explicitly set for the upstream-backed legacy requests to improve provider compatibility.',
          'Input sanitization is conservative: route parameters are trimmed and normalized before request dispatch.',
          'Bank validation responses include a generated bank image badge so front ends can render a recognizable visual without extra lookups.',
          'Document endpoints are synchronous; keep payloads compact and perform downstream storage asynchronously in your own system when needed.',
        ],
      },
    ],
    relatedSlugs: ['getting-started', 'validation', 'examples'],
  },
  validation: {
    slug: 'validation',
    label: 'Validation',
    description: 'IBAN and local Angolan bank-account validation with bank detection.',
    eyebrow: 'Category',
    title: 'Validate Angolan banking identifiers and detect the issuing bank.',
    intro:
      'The validation family covers `/api/v1/validate/iban` and `/api/v1/validate/bank-account`. Both routes normalize input, detect the bank from the banking code, and return a generated bank badge image for UI use.',
    summaryCards: [
      { label: 'Routes', value: '2 GET' },
      { label: 'Country scope', value: 'Angola' },
      { label: 'Visual output', value: 'Bank badge image' },
    ],
    sections: [
      {
        id: 'routes',
        title: 'Routes in this family',
        table: {
          columns: ['Route', 'Purpose', 'Key query'],
          rows: [
            ['/api/v1/validate/iban', 'Validate AO-format IBANs with mod-97 checks and bank lookup.', 'iban'],
            ['/api/v1/validate/bank-account', 'Validate 21-digit local account structures and derive the matching IBAN.', 'account'],
          ],
        },
      },
      routeSection({
        id: 'validate-iban-route',
        title: 'GET /api/v1/validate/iban',
        description: 'Use this route when you already have a full AO IBAN and need normalized parts, bank metadata, and validation flags.',
        params: [
          ['iban', 'Yes', 'AO-format IBAN. The handler trims separators and uppercases the value before checking it.'],
        ],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/validate/iban?iban=AO06004000010123456789012"',
        success: `{
  "isValid": true,
  "normalized": "AO06004000010123456789012",
  "formatted": "AO06 0040 0001 0123 4567 8901 2",
  "countryCode": "AO",
  "checkDigits": "06",
  "bank": {
    "code": "BAI",
    "ibanBankCode": "0040",
    "name": "Banco Angolano de Investimentos",
    "image": "data:image/svg+xml;base64,..."
  },
  "components": {
    "bankCode": "0040",
    "branchCode": "0001",
    "accountNumber": "01234567890",
    "controlDigits": "12"
  },
  "validation": {
    "countrySupported": true,
    "lengthValid": true,
    "bankCodeKnown": true,
    "mod97Valid": true
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_IBAN",
    "message": "Angolan IBANs must contain exactly 25 characters.",
    "field": "iban",
    "length": 18
  }
}`,
        bullets: [
          'Check `validation.mod97Valid` and `validation.bankCodeKnown` instead of relying on `isValid` alone when you need granular UI states.',
          'Use `bank.image` directly in payment summaries or verification cards.',
        ],
      }),
      routeSection({
        id: 'validate-bank-account-route',
        title: 'GET /api/v1/validate/bank-account',
        description: 'Use this route for local 21-digit account strings when you need structural validation and the matching derived IBAN.',
        params: [
          ['account', 'Yes', 'Local Angolan account string with 21 digits. Non-digit separators are ignored.'],
        ],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/validate/bank-account?account=004000010123456789012"',
        success: `{
  "isValid": true,
  "normalized": "004000010123456789012",
  "formatted": "0040 0001 0123 4567 8901 2",
  "derivedIban": "AO06004000010123456789012",
  "bankRecognized": true,
  "bank": {
    "code": "BAI",
    "name": "Banco Angolano de Investimentos",
    "image": "data:image/svg+xml;base64,..."
  },
  "components": {
    "bankCode": "0040",
    "branchCode": "0001",
    "accountNumber": "01234567890",
    "controlDigits": "12"
  },
  "validation": {
    "formatValid": true,
    "bankCodeKnown": true,
    "controlDigitsPresent": true
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_BANK_ACCOUNT",
    "message": "Angolan local bank account numbers must contain exactly 21 digits.",
    "field": "account",
    "length": 9
  }
}`,
        bullets: [
          'This is structural validation, not confirmation that the account is active in the banking network.',
          'Persist the normalized account or derived IBAN rather than the raw input string.',
        ],
      }),
    ],
    relatedSlugs: ['phone', 'finance', 'examples'],
  },
  phone: {
    slug: 'phone',
    label: 'Phone',
    description: 'Parse, validate, and classify Angolan phone numbers by operator.',
    eyebrow: 'Category',
    title: 'Parse Angolan numbers and classify the numbering range.',
    intro:
      'The phone routes normalize local or international input, separate country and national parts, and map mobile prefixes to Unitel, Africell, or Movicel when the range is known.',
    summaryCards: [
      { label: 'Routes', value: '3 GET' },
      { label: 'Country code', value: '+244' },
      { label: 'Availability model', value: 'Numbering plan' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Routes in this family',
        table: {
          columns: ['Route', 'Purpose', 'Key query'],
          rows: [
            ['/api/v1/phone/parse', 'Return structured phone-number components and formats.', 'phone'],
            ['/api/v1/phone/validate', 'Validate format and report numbering-plan availability.', 'phone'],
            ['/api/v1/phone/operator', 'Detect the mobile operator from the range prefix.', 'phone'],
          ],
        },
      },
      routeSection({
        id: 'phone-parse-route',
        title: 'GET /api/v1/phone/parse',
        description: 'Use parse when you need a canonical normalized number plus reusable formatting for storage or UI.',
        params: [['phone', 'Yes', 'Local or international Angolan number, such as `923456789` or `+244923456789`.']],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/phone/parse?phone=%2B244923456789"',
        success: `{
  "normalized": "+244923456789",
  "countryCode": "+244",
  "nationalNumber": "923456789",
  "internationalFormat": "+244 923 456 789",
  "nationalFormat": "923 456 789",
  "isMobile": true,
  "type": "mobile",
  "prefix": "92",
  "subscriberNumber": "3456789",
  "operator": {
    "code": "UNITEL",
    "name": "Unitel",
    "prefix": "92",
    "prefixes": ["92", "93", "94"]
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_PHONE",
    "message": "Angolan phone numbers must contain 9 national digits.",
    "field": "phone",
    "length": 6
  }
}`,
      }),
      routeSection({
        id: 'phone-validate-route',
        title: 'GET /api/v1/phone/validate',
        description: 'Use validate when you need a pass/fail result plus numbering-plan availability information.',
        params: [['phone', 'Yes', 'Local or international Angolan phone number.']],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/phone/validate?phone=952345678"',
        success: `{
  "isValid": true,
  "normalized": "+244952345678",
  "type": "mobile",
  "operator": {
    "code": "AFRICELL",
    "name": "Africell",
    "prefix": "95",
    "prefixes": ["95"]
  },
  "availability": {
    "type": "numbering-plan",
    "status": "allocated-range",
    "canConfirmLiveSubscriber": false
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_PHONE",
    "message": "The \\"phone\\" query parameter is required.",
    "field": "phone"
  }
}`,
        note: 'Availability is based on known Angolan numbering ranges. It does not confirm live subscriber reachability.',
      }),
      routeSection({
        id: 'phone-operator-route',
        title: 'GET /api/v1/phone/operator',
        description: 'Use operator when you need only the operator lookup and not the rest of the parsed phone payload.',
        params: [['phone', 'Yes', 'Local or international Angolan phone number.']],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/phone/operator?phone=912345678"',
        success: `{
  "phone": "912345678",
  "operator": {
    "code": "MOVICEL",
    "name": "Movicel",
    "prefix": "91",
    "prefixes": ["91", "99"]
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_PHONE",
    "message": "Angolan phone numbers must contain 9 national digits.",
    "field": "phone",
    "length": 4
  }
}`,
      }),
    ],
    relatedSlugs: ['validation', 'address-geo', 'examples'],
  },
  'address-geo': {
    slug: 'address-geo',
    label: 'Address & Geo',
    description: 'Normalize Angolan addresses and read provinces, municipalities, and communes.',
    eyebrow: 'Category',
    title: 'Standardize Angolan addresses and query the location registry.',
    intro:
      'Address normalization and suggestion are backed by a curated Angola geo registry. The geo routes return provinces, municipalities, and commune data that can drive admin forms and autocomplete flows.',
    summaryCards: [
      { label: 'Routes', value: '5 GET' },
      { label: 'Geo levels', value: 'Province to commune' },
      { label: 'Autocomplete', value: 'bairro + commune + municipality' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Routes in this family',
        table: {
          columns: ['Route', 'Purpose', 'Key query'],
          rows: [
            ['/api/v1/address/normalize', 'Clean and structure a free-text Angolan address.', 'address'],
            ['/api/v1/address/suggest', 'Suggest bairros, communes, or municipalities.', 'q, type, province, municipality'],
            ['/api/v1/geo/provinces', 'List all provinces in Angola.', 'none'],
            ['/api/v1/geo/municipalities', 'List municipalities, optionally filtered by province.', 'province'],
            ['/api/v1/geo/communes', 'List communes for a municipality.', 'municipality, optional province'],
          ],
        },
      },
      routeSection({
        id: 'address-normalize-route',
        title: 'GET /api/v1/address/normalize',
        description: 'Use normalize to clean a free-text address before persisting it or matching it against internal records.',
        params: [['address', 'Yes', 'Free-text Angolan address. Common abbreviations such as `prov.` and `mun.` are expanded automatically.']],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/address/normalize?address=Benfica,%20Luanda"',
        success: `{
  "input": "Benfica, Luanda",
  "normalized": "Benfica, Luanda",
  "components": {
    "bairro": "Benfica",
    "commune": "Benfica",
    "municipality": "Belas",
    "province": "Luanda"
  },
  "diagnostics": {
    "provinceMatched": true,
    "municipalityMatched": true,
    "communeMatched": true,
    "bairroMatched": true
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_ADDRESS",
    "message": "The \\"address\\" query parameter is required.",
    "field": "address"
  }
}`,
      }),
      routeSection({
        id: 'address-suggest-route',
        title: 'GET /api/v1/address/suggest',
        description: 'Use suggest to drive autocomplete fields for bairros, communes, municipalities, and provinces.',
        params: [
          ['q', 'Yes', 'Search fragment.'],
          ['type', 'No', 'Optional filter: `bairro`, `commune`, `municipality`, or `province`.'],
          ['province', 'No', 'Optional province filter.'],
          ['municipality', 'No', 'Optional municipality filter.'],
          ['limit', 'No', 'Maximum number of suggestions to return.'],
        ],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/address/suggest?q=tal&type=municipality&province=Luanda"',
        success: `{
  "query": "tal",
  "suggestions": [
    {
      "type": "municipality",
      "label": "Talatona",
      "province": "Luanda",
      "municipality": "Talatona"
    }
  ]
}`,
        error: `{
  "error": {
    "code": "MISSING_QUERY_PARAMETER",
    "message": "The \\"q\\" query parameter is required.",
    "field": "q"
  }
}`,
      }),
      routeSection({
        id: 'geo-provinces-route',
        title: 'GET /api/v1/geo/provinces',
        description: 'Use provinces as the top-level registry feed for location selectors and administrative filtering.',
        params: [],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/geo/provinces"',
        success: `{
  "country": "AO",
  "countryName": "Angola",
  "provinces": [
    {
      "name": "Luanda",
      "slug": "luanda",
      "capital": "Luanda",
      "municipalityCount": 16
    }
  ]
}`,
        error: `{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Unexpected error while listing provinces."
  }
}`,
      }),
      routeSection({
        id: 'geo-municipalities-route',
        title: 'GET /api/v1/geo/municipalities',
        description: 'Use municipalities to populate second-level location selectors, with or without a province filter.',
        params: [['province', 'No', 'Optional province name used to filter the list.']],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/geo/municipalities?province=Luanda"',
        success: `{
  "province": "Luanda",
  "municipalities": [
    {
      "name": "Talatona",
      "slug": "talatona",
      "province": "Luanda",
      "communeCount": 2
    }
  ]
}`,
        error: `{
  "error": {
    "code": "PROVINCE_NOT_FOUND",
    "message": "No Angolan province matched the supplied query.",
    "field": "province",
    "value": "Atlantis"
  }
}`,
      }),
      routeSection({
        id: 'geo-communes-route',
        title: 'GET /api/v1/geo/communes',
        description: 'Use communes when a municipality is already selected and you need the next administrative level.',
        params: [
          ['municipality', 'Yes', 'Municipality name to expand.'],
          ['province', 'No', 'Optional province name used to disambiguate repeated municipality labels.'],
        ],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/geo/communes?municipality=Talatona&province=Luanda"',
        success: `{
  "municipality": "Talatona",
  "province": "Luanda",
  "coverage": "curated",
  "communes": [
    { "name": "Cidade Universitaria", "slug": "cidade-universitaria" },
    { "name": "Talatona", "slug": "talatona" }
  ]
}`,
        error: `{
  "error": {
    "code": "MISSING_QUERY_PARAMETER",
    "message": "The \\"municipality\\" query parameter is required.",
    "field": "municipality"
  }
}`,
        note: 'Some municipalities use curated commune detail, while others currently expose seat-only coverage.',
      }),
    ],
    relatedSlugs: ['phone', 'calendar', 'examples'],
  },
  calendar: {
    slug: 'calendar',
    label: 'Calendar',
    description: 'Angolan public holidays and business-day calculations.',
    eyebrow: 'Category',
    title: 'Work with holidays, working days, and business-day offsets.',
    intro:
      'The calendar family returns official fixed and movable holidays plus business-day calculations useful for payroll, invoicing, and delivery scheduling.',
    summaryCards: [
      { label: 'Routes', value: '3 GET' },
      { label: 'Holiday model', value: 'Fixed + movable' },
      { label: 'Core use', value: 'Business-day math' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Routes in this family',
        table: {
          columns: ['Route', 'Purpose', 'Key query'],
          rows: [
            ['/api/v1/calendar/holidays', 'Return public holidays for a year.', 'year'],
            ['/api/v1/calendar/working-days', 'Count working days between two dates.', 'from, to'],
            ['/api/v1/calendar/add-working-days', 'Move a date forward or backward by working days.', 'date, days'],
          ],
        },
      },
      routeSection({
        id: 'calendar-holidays-route',
        title: 'GET /api/v1/calendar/holidays',
        description: 'Use holidays to obtain the supported Angola public-holiday schedule for a given year.',
        params: [['year', 'No', 'Optional calendar year. Defaults to the current year.']],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/calendar/holidays?year=2026"',
        success: `{
  "year": 2026,
  "holidays": [
    {
      "date": "2026-02-16",
      "name": "Carnival Holiday",
      "localName": "Tolerancia de Ponto de Carnaval",
      "category": "movable"
    },
    {
      "date": "2026-02-17",
      "name": "Carnival",
      "localName": "Carnaval",
      "category": "movable"
    }
  ]
}`,
        error: `{
  "error": {
    "code": "INVALID_YEAR",
    "message": "The \\"year\\" query parameter must be an integer between 2000 and 2100.",
    "field": "year",
    "value": 1800
  }
}`,
      }),
      routeSection({
        id: 'calendar-working-days-route',
        title: 'GET /api/v1/calendar/working-days',
        description: 'Use working-days to count business days between two dates while excluding weekends and supported Angola holidays.',
        params: [
          ['from', 'Yes', 'Start date in `YYYY-MM-DD` format.'],
          ['to', 'Yes', 'End date in `YYYY-MM-DD` format.'],
        ],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/calendar/working-days?from=2026-03-20&to=2026-03-24"',
        success: `{
  "from": "2026-03-20",
  "to": "2026-03-24",
  "workingDays": 2,
  "excludedWeekendDays": 2,
  "excludedHolidayDays": 1
}`,
        error: `{
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "The \\"from\\" date must be earlier than or equal to the \\"to\\" date.",
    "from": "2026-03-25",
    "to": "2026-03-24"
  }
}`,
      }),
      routeSection({
        id: 'calendar-add-working-days-route',
        title: 'GET /api/v1/calendar/add-working-days',
        description: 'Use add-working-days to move a base date forward or backward according to the supported working-day calendar.',
        params: [
          ['date', 'Yes', 'Base date in `YYYY-MM-DD` format.'],
          ['days', 'Yes', 'Signed integer representing the working-day offset.'],
        ],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/calendar/add-working-days?date=2026-03-20&days=1"',
        success: `{
  "inputDate": "2026-03-20",
  "days": 1,
  "resultDate": "2026-03-24",
  "direction": "forward"
}`,
        error: `{
  "error": {
    "code": "INVALID_INTEGER",
    "message": "The \\"days\\" query parameter must be an integer.",
    "field": "days",
    "value": "1.5"
  }
}`,
      }),
    ],
    relatedSlugs: ['time', 'finance', 'examples'],
  },
  finance: {
    slug: 'finance',
    label: 'Finance',
    description: 'VAT, invoice totals, and inflation adjustments for Angolan money flows.',
    eyebrow: 'Category',
    title: 'Calculate VAT, invoice totals, and inflation-adjusted values.',
    intro:
      'Finance endpoints provide deterministic calculations that can be used in back-office systems, quoted estimates, and reporting tools. They return both the derived values and the basis used to reach them.',
    summaryCards: [
      { label: 'Routes', value: '3 GET' },
      { label: 'Currency', value: 'AOA-first' },
      { label: 'Invoice input', value: 'JSON query payload' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Routes in this family',
        table: {
          columns: ['Route', 'Purpose', 'Key query'],
          rows: [
            ['/api/v1/finance/vat', 'Split or build VAT-inclusive totals.', 'amount, rate, inclusive'],
            ['/api/v1/finance/invoice-total', 'Compute invoice totals from line items.', 'lines, discount, discountType'],
            ['/api/v1/finance/inflation-adjust', 'Adjust values across years using the Angola CPI series.', 'amount, from, to'],
          ],
        },
      },
      routeSection({
        id: 'finance-vat-route',
        title: 'GET /api/v1/finance/vat',
        description: 'Use VAT to split gross totals into net-plus-tax or to build gross totals from a net amount.',
        params: [
          ['amount', 'Yes', 'Base amount to evaluate.'],
          ['rate', 'No', 'Tax rate percentage. Defaults to 14.'],
          ['inclusive', 'No', 'When `true`, treats amount as VAT-inclusive. When `false`, treats amount as net.'],
        ],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/finance/vat?amount=114000&inclusive=true"',
        success: `{
  "amount": 114000,
  "rate": 14,
  "inclusive": true,
  "netAmount": 100000,
  "vatAmount": 14000,
  "grossAmount": 114000
}`,
        error: `{
  "error": {
    "code": "INVALID_RATE",
    "message": "Tax rates must be between 0 and 100.",
    "field": "rate",
    "value": 140
  }
}`,
      }),
      routeSection({
        id: 'finance-invoice-total-route',
        title: 'GET /api/v1/finance/invoice-total',
        description: 'Use invoice-total to compute invoice totals from encoded line items without duplicating pricing math in each client.',
        params: [
          ['lines', 'Yes', 'JSON array string with `description`, `quantity`, `unitPrice`, and optional `vatRate`.'],
          ['discount', 'No', 'Discount amount or percent, depending on `discountType`.'],
          ['discountType', 'No', 'Either `amount` or `percent`.'],
        ],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/finance/invoice-total?lines=%5B%7B%22description%22%3A%22Service%22%2C%22quantity%22%3A1%2C%22unitPrice%22%3A100000%2C%22vatRate%22%3A14%7D%5D&discount=10&discountType=percent"',
        success: `{
  "currency": "AOA",
  "discountType": "percent",
  "subtotal": 100000,
  "discountAmount": 10000,
  "taxableBase": 90000,
  "vatTotal": 12600,
  "grandTotal": 102600
}`,
        error: `{
  "error": {
    "code": "INVALID_JSON",
    "message": "The \\"lines\\" query parameter must be a valid JSON array.",
    "field": "lines"
  }
}`,
      }),
      routeSection({
        id: 'finance-inflation-route',
        title: 'GET /api/v1/finance/inflation-adjust',
        description: 'Use inflation-adjust to compare nominal values across supported Angola CPI years.',
        params: [
          ['amount', 'Yes', 'Original nominal amount.'],
          ['from', 'Yes', 'Source date or year string. The first four digits are used as the CPI year.'],
          ['to', 'Yes', 'Target date or year string. The first four digits are used as the CPI year.'],
        ],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/finance/inflation-adjust?amount=100000&from=2020-01-01&to=2025-01-01"',
        success: `{
  "currency": "AOA",
  "amount": 100000,
  "fromYear": 2020,
  "toYear": 2025,
  "inflationFactor": 2.5642,
  "adjustedAmount": 256420,
  "source": "Curated annual Angola CPI index series."
}`,
        error: `{
  "error": {
    "code": "UNSUPPORTED_CPI_YEAR",
    "message": "Inflation adjustment is available for Angola annual CPI years from 2019 through 2025.",
    "fromYear": 2010,
    "toYear": 2025
  }
}`,
        note: 'Persist the calculation year range whenever the adjusted amount is used in reporting or pricing flows.',
      }),
    ],
    relatedSlugs: ['salary', 'documents', 'examples'],
  },
  salary: {
    slug: 'salary',
    label: 'Salary',
    description: 'Estimate net salary, gross salary, and employer cost under Angola payroll assumptions.',
    eyebrow: 'Category',
    title: 'Run Angola payroll estimates for employee and employer views.',
    intro:
      'The salary family applies internal Angola payroll assumptions for employee social security, employer social security, and employment-income withholding tables for supported years.',
    summaryCards: [
      { label: 'Routes', value: '3 GET' },
      { label: 'Years', value: '2025 and 2026' },
      { label: 'Outputs', value: 'Net, gross, employer cost' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Routes in this family',
        table: {
          columns: ['Route', 'Purpose', 'Key query'],
          rows: [
            ['/api/v1/salary/net', 'Estimate take-home salary from gross salary.', 'gross, year'],
            ['/api/v1/salary/gross', 'Estimate the required gross salary for a target net.', 'net, year'],
            ['/api/v1/salary/employer-cost', 'Estimate employer cost including contributions.', 'gross, year'],
          ],
        },
      },
      routeSection({
        id: 'salary-net-route',
        title: 'GET /api/v1/salary/net',
        description: 'Use net when your source value is the gross salary and you want the estimated take-home amount.',
        params: [
          ['gross', 'Yes', 'Gross monthly salary.'],
          ['year', 'No', 'Supported tax year. Currently `2025` or `2026`. Defaults to `2026`.'],
        ],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/salary/net?gross=500000&year=2026"',
        success: `{
  "currency": "AOA",
  "year": 2026,
  "grossSalary": 500000,
  "taxableIncome": 485000,
  "employeeSocialSecurity": 15000,
  "irtRate": 16,
  "irtTaxAmount": 52100,
  "netSalary": 432900,
  "employerContribution": 40000,
  "assumptions": ["Applies monthly employment-income withholding for Angola."]
}`,
        error: `{
  "error": {
    "code": "UNSUPPORTED_TAX_YEAR",
    "message": "Supported salary-tax years are 2025 and 2026.",
    "year": 2024
  }
}`,
      }),
      routeSection({
        id: 'salary-gross-route',
        title: 'GET /api/v1/salary/gross',
        description: 'Use gross when the target value is net pay and you need the approximate gross salary required to reach it.',
        params: [
          ['net', 'Yes', 'Desired net monthly salary.'],
          ['year', 'No', 'Supported tax year. Defaults to `2026`.'],
        ],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/salary/gross?net=432900&year=2026"',
        success: `{
  "currency": "AOA",
  "year": 2026,
  "targetNetSalary": 432900,
  "grossSalary": 500000,
  "employeeSocialSecurity": 15000,
  "irtTaxAmount": 52100,
  "netSalary": 432900
}`,
        error: `{
  "error": {
    "code": "INVALID_NUMBER",
    "message": "The \\"net\\" query parameter must be a non-negative number.",
    "field": "net",
    "value": "-1"
  }
}`,
      }),
      routeSection({
        id: 'salary-employer-cost-route',
        title: 'GET /api/v1/salary/employer-cost',
        description: 'Use employer-cost when payroll planning needs the company-side contribution on top of the employee gross salary.',
        params: [
          ['gross', 'Yes', 'Gross monthly salary.'],
          ['year', 'No', 'Supported tax year. Defaults to `2026`.'],
        ],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/salary/employer-cost?gross=500000&year=2026"',
        success: `{
  "currency": "AOA",
  "year": 2026,
  "grossSalary": 500000,
  "employerContribution": 40000,
  "totalEmployerCost": 540000
}`,
        error: `{
  "error": {
    "code": "INVALID_NUMBER",
    "message": "The \\"gross\\" query parameter must be a non-negative number.",
    "field": "gross",
    "value": "abc"
  }
}`,
        note: 'These endpoints are scenario calculators, not payroll-filing services. Surface the assumptions in any UI that shows the result.',
      }),
    ],
    relatedSlugs: ['finance', 'time', 'examples'],
  },
  time: {
    slug: 'time',
    label: 'Time',
    description: 'Current local time, timezone conversion, and business-hours checks.',
    eyebrow: 'Category',
    title: 'Work with timezones and local business-hour checks.',
    intro:
      'Time endpoints give you a small timezone utility layer without pulling a full scheduling platform into your application.',
    summaryCards: [
      { label: 'Routes', value: '3 GET' },
      { label: 'Default zone', value: 'Africa/Luanda' },
      { label: 'Business window', value: '08:00 to 17:00' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Routes in this family',
        table: {
          columns: ['Route', 'Purpose', 'Key query'],
          rows: [
            ['/api/v1/time/now', 'Return the current time for a timezone.', 'timezone'],
            ['/api/v1/time/convert', 'Convert a datetime from one timezone to another.', 'datetime, from, to'],
            ['/api/v1/time/business-hours', 'Check whether a datetime falls inside business hours.', 'datetime, timezone, start, end'],
          ],
        },
      },
      routeSection({
        id: 'time-now-route',
        title: 'GET /api/v1/time/now',
        description: 'Use now when you need the current local time for a specific IANA timezone.',
        params: [['timezone', 'No', 'IANA timezone. Defaults to `Africa/Luanda`.']],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/time/now?timezone=Africa/Luanda"',
        success: `{
  "iso": "2026-03-23T18:45:00",
  "timezone": "Africa/Luanda",
  "offset": "GMT+1",
  "components": {
    "year": 2026,
    "month": 3,
    "day": 23,
    "hour": 18,
    "minute": 45,
    "second": 0,
    "weekday": 1
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_TIMEZONE",
    "message": "The supplied timezone is not supported by the runtime.",
    "field": "timezone",
    "value": "Mars/Base"
  }
}`,
      }),
      routeSection({
        id: 'time-convert-route',
        title: 'GET /api/v1/time/convert',
        description: 'Use convert to transform a local or absolute datetime from one timezone into another.',
        params: [
          ['datetime', 'Yes', 'ISO datetime. If no offset is provided, the route interprets it in the source timezone.'],
          ['from', 'Yes', 'Source IANA timezone.'],
          ['to', 'Yes', 'Target IANA timezone.'],
        ],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/time/convert?datetime=2026-03-23T10:00:00&from=Africa/Luanda&to=UTC"',
        success: `{
  "input": {
    "datetime": "2026-03-23T10:00:00",
    "timezone": "Africa/Luanda"
  },
  "source": {
    "iso": "2026-03-23T10:00:00",
    "timezone": "Africa/Luanda"
  },
  "target": {
    "iso": "2026-03-23T09:00:00",
    "timezone": "UTC"
  }
}`,
        error: `{
  "error": {
    "code": "INVALID_DATETIME",
    "message": "Date-times without an offset must use YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss format.",
    "field": "datetime",
    "value": "23/03/2026 10:00"
  }
}`,
      }),
      routeSection({
        id: 'time-business-hours-route',
        title: 'GET /api/v1/time/business-hours',
        description: 'Use business-hours before sending notifications, calls, or reminders that should respect a local office window.',
        params: [
          ['datetime', 'Yes', 'ISO datetime to evaluate.'],
          ['timezone', 'No', 'IANA timezone. Defaults to `Africa/Luanda`.'],
          ['start', 'No', 'Business-day start time in `HH:mm`. Defaults to `08:00`.'],
          ['end', 'No', 'Business-day end time in `HH:mm`. Defaults to `17:00`.'],
        ],
        usage: 'curl -s "https://utils.api.orb3x.com/api/v1/time/business-hours?datetime=2026-03-23T09:30:00&timezone=Africa/Luanda"',
        success: `{
  "timezone": "Africa/Luanda",
  "businessHours": {
    "start": "08:00",
    "end": "17:00",
    "timezone": "Africa/Luanda"
  },
  "isBusinessDay": true,
  "isWithinBusinessHours": true
}`,
        error: `{
  "error": {
    "code": "INVALID_TIME",
    "message": "The \\"start\\" query parameter must use HH:mm format.",
    "field": "start",
    "value": "8am"
  }
}`,
      }),
    ],
    relatedSlugs: ['calendar', 'documents', 'examples'],
  },
  documents: {
    slug: 'documents',
    label: 'Documents',
    description: 'Generate invoice, receipt, and contract PDFs from JSON payloads.',
    eyebrow: 'Category',
    title: 'Generate transaction and contract PDFs on demand.',
    intro:
      'The document routes convert compact JSON payloads into synchronous PDF files that can be downloaded directly or stored by your own application.',
    summaryCards: [
      { label: 'Routes', value: '3 POST' },
      { label: 'Format', value: 'PDF attachments' },
      { label: 'Best for', value: 'Internal workflows' },
    ],
    sections: [
      {
        id: 'catalog',
        title: 'Routes in this family',
        table: {
          columns: ['Route', 'Purpose', 'Key body fields'],
          rows: [
            ['/api/v1/documents/invoice', 'Generate an invoice PDF.', 'seller, buyer, items'],
            ['/api/v1/documents/receipt', 'Generate a receipt PDF.', 'receivedFrom, amount'],
            ['/api/v1/documents/contract', 'Generate a contract PDF.', 'parties, clauses'],
          ],
        },
      },
      routeSection({
        id: 'documents-invoice-route',
        title: 'POST /api/v1/documents/invoice',
        description: 'Use invoice when you need a synchronous PDF invoice from a compact JSON payload.',
        params: [
          ['seller', 'Yes', 'Seller object with at least `name`.'],
          ['buyer', 'Yes', 'Buyer object with at least `name`.'],
          ['items', 'Yes', 'Array of items with `description`, `quantity`, `unitPrice`, and optional `vatRate`.'],
          ['invoiceNumber / issueDate / dueDate / notes', 'No', 'Optional invoice metadata fields.'],
        ],
        usage: `curl -s -X POST https://utils.api.orb3x.com/api/v1/documents/invoice \\
  -H "Content-Type: application/json" \\
  -d '{"seller":{"name":"Orb3x, Lda"},"buyer":{"name":"Cliente Exemplo"},"items":[{"description":"Service","quantity":1,"unitPrice":100000,"vatRate":14}]}' \\
  --output invoice.pdf`,
        success: `HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="invoice.pdf"`,
        error: `{
  "error": {
    "code": "INVALID_INVOICE_PAYLOAD",
    "message": "Invoice payload must include seller, buyer, and at least one item."
  }
}`,
        successLanguage: 'bash',
      }),
      routeSection({
        id: 'documents-receipt-route',
        title: 'POST /api/v1/documents/receipt',
        description: 'Use receipt for payment acknowledgements that only need the payer and the amount.',
        params: [
          ['receivedFrom', 'Yes', 'Party object with at least `name`.'],
          ['amount', 'Yes', 'Received amount.'],
          ['receiptNumber / issueDate / reason / paymentMethod / notes', 'No', 'Optional receipt metadata fields.'],
        ],
        usage: `curl -s -X POST https://utils.api.orb3x.com/api/v1/documents/receipt \\
  -H "Content-Type: application/json" \\
  -d '{"receivedFrom":{"name":"Cliente Exemplo"},"amount":100000}' \\
  --output receipt.pdf`,
        success: `HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="receipt.pdf"`,
        error: `{
  "error": {
    "code": "INVALID_RECEIPT_PAYLOAD",
    "message": "Receipt payload must include receivedFrom and amount."
  }
}`,
        successLanguage: 'bash',
      }),
      routeSection({
        id: 'documents-contract-route',
        title: 'POST /api/v1/documents/contract',
        description: 'Use contract when you need a basic agreement PDF generated from parties and clauses.',
        params: [
          ['parties', 'Yes', 'Array with at least two party objects.'],
          ['clauses', 'Yes', 'Array of contract clauses.'],
          ['title / contractNumber / issueDate / notes', 'No', 'Optional contract metadata fields.'],
        ],
        usage: `curl -s -X POST https://utils.api.orb3x.com/api/v1/documents/contract \\
  -H "Content-Type: application/json" \\
  -d '{"parties":[{"name":"Orb3x, Lda"},{"name":"Cliente Exemplo"}],"clauses":["The provider delivers the service.","The client pays within 15 days."]}' \\
  --output contract.pdf`,
        success: `HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="contract.pdf"`,
        error: `{
  "error": {
    "code": "INVALID_CONTRACT_PAYLOAD",
    "message": "Contract payload must include at least two parties and one clause."
  }
}`,
        successLanguage: 'bash',
        note: 'Document generation is intentionally narrow. Persist the source JSON yourself if you need auditability or re-generation.',
      }),
    ],
    relatedSlugs: ['finance', 'validation', 'examples'],
  },
  'nif-verification': {
    slug: 'nif-verification',
    label: 'NIF Verification',
    description: 'Lookup behavior, payload fields, and failure modes for taxpayer verification.',
    eyebrow: 'Endpoint',
    title: 'Look up taxpayer details from a normalized NIF value.',
    intro:
      'The NIF route accepts an Angolan tax identifier in the path, validates it, requests data from the public tax portal, and returns a parsed JSON response.',
    endpoint: {
      method: 'GET',
      path: '/api/nif/{nif}',
      detail: 'The path parameter is trimmed, uppercased, and limited to letters and digits before the lookup is attempted.',
    },
    summaryCards: [
      { label: 'Input type', value: 'Path parameter' },
      { label: 'Upstream source', value: 'Angolan tax portal' },
      { label: 'Primary failure', value: 'Portal availability' },
    ],
    sections: [
      {
        id: 'success-shape',
        title: 'Success payload',
        code: {
          label: '200 response',
          language: 'json',
          content: `{
  "NIF": "004813023LA040",
  "Name": "EMPRESA EXEMPLO, LDA",
  "Type": "Pessoa Colectiva",
  "Status": "Activo",
  "Defaulting": "Não",
  "VATRegime": "Regime Geral",
  "isTaxResident": true
}`,
        },
      },
      {
        id: 'field-glossary',
        title: 'Returned fields',
        table: {
          columns: ['Field', 'Meaning'],
          rows: [
            ['NIF', 'Normalized identifier used for the lookup and echoed in the response.'],
            ['Name', 'Registered taxpayer name parsed from the portal response.'],
            ['Type', 'Taxpayer classification returned by the source portal.'],
            ['Status', 'Current taxpayer status string.'],
            ['Defaulting', 'Whether the taxpayer is flagged as in default.'],
            ['VATRegime', 'VAT regime text returned by the portal.'],
            ['isTaxResident', 'Boolean derived from the resident or non-resident marker in the result section.'],
          ],
        },
      },
      {
        id: 'error-cases',
        title: 'What can go wrong',
        bullets: [
          'An empty or invalid path parameter returns a 400 INVALID_NIF error before any upstream call is made.',
          'If the tax portal reports no result, the route returns a 404 NIF_NOT_FOUND response.',
          'Malformed or structurally changed HTML from the portal returns a 502 UNPARSEABLE_RESPONSE error.',
          'Network and TLS issues are surfaced as upstream availability errors, with an internal fallback for certificate edge cases.',
        ],
        note:
          'Because the upstream source is HTML, schema changes on the portal are the biggest long-term maintenance risk. Keep a contract test around the parser.',
      },
      {
        id: 'integration-tips',
        title: 'Integration tips',
        bullets: [
          'Normalize spaces and casing in user-entered identifiers before you build the route path.',
          'Treat this endpoint as live verification rather than a permanent source of record; portal data can change over time.',
          'Store the raw lookup result alongside your own audit context when the output informs compliance actions.',
          'Show clear user messaging when the portal is temporarily unavailable instead of turning upstream failures into generic validation errors.',
        ],
      },
    ],
    relatedSlugs: ['api-reference', 'getting-started', 'examples'],
  },
  translation: {
    slug: 'translation',
    label: 'Translation',
    description: 'Request body rules, language handling, and practical integration guidance.',
    eyebrow: 'Endpoint',
    title: 'Translate text with explicit validation and source-language reporting.',
    intro:
      "The translation route accepts JSON input, validates language codes, calls Google's public translate endpoint, and returns translated text with the detected or supplied source language.",
    endpoint: {
      method: 'POST',
      path: '/api/translate',
      detail: 'Send JSON with text, target language code, and an optional source language code. If source is omitted, the route uses automatic detection.',
    },
    summaryCards: [
      { label: 'Input type', value: 'JSON body' },
      { label: 'Target validation', value: '2-12 chars' },
      { label: 'Auto detection', value: 'Enabled by default' },
    ],
    sections: [
      {
        id: 'request-shape',
        title: 'Request payload',
        code: {
          label: 'POST body',
          language: 'json',
          content: `{
  "text": "Olá mundo",
  "to": "en",
  "from": "pt"
}`,
        },
        bullets: [
          'text is required and trimmed before dispatch.',
          'to is required and must match a simple lowercase language-code pattern.',
          'from is optional; when absent, the route uses auto detection upstream.',
          'Invalid JSON returns a 400 response before any translation work starts.',
        ],
      },
      {
        id: 'success-shape',
        title: 'Success payload',
        code: {
          label: '200 response',
          language: 'json',
          content: `{
  "translatedText": "Hello world",
  "sourceLanguage": "pt",
  "targetLanguage": "en",
  "status": true,
  "message": ""
}`,
        },
      },
      {
        id: 'failure-modes',
        title: 'Common failure modes',
        table: {
          columns: ['Code', 'Cause', 'Suggested handling'],
          rows: [
            ['INVALID_TEXT', 'The text field is missing or blank.', 'Block submission and prompt the user for content.'],
            ['INVALID_LANGUAGE', 'Source or target language code is missing or malformed.', 'Fix the payload before retrying.'],
            ['UPSTREAM_TIMEOUT', 'Translation provider exceeded the timeout window.', 'Retry with backoff if the user flow permits.'],
            ['UPSTREAM_BAD_RESPONSE', 'Provider returned a non-200 response.', 'Degrade gracefully or queue for retry.'],
            ['UNPARSEABLE_RESPONSE', 'Provider JSON could not be parsed into translated text.', 'Alert and fall back to the original text.'],
          ],
        },
      },
      {
        id: 'best-practices',
        title: 'Usage notes',
        bullets: [
          'Preserve the original text in your own data model so editors can compare source and translated copy later.',
          'Cache your own successful translations when reuse is acceptable; the route itself intentionally does not cache responses.',
          'Prefer explicit source language codes in batch workflows where you already know the input language.',
          'Use sourceLanguage from the response to flag unexpected detection outcomes in moderation or support tools.',
        ],
      },
    ],
    relatedSlugs: ['api-reference', 'examples', 'currency-exchange'],
  },
  'currency-exchange': {
    slug: 'currency-exchange',
    label: 'Currency Exchange',
    description: 'Base-rate lookups, amount conversions, and payload semantics for FX data.',
    eyebrow: 'Endpoint',
    title: 'Return unit rates or converted totals from the same endpoint.',
    intro:
      'The currency route looks up metadata and rate tables for a base currency, then optionally multiplies those rates by an amount query parameter.',
    endpoint: {
      method: 'GET',
      path: '/api/exchange/{base}',
      detail: 'The path parameter identifies the base currency. Add ?amount=value when you also want precomputed convertedRates in the response.',
    },
    summaryCards: [
      { label: 'Input type', value: 'Path + query' },
      { label: 'Extended output', value: 'convertedRates' },
      { label: 'Primary risk', value: 'Upstream freshness' },
    ],
    sections: [
      {
        id: 'lookup-shape',
        title: 'Success payload without amount',
        code: {
          label: 'Unit-rate lookup',
          language: 'json',
          content: `{
  "currencyCode": "aoa",
  "currencyName": "Angolan kwanza",
  "currencySymbol": "Kz",
  "countryName": "Angola",
  "countryCode": "AO",
  "flagImage": "https://example.com/flags/ao.png",
  "ratesDate": "2026-03-22",
  "baseCurrency": "AOA",
  "unitRates": {
    "usd": 0.0011,
    "eur": 0.0010
  }
}`,
        },
      },
      {
        id: 'conversion-shape',
        title: 'Success payload with amount',
        code: {
          label: 'Lookup with conversion',
          language: 'json',
          content: `{
  "baseCurrency": "AOA",
  "amount": 1000000,
  "unitRates": {
    "usd": 0.0011
  },
  "convertedRates": {
    "usd": 1100
  }
}`,
        },
        bullets: [
          'amount is parsed as a number and must be zero or greater.',
          'convertedRates mirrors the keys from unitRates and multiplies each value by amount.',
          'baseCurrency is normalized to uppercase in the response even though the route accepts lowercase input.',
        ],
      },
      {
        id: 'metadata',
        title: 'Metadata fields',
        table: {
          columns: ['Field', 'Meaning'],
          rows: [
            ['currencyCode', 'Normalized base currency code from the upstream response.'],
            ['currencyName', 'Display name for the base currency.'],
            ['currencySymbol', 'Symbol associated with the base currency.'],
            ['countryName / countryCode', 'Country metadata tied to the base currency.'],
            ['flagImage', 'Flag asset URL returned by the upstream provider.'],
            ['ratesDate', 'Date attached to the upstream rate snapshot.'],
          ],
        },
      },
      {
        id: 'implementation-guidance',
        title: 'Implementation guidance',
        bullets: [
          'Use unitRates when you need full control over formatting, rounding, or downstream business calculations.',
          'Use convertedRates when the endpoint is feeding UI directly and you want to avoid duplicate math across clients.',
          'Guard against missing currencies in your UI because the upstream provider may not include every code in every snapshot.',
          'If you persist converted totals, also persist the ratesDate so reports remain auditable.',
        ],
      },
    ],
    relatedSlugs: ['api-reference', 'examples', 'translation'],
  },
  examples: {
    slug: 'examples',
    label: 'Examples',
    description: 'Practical cURL, Node.js, and TypeScript examples for production-like usage.',
    eyebrow: 'Implementation',
    title: 'Examples for calling the published routes.',
    intro:
      'The snippets below show cURL requests, matching Node.js fetch calls, and a typed TypeScript helper for the routes published in this repository.',
    summaryCards: [
      { label: 'Formats', value: 'cURL + Node.js' },
      { label: 'Client focus', value: 'Server-safe fetch' },
      { label: 'Error strategy', value: 'Code-aware handling' },
    ],
    sections: [
      {
        id: 'curl',
        title: 'cURL and Node.js examples',
        codes: makeCurlAndNodeCodeSamples(
          `curl -s https://utils.api.orb3x.com/api/nif/004813023LA040

curl -s -X POST https://utils.api.orb3x.com/api/translate \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Preciso de ajuda","to":"en"}'

curl -s "https://utils.api.orb3x.com/api/exchange/aoa?amount=250000"`,
          {
            curl: 'Terminal smoke tests (cURL)',
            node: 'Terminal smoke tests (Node.js)',
          },
        ),
      },
      {
        id: 'typescript',
        title: 'Typed TypeScript helper',
        code: {
          label: 'Shared client utility',
          language: 'ts',
          content: `type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
  code?: string;
  message?: string;
};

export async function callApi<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(error.error?.code ?? error.code ?? "REQUEST_FAILED");
  }

  return (await response.json()) as T;
}`,
        },
      },
      {
        id: 'workflow-patterns',
        title: 'Workflow patterns',
        bullets: [
          'Customer onboarding: verify the taxpayer record before activating an account in your back-office flow.',
          'Localization pipeline: translate user-facing content and store both the translated text and detected source language.',
          'Pricing dashboard: request base rates once, then use unitRates or convertedRates depending on how much control the UI needs.',
          'Support tooling: surface upstream error codes to internal agents so they can distinguish bad input from provider outages quickly.',
        ],
      },
      {
        id: 'production-hardening',
        title: 'Production hardening',
        bullets: [
          'Wrap calls in a shared client with typed success and error shapes.',
          'Emit metrics for timeout, bad response, not found, and invalid input rates separately.',
          'Keep retry logic close to the client boundary so product code does not reimplement it per feature.',
          'Record ratesDate and sourceLanguage when those fields matter for auditability or editorial review.',
        ],
      },
    ],
    relatedSlugs: ['getting-started', 'api-reference', 'translation'],
  },
};
