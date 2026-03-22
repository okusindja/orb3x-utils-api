# ORB3X Tax Verifier

Next.js API that verifies Angolan taxpayer data by querying the public AGT portal:

- Source portal: `https://portaldocontribuinte.minfin.gov.ao/consultar-nif-do-contribuinte`
- API endpoint: `GET /api/nif/[nif]`
- Runtime: Next.js App Router on the Node.js runtime, suitable for Vercel
- Parser dependency: `cheerio`

## Response

Successful requests return:

```json
{
  "NIF": "5402162409",
  "Name": "ELFRAN - COMERCIO E PRESTACAO DE SERVICOS, LDA",
  "Type": "COLECTIVO - Empresa",
  "Status": "Suspenso",
  "Defaulting": "Sim",
  "VATRegime": "Sem actividade em IVA (Não factura IVA)",
  "isTaxResident": true
}
```

`isTaxResident` is `true` only when the upstream portal response includes `Residente Fiscal`. Any other value is treated as `false`.

## Local development

Install dependencies and start the app:

```bash
pnpm dev
```

The API will be available at [http://localhost:3000/api/nif/5402162409](http://localhost:3000/api/nif/5402162409).

## Deployment on Vercel

This project is ready for Vercel as-is:

- No browser binary is required.
- The lookup uses the Node.js runtime and the built-in `fetch`.
- The route is marked dynamic and disables caching for each lookup.

Build locally with:

```bash
pnpm build
```

## Error responses

Errors return JSON in this format:

```json
{
  "error": {
    "code": "NIF_NOT_FOUND",
    "message": "nenhum resultado encontrado",
    "nif": "0000000000"
  }
}
```

Status codes used by the route:

- `400` for invalid NIF path params
- `404` for known "not found" responses from the portal
- `502` for upstream errors or unexpected HTML
- `504` for upstream timeouts
