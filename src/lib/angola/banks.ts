import { RouteError } from '@/lib/route-error';
import {
  compactWhitespace,
  formatGrouped,
  normalizeLookupKey,
  onlyAlphaNumeric,
  onlyDigits,
} from '@/lib/angola/shared';
import { ANGOLA_BANK_IMAGE_DATA } from '@/lib/angola/bank-images';

export type AngolaBank = {
  code: string;
  name: string;
  shortName: string;
  ibanBankCode: string;
  aliases: string[];
};

const BANKS: AngolaBank[] = [
  { code: 'BAI', name: 'Banco Angolano de Investimentos', shortName: 'BAI', ibanBankCode: '0040', aliases: ['banco angolano de investimentos'] },
  { code: 'YETU', name: 'Banco Yetu', shortName: 'Yetu', ibanBankCode: '0066', aliases: ['banco yetu'] },
  { code: 'BANC', name: 'Banco Angolano de Negocios e Comercio', shortName: 'BANC', ibanBankCode: '0053', aliases: ['banco angolano de negocios e comercio'] },
  { code: 'BMF', name: 'Banco BAI Microfinancas', shortName: 'BMF', ibanBankCode: '0048', aliases: ['banco bai microfinancas'] },
  { code: 'BIC', name: 'Banco BIC', shortName: 'BIC', ibanBankCode: '0051', aliases: ['banco bic'] },
  { code: 'BCGA', name: 'Banco Caixa Geral Angola', shortName: 'BCGA', ibanBankCode: '0004', aliases: ['banco caixa geral angola'] },
  { code: 'BCA', name: 'Banco Comercial Angolano', shortName: 'BCA', ibanBankCode: '0043', aliases: ['banco comercial angolano'] },
  { code: 'BCH', name: 'Banco Comercial do Huambo', shortName: 'BCH', ibanBankCode: '0059', aliases: ['banco comercial do huambo'] },
  { code: 'BCI', name: 'Banco de Comercio e Industria', shortName: 'BCI', ibanBankCode: '0005', aliases: ['banco de comercio e industria'] },
  { code: 'BDA', name: 'Banco de Desenvolvimento de Angola', shortName: 'BDA', ibanBankCode: '0054', aliases: ['banco de desenvolvimento de angola'] },
  { code: 'BFA', name: 'Banco de Fomento Angola', shortName: 'BFA', ibanBankCode: '0006', aliases: ['banco de fomento angola'] },
  { code: 'BIR', name: 'Banco de Investimento Rural', shortName: 'BIR', ibanBankCode: '0067', aliases: ['banco de investimento rural'] },
  { code: 'BNI', name: 'Banco de Negocios Internacional', shortName: 'BNI', ibanBankCode: '0052', aliases: ['banco de negocios internacional'] },
  { code: 'BPC', name: 'Banco de Poupanca e Credito', shortName: 'BPC', ibanBankCode: '0010', aliases: ['banco de poupanca e credito'] },
  { code: 'BE', name: 'Banco Economico', shortName: 'BE', ibanBankCode: '0045', aliases: ['banco economico'] },
  { code: 'KEVE', name: 'Banco Keve', shortName: 'Keve', ibanBankCode: '0047', aliases: ['banco keve'] },
  { code: 'BKI', name: 'Banco Kwanza Investimento', shortName: 'BKI', ibanBankCode: '0057', aliases: ['banco kwanza investimento'] },
  { code: 'BPG', name: 'Banco Prestigio', shortName: 'BPG', ibanBankCode: '0064', aliases: ['banco prestigio'] },
  { code: 'BPA', name: 'Banco Millennium Atlantico', shortName: 'BPA', ibanBankCode: '0055', aliases: ['banco millennium atlantico'] },
  { code: 'BMAIS', name: 'Banco Mais', shortName: 'Mais', ibanBankCode: '0065', aliases: ['banco mais'] },
  { code: 'BSOL', name: 'Banco Sol', shortName: 'Sol', ibanBankCode: '0044', aliases: ['banco sol'] },
  { code: 'BVB', name: 'Banco Valor', shortName: 'Valor', ibanBankCode: '0062', aliases: ['banco valor'] },
  { code: 'VTB', name: 'Banco VTB Africa', shortName: 'VTB', ibanBankCode: '0056', aliases: ['banco vtb africa'] },
  { code: 'FNB', name: 'Finibanco Angola', shortName: 'Finibanco', ibanBankCode: '0058', aliases: ['finibanco angola'] },
  { code: 'SBA', name: 'Standard Bank Angola', shortName: 'SBA', ibanBankCode: '0060', aliases: ['standard bank angola'] },
  { code: 'SCBA', name: 'Standard Chartered Bank de Angola', shortName: 'SCBA', ibanBankCode: '0063', aliases: ['standard chartered bank de angola'] },
  { code: 'BCS', name: 'Banco de Credito do Sul', shortName: 'BCS', ibanBankCode: '0070', aliases: ['banco de credito do sul'] },
  { code: 'BPT', name: 'Banco Postal', shortName: 'Postal', ibanBankCode: '0069', aliases: ['banco postal'] },
  { code: 'BOCLB', name: 'Banco da China', shortName: 'BOCLB', ibanBankCode: '0071', aliases: ['banco da china'] },
];

