import {
  buildAngolanIbanFromBban,
  findAngolaBankByCode,
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

  it('maps embedded asset aliases onto canonical bank codes', () => {
    const banks = getAngolaBanks();
    const bai = banks.find((bank) => bank.code === 'BAI');
    const bancoValor = banks.find((bank) => bank.code === 'BVB');
    const finibanco = banks.find((bank) => bank.code === 'FNB');
    const bancoPostal = banks.find((bank) => bank.code === 'BPT');
    const bancoSol = banks.find((bank) => bank.code === 'BSOL');

    expect(bai?.image).toMatch(/^data:image\/png;base64,/);
    expect(bancoValor?.image).toMatch(/^data:image\/svg\+xml;base64,/);
    expect(finibanco?.image).toMatch(/^data:image\/jpeg;base64,/);
    expect(bancoPostal?.image).toMatch(/^data:image\/webp;base64,/);
    expect(bancoSol?.image).toMatch(/^data:image\/png;base64,/);
  });

  it('uses one shared placeholder image when no embedded logo exists', () => {
    const banks = getAngolaBanks();
    const bancoMais = banks.find((bank) => bank.code === 'BMAIS');
    const bancoDaChina = banks.find((bank) => bank.code === 'BOCLB');

    expect(bancoMais?.image).toMatch(/^data:image\/svg\+xml;base64,/);
    expect(bancoMais?.image).toBe(bancoDaChina?.image);
  });
});
