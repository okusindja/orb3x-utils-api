const CURRENCY_API_URL = "https://currency-rate-exchange-api.onrender.com";

export type CurrencyMetadata = {
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  countryName: string;
  countryCode: string;
  flagImage: string;
};

export type CurrencyLookupResult = CurrencyMetadata & {
  ratesDate: string;
  baseCurrency: string;
  unitRates: Record<string, number>;
};

export type CurrencyConversionResult = CurrencyLookupResult & {
  amount: number;
  convertedRates: Record<string, number>;
};

export class CurrencyError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "CurrencyError";
  }
}

export async function fetchCurrencyRates(rawBaseCurrency: string): Promise<CurrencyLookupResult> {
  const baseCurrency = sanitizeCurrencyCode(rawBaseCurrency);
  const url = `${CURRENCY_API_URL}/${encodeURIComponent(baseCurrency)}`;

  let response: Response;

  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "User-Agent":
          "Mozilla/5.0 (compatible; Orb3xUtils/1.0; +https://vercel.com)",
      },
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new CurrencyError(
        "The currency service did not respond in time.",
        504,
        "UPSTREAM_TIMEOUT",
      );
    }

    throw new CurrencyError(
      "The currency service could not be reached.",
      502,
      "UPSTREAM_UNAVAILABLE",
    );
  }

  if (response.status === 404) {
    throw new CurrencyError("Currency not found.", 404, "CURRENCY_NOT_FOUND");
  }

  if (!response.ok) {
    throw new CurrencyError(
      `The currency service returned HTTP ${response.status}.`,
      502,
      "UPSTREAM_BAD_RESPONSE",
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new CurrencyError(
      "The currency service returned invalid JSON.",
      502,
      "UNPARSEABLE_RESPONSE",
    );
  }

  return parseCurrencyPayload(payload, baseCurrency);
}

export function convertCurrencyRates(
  lookup: CurrencyLookupResult,
  rawAmount: string,
): CurrencyConversionResult {
  const amount = sanitizeAmount(rawAmount);
  const convertedRates = Object.fromEntries(
    Object.entries(lookup.unitRates).map(([code, unitRate]) => [
      code,
      normalizeNumber(unitRate * amount),
    ]),
  );

  return {
    ...lookup,
    amount,
    convertedRates,
  };
}

function parseCurrencyPayload(
  payload: unknown,
  baseCurrency: string,
): CurrencyLookupResult {
  if (!payload || typeof payload !== "object") {
    throw new CurrencyError(
      "The currency service response is malformed.",
      502,
      "UNPARSEABLE_RESPONSE",
    );
  }

  const response = payload as Record<string, unknown>;
  const rates = response.rates;

  if (!rates || typeof rates !== "object") {
    throw new CurrencyError(
      "The currency service did not include rate data.",
      502,
      "UNPARSEABLE_RESPONSE",
    );
  }

  const ratesRecord = rates as Record<string, unknown>;
  const date = typeof ratesRecord.date === "string" ? ratesRecord.date : "";
  const unitRates = ratesRecord[baseCurrency];

  if (!date || !unitRates || typeof unitRates !== "object") {
    throw new CurrencyError(
      "The currency service did not include the requested base currency rates.",
      502,
      "UNPARSEABLE_RESPONSE",
    );
  }

  const normalizedUnitRates = Object.fromEntries(
    Object.entries(unitRates as Record<string, unknown>).flatMap(([code, value]) =>
      typeof value === "number" && Number.isFinite(value) ? [[code, value]] : [],
    ),
  );

  if (Object.keys(normalizedUnitRates).length === 0) {
    throw new CurrencyError(
      "The currency service returned no usable rates.",
      502,
      "UNPARSEABLE_RESPONSE",
    );
  }

  return {
    currencyCode: readStringField(response.currencyCode, "currencyCode"),
    currencyName: readStringField(response.currencyName, "currencyName"),
    currencySymbol: readStringField(response.currencySymbol, "currencySymbol"),
    countryName: readStringField(response.countryName, "countryName"),
    countryCode: readStringField(response.countryCode, "countryCode"),
    flagImage: readStringField(response.flagImage, "flagImage"),
    ratesDate: date,
    baseCurrency: baseCurrency.toUpperCase(),
    unitRates: normalizedUnitRates,
  };
}

function readStringField(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new CurrencyError(
      `The currency service response is missing ${fieldName}.`,
      502,
      "UNPARSEABLE_RESPONSE",
    );
  }

  return value.trim();
}

export function sanitizeCurrencyCode(rawCurrencyCode: string): string {
  const code = rawCurrencyCode.trim().toLowerCase();

  if (!code) {
    throw new CurrencyError("The currency path parameter is required.", 400, "INVALID_CURRENCY");
  }

  if (!/^[a-z0-9-]{2,20}$/.test(code)) {
    throw new CurrencyError(
      "The currency path parameter is invalid.",
      400,
      "INVALID_CURRENCY",
    );
  }

  return code;
}

function sanitizeAmount(rawAmount: string): number {
  const amount = Number(rawAmount);

  if (!Number.isFinite(amount)) {
    throw new CurrencyError("The amount query parameter is invalid.", 400, "INVALID_AMOUNT");
  }

  if (amount < 0) {
    throw new CurrencyError(
      "The amount query parameter must be zero or greater.",
      400,
      "INVALID_AMOUNT",
    );
  }

  return amount;
}

function normalizeNumber(value: number): number {
  if (!Number.isFinite(value)) {
    return value;
  }

  return Number.parseFloat(value.toPrecision(15));
}
