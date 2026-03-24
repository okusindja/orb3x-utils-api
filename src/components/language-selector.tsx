'use client';

import { useLocale, useSiteCopy } from '@/components/locale-provider';
import { supportedLocales } from '@/lib/site-copy';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LanguageSelector() {
  const { locale, setLocale } = useLocale();
  const copy = useSiteCopy();

  const languages = supportedLocales.map((code) => ({
    code,
    name: copy.languages[code],
  }));

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as typeof locale)}>
      <SelectTrigger
        aria-label={copy.header.language}
        className="min-w-[10rem]"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