type BankAccountParts = {
  bankCode: string;
  branchCode: string;
  accountNumber: string;
  controlDigits: string;
};

const BANK_IMAGE_CODE_ALIASES: Record<string, string> = {
  BPT: 'POSTAL',
  BSOL: 'SOL',
  BVB: 'BV',
  FNB: 'FINIBANCO',
};

const BANK_IMAGE_PLACEHOLDER = ANGOLA_BANK_IMAGE_DATA.PLACEHOLDER;
const bankImageCache = new Map<string, string>();

export function getAngolaBanks() {
  return BANKS.map((bank) => ({
    ...bank,
    image: getAngolaBankImage(bank),
  }));
}

export function findAngolaBankByCode(code: string) {
  const normalized = compactWhitespace(code).toUpperCase();

  return BANKS.find((bank) => bank.code === normalized || bank.ibanBankCode === normalized) ?? null;
}

export function findAngolaBankByName(name: string) {
  const normalized = normalizeLookupKey(name);

  return (
    BANKS.find((bank) =>
      [bank.name, bank.shortName, bank.code, ...bank.aliases].some(
        (candidate) => normalizeLookupKey(candidate) === normalized,
      ),
    ) ?? null
  );
}

export function sanitizeIban(value: string) {
  const sanitized = onlyAlphaNumeric(value).toUpperCase();

  if (!sanitized) {
    throw new RouteError('INVALID_IBAN', 'The "iban" query parameter is required.', 400, {
      field: 'iban',
    });
  }

  return sanitized;
}

export function sanitizeLocalBankAccount(value: string) {
  const sanitized = onlyDigits(value);

  if (!sanitized) {
    throw new RouteError('INVALID_BANK_ACCOUNT', 'The "account" query parameter is required.', 400, {
      field: 'account',
    });
  }

  return sanitized;
}

export function buildAngolanIbanFromBban(rawBban: string) {
  const bban = sanitizeLocalBankAccount(rawBban);

  if (bban.length !== 21) {
    throw new RouteError(
      'INVALID_BANK_ACCOUNT',
      'Angolan local bank account numbers must contain exactly 21 digits.',
      400,
      {
        field: 'account',
        length: bban.length,
      },
    );
  }

  const checkDigits = computeIbanCheckDigits('AO', bban);
  return `AO${checkDigits}${bban}`;
}

