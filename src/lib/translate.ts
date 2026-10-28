const GOOGLE_ENDPOINTS = [
  { url: "https://translate.googleapis.com/translate_a/single", client: "gtx" },
  { url: "https://translate.google.com/translate_a/single", client: "gtx" },
  { url: "https://translate.google.com/translate_a/single", client: "dict-chrome-ex" },
];
const MYMEMORY_URL = "https://api.mymemory.translated.net/get";
const MYMEMORY_MAX_CHARS = 500;
const RETRY_DELAYS_MS = [400];

export type TranslateInput = {
  text: string;
  to: string;
  from?: string;
};

export type TranslateResult = {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
};

export class TranslationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "TranslationError";
  }
}

export async function translateText(input: TranslateInput): Promise<TranslateResult> {
  const text = input.text.trim();
  const to = sanitizeLanguageCode(input.to, "target");
  const from = input.from ? sanitizeLanguageCode(input.from, "source") : "auto";

  if (!text) {
    throw new TranslationError("The text field is required.", 400, "INVALID_TEXT");
  }

  let lastError: TranslationError | undefined;

  for (const endpoint of GOOGLE_ENDPOINTS) {
    try {
      const payload = await fetchGoogleTranslation(endpoint, text, from, to);
      const translatedText = extractTranslatedText(payload);

      if (!translatedText) {
        throw new TranslationError(
          "The translation service returned an empty translation.",
          502,
          "UNPARSEABLE_RESPONSE",
        );
      }

      return {
        translatedText,
        sourceLanguage: extractDetectedSourceLanguage(payload, from),
        targetLanguage: to,
      };
    } catch (error) {
      if (!(error instanceof TranslationError)) {
        throw error;
      }

      lastError = error;
    }
  }

  // The unofficial Google endpoints rate-limit shared serverless IPs (HTTP 429),
  // so fall back to MyMemory before surfacing the failure.
  if (text.length <= MYMEMORY_MAX_CHARS) {
    try {
      return await translateWithMyMemory(text, from, to);
    } catch (error) {
      if (!(error instanceof TranslationError)) {
        throw error;
      }
    }
  }

  throw lastError ?? new TranslationError(
    "The translation service could not be reached.",
    502,
    "UPSTREAM_UNAVAILABLE",
  );
}

async function fetchGoogleTranslation(
  endpoint: { url: string; client: string },
  text: string,
  from: string,
  to: string,
): Promise<unknown> {
  const url = new URL(endpoint.url);
  url.searchParams.set("client", endpoint.client);
  url.searchParams.set("sl", from);
  url.searchParams.set("tl", to);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const response = await fetchWithRetry(url);

  try {
    return await response.json();
  } catch {
    throw new TranslationError(
      "The translation service returned invalid JSON.",
      502,
      "UNPARSEABLE_RESPONSE",
    );
  }
}

async function translateWithMyMemory(
  text: string,
  from: string,
  to: string,
): Promise<TranslateResult> {
  const url = new URL(MYMEMORY_URL);
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `${from === "auto" ? "Autodetect" : from}|${to}`);

  const response = await fetchWithRetry(url);

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new TranslationError(
      "The translation service returned invalid JSON.",
      502,
      "UNPARSEABLE_RESPONSE",
    );
  }

  const translatedText = (
    payload as { responseData?: { translatedText?: unknown } } | null
  )?.responseData?.translatedText;

  if (typeof translatedText !== "string" || !translatedText.trim()) {
    throw new TranslationError(
      "The translation service returned an empty translation.",
      502,
      "UNPARSEABLE_RESPONSE",
    );
  }

  return {
    translatedText: translatedText.trim(),
    sourceLanguage: from,
    targetLanguage: to,
  };
}

async function fetchWithRetry(url: URL): Promise<Response> {
  let response: Response | undefined;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      response = await fetch(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json,text/plain,*/*",
          "User-Agent":
            "Mozilla/5.0 (compatible; Orb3xUtils/1.0; +https://vercel.com)",
        },
        signal: AbortSignal.timeout(8000),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new TranslationError(
          "The translation service did not respond in time.",
          504,
          "UPSTREAM_TIMEOUT",
        );
      }

      throw new TranslationError(
        "The translation service could not be reached.",
        502,
        "UPSTREAM_UNAVAILABLE",
      );
    }

    if (response.status !== 429 || attempt === RETRY_DELAYS_MS.length) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
  }

  if (!response || !response.ok) {
    throw new TranslationError(
      `The translation service returned HTTP ${response?.status}.`,
      502,
      "UPSTREAM_BAD_RESPONSE",
    );
  }

  return response;
}

function sanitizeLanguageCode(rawCode: string, label: "source" | "target"): string {
  const code = rawCode.trim().toLowerCase();

  if (!code) {
    throw new TranslationError(
      `The ${label} language code is required.`,
      400,
      "INVALID_LANGUAGE",
    );
  }

  if (!/^[a-z-]{2,12}$/.test(code)) {
    throw new TranslationError(
      `The ${label} language code is invalid.`,
      400,
      "INVALID_LANGUAGE",
    );
  }

  return code;
}

function extractTranslatedText(payload: unknown): string {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    return "";
  }

  return payload[0]
    .map((part) => {
      if (!Array.isArray(part) || typeof part[0] !== "string") {
        return "";
      }

      return part[0];
    })
    .join("")
    .trim();
}

function extractDetectedSourceLanguage(payload: unknown, fallback: string): string {
  if (Array.isArray(payload) && typeof payload[2] === "string" && payload[2].trim()) {
    return payload[2].trim().toLowerCase();
  }

  return fallback;
}
