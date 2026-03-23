import {
  listAngolaCommunes,
  listAngolaMunicipalities,
  listAngolaProvinces,
} from '@/lib/angola/geo';
import {
  normalizeAngolanAddress,
  suggestAngolanAddressParts,
} from '@/lib/angola/address';

describe('angola geography and address utilities', () => {
  it('lists provinces and filtered municipalities', () => {
    const provinces = listAngolaProvinces();
    const luandaMunicipalities = listAngolaMunicipalities('Luanda');

    expect(provinces.some((province) => province.name === 'Luanda')).toBe(true);
    expect(luandaMunicipalities.some((municipality) => municipality.name === 'Talatona')).toBe(true);
  });

  it('lists communes for a municipality', () => {
    const result = listAngolaCommunes('Talatona', 'Luanda');

    expect(result.communes.map((commune) => commune.name)).toContain('Talatona');
  });

  it('normalizes addresses and suggests bairros', () => {
    const normalized = normalizeAngolanAddress('benfica, luanda');
    const suggestions = suggestAngolanAddressParts({ query: 'benf', type: 'bairro' });

    expect(normalized.components.province).toBe('Luanda');
    expect(suggestions.some((item) => item.label === 'Benfica')).toBe(true);
  });
});