export function validateAngolanBankAccount(rawAccount: string) {
  const account = sanitizeLocalBankAccount(rawAccount);

  if (account.length !== 21) {
    throw new RouteError(
      'INVALID_BANK_ACCOUNT',
      'Angolan local bank account numbers must contain exactly 21 digits.',
      400,
      {
        field: 'account',
        length: account.length,
      },
    );
  }

  const parts = splitBankAccount(account);
  const bank = findAngolaBankByCode(parts.bankCode);

  return {
    isValid: Boolean(bank),
    input: rawAccount,
    normalized: account,
    formatted: `${account.slice(0, 4)} ${account.slice(4, 8)} ${account.slice(8, 12)} ${account.slice(12, 16)} ${account.slice(16, 20)} ${account.slice(20)}`,
    derivedIban: buildAngolanIbanFromBban(account),
    bankRecognized: Boolean(bank),
    bank: bank
      ? {
          code: bank.code,
          ibanBankCode: bank.ibanBankCode,
          name: bank.name,
          shortName: bank.shortName,
          image: getAngolaBankImage(bank),
        }
      : null,
    components: parts,
    validation: {
      formatValid: true,
      bankCodeKnown: Boolean(bank),
      controlDigitsPresent: parts.controlDigits.length === 2,
    },
  };
}

export function validateAngolanIban(rawIban: string) {
  const iban = sanitizeIban(rawIban);

  if (!iban.startsWith('AO')) {
    throw new RouteError('INVALID_IBAN', 'Only Angolan IBANs with country code AO are supported.', 400, {
      field: 'iban',
      countryCode: iban.slice(0, 2) || null,
    });
  }

  if (iban.length !== 25) {
    throw new RouteError('INVALID_IBAN', 'Angolan IBANs must contain exactly 25 characters.', 400, {
      field: 'iban',
      length: iban.length,
    });
  }

  const bban = iban.slice(4);

  if (!/^\d+$/.test(bban)) {
    throw new RouteError(
      'INVALID_IBAN',
      'Angolan IBAN BBAN sections must contain digits only after the country code and check digits.',
      400,
      {
        field: 'iban',
      },
    );
  }

  const parts = splitBankAccount(bban);
  const bank = findAngolaBankByCode(parts.bankCode);
  const mod97Valid = computeMod97(shiftIban(iban)) === 1;

  return {
    isValid: mod97Valid && Boolean(bank),
    input: rawIban,
    normalized: iban,
    formatted: formatGrouped(iban),
    countryCode: iban.slice(0, 2),
    checkDigits: iban.slice(2, 4),
    bank: bank
      ? {
          code: bank.code,
          ibanBankCode: bank.ibanBankCode,
          name: bank.name,
          shortName: bank.shortName,
          image: getAngolaBankImage(bank),
        }
      : null,
    components: parts,
    validation: {
      countrySupported: true,
      lengthValid: true,
      bankCodeKnown: Boolean(bank),
      mod97Valid,
    },
  };
}

function splitBankAccount(account: string): BankAccountParts {
  return {
    bankCode: account.slice(0, 4),
    branchCode: account.slice(4, 8),
    accountNumber: account.slice(8, 19),
    controlDigits: account.slice(19, 21),
  };
}

function shiftIban(iban: string) {
  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`;

  return rearranged.replace(/[A-Z]/g, (char) => String(char.charCodeAt(0) - 55));
}

function computeMod97(value: string) {
  let remainder = 0;

  for (const digit of value) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }

  return remainder;
}

function computeIbanCheckDigits(countryCode: string, bban: string) {
  const prepared = `${bban}${countryCode.toUpperCase()}00`.replace(/[A-Z]/g, (char) =>
    String(char.charCodeAt(0) - 55),
  );
  const remainder = computeMod97(prepared);
  return String(98 - remainder).padStart(2, '0');
}

function getAngolaBankImage(bank: AngolaBank) {
  const cached = bankImageCache.get(bank.code);

  if (cached) {
    return cached;
  }

  const imageKey = BANK_IMAGE_CODE_ALIASES[bank.code] ?? bank.code;
  const image = ANGOLA_BANK_IMAGE_DATA[imageKey] ?? BANK_IMAGE_PLACEHOLDER;

  bankImageCache.set(bank.code, image);
  return image;
}
