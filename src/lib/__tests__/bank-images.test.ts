import { getAngolaBankLogoPath } from '@/lib/angola/bank-images';

describe('getAngolaBankLogoPath', () => {
  it('returns a path ending in BAI.png for the BAI bank code', () => {
    const result = getAngolaBankLogoPath('BAI');

    expect(result).not.toBeNull();
    expect(result).toMatch(/BAI\.png$/);
  });

  it('returns null for a non-existent bank code', () => {
    const result = getAngolaBankLogoPath('NONEXISTENT');

    expect(result).toBeNull();
  });

  it('is case-insensitive (normalizes to uppercase)', () => {
    const upper = getAngolaBankLogoPath('BAI');
    const lower = getAngolaBankLogoPath('bai');

    expect(upper).not.toBeNull();
    expect(lower).toEqual(upper);
  });
});
