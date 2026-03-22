# ORB3X Utils API

Next.js API for ORB3X utilities:

- Angola taxpayer lookup by NIF
- Text translation
- Currency rates and direct conversion

Runtime notes:

- Next.js App Router on the Node.js runtime
- Suitable for Vercel deployment
- `cheerio` is used for AGT HTML parsing

## Endpoints

### `GET /api/nif/[nif]`

Returns:

```json
{
  "NIF": "004813023LA040",
  "Name": "OKUSINDJA SANGUMBA RODRIGUES DE ALMEIDA",
  "Type": "SINGULAR",
  "Status": "Activo",
  "Defaulting": "Não",
  "VATRegime": "Sem actividade em IVA (Não factura IVA)",
  "isTaxResident": true
}
```

### `POST /api/translate`

Request:

```json
{
  "text": "Olá mundo",
  "to": "en"
}
```

Response:

```json
{
  "translatedText": "Hello world",
  "sourceLanguage": "pt",
  "targetLanguage": "en",
  "status": true,
  "message": ""
}
```

### `GET /api/exchange/[base]`

Example:

```txt
/api/exchange/aoa
```

Returns rate metadata plus unit rates for the requested base currency.

### `GET /api/exchange/[base]?amount=1000000`

Example:

```txt
/api/exchange/aoa?amount=1000000
```

Returns unit rates and the converted values for the provided amount.

Example response excerpt:

```json
{
  "baseCurrency": "AOA",
  "amount": 1000000,
  "ratesDate": "2026-03-21",
  "convertedRates": {
    "usd": 1089.4961,
    "eur": 939.90832,
    "brl": 5786.5844
  }
}
```

## Local development

Install dependencies and start the app:

```bash
pnpm dev
```

The homepage documents the available routes at [http://localhost:3000](http://localhost:3000).

## Deployment on Vercel

This project is ready for Vercel as-is:

- No browser binary is required.
- All utility routes use the Node.js runtime and built-in `fetch`.
- Routes are dynamic and disable caching for each live lookup.

Build locally with:

```bash
pnpm build
```

## Error responses

Tax and currency errors return JSON in this format:

```json
{
  "error": {
    "code": "UPSTREAM_UNAVAILABLE",
    "message": "The upstream service could not be reached."
  }
}
```

Translation errors return:

```json
{
  "status": false,
  "message": "The text field is required.",
  "code": "INVALID_TEXT"
}
```

Status codes used across the API:

- `400` for invalid inputs
- `404` for known missing resources
- `502` for upstream errors or unexpected payloads
- `504` for upstream timeouts
