const TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";

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

  const url = new URL(TRANSLATE_URL);
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", from);
  url.searchParams.set("tl", to);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

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

  if (!response.ok) {
    throw new TranslationError(
      `The translation service returned HTTP ${response.status}.`,
      502,
      "UPSTREAM_BAD_RESPONSE",
    );
  }

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

  const translatedText = extractTranslatedText(payload);
  const detectedSourceLanguage = extractDetectedSourceLanguage(payload, from);

  if (!translatedText) {
    throw new TranslationError(
      "The translation service returned an empty translation.",
      502,
      "UNPARSEABLE_RESPONSE",
    );
  }

  return {
    translatedText,
    sourceLanguage: detectedSourceLanguage,
    targetLanguage: to,
  };
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
