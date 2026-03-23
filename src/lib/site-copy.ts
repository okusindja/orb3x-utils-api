import { enSiteCopy, type SiteCopy } from '@/locales/site/en';
import { ptSiteCopy } from '@/locales/site/pt';
import type { DeepPartial } from '@/locales/site/types';
import type { DocsPage, DocsPageSlug } from '@/lib/site-content';

export const supportedLocales = ['en', 'pt'] as const;

export type SiteLocale = (typeof supportedLocales)[number];

const overrides: Record<SiteLocale, DeepPartial<SiteCopy>> = {
  en: enSiteCopy,
  pt: ptSiteCopy,
};

function mergeDeep<T>(base: T, override: DeepPartial<T>): T {
  if (Array.isArray(base)) {
    return (override as T | undefined) ?? base;
  }

  if (typeof base !== 'object' || base === null) {
    return (override as T | undefined) ?? base;
  }

  const result = { ...(base as Record<string, unknown>) };

  for (const key of Object.keys(override as Record<string, unknown>)) {
    const baseValue = (base as Record<string, unknown>)[key];
    const overrideValue = (override as Record<string, unknown>)[key];

    if (overrideValue === undefined) {
      continue;
    }

    result[key] =
      typeof baseValue === 'object' && baseValue !== null && !Array.isArray(baseValue)
        ? mergeDeep(baseValue, overrideValue as DeepPartial<typeof baseValue>)
        : overrideValue;
  }

  return result as T;
}

export function isSiteLocale(value: string): value is SiteLocale {
  return supportedLocales.includes(value as SiteLocale);
}

export function getSiteCopy(locale: SiteLocale): SiteCopy {
  if (locale === 'en') {
    return enSiteCopy;
  }

  return mergeDeep(enSiteCopy, overrides[locale]);
}

export function getLocalizedDocsPage(locale: SiteLocale, slug: DocsPageSlug): DocsPage {
  return getSiteCopy(locale).docsPages[slug];
}
