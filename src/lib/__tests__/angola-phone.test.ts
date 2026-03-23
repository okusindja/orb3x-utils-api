import {
  detectAngolanOperator,
  parseAngolanPhoneNumber,
  validateAngolanPhoneNumber,
} from '@/lib/angola/phone';

describe('angola phone utilities', () => {
  it('parses Unitel numbers', () => {
    const result = parseAngolanPhoneNumber('+244923456789');

    expect(result.normalized).toBe('+244923456789');
    expect(result.isMobile).toBe(true);
    expect(result.operator?.name).toBe('Unitel');
  });

  it('detects Movicel numbers', () => {
    const operator = detectAngolanOperator('912345678');
    expect(operator.name).toBe('Movicel');
  });

  it('reports numbering-plan availability', () => {
    const result = validateAngolanPhoneNumber('952345678');

    expect(result.isValid).toBe(true);
    expect(result.availability.status).toBe('allocated-range');
  });
});
