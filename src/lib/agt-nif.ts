import { load } from "cheerio";
import https from "node:https";

const PORTAL_URL =
  "https://portaldocontribuinte.minfin.gov.ao/consultar-nif-do-contribuinte";

const RESULT_MARKER = "Resultado da Consulta";
const SECTION_END_MARKERS = [
  "Aviso",
  "Fale Connosco",
  "Contactos",
  "Perguntas Frequentes",
];

export type TaxVerificationResult = {
  nif: string;
  name: string;
  type: string;
  status: string;
  defaulting: string;
  vatRegime: string;
  isTaxResident: boolean;
};

export class PortalLookupError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "PortalLookupError";
  }
}

export function sanitizeNif(rawNif: string): string {
  const nif = rawNif.trim().toUpperCase().replace(/\s+/g, "");

  if (!nif) {
    throw new PortalLookupError("The NIF path parameter is required.", 400, "INVALID_NIF");
  }

  if (!/^[0-9A-Z]+$/.test(nif)) {
    throw new PortalLookupError(
      "The NIF path parameter must contain only letters and digits.",
      400,
      "INVALID_NIF",
    );
  }

  return nif;
}

export async function lookupTaxpayerByNif(
  rawNif: string,
): Promise<TaxVerificationResult> {
  const nif = sanitizeNif(rawNif);
  const url = `${PORTAL_URL}?nif=${encodeURIComponent(nif)}`;

  const response = await requestPortalLookup(url);

  if (response.status < 200 || response.status >= 300) {
    throw new PortalLookupError(
      `The tax portal returned HTTP ${response.status}.`,
      502,
      "UPSTREAM_BAD_RESPONSE",
    );
  }

  return parseTaxpayerLookupHtml(response.body, nif);
}

export function parseTaxpayerLookupHtml(
  html: string,
  fallbackNif?: string,
): TaxVerificationResult {
  const $ = load(html);
  $("script, style, noscript").remove();
  const documentText = normalizeWhitespace($("body").text());
  const knownError = detectKnownPortalError(documentText);

  if (knownError) {
    throw new PortalLookupError(knownError, 404, "NIF_NOT_FOUND");
  }

  const resultSection = sliceResultSection(documentText);

  const nif = extractField(resultSection, "NIF", ["Nome"]) ?? fallbackNif;
  const name = extractField(resultSection, "Nome", ["Tipo"]);
  const type = extractField(resultSection, "Tipo", ["Estado"]);
  const status = extractField(resultSection, "Estado", ["Inadimplente"]);
  const defaulting = extractField(resultSection, "Inadimplente", ["Regime de IVA"]);
  const vatRegime = extractField(resultSection, "Regime de IVA", []);
  const isTaxResident = extractTaxResidentFlag(resultSection);

  if (!nif || !name || !type || !status || !defaulting || !vatRegime) {
    throw new PortalLookupError(
      "The tax portal response did not contain the expected taxpayer fields.",
      502,
      "UNPARSEABLE_RESPONSE",
    );
  }

  return {
    nif,
    name,
    type,
    status,
    defaulting,
    vatRegime,
    isTaxResident,
  };
}

function normalizeWhitespace(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n+/g, "\n")
    .replace(/ *\n */g, "\n")
    .trim();
}

function sliceResultSection(documentText: string): string {
  const startIndex = documentText.indexOf(RESULT_MARKER);

  if (startIndex === -1) {
    throw new PortalLookupError(
      "The tax portal response did not include a lookup result section.",
      502,
      "UNPARSEABLE_RESPONSE",
    );
  }

  const rawSection = documentText.slice(startIndex + RESULT_MARKER.length).trim();
  const endIndexes = SECTION_END_MARKERS.map((marker) => rawSection.indexOf(marker)).filter(
    (index) => index >= 0,
  );
  const endIndex = endIndexes.length > 0 ? Math.min(...endIndexes) : rawSection.length;

  return rawSection.slice(0, endIndex).trim();
}

function extractField(
  resultSection: string,
  label: string,
  nextLabels: string[],
): string | null {
  const escapedLabel = escapeRegExp(label);
  const nextLabelPattern = nextLabels.map(escapeRegExp).join("|");
  const residentBoundary = "(?:N(?:ao|ão)\\s+Residente Fiscal|Residente Fiscal)";
  const lookAheadParts = [`\\s*(?:${residentBoundary})`, "\\s*$"];

  if (nextLabelPattern) {
    lookAheadParts.unshift(`\\s*(?:${nextLabelPattern}):`);
  }

  const matcher = new RegExp(
    `${escapedLabel}:\\s*([\\s\\S]+?)(?=${lookAheadParts.join("|")})`,
    "i",
  );
  const match = resultSection.match(matcher);

  if (!match) {
    return null;
  }

  return match[1].replace(/\s+/g, " ").trim();
}

function extractTaxResidentFlag(resultSection: string): boolean {
  const match = resultSection.match(/\b(N(?:ao|ão)\s+Residente Fiscal|Residente Fiscal)\b/i);

  if (!match) {
    return false;
  }

  return normalizeForComparison(match[1]) === "residente fiscal";
}

function detectKnownPortalError(documentText: string): string | null {
  const knownErrors = [
    /nenhum resultado encontrado/i,
    /n[aã]o foi encontrado/i,
    /nif inv[aá]lido/i,
    /contribuinte n[aã]o encontrado/i,
  ];

  for (const pattern of knownErrors) {
    const match = documentText.match(pattern);

    if (match) {
      return match[0];
    }
  }

  return null;
}

function normalizeForComparison(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function requestPortalLookup(url: string): Promise<{
  status: number;
  body: string;
}> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: requestHeaders(),
      signal: AbortSignal.timeout(15000),
    });

    return {
      status: response.status,
      body: await response.text(),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new PortalLookupError(
        "The tax portal did not respond in time.",
        504,
        "UPSTREAM_TIMEOUT",
      );
    }

    if (isTlsCertificateError(error)) {
      return requestPortalLookupWithInsecureTls(url);
    }

    throw new PortalLookupError(
      "The tax portal could not be reached.",
      502,
      "UPSTREAM_UNAVAILABLE",
    );
  }
}

function requestPortalLookupWithInsecureTls(
  url: string,
): Promise<{
  status: number;
  body: string;
}> {
  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {
        headers: requestHeaders(),
        method: "GET",
        rejectUnauthorized: false,
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 0,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );

    request.setTimeout(15000, () => {
      request.destroy(new Error("UPSTREAM_TIMEOUT"));
    });

    request.on("error", (error) => {
      if (error instanceof Error && error.message === "UPSTREAM_TIMEOUT") {
        reject(
          new PortalLookupError(
            "The tax portal did not respond in time.",
            504,
            "UPSTREAM_TIMEOUT",
          ),
        );
        return;
      }

      reject(
        new PortalLookupError(
          "The tax portal could not be reached.",
          502,
          "UPSTREAM_UNAVAILABLE",
        ),
      );
    });

    request.end();
  });
}

function requestHeaders(): Record<string, string> {
  return {
    Accept: "text/html,application/xhtml+xml",
    "User-Agent":
      "Mozilla/5.0 (compatible; Orb3xTaxVerifier/1.0; +https://vercel.com)",
  };
}

function isTlsCertificateError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const cause = "cause" in error ? error.cause : undefined;
  const code =
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    typeof cause.code === "string"
      ? cause.code
      : undefined;

  return (
    code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
    code === "SELF_SIGNED_CERT_IN_CHAIN" ||
    code === "CERT_HAS_EXPIRED" ||
    code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY"
  );
}
