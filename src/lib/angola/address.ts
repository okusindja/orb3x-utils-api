import { RouteError } from '@/lib/route-error';
import { compactWhitespace, normalizeLookupKey, titleCase, uniqueBy } from '@/lib/angola/shared';
import { findMunicipality, findProvince, getGeoSearchIndex } from '@/lib/angola/geo';

const KNOWN_BAIRROS = [
  { bairro: 'Alvalade', commune: 'Maianga', municipality: 'Maianga', province: 'Luanda' },
  { bairro: 'Bairro Azul', commune: 'Ingombota', municipality: 'Ingombota', province: 'Luanda' },
  { bairro: 'Benfica', commune: 'Benfica', municipality: 'Belas', province: 'Luanda' },
  { bairro: 'Camama', commune: 'Camama', municipality: 'Camama', province: 'Luanda' },
  { bairro: 'Cassenda', commune: 'Maianga', municipality: 'Maianga', province: 'Luanda' },
  { bairro: 'Cidade Universitaria', commune: 'Talatona', municipality: 'Talatona', province: 'Luanda' },
  { bairro: 'Golfe', commune: 'Kilamba Kiaxi', municipality: 'Kilamba Kiaxi', province: 'Luanda' },
  { bairro: 'Ingombota', commune: 'Ingombota', municipality: 'Ingombota', province: 'Luanda' },
  { bairro: 'Kinaxixi', commune: 'Ingombota', municipality: 'Ingombota', province: 'Luanda' },
  { bairro: 'Kilamba', commune: 'Kilamba', municipality: 'Kilamba', province: 'Luanda' },
  { bairro: 'Maculusso', commune: 'Ingombota', municipality: 'Ingombota', province: 'Luanda' },
  { bairro: 'Maianga', commune: 'Maianga', municipality: 'Maianga', province: 'Luanda' },
  { bairro: 'Morro Bento', commune: 'Talatona', municipality: 'Talatona', province: 'Luanda' },
  { bairro: 'Nova Vida', commune: 'Kilamba Kiaxi', municipality: 'Kilamba Kiaxi', province: 'Luanda' },
  { bairro: 'Patriota', commune: 'Benfica', municipality: 'Belas', province: 'Luanda' },
  { bairro: 'Rocha Pinto', commune: 'Samba', municipality: 'Samba', province: 'Luanda' },
  { bairro: 'Sambizanga', commune: 'Sambizanga', municipality: 'Sambizanga', province: 'Luanda' },
  { bairro: 'Talatona Centro', commune: 'Talatona', municipality: 'Talatona', province: 'Luanda' },
  { bairro: 'Viana Sede', commune: 'Viana', municipality: 'Viana', province: 'Luanda' },
  { bairro: 'Zango', commune: 'Viana', municipality: 'Viana', province: 'Luanda' },
];

const ABBREVIATIONS: Array<[RegExp, string]> = [
  [/\bprov\.?\b/gi, 'Provincia'],
  [/\bmun\.?\b/gi, 'Municipio'],
  [/\bcom\.?\b/gi, 'Comuna'],
  [/\bb\.?\b/gi, 'Bairro'],
  [/\bav\.?\b/gi, 'Avenida'],
  [/\br\.?\b/gi, 'Rua'],
];

export function normalizeAngolanAddress(rawAddress: string) {
  const input = compactWhitespace(rawAddress);

  if (!input) {
    throw new RouteError('INVALID_ADDRESS', 'The "address" query parameter is required.', 400, {
      field: 'address',
    });
  }

  let cleaned = input;

  for (const [pattern, replacement] of ABBREVIATIONS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  cleaned = cleaned
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();

  const segments = cleaned.split(',').map((segment) => titleCase(segment));
  let province: string | null = null;
  let municipality: string | null = null;
  let commune: string | null = null;
  let bairro: string | null = null;

  for (const segment of segments) {
    try {
      province = findProvince(segment).name;
      continue;
    } catch {}

    try {
      const match = findMunicipality(segment, province ?? undefined);
      municipality = match.municipality.name;
      province = match.province.name;
      continue;
    } catch {}

    const bairroMatch = KNOWN_BAIRROS.find(
      (item) => normalizeLookupKey(item.bairro) === normalizeLookupKey(segment),
    );

    if (bairroMatch) {
      bairro = bairroMatch.bairro;
      commune = bairroMatch.commune;
      municipality = bairroMatch.municipality;
      province = bairroMatch.province;
      continue;
    }

    if (!commune) {
      commune = segment;
    }
  }

  return {
    input: rawAddress,
    normalized: segments.join(', '),
    components: {
      bairro,
      commune,
      municipality,
      province,
    },
    diagnostics: {
      provinceMatched: Boolean(province),
      municipalityMatched: Boolean(municipality),
      communeMatched: Boolean(commune),
      bairroMatched: Boolean(bairro),
    },
  };
}

export function suggestAngolanAddressParts({
  query,
  type,
  province,
  municipality,
  limit = 8,
}: {
  query: string;
  type?: string | null;
  province?: string | null;
  municipality?: string | null;
  limit?: number;
}) {
  if (!query) {
    throw new RouteError('MISSING_QUERY_PARAMETER', 'The "q" query parameter is required.', 400, {
      field: 'q',
    });
  }

  const normalizedQuery = normalizeLookupKey(query);
  const normalizedType = type?.toLowerCase();
  const normalizedProvince = province ? normalizeLookupKey(province) : null;
  const normalizedMunicipality = municipality ? normalizeLookupKey(municipality) : null;

  const suggestions = [
    ...getGeoSearchIndex(),
    ...KNOWN_BAIRROS.map((entry) => ({
      type: 'bairro' as const,
      label: entry.bairro,
      province: entry.province,
      municipality: entry.municipality,
      commune: entry.commune,
      bairro: entry.bairro,
    })),
  ]
    .filter((item) => (normalizedType ? item.type === normalizedType : true))
    .filter((item) =>
      normalizedProvince ? normalizeLookupKey(item.province) === normalizedProvince : true,
    )
    .filter((item) =>
      normalizedMunicipality
        ? normalizeLookupKey('municipality' in item ? item.municipality ?? '' : '') === normalizedMunicipality
        : true,
    )
    .filter((item) => normalizeLookupKey(item.label).includes(normalizedQuery))
    .sort((left, right) => left.label.localeCompare(right.label));

  return uniqueBy(suggestions, (item) => `${item.type}:${item.label}:${item.province}`).slice(0, limit);
}
