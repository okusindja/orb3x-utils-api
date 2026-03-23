'use client';

import { useLocale, useSiteCopy } from '@/components/locale-provider';
import { supportedLocales } from '@/lib/site-copy';

export default function LanguageSelector() {
  const { locale, setLocale } = useLocale();
  const copy = useSiteCopy();

  const languages = supportedLocales.map((code) => ({
    code,
    name: copy.languages[code],
  }));

  return (
    <select
      aria-label={copy.header.language}
      value={locale}
      onChange={(e) => setLocale(e.target.value as typeof locale)}
      className="h-10 w-full min-w-[10rem] rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
