import { existsSync } from 'node:fs';
import { join } from 'node:path';

const LOGOS_DIR = join(process.cwd(), 'public', 'bank-logos');

export function getAngolaBankLogoPath(code: string): string | null {
  const normalizedCode = code.toUpperCase();
  const filePath = join(LOGOS_DIR, `${normalizedCode}.png`);
  return existsSync(filePath) ? filePath : null;
}
