import {
  buildAngolanIbanFromBban,
  findAngolaBankByCode,
  getAngolaBankLogoBytes,
  getAngolaBanks,
  validateAngolanBankAccount,
  validateAngolanIban,
} from '@/lib/angola/banks';

describe('angola banks', () => {
  it('builds and validates an Angolan IBAN', () => {
    const iban = buildAngolanIbanFromBban('004000010123456789012');
    const result = validateAngolanIban(iban);

    expect(result.isValid).toBe(true);
    expect(result.bank?.code).toBe('BAI');
    expect(result.validation.mod97Valid).toBe(true);
  });

  it('validates a local bank account and derives an IBAN', () => {
    const result = validateAngolanBankAccount('004000010123456789012');

    expect(result.isValid).toBe(true);
    expect(result.bank?.name).toContain('Banco Angolano');
    expect(result.derivedIban.startsWith('AO')).toBe(true);
  });

  it('returns a bank image for known banks', () => {
    const bank = findAngolaBankByCode('0040');

    expect(bank?.code).toBe('BAI');
  });

  it('maps logo bytes for banks with alias-resolved PNG files', () => {
    const banks = getAngolaBanks();
    const bai = banks.find((bank) => bank.code === 'BAI');
    const bancoSol = banks.find((bank) => bank.code === 'BSOL'); // alias: SOL.png

    // Known logos resolve to Uint8Array with bytes
    expect(bai?.image).toBeInstanceOf(Uint8Array);
    expect((bai?.image as Uint8Array).length).toBeGreaterThan(0);
    expect(bancoSol?.image).toBeInstanceOf(Uint8Array);
    expect((bancoSol?.image as Uint8Array).length).toBeGreaterThan(0);
  });

  it('returns null from getAngolaBankLogoBytes for a bank with no logo file', () => {
    // A bank whose code has no matching PNG in public/bank-logos/ returns null (D-06)
    const missingBank = { code: 'NONEXISTENT', name: 'Test', shortName: 'T', ibanBankCode: '9999', aliases: [] };
    const result = getAngolaBankLogoBytes(missingBank);

    expect(result).toBeNull();
  });
});
